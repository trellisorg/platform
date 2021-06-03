import * as yargs from 'yargs';
import { readWorkspaceJson } from '@nrwl/workspace';
import { readOrGenerateDepFile } from './util';
import { findUnusedDependencies } from './unused-deps';
import { findCircularDependencies } from './circular-deps';
import { listProjects } from './list';
import { findAllDependencyChains } from './find-dep-chain';
import { calculateSubsetPercent } from './calculate-subset-percent';

yargs
    .command(
        'overlap',
        'Find the percentage overlap between all libraries dependencies',
        {
            threshold: {
                type: 'number',
                demandOption: false,
                default: 0,
            },
        },
        (args) => {
            calculateSubsetPercent(
                readOrGenerateDepFile().dependencies,
                args.threshold
            );
        }
    )
    .command(
        'chain',
        'Find the dependency chain between sources and a target lib',
        {
            source: {
                alias: 's',
                type: 'array',
                demandOption: true,
                default: [],
            },
            target: {
                alias: 't',
                type: 'string',
                demandOption: true,
            },
        },
        (args) => {
            const nxDepsFile = readOrGenerateDepFile();
            const chains = findAllDependencyChains(
                args.source,
                args.target,
                nxDepsFile.dependencies
            );

            chains
                .map((chain) => chain.join(' -> '))
                .forEach((chain) => {
                    console.log(chain);
                });
        }
    )
    .command(
        'list',
        'List projects in workspace, flags are interpreted as AND conditions',
        {
            buildable: {
                alias: 'b',
                type: 'boolean',
                demandOption: false,
                default: undefined,
            },
            projectType: {
                alias: 'p',
                choices: ['app', 'lib'],
                demandOption: false,
                default: undefined,
            },
            frameworks: {
                alias: 'f',
                type: 'array',
                choices: ['angular', 'node', 'react', 'gatsby', 'next', 'web'],
                demandOption: false,
                default: [],
            },
        },
        (args) => {
            const projects = listProjects(args);
            console.log(projects);
        }
    )
    .command(
        'unused',
        'List unused dependencies',
        {
            excludeExternal: {
                alias: 'e',
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
