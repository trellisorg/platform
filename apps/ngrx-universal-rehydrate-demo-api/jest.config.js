module.exports = {
    displayName: 'ngrx-universal-rehydrate-demo-api',
    preset: '../../jest.preset.js',
    globals: {
        'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' },
    },
    transform: {
        '^.+\\.[tj]s$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/apps/ngrx-universal-rehydrate-demo-api',
};
