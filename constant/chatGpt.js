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
   - DO NOT use triple backticks (html) or any Markdown-style code fences to encapsulate the HTML.
   - Output must be valid, self-contained HTML directly viewable in a browser.
   - DO NOT use \`\`\`html \`\`\` to enclose final html


2. Consistent structure for all files:
   - Title / File Name as <h1>
   - Project description or module overview
   - Features and functionality
   - Installation instructions (if applicable)
   - Configuration or setup (if applicable)
   - Usage examples with realistic, executable code snippets
   - Detailed inline explanations for functions/classes (parameters, return values, side effects)
   - Optional notes for complex logic or algorithms, explained clearly
   - All code blocks (<pre><code>) should resemble real IDE syntax highlighting
   - Every <pre><code> block must include Tailwind CSS classes explicitly on both <pre> and <code> tags.
   Example:
     <pre class="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto whitespace-pre text-sm my-6 border border-gray-700 shadow-inner">
       <code class="language-js text-blue-400">...</code>
     </pre>
   - This exact pattern must be used for **every** code snippet in all files — no omission allowed.
   - Never produce a <pre> or <code> tag without Tailwind styling.
   - If the model generates a code block without Tailwind CSS classes, regenerate that block so it visually matches all others.
   - Do NOT omit any styling for code blocks. All code blocks should consistently use these classes for background, padding, rounded corners, and syntax colors.
   - Ensure long lines of code never overflow outside the viewport (use Tailwind utilities like overflow-x-auto, whitespace-pre, and break-words where needed).
   - All <pre><code> blocks across all files must look identical, with same Tailwind classes, padding, font size, and background, regardless of the file or language.
   - Use Tailwind CSS classes only for styling do NOT generate inline <style> or <link> tags, except for the Tailwind CDN in the template.
   - Use a palette of gray tones for backgrounds, text, and elements.
   - Ensure the same template, layout, and styling is used for all files.
   - Ensure proper spacing, indentation, and layout throughout the HTML.
   - Use consistent padding, margins, and line spacing to make the content visually clean and easy to read.
   - Code blocks, headings, lists, and paragraphs should all have appropriate spacing so that the page feels structured and not cluttered.
   - Maintain a visually appealing hierarchy with headings, subheadings, and section breaks.
   - Before returning the HTML for any file, ensure that it is fully valid HTML, well-formed, and uses the same layout, structure, and Tailwind styling as all other pages.
   - Do not include any broken tags, missing closing tags, or inconsistent styles.
   - All generated HTML should render correctly in a browser and look visually consistent across all files.
   - DO NOT include <html>, <head>, <body>, <meta>, <title>, or <script> tags in the output.
   - DO NOT insert Tailwind classes or any CSS on the outermost <div> that wraps the content.
   - All Tailwind styling should only be applied to inner elements (headings, paragraphs, <pre><code>, lists, sections, etc.).
   - The generated HTML should be a clean snippet that can be embedded inside a page that already includes Tailwind.

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

6. Style and design:
   - Use Tailwind CSS only (no inline CSS, no <style> tags).
   - Visual style should reflect a clean iOS-like glassmorphism aesthetic:
     Soft gradients, translucent panels, blur effects, white/gray palette.
   - Use Tailwind utilities like:
     bg-white/40, backdrop-blur-xl, border border-white/30, shadow-2xl, rounded-3xl, p-10, text-gray-900/90.
   - Maintain proper spacing and layout consistency:
     * Adequate spacing between sections (mt-8, mb-6, etc.)
     * Structured indentation for readability
     * Visual hierarchy with consistent <h2>, <h3> styling
   - Ensure the document feels clean, modern, and readable on desktop and mobile.

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
