import { createProjectGraphAsync } from '@nx/devkit';
import * as yargs from 'yargs';
import { calcDependencyOverlap } from './calc-dependency-overlap';
import { findCircularDependencies } from './circular-deps';
import { findAllDependencyChains, findDependencies, findDependents } from './find-dep-chain';
import { listProjects } from './list';
import { findUnusedDependencies } from './unused-deps';

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
            const records = calcDependencyOverlap(args);

            records.forEach(({ outerDep, innerDep, percent }) => {
                console.log(
                    `${outerDep} shares ${Math.round(percent * 100 * 100) / 100}% of it's deps with ${innerDep}`
                );
            });
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
            if (args.source?.length && (args.dependencies != null || args.dependents != null)) {
                // TODO: use chalk to display an error
                console.error('--source cannot be used with --dependencies or --dependencies');
                return;
            }

            if (args.dependencies != null && args.dependents != null) {
                // TODO: use chalk to display an error
                console.error('Please either either `--dependants or `--dependencies but not both.');
                return;
            }

            let chains: string[] = [];

            if (args.dependencies != null) {
                chains = findDependencies(args);
            } else if (args.dependents) {
                chains = findDependents(args);
            } else {
                chains = findAllDependencyChains(args as unknown as any).map((chain) => chain.join(' -> '));
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
            countDependents: {
                alias: 'n',
                type: 'boolean',
                demandOption: false,
                default: false,
            },
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
        async (args) => {
            const projectGraph = await createProjectGraphAsync();
            const projects = listProjects(args as unknown as any, projectGraph.nodes);
            projects.forEach((project) => {
                console.log(`${project.name}`, args.countDependents ? ` used ${project.numDependents} times.` : '');
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
        async (args) => {
            const unusedDeps = await findUnusedDependencies(args as unknown as any);

            console.log('Unused Deps', unusedDeps);
        }
    )
    .command(
        'circular',
        'Find all circular dependencies in your repo',
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
        async (args) => {
            const circularDeps = await findCircularDependencies(args as unknown as any);

            if (circularDeps.length)
                circularDeps.forEach((value) => {
                    console.log(value.key);
                });
            else {
                console.log('No circular dependencies found.');
            }
        }
    ).argv;
