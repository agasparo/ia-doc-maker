import { createRequire as __WEBPACK_EXTERNAL_createRequire } from "module";
/******/ var __webpack_modules__ = ({

/***/ 812:
/***/ ((module) => {

module.exports = eval("require")("./chatGpt.js");


/***/ }),

/***/ 974:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 919:
/***/ ((module) => {

module.exports = eval("require")("openai");


/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __nccwpck_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	var threw = true;
/******/ 	try {
/******/ 		__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 		threw = false;
/******/ 	} finally {
/******/ 		if(threw) delete __webpack_module_cache__[moduleId];
/******/ 	}
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/************************************************************************/
var __webpack_exports__ = {};

// EXTERNAL MODULE: ../../../../usr/local/lib/node_modules/@vercel/ncc/dist/ncc/@@notfound.js?@actions/core
var core = __nccwpck_require__(974);
;// CONCATENATED MODULE: external "fs"
const external_fs_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("fs");
;// CONCATENATED MODULE: external "path"
const external_path_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("path");
// EXTERNAL MODULE: ../../../../usr/local/lib/node_modules/@vercel/ncc/dist/ncc/@@notfound.js?openai
var _notfoundopenai = __nccwpck_require__(919);
// EXTERNAL MODULE: ../../../../usr/local/lib/node_modules/@vercel/ncc/dist/ncc/@@notfound.js?./chatGpt.js
var _notfoundchatGpt = __nccwpck_require__(812);
;// CONCATENATED MODULE: ./index.js






const SUPPORTED_EXTENSIONS = [".js", ".ts", ".py", ".php"];
const OUTPUT_DIR = external_path_namespaceObject.join(process.cwd(), "docs");

/**
 * Récupère tous les fichiers de code dans un dossier (récursif)
 */
function getAllCodeFiles(dir) {
  const entries = external_fs_namespaceObject.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = external_path_namespaceObject.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllCodeFiles(fullPath));
    } else if (SUPPORTED_EXTENSIONS.includes(external_path_namespaceObject.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Demande à OpenAI de générer la documentation HTML pour un fichier
 */
async function generateDocForFile(client, code) {
  const input = `${_notfoundchatGpt.PROMPT}\n${code}`;

  const response = await client.responses.create({
    model: _notfoundchatGpt.MODEL,
    input: [
      {
        role: _notfoundchatGpt.ROLE,
        content: input,
      },
    ],
  });

  return response.output_text || response.output[0]?.content[0]?.text || "";
}

/**
 * Gabarit HTML (avec Tailwind CSS)
 */
function wrapInTemplate(title, bodyContent) {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.0/dist/tailwind.min.css" rel="stylesheet" />
  </head>
  <body class="bg-gray-50 text-gray-900">
    <div class="max-w-5xl mx-auto py-10 px-6">
      <header class="mb-10">
        <h1 class="text-4xl font-bold text-blue-700 mb-2">${title}</h1>
        <p class="text-gray-600">Automatically generated documentation</p>
        <hr class="mt-4 border-gray-300" />
      </header>
      <main class="prose max-w-none">${bodyContent}</main>
    </div>
  </body>
</html>
  `;
}

/**
 * Génère la page d’index regroupant les catégories et fichiers
 */
function generateIndexPage(structure) {
  let content = `<h1 class="text-4xl font-bold mb-6">Project Documentation</h1><ul>`;
  for (const [category, files] of Object.entries(structure)) {
    content += `<li><h2 class="text-2xl font-semibold mt-6 mb-2">${category}</h2><ul class="ml-4 list-disc">`;
    for (const file of files) {
      const fileName = external_path_namespaceObject.basename(file, external_path_namespaceObject.extname(file));
      content += `<li><a href="${category}/${fileName}.html" class="text-blue-600 hover:underline">${fileName}</a></li>`;
    }
    content += `</ul></li>`;
  }
  content += `</ul>`;

  return wrapInTemplate("Documentation Index", content);
}

/**
 * Fonction principale
 */
async function run() {
  try {
    const openaiApiKey = core.getInput("openai_api_key", { required: true });
    const targetPath = core.getInput("path", { required: true });

    const client = new _notfoundopenai({ apiKey: openaiApiKey });
    core.info(`Scanning code folder: ${targetPath}`);

    const codeFiles = getAllCodeFiles(targetPath);
    if (!codeFiles.length) {
      core.warning("No code files found to document.");
      return;
    }

    const structure = {};

    for (const file of codeFiles) {
      const relativePath = external_path_namespaceObject.relative(targetPath, file);
      const category = external_path_namespaceObject.dirname(relativePath) || "root";
      const fileName = external_path_namespaceObject.basename(file, external_path_namespaceObject.extname(file));

      if (!structure[category]) structure[category] = [];

      core.info(`Generating documentation for: ${relativePath}`);

      const code = external_fs_namespaceObject.readFileSync(file, "utf-8");
      const htmlBody = await generateDocForFile(client, code);
      const fullHTML = wrapInTemplate(fileName, htmlBody);

      const outputDir = external_path_namespaceObject.join(OUTPUT_DIR, category);
      external_fs_namespaceObject.mkdirSync(outputDir, { recursive: true });
      external_fs_namespaceObject.writeFileSync(external_path_namespaceObject.join(outputDir, `${fileName}.html`), fullHTML, "utf-8");

      structure[category].push(file);
    }

    // Génère l'index principal
    const indexHTML = generateIndexPage(structure);
    external_fs_namespaceObject.writeFileSync(external_path_namespaceObject.join(OUTPUT_DIR, "index.html"), indexHTML, "utf-8");

    core.info(`Documentation generated successfully in ${OUTPUT_DIR}`);
  } catch (error) {
    core.setFailed(`Failed to generate documentation: ${error.message}`);
  }
}

run();

