# Generate AI Documentation

[![GitHub Workflow Status](https://img.shields.io/badge/status-ready-blue)](#)

GitHub Action to automatically generate **professional HTML documentation** for your code using OpenAI GPT models. This action is fully reusable in any repository and allows users to provide their own OpenAI API key

---

## Features

* Generate a complete **HTML documentation** for each code file, organized by categories (subfolders)
* Include **detailed inline explanations** (docstrings/comments) for all functions, classes, and modules
* Automatically generate **practical, realistic usage examples** for each function/class, including end-to-end examples
* Detect programming language automatically and adapt code snippets (supports **JavaScript, TypeScript, Python, and PHP**)
* Maintain **uniform, clean, modern HTML style** for all generated files
* Produce a central **`index.html`** to navigate between all files in the project
* Fully reusable in external workflows with **user-provided OpenAI API key**
* Bundled for easy use, no manual installation required

---

## Usage

### 1. Add the action to your workflow

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
        uses: agasparo/ia-doc-maker@v2.0.0
        with:
          openai_api_key: ${{ secrets.OPENAI_API_KEY }}
          path: ${{ github.event.inputs.code_folder }}

      - name: Upload generated HTML documentation
        uses: actions/upload-artifact@v4
        with:
          name: generated-docs
          path: docs/
```

---

## Output

* **HTML files per code file**, stored in `docs/{category}/{filename}.html`
* **Central `index.html`** linking all files for easy navigation
* Consistent visual style with headings, lists, code blocks, and syntax highlighting
* Fully viewable in a browser without additional processing

---

## Notes

* Each file’s documentation includes description, features, configuration, usage examples, and detailed inline explanations
* Subfolders in your code project become **categories** in the documentation
* The action is designed to evolve — feedback and feature requests are welcome

---

## Images