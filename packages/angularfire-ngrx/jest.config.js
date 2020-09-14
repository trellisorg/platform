module.exports = {
  name: 'angularfire-ngrx',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/packages/angularfire-ngrx',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js',
  ],
};
