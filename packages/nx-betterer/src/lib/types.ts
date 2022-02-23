import type { ProjectGraph, ProjectGraphProjectNode } from '@nrwl/devkit';

export interface NxBettererContext {
    plainWorkspaceJson: { projects: Record<string, string | any> };
    workspaceJson: ProjectGraph;
    workspaceProjects: ProjectGraphProjectNode[];
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
