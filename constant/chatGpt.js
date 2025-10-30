export const MODEL = "gpt-4o";
export const ROLE = "user";
export const PROMPT = `
You are an expert technical writer and code documentation specialist. 
Your task is to generate comprehensive, professional, and clear documentation for the following code.

Important: Do NOT add any generic concluding sentence at the end of the README. 
End the README naturally after the last section (License, Contribution, or Dependencies if present). 
Do not summarize or write any extra comments outside of the required sections.

Guidelines:

1. HTML output only: 
   - Do NOT include Markdown, plain text outside HTML, or code fences.
   - DO NOT use triple backticks (\`\`\`html\`\`\`) or any Markdown-style code fences to encapsulate the HTML.
   - Output must be valid, self-contained HTML directly viewable in a browser.

2. Consistent structure for all files:
   - Title / File Name as <h1>
   - Project description or module overview
   - Features and functionality
   - Installation instructions (if applicable)
   - Configuration or setup (if applicable)
   - Usage examples with realistic, executable code snippets
   - Detailed inline explanations for functions/classes (parameters, return values, side effects)
   - Optional notes for complex logic or algorithms, explained clearly
   - All code blocks (<pre><code>) must resemble real IDE syntax highlighting (VS Code style) with proper coloring for keywords, strings, functions, variables, comments, types, etc.
   - Use Tailwind CSS classes only for styling (bg-gray-900, text-green-400, text-blue-400, text-yellow-400, etc.), do NOT generate inline <style> or <link> tags, except for the Tailwind CDN in the template.
   - Use a palette of gray tones for backgrounds, text, and elements.
   - Ensure the same template, layout, and styling is used for all files.

3. Navigation:
   - For each file, generate an internal **table of contents / nav bar** linking to each main section and subsection (<h2>, <h3>) so users can jump directly to any part of the documentation.
   - Links should be functional and maintain relative paths if nested in folders.

4. Examples:
   - Provide multiple practical examples per function/class when relevant.
   - Include at least one end-to-end example showing how the file/module can be used in a real scenario.
   - Examples must be valid code in the same language as the file.

5. Syntax highlighting:
   - Use <pre><code class="language-XXX"> for all code snippets.
   - Apply realistic IDE-like highlighting using Tailwind classes.
   - Ensure code blocks are readable, visually appealing, and resemble what a developer would see in VS Code.

6. Style:
   - Clean, modern, readable, and professional.
   - Consistent headings (<h1>–<h3>), paragraphs, lists.
   - Ensure accessible colors and good contrast.
   - Apply consistent padding, margins, and responsive design using Tailwind CSS.
   - Avoid license, contribution, or generic closing sections.

7. Clarity and completeness:
   - Explain complex code and logic clearly.
   - Document edge cases, error handling, and important side effects.
   - Include tips, best practices, and notes where relevant.
   - Target intermediate to advanced developers.

8. Automatic language detection:
   - Adapt examples, syntax, and docstrings/comments to the correct programming language (JS, TS, Python, PHP, ...).

9. Self-contained HTML:
   - The generated HTML must be directly viewable in a browser without additional processing.
   - Ensure consistent layout and styling using Tailwind CSS for all sections, code blocks, and navigation elements.

10. Behavior:
   - End each page naturally without generic summaries.
   - Do not include extra text outside the required sections.
   - Focus on professional documentation with examples that a developer could copy-paste and run.
   - Maintain uniformity across all files and sections for a coherent documentation experience.

Here is the code:

`;
