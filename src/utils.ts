import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
} from "node:fs";
import { join } from "node:path";
import { config } from "./config.js";

export function getWorkspaceRoot(root?: string): string {
  return root || process.cwd();
}

export function getPlanDirectory(workspaceRoot: string): string {
  return join(workspaceRoot, ".complex_plans");
}

export async function handleGitignore(workspaceRoot: string): Promise<void> {
  if (!config.add_to_gitignore) return;

  const gitignorePath = join(workspaceRoot, ".gitignore");
  const planDir = getPlanDirectory(workspaceRoot);
  const relativePlanDir = ".complex_plans";

  try {
    let gitignoreContent = "";
    if (existsSync(gitignorePath)) {
      gitignoreContent = readFileSync(gitignorePath, "utf-8");
    }

    if (!gitignoreContent.includes(relativePlanDir)) {
      gitignoreContent += `\n${relativePlanDir}\n`;
      writeFileSync(gitignorePath, gitignoreContent, "utf-8");
    }
  } catch (error) {
    console.warn("Failed to update .gitignore:", error);
  }
}
