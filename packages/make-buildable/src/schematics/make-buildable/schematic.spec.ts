import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { createEmptyWorkspace } from '@nrwl/workspace/testing';
import { join } from 'path';

import { MakeBuildableSchematicSchema } from './schema';

describe('make-buildable schematic', () => {
  let appTree: Tree;
  const options: MakeBuildableSchematicSchema = { name: 'test' };

  const testRunner = new SchematicTestRunner(
    '@trellis/make-buildable',
    join(__dirname, '../../../collection.json')
  );

  beforeEach(() => {
    appTree = createEmptyWorkspace(Tree.empty());
  });

  it('should run successfully', async () => {
    await expect(
      testRunner
        .runSchematicAsync('make-buildable', options, appTree)
        .toPromise()
    ).resolves.not.toThrowError();
  });
});
