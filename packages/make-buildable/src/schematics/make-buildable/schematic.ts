import {
    apply,
    applyTemplates,
    chain,
    mergeWith,
    move,
    Rule,
    SchematicContext,
    Tree,
    url,
} from '@angular-devkit/schematics';
import { offsetFromRoot, readNxJson } from '@nrwl/devkit';
import {
    readJsonInTree,
    readWorkspace,
    updateJsonInTree,
    updateWorkspaceInTree,
} from '@nrwl/workspace';
import { checkProjectExists } from '@nrwl/workspace/src/utils/rules/check-project-exists';
import * as merge from 'lodash.merge';
import type { MakeBuildableSchematicSchema } from './schema';

interface NormalizedSchema extends MakeBuildableSchematicSchema {
    projectName: string;
    projectRoot: string;
    offsetFromRoot: string;
    isAngular: boolean;
    configurations: string[];
    pathInLibs: string;
    angularVersion?: string;
    tsLibVersion?: string;
    npmScope: string;
}

interface Versions {
    nx: number;
    angular?: string;
    tsLib?: string;
}

const parseVersionRegex = /\d+\.\d+\.\d+/;

function getVersions(host: Tree): Versions {
    const packageJson = readJsonInTree(host, 'package.json');
    const nrwlWorkspace =
        packageJson.devDependencies['@nrwl/workspace'].match(
            parseVersionRegex
        )[0];
    const angular =
        packageJson.dependencies['@angular/core']?.match(parseVersionRegex)[0];
    const tsLib =
        packageJson.dependencies['tslib']?.match(parseVersionRegex)[0];
    return {
        angular,
        tsLib,
        nx: parseInt(nrwlWorkspace.split('.')[0]),
    };
}

function createAngularBuildTarget(
    projectName: string,
    root: string,
    configurations: string[],
    nxVersion: number
): any {
    return {
        builder:
            nxVersion >= 11
                ? '@nrwl/angular:ng-packagr-lite'
                : '@nrwl/angular:package',
        options: {
            tsConfig: `${root}/tsconfig.lib.json`,
            project: `${root}/ng-package.json`,
        },
        configurations: configurations.reduce(
            (prev, cur) => ({
                ...prev,
                [cur]: { tsConfig: `${root}/tsconfig.lib.prod.json` },
            }),
            {}
        ),
    };
}

function createNodeBuildTarget(projectName: string, root: string): any {
    return {
        builder: '@nrwl/node:package',
        options: {
            outputPath: `dist/${root}`,
            tsConfig: `${root}/tsconfig.lib.json`,
            packageJson: `${root}/package.json`,
            main: `${root}/src/index.ts`,
            assets: [`${root}/*.md`],
        },
    };
}

function normalizeOptions(
    options: MakeBuildableSchematicSchema,
    workspace: any,
    versions: Versions,
    npmScope: string
): NormalizedSchema {
    const project = workspace.projects[options.projectName];
    const projectRoot = project.root;

    return {
        ...options,
        projectRoot,
        offsetFromRoot: offsetFromRoot(projectRoot),
        isAngular: options.libType === 'angular',
        configurations: (options.configs || '')
            .trim()
            .split(',')
            .map((config) => config.trim().toLowerCase()),
        pathInLibs: project.root.substring(project.root.indexOf('/') + 1),
        angularVersion: versions.angular,
        tsLibVersion: versions.tsLib,
        npmScope,
    };
}

function addFiles(options: NormalizedSchema): Rule {
    return mergeWith(
        apply(url(`./files/${options.isAngular ? 'angular' : 'node'}`), [
            applyTemplates(options),
            move(options.projectRoot),
        ])
    );
}

function updateWorkspace(schema: NormalizedSchema, nxVersion: number) {
    return updateWorkspaceInTree((workspace) => {
        const project = workspace.projects[schema.projectName];

        const isAngular = schema.libType === 'angular';
        const root = project.root;

        project.architect.build = isAngular
            ? createAngularBuildTarget(
                  schema.projectName,
                  root,
                  schema.configurations,
                  nxVersion
              )
            : createNodeBuildTarget(schema.projectName, root);

        return workspace;
    });
}

function updateLibTsConfigAngular(root: string): Rule {
    return updateJsonInTree(`${root}/tsconfig.lib.json`, (json, context) => {
        json = merge(
            {
                compilerOptions: {
                    target: 'es2015',
                    declaration: true,
                    declarationMap: true,
                    inlineSources: true,
                    types: [],
                    lib: ['dom', 'es2018'],
                },
                angularCompilerOptions: {
                    skipTemplateCodegen: true,
                    strictMetadataEmit: true,
                    enableResourceInlining: true,
                },
                exclude: ['src/test-setup.ts', '**/*.spec.ts'],
                include: ['**/*.ts'],
            },
            json
        );

        return json;
    });
}

function updateLibTsConfigNode(root: string): Rule {
    return updateJsonInTree(`${root}/tsconfig.lib.json`, (json, context) => {
        return merge(
            {
                compilerOptions: {
                    module: 'commonjs',
                    declaration: true,
                    types: ['node'],
                },
                exclude: ['**/*.spec.ts'],
                include: ['**/*.ts'],
            },
            json
        );
    });
}

export default function (options: MakeBuildableSchematicSchema): Rule {
    return (host: Tree, context: SchematicContext) => {
        const workspace = readWorkspace(host);
        const versions = getVersions(host);
        const npmScope = readNxJson().npmScope;
        const normalizedOptions = normalizeOptions(
            options,
            workspace,
            versions,
            npmScope
        );

        return chain([
            checkProjectExists(options),
            addFiles(normalizedOptions),
            normalizedOptions.isAngular
                ? updateLibTsConfigAngular(normalizedOptions.projectRoot)
                : updateLibTsConfigNode(normalizedOptions.projectRoot),
            updateWorkspace(normalizedOptions, versions.nx),
        ]);
    };
}
