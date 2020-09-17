module.exports = {
    name: 'nx-realm',
    preset: '../../jest.config.js',
    transform: {
        '^.+\\.[tj]sx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
    coverageDirectory: '../../coverage/packages/nx-realm',
    globals: { 'ts-jest': { tsConfig: '<rootDir>/tsconfig.spec.json' } },
};
