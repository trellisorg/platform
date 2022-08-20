/* eslint-disable */
export default {
    name: 'make-buildable',

    transform: {
        '^.+\\.[tj]sx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
    coverageDirectory: '../../coverage/packages/make-buildable',
    globals: { 'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' } },
    testEnvironment: 'node',
    preset: '../../jest.preset.js',
};
