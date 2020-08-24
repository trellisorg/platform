import { execSync, spawn } from 'child_process';

console.log('Finding Buildable Projects.');

const result = execSync(`yarn nx affected:libs --plain`);
const exclude = result.toString().split('\n');

console.log('Building Many');

const buildMany = spawn('yarn', [
  'nx',
  'affected',
  `--target=build`,
  `--with-deps`,
  `--exclude=`,
  ...exclude[1].split(' '),
  `--verbose=true`,
  `--parallel`,
]);

buildMany.stdout.on('data', (data) => {
  console.log(data.toString());
});

buildMany.stderr.on('data', (data) => {
  console.error(data.toString());
});

buildMany.on('exit', (code) => {
  console.log('Finished building with code:', code);
});
