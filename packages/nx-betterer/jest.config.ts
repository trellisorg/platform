/* eslint-disable */
export default {
    displayName: 'nx-betterer',

    globals: {},
    transform: {
        '^.+\\.[tj]s$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
            },
        ],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/packages/nx-betterer',
    preset: '../../jest.preset.js',
};
