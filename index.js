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

/** Template HTML avec sidebar et palette grise */
function wrapInTemplate(title, bodyContent, structure) {
  const sidebarLinks = Object.entries(structure)
    .map(([category, files]) => {
      const links = files.map(file => {
        const fileName = path.basename(file, path.extname(file));
        return `<li class="mb-1"><a href="../${category}/${fileName}.html" class="text-gray-700 hover:text-blue-600">${fileName}</a></li>`;
      }).join("\n");
      return `
        <div class="mb-4">
          <h2 class="font-semibold text-gray-800 mb-2">${category}</h2>
          <ul class="ml-2">${links}</ul>
        </div>
      `;
    })
    .join("\n");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${title}</title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 text-gray-900 font-sans">
<div class="flex min-h-screen">
  <!-- Sidebar -->
  <aside class="w-64 bg-gray-200 p-6 flex flex-col">
    <div class="flex items-center mb-8">
      <img src="logo.png" alt="Logo" class="w-10 h-10 mr-2"/>
      <span class="text-xl font-bold text-gray-800">Documentation</span>
    </div>
    <nav class="flex-1 overflow-y-auto">
      ${sidebarLinks}
    </nav>
  </aside>

  <!-- Main content -->
  <main class="flex-1 p-8 overflow-auto">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">${title}</h1>
    <div class="prose max-w-none bg-white p-6 rounded shadow">
      ${bodyContent}
    </div>
  </main>
</div>
</body>
</html>
`;
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

    // Crée la structure des fichiers par catégorie
    for (const file of codeFiles) {
      const relativePath = path.relative(targetPath, file);
      const category = path.dirname(relativePath) || "root";

      if (!structure[category]) structure[category] = [];
      structure[category].push(file);
    }

    // Génère la doc pour chaque fichier
    for (const [category, files] of Object.entries(structure)) {
      const outputDir = path.join(OUTPUT_DIR, category);
      fs.mkdirSync(outputDir, { recursive: true });

      for (const file of files) {
        const fileName = path.basename(file, path.extname(file));
        const code = fs.readFileSync(file, "utf-8");
        const htmlBody = await generateDocForFile(client, code);

        const fullHTML = wrapInTemplate(fileName, htmlBody, structure);
        fs.writeFileSync(path.join(outputDir, `${fileName}.html`), fullHTML, "utf-8");
        core.info(`Generated doc for ${file}`);
      }
    }

    core.info(`All documentation generated successfully in ${OUTPUT_DIR}`);
  } catch (error) {
    core.setFailed(`Failed to generate documentation: ${error.message}`);
  }
}

run();
