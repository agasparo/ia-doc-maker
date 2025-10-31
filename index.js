import core from "@actions/core";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { MODEL, PROMPT, ROLE } from "./constant/chatGpt.js";

/* -------------------------------------------------------------------------- */
/*                              CONFIGURATION                                 */
/* -------------------------------------------------------------------------- */

const SUPPORTED_EXTENSIONS = [".js", ".ts", ".py", ".php"];
const OUTPUT_DIR = path.join(process.cwd(), "docs");

/* -------------------------------------------------------------------------- */
/*                         FONCTIONS UTILITAIRES                              */
/* -------------------------------------------------------------------------- */

/**
 * Récupère récursivement tous les fichiers de code pris en charge dans un dossier.
 * @param {string} dir - Dossier à parcourir
 * @returns {string[]} Liste complète des fichiers de code
 */
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

/**
 * Construit la structure hiérarchique des dossiers et fichiers à partir d'une liste de chemins.
 * @param {string[]} files - Liste des fichiers à structurer
 * @param {string} rootDir - Dossier racine
 * @returns {object} Structure hiérarchique pour la génération de la sidebar
 */
function buildFileStructure(files, rootDir) {
  const structure = {};

  for (const file of files) {
    const relativePath = path.relative(rootDir, file);
    const parts = relativePath.split(path.sep);
    const fileName = parts.pop();
    let current = structure;

    for (const part of parts) {
      if (!current[part]) current[part] = {};
      current = current[part];
    }

    if (!current.files) current.files = [];
    current.files.push(fileName);
  }

  return structure;
}

/**
 * Formate un nom de fichier en supprimant les extensions et en rendant le nom plus lisible.
 * @param {string} name - Nom du fichier sans extension
 * @returns {string} Nom formaté (capitalisé et espacé)
 */
function formatFileName(name) {
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Génère les liens HTML pour la sidebar (supporte les sous-dossiers récursifs).
 * @param {object} structure - Structure des fichiers et dossiers
 * @param {string} currentFilePath - Chemin du fichier courant (ex: "utils/math.html")
 * @param {string} basePath - Chemin de base relatif courant
 * @returns {string} HTML de la sidebar
 */
function generateSidebarLinks(structure, currentFilePath = "", basePath = "") {
  let html = "";

  for (const [key, value] of Object.entries(structure)) {
    if (key === "files") {
      // Liste des fichiers à ce niveau
      const links = value
        .map((file) => {
          const fileName = path.basename(file, path.extname(file));
          const relativePath = path
            .relative(path.dirname(currentFilePath), path.join(basePath, `${fileName}.html`))
            .replace(/\\/g, "/");

          return `
            <li>
              <a href="${relativePath}"
                 class="block px-3 py-1.5 rounded-md text-gray-800/90 hover:text-blue-600 hover:bg-white/40 transition-all duration-200">
                ${formatFileName(fileName)}
              </a>
            </li>
          `;
        })
        .join("\n");

      html += `<ul class="space-y-1">${links}</ul>`;
    } else if (typeof value === "object") {
      // Dossier imbriqué
      html += `
        <div class="mb-5">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-600/80 mb-2">${key}</h3>
          ${generateSidebarLinks(value, currentFilePath, path.join(basePath, key))}
        </div>
      `;
    }
  }

  return html;
}

/**
 * Génère le squelette HTML complet (page + sidebar + contenu).
 * @param {string} title - Titre du fichier/document
 * @param {string} bodyContent - Contenu HTML généré par le modèle
 * @param {object} structure - Structure des fichiers pour la navigation
 * @param {string} currentFilePath - Chemin relatif du fichier courant
 * @returns {string} HTML complet prêt à écrire
 */
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
    // Défilement fluide pour les ancres internes
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

/**
 * Appelle l'API OpenAI pour générer la documentation HTML d'un fichier.
 * @param {OpenAI} client - Instance du client OpenAI
 * @param {string} code - Contenu du fichier source
 * @returns {Promise<string>} HTML généré
 */
async function generateDocForFile(client, code) {
  const input = `${PROMPT}\n${code}`;

  const response = await client.responses.create({
    model: MODEL,
    input: [{ role: ROLE, content: input }],
  });

  return response.output_text || response.output?.[0]?.content?.[0]?.text || "";
}

/* -------------------------------------------------------------------------- */
/*                                MAIN LOGIC                                  */
/* -------------------------------------------------------------------------- */

async function run() {
  try {
    const openaiApiKey = core.getInput("openai_api_key", { required: true });
    const targetPath = core.getInput("path", { required: true });

    const client = new OpenAI({ apiKey: openaiApiKey });
    core.info(`Scanning source folder: ${targetPath}`);

    const codeFiles = getAllCodeFiles(targetPath);
    if (!codeFiles.length) {
      core.warning("No code files found to document.");
      return;
    }

    const structure = buildFileStructure(codeFiles, targetPath);

    for (const file of codeFiles) {
      const relativePath = path.relative(targetPath, file);
      const outputDir = path.join(OUTPUT_DIR, path.dirname(relativePath));
      fs.mkdirSync(outputDir, { recursive: true });

      const fileName = path.basename(file, path.extname(file));
      const code = fs.readFileSync(file, "utf-8");

      core.info(`Generating documentation for: ${relativePath}`);
      const htmlBody = await generateDocForFile(client, code);

      const currentFilePath = path.join(path.dirname(relativePath), `${fileName}.html`).replace(/\\/g, "/");
      const fullHTML = wrapInTemplate(fileName, htmlBody, structure, currentFilePath);

      fs.writeFileSync(path.join(outputDir, `${fileName}.html`), fullHTML, "utf-8");
      core.info(`Documentation generated for ${relativePath}`);
    }

    core.info(`All documentation generated successfully in: ${OUTPUT_DIR}`);
  } catch (error) {
    core.setFailed(`Failed to generate documentation: ${error.message}`);
  }
}

/* -------------------------------------------------------------------------- */
/*                              EXECUTION                                     */
/* -------------------------------------------------------------------------- */

run();
