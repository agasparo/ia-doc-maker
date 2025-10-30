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

/** Génère les liens de la sidebar avec compatibilité sous-dossiers */
function generateSidebarLinks(structure, currentFilePath = "") {
  return Object.entries(structure)
    .map(([category, files]) => {
      const links = files
        .map((file) => {
          const fileName = path.basename(file, path.extname(file));
          const relativePath = path.relative(
            path.dirname(currentFilePath),
            path.join(category, `${fileName}.html`)
          );
          return `
            <li>
              <a href="${relativePath}"
                 class="block px-3 py-1.5 rounded-md text-gray-800/90 hover:text-blue-600 hover:bg-white/40 transition-all duration-200">
                ${fileName}
              </a>
            </li>
          `;
        })
        .join("\n");

      return `
        <div class="mb-5">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-600/80 mb-2">${category}</h3>
          <ul class="space-y-1">${links}</ul>
        </div>
      `;
    })
    .join("\n");
}

/** Template HTML avec design iOS-style glassmorphism via Tailwind */
function wrapInTemplate(title, bodyContent, structure, currentFilePath = "") {
  const sidebarLinks = generateSidebarLinks(structure, currentFilePath);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 text-gray-900 font-sans antialiased">
  <div class="flex min-h-screen">

    <!-- Sidebar -->
    <aside class="fixed inset-y-0 left-0 w-72 p-6 border-r border-white/30 bg-white/40 backdrop-blur-xl shadow-lg flex flex-col">
      <div class="flex items-center mb-10">
        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"
             alt="Logo"
             class="w-9 h-9 mr-3 opacity-90 drop-shadow-md" />
        <span class="text-2xl font-semibold text-gray-900/90 tracking-tight">AI Docs</span>
      </div>

      <nav class="flex-1 overflow-y-auto pr-2 space-y-3">
        ${sidebarLinks}
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 ml-72 p-12">
      <div class="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-10 max-w-5xl mx-auto">
        <h1 class="text-4xl font-bold mb-8 text-gray-900/90 tracking-tight">${title}</h1>

        <div class="prose prose-gray max-w-none text-gray-800 leading-relaxed">
          ${bodyContent}
        </div>
      </div>
    </main>
  </div>

  <script>
    // Défilement doux pour les ancres internes
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({
          behavior: "smooth"
        });
      });
    });
  </script>
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

    // Construit la structure imbriquée
    const structure = {};

    for (const file of codeFiles) {
      const relativePath = path.relative(targetPath, file);
      const parts = relativePath.split(path.sep);
      const fileName = parts.pop(); // nom du fichier
      let current = structure;

      if (parts.length === 0) {
        // Pas de sous-dossier, fichier directement à la racine
        if (!current.files) current.files = [];
        current.files.push(fileName);
      } else {
        // Parcours les sous-dossiers
        for (const part of parts) {
          if (!current[part]) current[part] = {};
          current = current[part];
        }

        if (!current.files) current.files = [];
        current.files.push(fileName);
      }
    }


    // Génère la doc pour chaque fichier
    for (const file of codeFiles) {
      const relativePath = path.relative(targetPath, file);
      const outputDir = path.join(OUTPUT_DIR, path.dirname(relativePath));
      fs.mkdirSync(outputDir, { recursive: true });

      const fileName = path.basename(file, path.extname(file));
      const code = fs.readFileSync(file, "utf-8");
      const htmlBody = await generateDocForFile(client, code);
      const currentFilePath = path.join(path.dirname(relativePath), `${fileName}.html`).replace(/\\/g, "/");

      const fullHTML = wrapInTemplate(fileName, htmlBody, structure, currentFilePath);
      fs.writeFileSync(path.join(outputDir, `${fileName}.html`), fullHTML, "utf-8");
      core.info(`Generated doc for ${relativePath}`);
    }

    core.info(`Documentation generated successfully in ${OUTPUT_DIR}`);
  } catch (error) {
    core.setFailed(`Failed to generate documentation: ${error.message}`);
  }
}

run();
