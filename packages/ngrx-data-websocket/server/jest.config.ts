module.exports = {
    displayName: 'ngrx-data-websocket-server',

    globals: {
        'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' },
    },
    transform: {
        '^.+\\.[tj]sx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../../coverage/packages/ngrx-data-websocket/server',
    testEnvironment: 'node',
    preset: '../../../jest.preset.ts',
};
