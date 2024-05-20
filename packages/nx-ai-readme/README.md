````markdown
# @trellisorg/nx-ai-readme

This Nx executor utilizes Google's Gemini AI model to generate a README.md file for your project based on the files within your workspace. The executor can also leverage additional context, such as instructions, example READMEs, and other files.

## Table of Contents

-   [Installation](#installation)
-   [Setup](#setup)
-   [Configuration Options](#configuration-options)
-   [Usage](#usage)
-   [Example](#example)

## Installation

To use the `@trellisorg/nx-ai-readme` executor, install the package within your Nx workspace:

```bash
nx add @trellisorg/nx-ai-readme
```
````

## Setup

1. **API Key:** Obtain a Google Cloud Platform API Key with access to Google's generative AI API.
2. **Environment Variable:** Set the environment variable `AI_README_API_KEY` to your Google Cloud API key. You can add this to your `.env` file or directly in your CI/CD pipeline.

## Configuration Options

The `@trellisorg/nx-ai-readme` executor utilizes the following configuration options in your `nx.json` file:

| Option         | Type     | Description                                                                                                                                                                                                                                                                                                                                               | Default                                                                                     |
| -------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `instructions` | string   | Instructions to send along with the generation to ensure the model acts appropriately or includes additional context you want it to. This can be a link to a file or raw text. Will attempt to find a file (from workspace root) first, if it does not exist then the value will be used as the instructions. The file this points to should be raw text. | `undefined`                                                                                 |
| `include`      | string[] | Additional files to include as context to the readme generation. These could be files displaying usage of the library in a demo app, documentation files, or other relevant files.                                                                                                                                                                        | `[]`                                                                                        |
| `example`      | string   | A link to an example README.md that should be used as additional context for the model to know what a good readme is to follow the format of, or a template you have hosted publicly. This should be a link to the raw text so an HTTP GET will return the raw markdown.                                                                                  | `https://raw.githubusercontent.com/othneildrew/Best-README-Template/master/BLANK_README.md` |
| `projectFiles` | string[] | An array of globs defining what files (relative to the project root) to include as part of the context for the project generation. This will default to: `['**/*.ts', 'package.json']`                                                                                                                                                                    | `['**/*.ts', 'package.json']`                                                               |
| `pathToReadme` | string   | The path to the readme file that will be written to when the generation is completed. This defaults to `{projectRoot}/README.md`.                                                                                                                                                                                                                         | `README.md`                                                                                 |

## Usage

To generate a README.md file for your project, run the following command in your Nx workspace:

```bash
nx generate-readme --project=my-project
```

Replace `my-project` with the name of the project you want to generate a README.md for.

## Example

```json
{
    "projects": {
        "my-project": {
            "targets": {
                "generate-readme": {
                    "executor": "@trellisorg/nx-ai-readme:ai-readme",
                    "options": {
                        "instructions": "Generate a README.md for a Node.js package called 'my-project' that utilizes TypeScript and includes a basic description, installation instructions, and usage examples. Provide a clear and concise format.",
                        "include": ["src/my-project.ts"],
                        "example": "https://raw.githubusercontent.com/othneildrew/Best-README-Template/master/BLANK_README.md"
                    }
                }
            }
        }
    }
}
```

This example demonstrates how to use the executor to generate a README.md for a project called "my-project" with specific instructions, an included source file, and an example README.md.

## Contributing

Contributions to this project are welcome! Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

```

```
