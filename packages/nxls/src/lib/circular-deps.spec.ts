import type { ProjectGraphProjectNode } from '@nrwl/devkit';
import { _findCircularDependencies } from './circular-deps';
import type { Dependencies } from './types';

describe('Circular Deps', () => {
    const app1 = 'app1';
    const lib1 = 'lib1';
    const lib2 = 'lib2';
    const lib3 = 'lib3';

    const projects: Record<string, ProjectGraphProjectNode> = {
        [app1]: {
            type: 'app',
            name: app1,
            data: {},
        },
        [lib1]: {
            type: 'lib',
            name: lib2,
            data: {},
        },
        [lib2]: {
            type: 'lib',
            name: lib2,
            data: {},
        },
        [lib3]: {
            type: 'lib',
            name: lib3,
            data: {},
        },
    };

    it('should have no circular dependencies', () => {
        const dependencies = {
            [app1]: [
                {
                    target: lib1,
                    source: app1,
                    type: 'static',
                },
            ],
            [lib1]: [],
            [lib2]: [],
            [lib3]: [],
        };

        expect(
            _findCircularDependencies(
                {},
                {
                    nodes: projects,
                    dependencies,
                }
            )
        ).toEqual([]);
    });

    it('should find the shorted circular dep path', () => {
        const dependencies: Dependencies = {
            [app1]: [],
            [lib1]: [
                {
                    target: lib2,
                    source: lib1,
                    type: 'static',
                },
            ],
            [lib2]: [
                {
                    target: lib1,
                    source: lib2,
                    type: 'static',
                },
            ],
            [lib3]: [
                {
                    target: lib3,
                    source: lib3,
                    type: 'static',
                },
            ],
        };

        expect(
            _findCircularDependencies(
                {},
                {
                    nodes: projects,
                    dependencies,
                }
            )
        ).toEqual([
            { path: [lib1, lib2, lib1], key: `${lib1} -> ${lib2} -> ${lib1}` },
            { path: [lib3, lib3], key: `${lib3} -> ${lib3}` },
        ]);
    });
});
