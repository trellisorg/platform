export interface AiReadmeExecutorSchema {
    /**
     * Instructions to send along with the generation to ensure the model acts appropriately or includes additional
     * context you want it to. This can be a link to a file or raw text. Will attempt to find a file (from
     * workspace root) first, if it does not exist then the value will be used as the instructions. The file this
     * points to should be raw text.
     */
    instructions?: string;

    /**
     * Additional files to include as context to the readme generation, these could be files displaying usage of
     * the library in a demo app, documentation files or other relevant files.
     */
    include?: string[];

    /**
     * A link to an example README.md that should be used as additional context for the model to know what a good
     * readme is to follow the format of, or a template you have hosted publicly.
     *
     * This should be a link to the raw text so an HTTP GET will return the raw markdown.
     */
    example?: string;

    /**
     * An array of globs defining what files (relative to the project root) to include as part of the context for
     * the project generation. This will default to: `['**\/*.ts', 'package.json']`
     */
    projectFiles?: string[];

    /**
     * The path to the readme file that will be written to when the generation is completed, this defaults to
     * `{projectRoot}/package.json`
     */
    pathToReadme?: string;

    /**
     * What model from the Gemini family to use, will default to: gemini-1.5-flash-latest.
     */
    model: string;

    /**
     * Configure the temperature of the model, will default to: 0.
     */
    temperature: number;

    /**
     * The key in process.env the apiKey for Gemini is stored in. If this is left out it will be undefined and pull
     * the default based on the @google/generative-ai package.
     */
    apiKey?: string;
}
