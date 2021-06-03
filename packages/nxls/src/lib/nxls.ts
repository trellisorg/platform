import * as yargs from 'yargs';
import { readWorkspaceJson } from '@nrwl/workspace';
import { readOrGenerateDepFile } from './util';
import { findUnusedDependencies } from './unused-deps';
import { findCircularDependencies } from './circular-deps';
import { listProjects } from './list';
import {
    findAllDependencyChains,
    findDependencies,
    findDependents,
} from './find-dep-chain';
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
                default: [],
            },
            target: {
                alias: 't',
                type: 'string',
                demandOption: true,
            },
            dependents: {
                alias: 'd',
                type: 'boolean',
                demandOption: false,
            },
            dependencies: {
                alias: 'c',
                type: 'boolean',
                demandOptions: false,
            },
        },
        (args) => {
            if (
                args.source?.length &&
                (args.dependencies != null || args.dependents != null)
            ) {
                // TODO: use chalk to display an error
                console.error(
                    '--source cannot be used with --dependencies or --dependencies'
                );
                return;
            }

            if (args.dependencies != null && args.dependents != null) {
                // TODO: use chalk to display an error
                console.error(
                    'Please either either `--dependants or `--dependencies but not both.'
                );
                return;
            }

            let chains: string[] = [];

            const nxDepsFile = readOrGenerateDepFile();

            if (args.dependencies != null) {
                chains = findDependencies(args.target, nxDepsFile.dependencies);
            } else if (args.dependents) {
                chains = findDependents(args.target, nxDepsFile.dependencies);
            } else {
                chains = findAllDependencyChains(
                    args.source,
                    args.target,
                    nxDepsFile.dependencies
                ).map((chain) => chain.join(' -> '));
            }

            chains.forEach((chain) => {
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
            countDependents: {
                alias: 'n',
                type: 'boolean',
                demandOption: false,
                default: false,
            },
        },
        (args) => {
            const projects = listProjects(args);
            projects.forEach((project) => {
                console.log(
                    `${project.name}`,
                    args.countDependents
                        ? ` used ${project.numDependents} times.`
                        : ''
                );
            });
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
