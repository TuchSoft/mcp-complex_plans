import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  readdirSync,
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

/**
 * Generates a short, sortable timestamp-based code.
 * Uses 10-second intervals since 2000-01-01 encoded in base36.
 */
export function tenStamp(length = 6): string {
  const EPOCH_2000 = 946684800;
  const secondsSince2000 = Math.floor(Date.now() / 1000) - EPOCH_2000;
  const intervals = Math.floor(secondsSince2000 / 10);
  return intervals.toString(36).toUpperCase().padStart(length, "0");
}

/**
 * Reverses a tenStamp code back to the approximate Date it represents.
 */
export function stampToDate(stamp: string): Date {
  const EPOCH_2000 = 946684800;
  const intervals = parseInt(stamp.toLowerCase(), 36);
  const secondsSince2000 = intervals * 10;
  const timestamp = (secondsSince2000 + EPOCH_2000) * 1000;
  return new Date(timestamp);
}

/**
 * Checks whether a string is a plausible tenStamp ID:
 * 6 base36 characters that decode to a date between 2000 and 2100.
 */
export function isValidStamp(stamp: string): boolean {
  if (!/^[A-Z0-9]{6}$/i.test(stamp)) return false;
  const date = stampToDate(stamp);
  const minDate = new Date("2000-01-01T00:00:00.000Z");
  const maxDate = new Date("2100-01-01T00:00:00.000Z");
  return date >= minDate && date < maxDate;
}

/**
 * Resolves a plan name to an actual plan file path.
 * Accepts:
 * - full prefixed name: XXXXXX-plan-name
 * - bare plan name: plan-name
 * - 6-character stamp ID: XXXXXX
 * - legacy unprefixed name: plan-name (direct file match)
 */
export function resolvePlanFile(
  planDir: string,
  planName: string,
): string {
  const directPath = join(planDir, `${planName}.md`);
  if (existsSync(directPath)) {
    return directPath;
  }

  const files = readdirSync(planDir);

  // If planName looks like a valid stamp ID, resolve by prefix.
  if (isValidStamp(planName)) {
    const prefix = `${planName}-`;
    const matches = files.filter(
      (file) => file.endsWith(".md") && file.startsWith(prefix),
    );
    if (matches.length === 1) {
      return join(planDir, matches[0]);
    }
    if (matches.length > 1) {
      throw new Error(
        `Multiple plans match ID '${planName}': ${matches.join(", ")}. Use the full plan name.`,
      );
    }
  }

  // Otherwise resolve by base name suffix.
  const suffix = `-${planName}.md`;
  const matches = files.filter(
    (file) => file.endsWith(".md") && file.endsWith(suffix),
  );

  if (matches.length === 1) {
    return join(planDir, matches[0]);
  }

  if (matches.length > 1) {
    throw new Error(
      `Multiple plans match '${planName}': ${matches.join(", ")}. Use the full plan name including its ID prefix.`,
    );
  }

  return directPath;
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
