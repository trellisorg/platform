import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import { from, Observable, zip } from 'rxjs';
import { BuildBuilderSchema } from './schema';
import { map, switchMap } from 'rxjs/operators';
import { readWorkspaceJson } from '@nrwl/workspace';
import * as fs from 'fs';
import { join, resolve } from 'path';

export function runBuilder(
  options: BuildBuilderSchema,
  context: BuilderContext
): Observable<BuilderOutput> {
  const workspace = readWorkspaceJson();

  const project = workspace.projects[context.target.project];
  const outputPath = project.architect.build.options.outputPath;

  return from(
    context.scheduleBuilder(
      '@nrwl/node:build',
      project.architect.build.options,
      { target: context.target }
    )
  ).pipe(
    switchMap((builderRun) => builderRun.output),
    switchMap(() =>
      zip(
        ...[].concat(
          ...['functions'].map((directory) =>
            fs
              .readdirSync(join(project.sourceRoot, 'app', directory))
              .filter((file) =>
                fs
                  .statSync(
                    resolve(join(project.sourceRoot, 'app', directory), file)
                  )
                  .isDirectory()
              )
              .map((buildable) => {
                return from(
                  context.scheduleBuilder(
                    '@nrwl/node:build',
                    {
                      ...project.architect.build.options,
                      main: `${project.sourceRoot}/app/${directory}/${buildable}/source.ts`,
                      outputPath: `${outputPath}/app/${directory}/${buildable}`,
                      assets: [],
                    },
                    { target: context.target }
                  )
                ).pipe(
                  switchMap((builderRun) => builderRun.output),
                  map((builderOutput) => {
                    fs.renameSync(
                      `${outputPath}/app/${directory}/${buildable}/main.js`,
                      `${outputPath}/app/${directory}/${buildable}/source.js`
                    );

                    if (
                      fs.existsSync(
                        `${outputPath}/app/${directory}/${buildable}/main.js.map`
                      )
                    ) {
                      fs.renameSync(
                        `${outputPath}/app/${directory}/${buildable}/main.js.map`,
                        `${outputPath}/app/${directory}/${buildable}/source.js.map`
                      );
                    }

                    return builderOutput;
                  })
                );
              })
          )
        )
      )
    ),
    map((results: BuilderOutput[]) => {
      return {
        success: results.reduce<boolean>(
          (prev, cur) => prev && cur.success,
          true
        ),
      };
    })
  );
}

export default createBuilder(runBuilder);
