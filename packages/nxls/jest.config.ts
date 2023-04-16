/* eslint-disable */
export default {
    displayName: 'nxls',

    globals: {},
    transform: {
        '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../coverage/packages/nxls',
    testEnvironment: 'node',
    preset: '../../jest.preset.js',
};
