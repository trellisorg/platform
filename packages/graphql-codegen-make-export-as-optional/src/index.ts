import type { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import type { OperationDefinitionNode, TypeNode } from 'graphql';
import { set } from 'lodash';

const rollbackPluginName = '@trellisorg/graphql-codegen-restore-export-as-changes';

export interface OperationDefinitionVariableReplacement {
    documentIndex: number;
    value: TypeNode;
    path: string;
}

/**
 * Finds all variables names in the operation definition that have been marked with the `@export(as)` directive.
 *
 * @param definition
 */
function findExportAsFieldNameForOperation(definition: OperationDefinitionNode) {
    const exportAsFieldNames: string[] = [];
    const selectionSet = definition.selectionSet;


    for (const selection of selectionSet.selections) {
        if (selection.directives == null) {
            continue;
        }

        if (selection.directives.length > 0) {
            for (const directive of selection.directives) {
                if (directive.name.value === 'export') {
                    const argumentNode = directive.arguments?.find((argument) => argument.name.value === 'as');
                    if (argumentNode != null && argumentNode.value.kind === 'StringValue') {
                        exportAsFieldNames.push(argumentNode.value.value);
                    }
                }
            }
        }
    }
    return exportAsFieldNames;
}

/**
 * Replaces the variable definitions for the field name by removing the NonNullType if it exists.
 *
 * The original type is retained with a path to how to restore it. These replacements are returned as an array from this function.
 *
 * @param exportAsFieldNames
 * @param definition
 * @param documentIndex
 * @param definitionIndex
 */
function replaceNonNullVariables(
    {
        exportAsFieldNames,
        definition,
        documentIndex,
        definitionIndex
    }: {
        exportAsFieldNames: string[],
        definition: OperationDefinitionNode, documentIndex: number, definitionIndex: number
    }): OperationDefinitionVariableReplacement[] {
    const replacements: OperationDefinitionVariableReplacement[] = [];

    if (exportAsFieldNames.length > 0 && definition.variableDefinitions != null) {
        for (let variableDefinitionIndex = 0; variableDefinitionIndex < definition.variableDefinitions.length; variableDefinitionIndex++) {
            const variable = definition.variableDefinitions[variableDefinitionIndex];
            if (exportAsFieldNames.includes(variable.variable.name.value)) {
                if ((variable.type.kind == 'NonNullType')) {
                    // Retain that variable type so that it can be retained if needed.
                    replacements.push({
                        documentIndex: documentIndex,
                        path: `document.definitions[${definitionIndex}].variableDefinitions[${variableDefinitionIndex}].type`,
                        value: variable.type
                    });
                    // Remove the NonNullType by assigning the variable to the nested type instead.
                    // We use lodash set here because technically this is a readonly field, but we can in fact re-assign it.
                    set(variable, 'type', variable.type.type)
                }
            }
        }
    }

    return replacements;
}

/**
 * Saves the rollback replacements for the graphql-codegen-restore-export-as-changes plugin to restore.
 *
 * @param allPlugins
 * @param replacements
 */
function saveRollbackReplacements(allPlugins: Types.ConfiguredPlugin[], replacements: OperationDefinitionVariableReplacement[]) {
    const plugin = allPlugins.find((obj) => Object.keys(obj).includes(rollbackPluginName));
    if (plugin) {
        plugin[rollbackPluginName] = {
            ...plugin[rollbackPluginName],
            replacements: replacements
        };

    }
}

/**
 * Plugin that makes the variables that have been tagged with `export(as)` as optionals instead non-nullable.
 *
 * @param schema
 * @param documents
 * @param config
 * @param info
 */
export const plugin: PluginFunction<never> = (schema, documents, config, info) => {
    const replacements: OperationDefinitionVariableReplacement[] = [];

    for (let documentIndex = 0; documentIndex < documents.length; documentIndex++) {
        const documentNode = documents[documentIndex].document;

        if (documentNode == null) {
            continue;
        }

        for (let definitionIndex = 0; definitionIndex < documentNode.definitions.length; definitionIndex++) {
            const definition = documentNode.definitions[definitionIndex];

            if (definition.kind !== 'OperationDefinition') {
                continue;
            }

            const exportAsFieldNames = findExportAsFieldNameForOperation(definition);

            replacements.push(...replaceNonNullVariables({
                exportAsFieldNames: exportAsFieldNames,
                definition: definition,
                documentIndex: documentIndex,
                definitionIndex: definitionIndex
            }));
        }
    }

    if (info?.allPlugins) {
        saveRollbackReplacements(info.allPlugins, replacements);
    }

    return '';
};
