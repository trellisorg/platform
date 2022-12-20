import type { PluginFunction } from '@graphql-codegen/plugin-helpers';
import type { OperationDefinitionVariableReplacement } from '@trellisorg/graphql-codegen-make-export-as-optional';
import { set } from 'lodash';

const pluginName = '@trellisorg/graphql-codegen-restore-export-as-changes';

/**
 * Restores the changed made by the graphql-codegen-make-export-as-optional by applying the saved paths and values saved
 * into this plugin's options.
 * @param schema
 * @param documents
 * @param config
 * @param info
 */
export const plugin: PluginFunction<never> = (schema, documents, config, info) => {
    const plugin = info?.allPlugins?.find((obj) => Object.keys(obj).includes(pluginName));
    const replacements = plugin?.[pluginName]?.['replacements'] ?? [] as OperationDefinitionVariableReplacement[];

    for (const replacement of replacements) {
        set(documents[replacement.documentIndex], replacement.path, replacement.value);
    }

    return '';
};
