import {
    ExecutorContext,
    offsetFromRoot,
    ProjectGraphProjectNode,
    readJsonFile,
} from '@nrwl/devkit';
import jestExecutor from '@nrwl/jest/src/executors/jest/jest.impl';
import {
    createProjectGraphAsync,
    readCachedProjectGraph,
} from '@nrwl/workspace/src/core/project-graph';
import type { DependentBuildableProjectNode } from '@nrwl/workspace/src/utilities/buildable-libs-utils';
import { calculateProjectDependencies } from '@nrwl/workspace/src/utilities/buildable-libs-utils';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import type { NxJestExecutorOptions } from './schema';

const outputDirs = ['dist', 'build'];

const createTmpJestConfig = (
    jestConfigPath: string,
    root: string,
    context: ExecutorContext,
    dependencies: DependentBuildableProjectNode[]
): string => {
    const jestConfig = readFileSync(
        resolve(context.cwd, jestConfigPath)
    ).toString();

    const overrides = createJestOverrides(root, context, dependencies);

    return `
    const path = require('path');
    const { pathsToModuleNameMapper } = require('ts-jest/utils')
    ${jestConfig}
    ${overrides}
  `;
};

/**
 * Attempt to find the compiled index.js to use as the entry point for this library
 *
 * Built in library schematics are as follows for the package.json index file:
 *
 * Nest: 'main'
 * Angular: 'esm2020', 'es2020', 'module' (No order, as of Angular 13 all three point to the same artifacts)
 * Node: 'main'
 * React: 'main', 'module' (Cannot use `module` as NxJest does not support it yet)
 * TS (@nrwl/js): 'main'
 * Web: 'main'
 *
 * @param distPackageJson
 */
export function findIndexFile(distPackageJson: any): string | undefined {
    if (distPackageJson['main']) {
        return distPackageJson['main'];
    }

    return distPackageJson['esm2020'];
}

export function createJestOverrides(
    root: string,
    context: ExecutorContext,
    dependencies: DependentBuildableProjectNode[]
): string {
    const offset = offsetFromRoot(root);

    const tsAliasPrefix = `@${context.workspace.npmScope}/`;

    const paths = dependencies
        .filter((dep) => !dep.node.name.startsWith('npm:'))
        .reduce((prev, dep) => {
            const node = dep.node as ProjectGraphProjectNode;

            // Find the output dir of the deps artifacts.
            const outputDir = outputDirs.find((dir) =>
                existsSync(join(context.cwd, dir, node.data.root))
            );

            if (!outputDir) {
                throw new Error(
                    `Artifacts for ${dep.name} do not exist in /build or /dist. Are you sure you compiled them before running test?`
                );
            }

            const rootPath = node.data.root.split('/');
            rootPath.shift();

            // Path to the folder that contains the deps compiled artifacts
            const artifactsPath = join(outputDir, node.data.root);

            // The JSON object of the deps package.json
            const distPackageJson = readJsonFile(
                join(context.cwd, artifactsPath, 'package.json')
            );

            const indexFile = findIndexFile(distPackageJson);

            // The TS import alias for the dep
            const aliasPath = `${tsAliasPrefix}${rootPath.join('/')}`;

            const pathToRoot = `<rootDir>/${offset}`;

            if (indexFile) {
                const indexPath = join(artifactsPath, indexFile);

                prev.push(`"${aliasPath}": [
                  '${pathToRoot}${indexPath}'
                ]`);
            }

            // Not sure if this is going to be needed for not for secondary entry points.
            // const additionalEntryPoints: Record<string, string> | undefined =
            //     distPackageJson['additionalEntryPoints'];
            //
            // // Find additional entry points and map them.
            // if (additionalEntryPoints) {
            //     prev.push(
            //         ...Object.entries(additionalEntryPoints).map(
            //             ([entryName, entryPoint]: [string, string]) =>
            //                 `"${aliasPath}/${entryName}": ['${pathToRoot}${join(
            //                     artifactsPath,
            //                     entryPoint
            //                 )}']`
            //         )
            //     );
            // }

            return prev;
        }, [] as string[]);

    return `
  module.exports = {
    ...module.exports,
    preset: '${offset}jest.preset.js',
    rootDir: path.join(__dirname, '../${offset}${root}'),
    coverageDirectory: '../${offset}coverage/${root}',
    moduleNameMapper: {
      ...(module.exports.moduleNameMapper || {}),
      ...pathsToModuleNameMapper({
        ${paths.join(',')}
      })
    }
  }`;
}

export async function jestExecutor2(
    options: NxJestExecutorOptions,
    context: ExecutorContext
): Promise<{ success: boolean }> {
    const config = options;

    if (context.projectName == null) {
        throw new Error(`projectName cannot be undefined.`);
    }

    if (context.targetName == null) {
        throw new Error(`targetName cannot be undefined.`);
    }

    /*
     * Will enable jest to run tests using already compiled artifacts instead of
     * using ts-jest to compile the dependencies
     */
    if (!options.testFromSource && !options.watch && !options.watchAll) {
        // We only need to create the cached project graph if not testing from source
        await createProjectGraphAsync();
        const projGraph = readCachedProjectGraph();
        const { dependencies } = calculateProjectDependencies(
            projGraph,
            context.root,
            context.projectName,
            'build',
            context.configurationName ?? ''
        );

        const projectRoot =
            context.workspace.projects[context.projectName].root;

        const tmpProjectFolder = join(context.cwd, `tmp/${projectRoot}`);
        mkdirSync(tmpProjectFolder, { recursive: true });

        const temporaryJestConfig = createTmpJestConfig(
            options.jestConfig,
            projectRoot,
            context,
            dependencies
        );

        // Write the temporary jest config with correct paths
        writeFileSync(
            join(tmpProjectFolder, 'jest.config.js'),
            temporaryJestConfig,
            'utf8'
        );

        config.jestConfig = join(
            process.cwd(),
            `tmp/${projectRoot}`,
            'jest.config.js'
        );
    }

    return jestExecutor(config, context);
}

export default jestExecutor2;
