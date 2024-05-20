# @trellisorg/nx-ai-readme

## Project Description

This is an Nx executor that can be used within an Nx monorepo to generate `README.md` files using Google's Gemini AI models. It leverages the `@google/generative-ai` package to communicate with the Gemini API and uses the context of your project's files to generate comprehensive and insightful `README.md` files.

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Configuration Options](#configuration-options)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation

Install the package within your Nx workspace:

```bash
nx add @trellisorg/nx-ai-readme
```

## Setup

1. **Obtain a Google Generative AI API Key:**
   - Visit [https://generativeai.google.com/](https://generativeai.google.com/) to sign up and create a Google Generative AI project.
   - Navigate to the API credentials section to obtain your API key.

2. **Set your API Key:**
   - You can set your API key as an environment variable in your project. For example:
     ```bash
     export AI_README_API_KEY="your-api-key-here"
     ```
   - Alternatively, you can define the API key in your executor configuration within your `workspace.json`.

## Configuration Options

| Option           | Type     | Default              | Description                                                                                                                                                                                                                                                                                     |
| ---------------- | -------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `instructions`   | `string` | `"Write a README.md file in Markdown that clearly explains how to use the library..."` | Instructions to send along with the generation to ensure the model acts appropriately or includes additional context you want it to. This can be a link to a file or raw text. Will attempt to find a file (from workspace root) first, if it does not exist then the value will be used as the instructions. The file this points to should be raw text. |
| `include`       | `array`  | `[]`                 | Additional files to include as context to the readme generation, these could be files displaying usage of the library in a demo app, documentation files or other relevant files.                                                                                                                                              |
| `example`        | `string` | `"https://raw.githubusercontent.com/othneildrew/Best-README-Template/master/BLANK_README.md"` | A link to an example README.md that should be used as additional context for the model to know what a good readme is to follow the format of, or a template you have hosted publicly. This should be a link to the raw text so an HTTP GET will return the raw markdown. |
| `projectFiles`   | `array`  | `['**/*.ts', 'package.json']` | An array of globs defining what files (relative to the project root) to include as part of the context for the project generation.                                                                                                                                                                         |
| `pathToReadme`  | `string` | `"README.md"`          | The path to the readme file that will be written to when the generation is completed, this defaults to `{projectRoot}/README.md`.                                                                                                                                                                     |
| `model`          | `string` | `"gemini-1.5-flash-latest"` | The model from the Gemini family to use for generating the readme.                                                                                                                                                                                                                                             |
| `temperature`    | `number` | `0`                   | Configure the temperature of the model, will default to: 0.                                                                                                                                                                                                                                                    |
| `apiKey`         | `string` | `"AI_README_API_KEY"`     | The key in process.env the apiKey for Gemini is stored in. If this is left out it will be undefined and pull the default based on the `@google/generative-ai` package.                                                                                                                                                                       |

## Usage

You can use the `ai-readme` executor within your `workspace.json` file to generate a `README.md` file for a specific project. For example, to generate a README for the `nx-ai-readme` project, add the following to your `workspace.json`:

```json
{
  "projects": {
    "nx-ai-readme": {
      "targets": {
        "generate-readme": {
          "executor": "@trellisorg/nx-ai-readme:ai-readme",
          "options": {
            "temperature": 1,
            "projectFiles": ["**/*.ts", "**/*.json"],
            "instructions": "Write a README.md file in Markdown that clearly explains how to use the library @trellisorg/nx-ai-readme. Provide sections for: installation, setup, configuration options, usage and all other relevant information a developer would need to use the library, An example structure/layout will be provided along with all source files and relevant example files for the project. This is an Nx executor that can be used within an Nx monorepo to generate README files, show how to use it within an Nx workspace."
          }
        }
      }
    }
  }
}
```

Then, you can run the following command:

```bash
nx generate-readme nx-ai-readme
```

This will generate a `README.md` file in the `nx-ai-readme` project root.

## Contributing

We welcome contributions to this project! 

- If you have any issues or feature requests, please open an issue on the [GitHub repository](https://github.com/your-organization/nx-ai-readme).
- Before submitting a pull request, please ensure your code adheres to the existing code style and that your changes are covered by unit tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.