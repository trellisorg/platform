/* eslint-disable */
export default {
    displayName: 'ngrx-universal-rehydrate-demo-api',

    globals: {},
    transform: {
        '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/apps/ngrx-universal-rehydrate-demo-api',
    testEnvironment: 'node',
    preset: '../../jest.preset.js',
};
