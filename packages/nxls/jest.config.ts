/* eslint-disable */
export default {
    displayName: 'nxls',

    globals: {
        'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' },
    },
    transform: {
        '^.+\\.[tj]sx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../coverage/packages/nxls',
    testEnvironment: 'node',
    preset: '../../jest.preset.js',
};
