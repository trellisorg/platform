# nx-jest

A wrapper around the `@nrwl/jest` library that adds on the ability to run your tests from built artifacts rather than
from libs (and deps) source.

# Installation

Npm
`npm i --save-dev @trellisorg/nx-jest`

Yarn
`yarn add -D @trellisorg/nx-jest`

# Setup

Replace the executor in your projects configuration

Before:

```json
{
    "targets": {
        "test": {
            "executor": "@nrwl/jest:jest",
            "outputs": ["coverage/packages/<package name>"],
            "options": {
                "jestConfig": "packages/<package name>/jest.config.js",
                "passWithNoTests": true
            }
        }
    }
}
```

After:

```json
{
    "targets": {
        "test": {
            "executor": "@trellisorg/nx-jest:jest",
            "outputs": ["coverage/packages/<package name>"],
            "options": {
                "jestConfig": "packages/<package name>/jest.config.js",
                "passWithNoTests": true,
                "testFromSource": false
            }
        }
    }
}
```

Notice the `testFromSource` flag configured in the after example. This is what tells the executor to point all imports for a libraries
dependencies to the pre-compiled artifacts in the dist folder.

This requires that all the library's dependencies be `buildable` and for all dependencies be built prior to tests being run. There are two ways to accomplish this:

1. Set up the `targetDependencies` in your `nx.json`

```json
{
    "targetDependencies": {
        "test": [
            {
                "target": "build",
                "projects": "dependencies"
            }
        ],
        "build": [
            {
                "target": "build",
                "projects": "dependencies"
            }
        ]
    }
}
```

Or if you are incrementally making your codebase buildable and cannot enable the target dependencies globally

2. Add the `dependsOn` configuration to your libraries targets. Note: this will also need to be done all the way through the dep tree for your library
   so that all of your libraries dependencies are also configured so that when any libs build target through the chain is called all build targets for all libs are called.

```json
{
    "targets": {
        "build": {
            "executor": "@nrwl/<type>",
            "outputs": ["{options.outputPath}"],
            "options": {
                "outputPath": "dist/libs/<package name>",
                "main": "libs/<package name>/src/index.ts",
                "tsConfig": "libs/<package name>/tsconfig.lib.json",
                "assets": ["libs/<package name>/*.md"]
            },
            "dependsOn": [
                {
                    "target": "build",
                    "projects": "dependencies"
                }
            ]
        },
        "test": {
            "executor": "@trellisorg/nx-jest:jest",
            "outputs": ["coverage/packages/<package name>"],
            "options": {
                "jestConfig": "packages/<package name>/jest.config.js",
                "passWithNoTests": true,
                "testFromSource": false
            },
            "dependsOn": [
                {
                    "target": "build",
                    "projects": "self"
                }
            ]
        }
    }
}
```

What this will do is tell Nx that when `test` is run for a lib to build that lib, and then Nx knows that when that lib has the `build` target called on it
to also call `build` on all that libs dependencies, as long as this configured all the way through the tree then the `build` target will be called for all
dependencies which would all be used by the test target instead of testing from source.
