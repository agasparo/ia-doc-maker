import core from "@actions/core";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { MODEL, PROMPT, ROLE } from "./constant/chatGpt.js";

const SUPPORTED_EXTENSIONS = [".js", ".ts", ".py", ".php"];
const OUTPUT_DIR = path.join(process.cwd(), "docs");

/** Récupère tous les fichiers de code dans un dossier (récursif) */
function getAllCodeFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllCodeFiles(fullPath));
    } else if (SUPPORTED_EXTENSIONS.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

/** Génère la doc HTML pour un fichier via OpenAI */
async function generateDocForFile(client, code) {
  const input = `${PROMPT}\n${code}`;
  const response = await client.responses.create({
    model: MODEL,
    input: [
      {
        role: ROLE,
        content: input,
      },
    ],
  });
  return response.output_text || response.output?.[0]?.content?.[0]?.text || "";
}

/** Template HTML avec Tailwind CDN */
function wrapInTemplate(title, bodyContent) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${title}</title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 text-gray-900">
<div class="max-w-5xl mx-auto py-10 px-6">
<header class="mb-10">
<h1 class="text-4xl font-bold text-blue-700 mb-2">${title}</h1>
<p class="text-gray-600">Automatically generated documentation</p>
<hr class="mt-4 border-gray-300"/>
</header>
<main class="prose max-w-none">${bodyContent}</main>
</div>
</body>
</html>
`;
}

/** Génère l'index principal avec description globale */
function generateIndexPage(structure, projectDescription = "") {
  let content = `
    <h1 class="text-4xl font-bold mb-6">Project Documentation</h1>
    ${projectDescription ? `<p class="mb-6">${projectDescription}</p>` : ""}
    <ul>
  `;

  for (const [category, files] of Object.entries(structure)) {
    content += `<li><h2 class="text-2xl font-semibold mt-6 mb-2">${category}</h2><ul class="ml-4 list-disc">`;
    for (const file of files) {
      const fileName = path.basename(file, path.extname(file));
      content += `<li><a href="${category}/${fileName}.html" class="text-blue-600 hover:underline">${fileName}</a></li>`;
    }
    content += `</ul></li>`;
  }
  content += `</ul>`;

  return wrapInTemplate("Documentation Index", content);
}

/** Fonction principale */
async function run() {
  try {
    const openaiApiKey = core.getInput("openai_api_key", { required: true });
    const targetPath = core.getInput("path", { required: true });

    const client = new OpenAI({ apiKey: openaiApiKey });
    core.info(`Scanning code folder: ${targetPath}`);

    const codeFiles = getAllCodeFiles(targetPath);
    if (!codeFiles.length) {
      core.warning("No code files found to document.");
      return;
    }

    const structure = {};

    // Générer la doc pour chaque fichier
    for (const file of codeFiles) {
      const relativePath = path.relative(targetPath, file);
      const category = path.dirname(relativePath) || "root";
      const fileName = path.basename(file, path.extname(file));

      if (!structure[category]) structure[category] = [];

      core.info(`Generating documentation for: ${relativePath}`);

      const code = fs.readFileSync(file, "utf-8");
      const htmlBody = await generateDocForFile(client, code);
      const fullHTML = wrapInTemplate(fileName, htmlBody);

      const outputDir = path.join(OUTPUT_DIR, category);
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(path.join(outputDir, `${fileName}.html`), fullHTML, "utf-8");

      structure[category].push(file);
    }

    // Génération de la description globale du projet
    const allCode = codeFiles.map(file => fs.readFileSync(file, "utf-8")).join("\n\n");
    const globalDescription = await generateDocForFile(
      client,
      `Generate a concise, professional project overview for the following code:\n\n${allCode}`
    );

    // Génération de l'index principal
    const indexHTML = generateIndexPage(structure, globalDescription);
    fs.writeFileSync(path.join(OUTPUT_DIR, "index.html"), indexHTML, "utf-8");

    core.info(`Documentation generated successfully in ${OUTPUT_DIR}`);
  } catch (error) {
    core.setFailed(`Failed to generate documentation: ${error.message}`);
  }
}

run();
