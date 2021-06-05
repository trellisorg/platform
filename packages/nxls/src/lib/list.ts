import type { FilterableCommand } from './types';
import { filterProjects, readOrGenerateDepFile } from './util';

export interface ListProjects extends FilterableCommand {
    countDependents: boolean;
}

export function listProjects(
    list: ListProjects
): { name: string; numDependents?: number }[] {
    const filtered = filterProjects(list);

    if (list.countDependents) {
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
