export interface MakeBuildableSchematicSchema {
    projectName: string;
    configs: string;
    libType: 'node' | 'angular' | 'nest';
}
