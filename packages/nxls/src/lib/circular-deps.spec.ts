import { findCircularDependencies } from './circular-deps';
import { Dependencies } from './types';

describe('Circular Deps', () => {
    const app1 = 'app1';
    const lib1 = 'lib1';
    const lib2 = 'lib2';
    const lib3 = 'lib3';

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

        expect(findCircularDependencies(dependencies)).toEqual([]);
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

        expect(findCircularDependencies(dependencies)).toEqual([
            [lib1, lib2, lib1],
            [lib2, lib1, lib2],
            [lib3, lib3],
        ]);
    });
});
