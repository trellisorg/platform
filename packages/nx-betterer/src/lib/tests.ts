import { BettererTest } from '@betterer/betterer';
import { smaller } from '@betterer/constraints';
import type { NxBettererContext, TsConfig } from './types';
import { isBuildable, isCompilerFlagSet } from './utils';

/**
 * Should only be used with the strict family flags
 */
export function numberOfTestsThatDoNotHaveAStrictFlag(
    context: NxBettererContext,
    flag: keyof TsConfig['compilerOptions']
) {
    return function () {
        return new BettererTest({
            test: () => {
                const projectsWithTestTarget = context.workspaceProjects.filter(
                    (project) => project.data.targets?.test
                );

                return projectsWithTestTarget.filter((project) => {
                    return (
                        !isCompilerFlagSet(
                            context.tsConfigBase,
                            project,
                            'strict',
                            true,
                            'spec'
                        ) &&
                        !isCompilerFlagSet(
                            context.tsConfigBase,
                            project,
                            flag,
                            true,
                            'spec'
                        )
                    );
                }).length;
            },
            constraint: smaller,
            goal: 0,
        });
    };
}

export function numberOfTestsThatAreNotStrict(context: NxBettererContext) {
    return () => {
        return new BettererTest({
            test: () => {
                const projectsWithTestTarget = context.workspaceProjects.filter(
                    (project) => project.data.targets?.test
                );

                return projectsWithTestTarget.filter((project) => {
                    return !isCompilerFlagSet(
                        context.tsConfigBase,
                        project,
                        'strict',
                        true,
                        'spec'
                    );
                }).length;
            },
            constraint: smaller,
            goal: 0,
        });
    };
}

/**
 * Should only be used with the strict family flags
 */
export function numberOfBuildsThatDoNotHaveAStrictFlag(
    context: NxBettererContext,
    flag: keyof TsConfig['compilerOptions']
) {
    return function () {
        return new BettererTest({
            test: () => {
                const projectsThatShouldBeBuildable =
                    context.workspaceProjects.filter(
                        (project) =>
                            project.type !== 'e2e' && isBuildable(project)
                    );

                return projectsThatShouldBeBuildable.filter((project) => {
                    return (
                        !isCompilerFlagSet(
                            context.tsConfigBase,
                            project,
                            'strict',
                            true,
                            project.type
                        ) &&
                        !isCompilerFlagSet(
                            context.tsConfigBase,
                            project,
                            flag,
                            true,
                            project.type
                        )
                    );
                }).length;
            },
            constraint: smaller,
            goal: 0,
        });
    };
}

export function numberOfBuildsThatAreNotStrict(context: NxBettererContext) {
    return () => {
        return new BettererTest({
            test: () => {
                return context.workspaceProjects
                    .filter((project) => isBuildable(project))
                    .filter((project) => {
                        return !isCompilerFlagSet(
                            context.tsConfigBase,
                            project,
                            'strict',
                            true,
                            project.type
                        );
                    }).length;
            },
            constraint: smaller,
            goal: 0,
        });
    };
}

export function numberOfLibrariesNotUsingStandaloneConfig(
    context: NxBettererContext
) {
    return () => {
        return new BettererTest({
            test: () => {
                return Object.values(
                    context.plainWorkspaceJson.projects
                ).filter((config) => typeof config !== 'string').length;
            },
            constraint: smaller,
            goal: 0,
        });
    };
}

export function numberOfNonBuildableLibraries(context: NxBettererContext) {
    return () => {
        return new BettererTest({
            test: () => {
                return context.workspaceProjects.filter(
                    (project) => !isBuildable(project) && project.type === 'lib'
                ).length;
            },
            constraint: smaller,
            goal: 0,
        });
    };
}
