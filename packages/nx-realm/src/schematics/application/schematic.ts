import {
  apply,
  applyTemplates,
  chain,
  externalSchematic,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  formatFiles,
  getWorkspacePath,
  names,
  offsetFromRoot,
  projectRootDir,
  ProjectType,
  toFileName,
  updateJsonInTree,
} from '@nrwl/workspace';
import { NxRealmSchematicSchema } from './schema';
import { join } from 'path';

/**
 * Depending on your needs, you can change this to either `Library` or `Application`
 */
const projectType = ProjectType.Application;

interface NormalizedSchema extends NxRealmSchematicSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(options: NxRealmSchematicSchema): NormalizedSchema {
  const name = toFileName(options.name);
  const projectDirectory = options.directory
    ? `${toFileName(options.directory)}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${projectRootDir(projectType)}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
    appName: options.appName ? options.appName : projectName,
  };
}

function addMain(options: NormalizedSchema): Rule {
  return (host: Tree) => {
    host.overwrite(
      join(options.projectRoot, 'src/main.ts'),
      `// this file is only here to satisfy the @nrwl/node build`
    );
  };
}

function addFiles(options: NormalizedSchema): Rule {
  return mergeWith(
    apply(url(`./files`), [
      applyTemplates({
        ...options,
        ...names(options.name),
        offsetFromRoot: offsetFromRoot(options.projectRoot),
      }),
      move(join(options.projectRoot, 'src/app')),
    ])
  );
}

export default function (options: NxRealmSchematicSchema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const normalizedOptions = normalizeOptions(options);
    return chain([
      externalSchematic('@nrwl/node', 'application', options),
      updateJsonInTree(getWorkspacePath(host), (json) => {
        const project = json.projects[normalizedOptions.projectName];

        project.architect.build.options.assets = [
          join(normalizedOptions.projectRoot, 'src/app/config.json'),
          ...[
            'functions/**/*.json',
            'services/**/*.json',
            'triggers/**/*.json',
            'hosting/**/*.json',
            'values/**/*.json',
          ].map((glob) => ({
            glob,
            input: join(normalizedOptions.projectRoot, 'src/app/'),
            output: './app',
          })),
        ];
        project.architect.build.builder = './dist/packages/nx-realm:build';

        return json;
      }),
      addFiles(normalizedOptions),
      addMain(normalizedOptions),
      formatFiles(options),
    ]);
  };
}
