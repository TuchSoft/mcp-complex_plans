import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";

/**
 * Loads a prompt description from a markdown file
 * Uses the package's installation directory to resolve prompt paths
 *
 * Supports runtime placeholders:
 * - {{PLANS_DIR}} is replaced with the configured plans directory name
 */
export function loadPromptDescription(promptName: string): string {
  let content: string;

  try {
    // Get the current module's directory
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // Try prompts directory alongside the module (production - dist/prompts)
    let promptPath = join(__dirname, "prompts", `${promptName}.md`);
    if (existsSync(promptPath)) {
      content = readFileSync(promptPath, "utf-8");
    } else {
      // Fallback to src/prompts (development)
      promptPath = join(
        __dirname,
        "..",
        "..",
        "src",
        "prompts",
        `${promptName}.md`,
      );
      if (existsSync(promptPath)) {
        content = readFileSync(promptPath, "utf-8");
      } else {
        throw new Error(`Prompt file not found: ${promptName}.md`);
      }
    }
  } catch (error) {
    console.error(`Failed to load prompt ${promptName}:`, error);
    return `Description for ${promptName} not available`;
  }

  // Apply runtime substitutions
  return content.replace(/\{\{PLANS_DIR\}\}/g, config.plans_dir);
}

export function getWorkspaceRoot(root?: string): string {
  return root || process.cwd();
}

export function getPlanDirectory(workspaceRoot: string): string {
  return join(workspaceRoot, config.plans_dir);
}

export async function handleGitignore(workspaceRoot: string): Promise<void> {
  if (!config.add_to_gitignore) return;

  const gitignorePath = join(workspaceRoot, ".gitignore");
  const relativePlanDir = config.plans_dir;

  try {
    let gitignoreContent = "";
    if (existsSync(gitignorePath)) {
      gitignoreContent = readFileSync(gitignorePath, "utf-8");
    }

    if (!gitignoreContent.includes(relativePlanDir)) {
      gitignoreContent += `\n#Ignore the AI plans directory\n${relativePlanDir}\n`;
      writeFileSync(gitignorePath, gitignoreContent, "utf-8");
    }
  } catch (error) {}
}
