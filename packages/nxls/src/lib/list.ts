import { ListProjects } from './types';
import { readWorkspaceJson } from '@nrwl/workspace';
import { WorkspaceJsonConfiguration } from '@nrwl/tao/src/shared/workspace';
import { readOrGenerateDepFile } from './util';

const projectTypeMap = {
    app: 'application',
    lib: 'library',
};

export function listProjects(
    args: ListProjects
): { name: string; numDependents?: number }[] {
    const workspaceJson: WorkspaceJsonConfiguration = readWorkspaceJson();

    let filtered = Object.entries(workspaceJson.projects);

    if (args.buildable != null) {
        filtered = filtered.filter(
            ([, config]) => !!config.targets['build'] === args.buildable
        );
    }

    if (args.projectType != null) {
        filtered = filtered.filter(
            ([, config]) =>
                config.projectType === projectTypeMap[args.projectType]
        );
    }

    if (args.frameworks?.length) {
        filtered = filtered.filter(
            ([, config]) =>
                config.targets['build'] &&
                args.frameworks.some((framework) =>
                    new RegExp(framework).test(config.targets['build'].executor)
                )
        );
    }

    if (args.countDependents) {
        const nxDepsFile = readOrGenerateDepFile();

        const totals: Record<string, number> = {};

        Object.values(nxDepsFile.dependencies).forEach((deps) => {
            deps.forEach((dep) => {
                if (totals[dep.target]) {
                    totals[dep.target] += 1;
                } else {
                    totals[dep.target] = 1;
                }
            });
        });

        return filtered.map(([project]) => ({
            name: project,
            numDependents: totals[project] ?? 0,
        }));
    }

    return filtered.map(([project]) => ({ name: project }));
}
