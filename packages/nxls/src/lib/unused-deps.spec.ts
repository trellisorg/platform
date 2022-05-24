import type { ProjectGraphProjectNode } from '@nrwl/devkit';
import { _findUnusedDependencies } from './unused-deps';

describe('Unused Deps', () => {
    const app1 = 'app1';
    const lib1 = 'lib1';

    const workspaceJson: Record<string, ProjectGraphProjectNode> = {
        [app1]: {
            type: 'app',
            name: app1,
            data: {},
        },
        [lib1]: {
            type: 'lib',
            name: lib1,
            data: {},
        },
    };

    it('should not find any unused deps', () => {
        const dependencies = {
            [app1]: [
                {
                    target: lib1,
                    source: app1,
                    type: 'static',
                },
            ],
            [lib1]: [],
        };

        expect(
            _findUnusedDependencies(dependencies, workspaceJson, {
                excludeExternal: false,
            })
        ).toEqual([]);
    });

    it('should find lib1 as unused', () => {
        const dependencies = {
            [app1]: [],
            [lib1]: [],
        };

        expect(
            _findUnusedDependencies(dependencies, workspaceJson, {
                excludeExternal: false,
            })
        ).toEqual([lib1]);
    });
});
