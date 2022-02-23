import { setupNxBetterer } from './setup';
import {
    numberOfBuildsThatAreNotStrict,
    numberOfBuildsThatDoNotHaveAStrictFlag,
    numberOfLibrariesNotUsingStandaloneConfig,
    numberOfNonBuildableLibraries,
    numberOfTestsThatAreNotStrict,
    numberOfTestsThatDoNotHaveAStrictFlag,
} from './tests';
import { strictModeFamilyOptions } from './types';

export function nxBettererPreset() {
    const context = setupNxBetterer();

    return {
        'number of libraries that are not buildable':
            numberOfNonBuildableLibraries(context),
        'number of libraries not using standalone config':
            numberOfLibrariesNotUsingStandaloneConfig(context),
        'number of builds that not are strict':
            numberOfBuildsThatAreNotStrict(context),
        'number of tests that are not strict':
            numberOfTestsThatAreNotStrict(context),
        ...strictModeFamilyOptions.reduce(
            (tests, flag) => ({
                ...tests,
                [`number of tests that are are not strict with ${flag} (and are not strict)`]:
                    numberOfTestsThatDoNotHaveAStrictFlag(context, flag),
            }),
            {}
        ),
        ...strictModeFamilyOptions.reduce(
            (tests, flag) => ({
                ...tests,
                [`number of builds that are not strict with ${flag} (and are not strict, does not include non-buildable)`]:
                    numberOfBuildsThatDoNotHaveAStrictFlag(context, flag),
            }),
            {}
        ),
    };
}
