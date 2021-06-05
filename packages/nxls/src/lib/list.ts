import type { WorkspaceJsonConfiguration } from '@nrwl/tao/src/shared/workspace';
import { readWorkspaceJson } from '@nrwl/workspace';
import type { Framework } from './types';
import { readOrGenerateDepFile } from './util';

const projectTypeMap = {
    app: 'application',
    lib: 'library',
};

export interface ListProjects {
    buildable?: boolean;
    projectType?: 'app' | 'lib';
    frameworks?: Framework[];
    countDependents: boolean;
}

export function listProjects({
    buildable,
    projectType,
    frameworks,
    countDependents,
}: ListProjects): { name: string; numDependents?: number }[] {
    const workspaceJson: WorkspaceJsonConfiguration = readWorkspaceJson();

    let filtered = Object.entries(workspaceJson.projects);

    if (buildable != null) {
        filtered = filtered.filter(
            ([, config]) => !!config.targets['build'] === buildable
        );
    }

    if (projectType != null) {
        filtered = filtered.filter(
            ([, config]) => config.projectType === projectTypeMap[projectType]
        );
    }

    if (frameworks?.length) {
        filtered = filtered.filter(
            ([, config]) =>
                config.targets['build'] &&
                frameworks.some((framework) =>
                    new RegExp(framework).test(config.targets['build'].executor)
                )
        );
    }

    if (countDependents) {
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
