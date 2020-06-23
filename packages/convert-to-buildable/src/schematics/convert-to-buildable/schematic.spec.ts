import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { createEmptyWorkspace } from '@nrwl/workspace/testing';
import { join } from 'path';

import { ConvertToBuildableSchematicSchema } from './schema';

describe('convert-to-buildable schematic', () => {
  let appTree: Tree;
  const options: ConvertToBuildableSchematicSchema = { name: 'test' };

  const testRunner = new SchematicTestRunner(
    '@trellis/convert-to-buildable',
    join(__dirname, '../../../collection.json')
  );

  beforeEach(() => {
    appTree = createEmptyWorkspace(Tree.empty());
  });

  it('should run successfully', async () => {
    await expect(
      testRunner
        .runSchematicAsync('convert-to-buildable', options, appTree)
        .toPromise()
    ).resolves.not.toThrowError();
  });
});
