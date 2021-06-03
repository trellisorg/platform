import * as yargs from 'yargs';
import { readWorkspaceJson } from '@nrwl/workspace';
import { readOrGenerateDepFile } from './util';
import { findUnusedDependencies } from './unused-deps';
import { findCircularDependencies } from './circular-deps';

yargs
    .command(
        'unused',
        'List projects in the nx workspace',
        {
            excludeExternal: {
                type: 'boolean',
                demandOption: false,
                default: true,
            },
        },
        (args) => {
            const nxDepsFile = readOrGenerateDepFile();

            const workspaceJson = readWorkspaceJson();

            const unusedDeps = findUnusedDependencies(
                nxDepsFile.dependencies,
                workspaceJson.projects,
                args.excludeExternal
            );

            console.log('Unused Deps', unusedDeps);
        }
    )
    .command(
        'circular',
        'Find all circular dependencies in your repo',
        {},
        () => {
            const nxDepsFile = readOrGenerateDepFile();

            const circularDeps = findCircularDependencies(
                nxDepsFile.dependencies
            );

            console.log(circularDeps);
        }
    ).argv;
