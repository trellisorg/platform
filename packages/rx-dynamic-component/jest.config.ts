/* eslint-disable */
export default {
    displayName: 'rx-dynamic-component',

    setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
    globals: {},
    coverageDirectory: '../../coverage/packages/rx-dynamic-component',
    snapshotSerializers: [
        'jest-preset-angular/build/serializers/no-ng-attributes',
        'jest-preset-angular/build/serializers/ng-snapshot',
        'jest-preset-angular/build/serializers/html-comment',
    ],
    transform: {
        '^.+.(ts|mjs|js|html)$': [
            'jest-preset-angular',
            {
                stringifyContentPathRegex: '\\.(html|svg)$',

                tsconfig: '<rootDir>/tsconfig.spec.json',
            },
        ],
    },
    transformIgnorePatterns: ['node_modules/(?!.*.mjs$)'],
    preset: '../../jest.preset.js',
};
