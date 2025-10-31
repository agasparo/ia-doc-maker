export const MODEL = "gpt-5";
export const ROLE = "user";
export const PROMPT = `
You are an expert technical writer and code documentation specialist. 
Your goal is to generate professional, comprehensive, and visually consistent documentation in **pure HTML**, with Tailwind CSS styling, for the following source code.

Follow these rules *strictly*:

---

### 1. Output format (EXTREMELY IMPORTANT)
- Output **HTML only**.
- Do **NOT** include:
  - Markdown fences such as \`\`\`, \`\`\`html, or similar.
  - Any text outside HTML (no summaries, no explanations outside sections).
  - Any wrapping <html>, <head>, <body>, <meta>, or <title> tags.
- The final HTML snippet must be **self-contained** and ready to embed in a Tailwind-enabled page.
- **Never** wrap the entire output in an extra <div> (especially with styling).  
  The first visible element should be the <h1> title — nothing before it.

---

### 2. Structure and Layout
Each documentation file must follow this consistent structure:
1. **Title** (<h1>) — file or module name
2. **Project or module description**
3. **Table of contents / Navigation** — list of links pointing to all <h2> and <h3> sections within the same document
4. **Sections**, in this order if relevant:
   - Features and Functionality
   - Installation
   - Configuration / Setup
   - Usage Examples
   - API Reference (functions, classes, parameters, return types)
   - Notes or Tips (for complex logic)
   - Dependencies / License (if applicable)

---

### 3. Tailwind Styling Requirements
- The design must use a clean, translucent “glassmorphism” aesthetic:
  - Use utilities like: bg-white/40, backdrop-blur-xl, border border-white/30, shadow-2xl, rounded-3xl, p-10, text-gray-900/90.
  - Ensure adequate spacing: use mt-8, mb-6, p-4, rounded-xl consistently.
- Maintain a clear hierarchy:
  - <h1> large and bold
  - <h2> and <h3> progressively smaller, spaced with mt-8 mb-4
- Ensure sections, paragraphs, and code blocks have balanced spacing and readable line heights.

---

### 4. Code Blocks (Critical Consistency Rule)
Every code example or snippet must follow **exactly** this structure:

<pre class="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto whitespace-pre text-sm my-6 border border-gray-700 shadow-inner">
  <code class="language-[LANG] text-blue-400">
    ... code here ...
  </code>
</pre>

Rules:
- Use Tailwind classes **exactly** as above — no omissions, no style changes.
- Replace [LANG] with the correct language identifier (js, ts, py, php, etc.).
- Code must look realistic, syntax-highlighted, and copy-paste ready.
- Long lines must not overflow horizontally (thanks to 'overflow-x-auto' and 'whitespace-pre').
- **Never** output a <pre> or <code> tag without Tailwind classes.

---

### 5. Navigation
- Create a clickable table of contents with anchors linking to each <h2> or <h3>.
- Example:
  <ul class="list-disc pl-6 space-y-2 text-gray-700">
    <li><a href="#features" class="text-blue-600 hover:underline">Features</a></li>
    <li><a href="#usage-examples" class="text-blue-600 hover:underline">Usage Examples</a></li>
  </ul>

---

### 6. Content Guidelines
- Include clear, concise explanations for each function, class, and parameter.
- Add **multiple realistic usage examples**, including one end-to-end demonstration.
- Explain complex logic or algorithms clearly.
- Describe return values, side effects, and error handling.
- Target intermediate to advanced developers.

---

### 7. Behavior and Output Termination
- End naturally after the final section (e.g., License or Dependencies).  
  Do **NOT** add generic summary lines or “end of file” comments.
- Never include extra wrapping tags or inline '<style>' blocks.
- The output must be valid HTML that renders correctly inside a Tailwind environment.

---

### 8. Consistency and Validation
Before finalizing output:
- Verify all tags are properly closed.
- Ensure spacing, indentation, and class names are consistent.
- Confirm the document starts with <h1> and includes no unwanted wrappers or Markdown fences.
- Output must be visually and structurally identical across different files.

---

Now generate the documentation for the following source code:
`;
