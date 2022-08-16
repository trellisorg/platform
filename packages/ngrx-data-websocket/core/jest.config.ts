/* eslint-disable */
export default {
    displayName: 'ngrx-data-websocket-core',

    globals: {
        'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' },
    },
    transform: {
        '^.+\\.[tj]sx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../../coverage/packages/ngrx-data-websocket/core',
    testEnvironment: 'node',
    preset: '../../../jest.preset.js',
};
