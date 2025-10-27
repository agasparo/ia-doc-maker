import fs from "fs";
import path from "node:path";
import core from "@actions/core";
import OpenAI from "openai";
import {MODEL, ROLE, PROMPT} from './constant/chatGpt';
import {RESPONSE_FILE, ALLOWED_FILE_EXTENSION} from './constant/file';

/**
 * Récupère les inputs de l'action GitHub
 * @returns {{ apiKey: string, codePath: string }}
 */
function getInputs() {
  const apiKey = core.getInput("openai_api_key", { required: true });
  const codePath = core.getInput("path", { required: true });
  return { apiKey, codePath };
}

/**
 * Lit récursivement un dossier et concatène le contenu des fichiers autorisés
 * @param {string} dir - Chemin du dossier à lire
 * @returns {string} Contenu concaténé des fichiers
 */
function readDirRecursively(dir) {
  let codeContent = "";
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      codeContent += readDirRecursively(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (ALLOWED_FILE_EXTENSION.includes(ext)) {
        try {
          const fileData = fs.readFileSync(fullPath, "utf-8");
          codeContent += `# File: ${path.relative(process.cwd(), fullPath)}\n${fileData}\n\n`;
        } catch (err) {
          core.warning(`Failed to read file ${fullPath}: ${err.message}`);
        }
      }
    }
  }

  return codeContent;
}

/**
 * Génère la documentation avec OpenAI
 * @param {string} apiKey - Clé API OpenAI
 * @param {string} codeContent - Contenu du code à documenter
 * @returns {Promise<string>} Documentation générée
 */
async function generateDocumentation(apiKey, codeContent) {
  const openai = new OpenAI({ apiKey });
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: ROLE, content: `${PROMPT}\n\n${codeContent}` }],
  });

  return completion.choices[0].message.content;
}

/**
 * Écrit la documentation dans un fichier
 * @param {string} content - Contenu à écrire
 * @param {string} fileName - Nom du fichier de sortie
 */
function writeDocumentation(content, fileName = RESPONSE_FILE) {
  fs.writeFileSync(path.join(process.cwd(), fileName), content);
  core.info(`${fileName} created successfully.`);
}

/**
 * Fonction principale
 */
async function run() {
  try {
    const { apiKey, codePath } = getInputs();
    const absPath = path.resolve(process.cwd(), codePath);
    const codeContent = readDirRecursively(absPath);

    if (!codeContent) {
      core.warning("No code files found to document.");
      return;
    }

    const documentation = await generateDocumentation(apiKey, codeContent);
    writeDocumentation(documentation);
  } catch (error) {
    core.setFailed(`Failed to generate documentation: ${error.message}`);
  }
}

run();
