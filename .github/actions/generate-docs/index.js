import fs from "fs";
import path from "node:path";
import core from "@actions/core";
import OpenAI from "openai";

async function run() {
  try {
    const apiKey = core.getInput("openai_api_key", { required: true });
    const codePath = core.getInput("path", { required: true });

    const openai = new OpenAI({ apiKey });

    // Lire le code dans le dossier spécifié
    const absPath = path.resolve(process.cwd(), codePath);
    let codeContent = "";

    function readDirRec(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          readDirRec(full);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if ([".js", ".ts", ".py"].includes(ext)) {
            const fileData = fs.readFileSync(full, "utf-8");
            codeContent += `# File: ${path.relative(process.cwd(), full)}\n${fileData}\n\n`;
          }
        }
      }
    }

    readDirRec(absPath);

    const prompt = `You are an expert technical writer. Generate a professional README.md and inline documentation for the following code:\n\n${codeContent}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const documentation = completion.choices[0].message.content;

    fs.writeFileSync(path.join(process.cwd(), "README.md"), documentation);

    core.info("Documentation generated and README.md created");
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
