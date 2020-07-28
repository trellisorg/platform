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
import * as path from 'path';
import { rollup } from 'rollup';
import * as typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';

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
              .readdirSync(path.join(project.sourceRoot, 'app', directory))
              .filter((file) =>
                fs
                  .statSync(
                    path.resolve(
                      path.join(project.sourceRoot, 'app', directory),
                      file
                    )
                  )
                  .isDirectory()
              )
              .map((buildable) => {
                return from(
                  rollup({
                    input: `${project.sourceRoot}/app/${directory}/${buildable}/source.ts`,
                    plugins: [
                      resolve(),
                      (typescript as any)({
                        lib: ['es6'],
                        target: 'es6',
                        include: [
                          `${project.sourceRoot}/app/${directory}/${buildable}/source.ts`,
                        ],
                        tsconfig: `${project.root}/tsconfig.app.json`,
                      }),
                    ],
                  })
                ).pipe(
                  switchMap((bundle) => {
                    const outputOptions: {
                      format: 'es';
                      file: string;
                      sourcemap: false;
                    } = {
                      format: 'es',
                      file: `${outputPath}/app/${directory}/${buildable}/source.js`,
                      sourcemap: false,
                    };
                    return from(bundle.generate(outputOptions)).pipe(
                      switchMap((output) => bundle.write(outputOptions))
                    );
                  })
                );
              })
          )
        )
      )
    ),
    map(() => {
      return {
        success: true,
      };
    })
  );
}

export default createBuilder(runBuilder);
