export default {
    displayName: 'ngrx-universal-rehydrate-demo-api',

    globals: {
        'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' },
    },
    transform: {
        '^.+\\.[tj]s$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/apps/ngrx-universal-rehydrate-demo-api',
    testEnvironment: 'node',
    preset: '../../jest.preset.js',
};
