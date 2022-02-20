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
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import type { NxJestExecutorOptions } from './schema';

const createTmpJestConfig = (
    jestConfigPath: string,
    root: string,
    context: ExecutorContext,
    dependencies: DependentBuildableProjectNode[]
): string => {
    const jestConfig = readFileSync(
        path.resolve(context.cwd, jestConfigPath)
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

            const rootPath = node.data.root.split('/');
            rootPath.shift();

            const distPackageJson = readJsonFile(
                path.join(context.cwd, 'dist', node.data.root, 'package.json')
            );

            const indexFile = findIndexFile(distPackageJson);

            if (!indexFile) {
                return prev;
            }

            return [
                ...prev,
                `"${tsAliasPrefix}${rootPath.join('/')}": [
                  path.join(__dirname, '../${offset}dist/', '${
                    node.data.root
                }', '${indexFile}')
                ]`,
            ];
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
            context.targetName,
            context.configurationName ?? ''
        );

        const projectRoot =
            context.workspace.projects[context.projectName].root;

        const tmpProjectFolder = path.join(context.cwd, `tmp/${projectRoot}`);
        mkdirSync(tmpProjectFolder, { recursive: true });

        const temporaryJestConfig = createTmpJestConfig(
            options.jestConfig,
            projectRoot,
            context,
            dependencies
        );

        // Write the temporary jest config with correct paths
        writeFileSync(
            path.join(tmpProjectFolder, 'jest.config.js'),
            temporaryJestConfig,
            'utf8'
        );

        config.jestConfig = path.join(
            process.cwd(),
            `tmp/${projectRoot}`,
            'jest.config.js'
        );
    }

    return jestExecutor(config, context);
}

export default jestExecutor2;
