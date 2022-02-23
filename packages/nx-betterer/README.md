# nx-betterer

A utility library for checking commons metrics in a nx repo.

# Installation

If you do not have `betterer` installed yet follow the installation instructions here: https://phenomnomnominal.github.io/betterer/docs/installation

Once you have `betterer` installed run:

```bash
yarn add -D @trellisorg/nx-betterer
```

# Usage

You should have a `.betterer.ts` file in the root of your repo after installing `betterer`.

If this is your first time setting up tests it will look something like:

```typescript
export default {};
```

To use the `nx-betterer` presets change it to:

```typescript
import { nxBettererPreset } from '@trellisorg/nx-betterer';

export default {
    ...nxBettererPreset(),
};
```

That is all you need to do to get started.

The preset enables all the tests provided, each of which we want to get smaller with a goal of 0:

0 `function name` - description

1. `numberOfNonBuildableLibraries` - The number of libraries that are not yet buildable
2. `numberOfLibrariesNotUsingStandaloneConfig` - The number of projects not using the standalone config
3. `numberOfBuildsThatAreNotStrict` - The number of `build` targets that are not fully `strict`
4. `numberOfTestsThatAreNotStrict` - The number of `test` targets that are not fully strict
5. `numberOfTestsThatDoNotHaveAStrictFlag` - The number of `test` targets that do not have a certain strict flag enabled (if `strict` is true, that counts)
6. `numberOfBuildsThatDoNotHaveAStrictFlag` - The number of `build` targets that do not have a certain strict flag enabled (if `strict` is true, that counts)

If you only want to enable some tests you can use them individually by importing the function specifically and pass in the generated context:

```typescript
import {
    numberOfNonBuildableLibraries,
    setupNxBetterer,
} from '@trellisorg/nx-betterer';

// Build the Nx-Betterer context needed to calculate metrics.
// This is done for you if using the `nxBettererPreset` configuration.
const context = setupNxBetterer();

export default {
    'number of libraries that are not buildable':
        numberOfNonBuildableLibraries(context),
};
```
