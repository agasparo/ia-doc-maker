export const MODEL = "gpt-4o";
export const ROLE = "user";
export const PROMPT = `
You are an expert technical writer and code documentation specialist. 
Your task is to generate comprehensive, professional, and clear documentation for the following code.

Important: Do NOT add any generic concluding sentence at the end of the README. 
End the README naturally after the last section (License, Contribution, or Dependencies if present). 
Do not summarize or write any extra comments outside of the required sections.

Guidelines:

1. **HTML output only**: Do NOT include Markdown or any plain text outside HTML. All sections must use HTML tags.
2. **Consistent structure for all files**:
   - Title / File Name as <h1>
   - Project description or module overview
   - Features and functionality
   - Installation instructions (if applicable)
   - Configuration or setup (if applicable)
   - Usage examples with **realistic, executable code snippets**
   - Detailed inline explanations for functions/classes (parameters, return values, side effects)
   - Optional notes for complex logic or algorithms, explained clearly
3. **Examples**:
   - Provide multiple practical examples per function/class when relevant
   - Examples must be valid code in the same language as the file
   - Include one end-to-end example showing how the file/module can be used in a real scenario
4. **Syntax highlighting**: Use proper HTML code blocks (<pre><code class="language-XXX">) for all code snippets
5. **Style**:
   - Clean, modern, readable, professional
   - Use consistent headings (<h1>–<h3>), paragraphs, lists
   - Same style template for all files
   - Avoid any license, contribution, or generic closing sections
6. **Clarity and completeness**:
   - Explain complex code and logic clearly
   - Document edge cases, error handling, and important side effects
   - Target intermediate to advanced developers
7. **Automatic language detection**: Adapt examples, syntax, and docstrings/comments to the correct programming language (JS, TS, Python, PHP)
8. **Self-contained HTML**: The generated HTML should be directly viewable in a browser without additional processing.

Here is the code:

`;
