import { WatchBuilderSchema } from './schema';
import { Rule } from '@angular-devkit/schematics';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodemon = require('nodemon');

export default function (options: WatchBuilderSchema): Rule {
  return (host) => {
    return new Promise<void>((resolve, reject) => {
      nodemon({
        restartable: 'rs',
        ignore: [
          '.git',
          'node_modules/**/node_modules',
          '**/*.spec.*',
          '**/jest.*',
        ],
        verbose: true,
        exec: `node ./node_modules/@trellisorg/watch-and-build/src/schematics/watch/run.js`,
        watch: ['apps/', 'libs/'],
        env: {
          NODE_ENV: 'development',
        },
        ext: 'js,json,ts',
      });

      nodemon
        .on('start', function () {
          console.log('App has started');
        })
        .on('quit', function () {
          console.log('App has quit');
          process.exit();
        })
        .on('restart', function (files) {
          console.log('App restarted due to: ', files);
        });
    });
  };
}
