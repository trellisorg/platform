import type { WorkspaceConfiguration } from '@nrwl/devkit';
import type { ProjectConfiguration } from '@nrwl/tao/src/shared/workspace';

export interface NxBettererContext {
    plainWorkspaceJson: WorkspaceConfiguration;
    workspaceProjects: ProjectConfiguration[];
    tsConfigBase: TsConfig;
}

/**
 * A simple type denoting the flags that encompass strict mode
 */
export interface TsConfig {
    compilerOptions: {
        strict: boolean | undefined;
        alwaysStrict: boolean | undefined;
        strictBindCallApply: boolean | undefined;
        strictFunctionTypes: boolean | undefined;
        strictNullChecks: boolean | undefined;
        strictPropertyInitialization: boolean | undefined;
        noImplicitAny: boolean | undefined;
        noImplicitThis: boolean | undefined;
        useUnknownInCatchVariables: boolean | undefined;
    };
}

/**
 * The flags that encompass strict mode as an array that can be checked.
 */
export const strictModeFamilyOptions: (keyof TsConfig['compilerOptions'])[] = [
    'alwaysStrict',
    'strictBindCallApply',
    'strictFunctionTypes',
    'strictNullChecks',
    'strictPropertyInitialization',
    'noImplicitAny',
    'noImplicitThis',
    'useUnknownInCatchVariables',
];
