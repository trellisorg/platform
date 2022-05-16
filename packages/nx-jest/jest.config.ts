export default {
    displayName: 'nx-jest',

    transform: {
        '^.+\\.[tj]s$': '@swc/jest',
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/packages/nx-jest',
    preset: '../../jest.preset.js',
};
