import { GoogleGenerativeAI, type Part } from '@google/generative-ai';
// This package doesn't have its typings setup correctly.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { GoogleAIFileManager, UploadFileResponse } from '@google/generative-ai/files';
import { logger } from '@nx/devkit';
import { sync } from 'glob';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import type { ExecutorContext } from 'nx/src/config/misc-interfaces';
import type { AiReadmeExecutorSchema } from './schema';
import { systemInstruction } from './system-instruction';

/**
 * Nx Executor that will take in all source, config, test files (among anything else you want) to generate a
 * README.md for your project.
 */
export default async function runExecutor(options: AiReadmeExecutorSchema, context: ExecutorContext) {
    console.log('Executor ran for AiReadme', options);

    const ai = new GoogleGenerativeAI(options.apiKey ? process.env['AI_README_API_KEY'] : undefined);

    const fileManager = new GoogleAIFileManager(options.apiKey ? process.env['AI_README_API_KEY'] : undefined);

    const model = ai.getGenerativeModel({
        model: options.model,
        systemInstruction,
    });

    const projectConfig = context.projectGraph?.nodes[context.projectName ?? ''].data;

    const parts: Part[] = [];

    /*
    Parse our the instructions provided to the executor. Otherwise, default to generic instructions.
     */
    let instructions = options.instructions;

    if (instructions && existsSync(join(context.root, instructions))) {
        instructions = readFileSync(join(context.root, instructions), { encoding: 'utf-8' });
    }

    if (!instructions) {
        instructions =
            `Write a README.md file in Markdown that clearly explains how to use the library ${context.projectName}.
        Provide sections for: installation, setup, configuration options, usage and all other relevant information a
        developer would need to use the library, An example structure/layout will be provided along with all source
        files and relevant example files for the project.`
                .replaceAll('\n', ' ')
                .replaceAll('\t', ' ')
                .replaceAll(/\s+/g, ' ');
    }

    parts.push({
        text: instructions,
    });

    /*
    If an example URL is provided, read the content of it and provide it as a file in the generation.
     */
    if (options.example) {
        try {
            const result = await fetch(options.example);
            const contents = await result.text();
            const examplePath = join(context.root, 'tmp', `example-readme-${randomUUID()}.md`);

            writeFileSync(examplePath, contents);

            logger.log(`Uploading example from: ${options.example} to Google Files.`);
            const metadata = await fileManager.uploadFile(examplePath, {
                mimeType: 'text/plain',
            });

            parts.push({
                fileData: {
                    mimeType: 'text/plain',
                    fileUri: metadata.file.uri,
                },
            });
        } catch (e) {
            throw new Error(`Could not successfully pull example: ${options.example}`);
        }
    }

    const files: {
        fileName: string;
        contents: string;
        hash: string;
        metadata?: UploadFileResponse;
        filePath: string;
    }[] = [];

    /*
    Read all files as part of the project and
     */
    const includeFiles = [
        ...(options.projectFiles ?? ['**/*.ts', 'package.json']).map((pattern) =>
            sync(join(projectConfig.root, pattern))
        ),
        ...(options.include ?? []).map((includeFileGlob) => sync(join(context.root, includeFileGlob))),
    ].flat();

    logger.log(`Including the following files: ${includeFiles.join(', ')}`);

    for (const includeFile of includeFiles) {
        if (existsSync(includeFile)) {
            const contents = readFileSync(includeFile, { encoding: 'utf-8' });

            files.push({
                fileName: basename(includeFile),
                contents,
                hash: createHash('sha1').update(contents).digest('hex'),
                filePath: includeFile,
            });
        }
    }

    logger.log('Uploading files to be used to generated README.');
    const uploadedFiles = await Promise.all(
        files.map((file) =>
            fileManager.uploadFile(file.filePath, {
                mimeType: 'text/plain',
            })
        )
    );

    for (let x = 0; x < uploadedFiles.length; x++) {
        files[x].metadata = uploadedFiles[x];
    }

    parts.push(
        ...files.map((file) => ({
            fileData: {
                mimeType: file.metadata.file.mimeType,
                fileUri: file.metadata.file.uri,
            },
        }))
    );

    const result = await model.generateContent({
        contents: [
            {
                role: 'user',
                parts,
            },
        ],
        generationConfig: {
            temperature: options.temperature,
        },
    });

    logger.log('Deleting files used to generated README.');
    await Promise.all(files.map((file) => fileManager.deleteFile(file.metadata.file.name)));

    let readme = result.response.text().trim().split('\n');

    console.log(readme[0]);
    if (readme[0].startsWith('```markdown')) {
        readme = readme.slice(1);
    }

    if (readme[readme.length - 1].startsWith('```')) {
        readme = readme.slice(0, readme.length - 1);
    }

    writeFileSync(join(projectConfig.root, options.pathToReadme ?? 'README.md'), readme.join('\n').trim());

    return {
        success: true,
    };
}
