import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { createEmptyWorkspace } from '@nrwl/workspace/testing';
import { join } from 'path';

import { NxRealmSchematicSchema } from './schema';

describe('nx-realm schematic', () => {
  let appTree: Tree;
  const options: NxRealmSchematicSchema = { name: 'test' };

  const testRunner = new SchematicTestRunner(
    '@trellis/nx-realm',
    join(__dirname, '../../../collection.json')
  );

  beforeEach(() => {
    appTree = createEmptyWorkspace(Tree.empty());
  });

  it('should run successfully', async () => {
    await expect(
      testRunner.runSchematicAsync('nx-realm', options, appTree).toPromise()
    ).resolves.not.toThrowError();
  });
});
