import { ProjectConfiguration } from '@nrwl/tao/src/shared/workspace';
import { NxDepGraph } from './types';
import { findAllDependencyChains } from './find-dep-chain';

describe('FindDepChain', () => {
    const app1 = 'app1';
    const lib1 = 'lib1';
    const lib2 = 'lib2';
    const lib3 = 'lib3';

    it('should find no chains', () => {
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

        expect(findAllDependencyChains([app1], lib3, dependencies)).toEqual([]);
    });

    it('should find a chain between app1 and lib3', () => {
        const dependencies = {
            [app1]: [
                {
                    target: lib1,
                    source: app1,
                    type: 'static',
                },
            ],
            [lib1]: [
                {
                    target: lib2,
                    source: lib1,
                    type: 'static',
                },
            ],
            [lib2]: [
                {
                    target: lib3,
                    source: lib2,
                    type: 'static',
                },
            ],
            [lib3]: [],
        };

        expect(findAllDependencyChains([app1], lib3, dependencies)).toEqual([
            [app1, lib1, lib2, lib3],
        ]);
    });
});
