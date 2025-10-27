# Generate AI Documentation

[![GitHub Workflow Status](https://img.shields.io/badge/status-ready-blue)](#)

GitHub Action to automatically generate professional code documentation and README files using OpenAI GPT models. This action is designed to be reusable in any repository and supports providing your own OpenAI API key.

---

## Features

- Generate a comprehensive `README.md` with project title, description, usage examples, features, configuration, dependencies, contribution guidelines, and license information.
- Add inline documentation (docstrings/comments) to all functions, classes, and modules in your code.
- Supports multiple programming languages: **JavaScript, TypeScript, Python, and PHP**.
- Fully reusable in external workflows with user-provided OpenAI API key.
- Bundled for easy use, no need to manually install dependencies if using the `dist/` build.

---

## Usage

### 1. Add the action to your workflow

Example workflow:

```yaml
name: "Generate Documentation"

on:
  workflow_dispatch:
    inputs:
      code_folder:
        description: "Path to the code folder to document"
        required: true
        default: "src"

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Generate documentation
        uses: TON_USER/my-ai-doc-action@v1
        with:
          openai_api_key: ${{ secrets.OPENAI_API_KEY }}
          path: ${{ github.event.inputs.code_folder }}

      - name: Upload generated README
        uses: actions/upload-artifact@v4
        with:
          name: generated-docs
          path: README.md
