module.exports = {
    name: 'dynamic-remote',
    exposes: {
        './Module': 'apps/dynamic-remote/src/app/remote-entry/entry.module.ts',
    },
};
