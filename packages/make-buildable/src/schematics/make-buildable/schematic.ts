import {
  apply,
  applyTemplates,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { MakeBuildableSchematicSchema } from './schema';
import { checkProjectExists } from '@nrwl/workspace/src/utils/rules/check-project-exists';
import {
  offsetFromRoot,
  readWorkspace,
  updateWorkspaceInTree,
} from '@nrwl/workspace';

interface NormalizedSchema extends MakeBuildableSchematicSchema {
  projectName: string;
  projectRoot: string;
  offsetFromRoot: string;
  isAngular: boolean;
  configurations: string[];
}

function isAngularProject(project: { schematics: any }): boolean {
  return Object.keys(project.schematics).length !== 0;
}

function createAngularBuildTarget(
  projectName: string,
  root: string,
  configurations: string[]
): any {
  return {
    builder: '@nrwl/angular:package',
    options: {
      tsConfig: `${root}/tsconfig.lib.json`,
      project: `${root}/ng-package.json`,
    },
    configurations: configurations.reduce(
      (prev, cur) => ({
        ...prev,
        [cur]: { tsConfig: `${root}/tsconfig.lib.prod.json` },
      }),
      {}
    ),
  };
}

function createNodeBuildTarget(projectName: string, root: string): any {
  return {
    builder: '@nrwl/node:package',
    options: {
      outputPath: `dist/${root}`,
      tsConfig: `${root}/tsconfig.lib.json`,
      packageJson: `${root}/package.json`,
      main: `${root}/src/index.ts`,
      assets: [`${root}/*.md`],
    },
  };
}

function normalizeOptions(
  options: MakeBuildableSchematicSchema,
  workspace: any
): NormalizedSchema {
  const project = workspace.projects[options.projectName];
  const projectRoot = project.root;

  return {
    ...options,
    projectRoot,
    offsetFromRoot: offsetFromRoot(projectRoot),
    isAngular: isAngularProject(project),
    configurations: (options.configs || '')
      .trim()
      .split(',')
      .map((config) => config.trim().toLowerCase()),
  };
}

function addFiles(options: NormalizedSchema): Rule {
  return mergeWith(
    apply(url(`./files/${options.isAngular ? 'angular' : 'node'}`), [
      applyTemplates(options),
      move(options.projectRoot),
    ])
  );
}

function updateWorkspace(schema: NormalizedSchema) {
  return updateWorkspaceInTree((workspace) => {
    const project = workspace.projects[schema.projectName];

    const isAngular = isAngularProject(project);
    const root = project.root;

    project.architect.build = isAngular
      ? createAngularBuildTarget(
          schema.projectName,
          root,
          schema.configurations
        )
      : createNodeBuildTarget(schema.projectName, root);

    return workspace;
  });
}

export default function (options: MakeBuildableSchematicSchema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const workspace = readWorkspace(host);
    const normalizedOptions = normalizeOptions(options, workspace);

    return chain([
      checkProjectExists(options),
      addFiles(normalizedOptions),
      updateWorkspace(normalizedOptions),
    ]);
  };
}
