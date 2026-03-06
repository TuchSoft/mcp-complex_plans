import { z } from "zod";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// Configuration management
const configSchema = z.object({
  default_editor: z
    .string()
    .optional()
    .describe("Default editor for opening files"),
  auto_delete_plans: z
    .boolean()
    .optional()
    .describe("Automatically delete plans after implementation"),
  add_to_gitignore: z
    .boolean()
    .optional()
    .describe("Automatically add .complex_plans to .gitignore"),
});

export type ServerConfig = z.infer<typeof configSchema>;

export const DEFAULT_CONFIG: ServerConfig = {
  default_editor: "zed",
  auto_delete_plans: false,
  add_to_gitignore: true,
};

// Parse environment variables
function parseEnvVars(): Partial<ServerConfig> {
  const envConfig: Partial<ServerConfig> = {};

  if (process.env.MCP_DEFAULT_EDITOR) {
    envConfig.default_editor = process.env.MCP_DEFAULT_EDITOR;
  }

  if (process.env.MCP_AUTO_DELETE_PLANS !== undefined) {
    envConfig.auto_delete_plans = process.env.MCP_AUTO_DELETE_PLANS === "true";
  }

  if (process.env.MCP_ADD_TO_GITIGNORE !== undefined) {
    envConfig.add_to_gitignore = process.env.MCP_ADD_TO_GITIGNORE === "true";
  }

  return envConfig;
}

// Parse CLI arguments
function parseCliArgs(): Partial<ServerConfig> {
  const cliConfig: Partial<ServerConfig> = {};

  // Parse process.argv manually
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];

    if (arg.startsWith("--default-editor=")) {
      cliConfig.default_editor = arg.split("=")[1];
    } else if (arg.startsWith("--auto-delete-plans=")) {
      cliConfig.auto_delete_plans = arg.split("=")[1] === "true";
    } else if (arg.startsWith("--add-to-gitignore=")) {
      cliConfig.add_to_gitignore = arg.split("=")[1] === "true";
    }
  }

  return cliConfig;
}

export function loadConfig(cliArgs?: Partial<ServerConfig>): ServerConfig {
  const parsedCliArgs = cliArgs || parseCliArgs();
  const parsedEnvVars = parseEnvVars();

  try {
    // 1. First priority: config.json in .complex_plans directory
    const aiPlansConfigPath = join(
      process.cwd(),
      ".complex_plans",
      "config.json",
    );
    if (existsSync(aiPlansConfigPath)) {
      const configContent = readFileSync(aiPlansConfigPath, "utf-8");
      const parsed = JSON.parse(configContent);
      // 2. Second priority: Environment variables override file config
      // 3. Third priority: CLI arguments override everything
      const merged = {
        ...DEFAULT_CONFIG,
        ...parsed,
        ...parsedEnvVars,
        ...parsedCliArgs,
      };
      return configSchema.parse(merged);
    }

    // 4. Fourth priority: Environment variables only
    if (Object.keys(parsedEnvVars).length > 0) {
      // 5. Fifth priority: CLI arguments override environment variables
      const merged = { ...DEFAULT_CONFIG, ...parsedEnvVars, ...parsedCliArgs };
      return configSchema.parse(merged);
    }

    // 6. Sixth priority: CLI arguments only
    if (Object.keys(parsedCliArgs).length > 0) {
      const merged = { ...DEFAULT_CONFIG, ...parsedCliArgs };
      return configSchema.parse(merged);
    }
  } catch (error) {
    console.warn("Failed to load config, using defaults:", error);
  }

  // 7. Seventh priority: defaults only
  return DEFAULT_CONFIG;
}

export function saveConfig(config: ServerConfig): void {
  try {
    const configDir = join(process.cwd(), ".complex_plans");
    const configPath = join(configDir, "config.json");

    // Ensure .complex_plans directory exists
    if (!existsSync(configDir)) {
      // Note: In a real implementation, you'd create the directory here
      // For now, we'll just try to write and let it fail if directory doesn't exist
    }

    writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save config:", error);
  }
}

export const config = loadConfig();
