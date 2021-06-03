import { ListProjects } from './types';
import { readWorkspaceJson } from '@nrwl/workspace';
import { WorkspaceJsonConfiguration } from '@nrwl/tao/src/shared/workspace';

const projectTypeMap = {
    app: 'application',
    lib: 'library',
};

export function listProjects(args: ListProjects): string[] {
    const workspaceJson: WorkspaceJsonConfiguration = readWorkspaceJson();

    let filtered = Object.entries(workspaceJson.projects);

    if (args.buildable != null) {
        filtered = filtered.filter(([, config]) => !!config.targets['build']);
    }

    if (args.projectType != null) {
        filtered = filtered.filter(
            ([, config]) =>
                config.projectType === projectTypeMap[args.projectType]
        );
    }

    if (args.frameworks) {
        filtered = filtered.filter(
            ([, config]) =>
                config.targets['build'] &&
                args.frameworks.some((framework) =>
                    new RegExp(framework).test(config.targets['build'].executor)
                )
        );
    }

    return filtered.map(([project]) => project);
}
