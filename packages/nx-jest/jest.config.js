module.exports = {
    displayName: 'nx-jest',
    preset: '../../jest.preset.js',
    transform: {
        '^.+\\.[tj]s$': '@swc/jest',
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/packages/nx-jest',
};
