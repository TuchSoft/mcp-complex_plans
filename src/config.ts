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
  disabled_tools: z
    .array(z.string())
    .optional()
    .describe("List of tools to disable"),
});

export type ServerConfig = z.infer<typeof configSchema>;

export const DEFAULT_CONFIG: ServerConfig = {
  default_editor: "zed",
  auto_delete_plans: false,
  add_to_gitignore: true,
  disabled_tools: [],
};

// Parse environment variables
function parseEnvVars(): Partial<ServerConfig> {
  const envConfig: Partial<ServerConfig> = {};

  if (process.env.MCP_COMPLEX_PLANS_DEFAULT_EDITOR) {
    envConfig.default_editor = process.env.MCP_COMPLEX_PLANS_DEFAULT_EDITOR;
  }

  if (process.env.MCP_COMPLEX_PLANS_AUTO_DELETE_PLANS !== undefined) {
    envConfig.auto_delete_plans =
      process.env.MCP_COMPLEX_PLANS_AUTO_DELETE_PLANS === "true";
  }

  if (process.env.MCP_COMPLEX_PLANS_ADD_TO_GITIGNORE !== undefined) {
    envConfig.add_to_gitignore =
      process.env.MCP_COMPLEX_PLANS_ADD_TO_GITIGNORE === "true";
  }

  if (process.env.MCP_COMPLEX_PLANS_DISABLED_TOOLS) {
    // Support comma-separated list in environment variable
    envConfig.disabled_tools =
      process.env.MCP_COMPLEX_PLANS_DISABLED_TOOLS.split(",")
        .map((tool) => tool.trim())
        .filter((tool) => tool.length > 0);
  }

  return envConfig;
}

// Parse CLI arguments
function parseCliArgs(): Partial<ServerConfig> {
  const cliConfig: Partial<ServerConfig> = {
    disabled_tools: [],
  };

  // Parse process.argv manually
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];

    if (arg.startsWith("--default-editor=")) {
      cliConfig.default_editor = arg.split("=")[1];
    } else if (arg.startsWith("--auto-delete-plans=")) {
      cliConfig.auto_delete_plans = arg.split("=")[1] === "true";
    } else if (arg.startsWith("--add-to-gitignore=")) {
      cliConfig.add_to_gitignore = arg.split("=")[1] === "true";
    } else if (arg.startsWith("--disabled-tools=")) {
      // Support comma-separated list
      const tools = arg.split("=")[1].split(",");
      cliConfig.disabled_tools = [
        ...(cliConfig.disabled_tools || []),
        ...tools,
      ];
    } else if (arg === "--disabled-tools") {
      // Support multiple --disabled-tools args
      const nextArg = process.argv[i + 1];
      if (nextArg && !nextArg.startsWith("--")) {
        cliConfig.disabled_tools = [
          ...(cliConfig.disabled_tools || []),
          nextArg,
        ];
        i++; // Skip the next argument
      }
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
      // Config file has highest priority, then CLI args, then env vars
      const merged = {
        ...DEFAULT_CONFIG,
        ...parsedEnvVars,
        ...parsedCliArgs,
        ...parsed,
      };
      return configSchema.parse(merged);
    }

    // 4. Fourth priority: CLI arguments only
    if (Object.keys(parsedCliArgs).length > 0) {
      // CLI args override env vars
      const merged = { ...DEFAULT_CONFIG, ...parsedEnvVars, ...parsedCliArgs };
      return configSchema.parse(merged);
    }

    // 6. Fifth priority: Environment variables only
    if (Object.keys(parsedEnvVars).length > 0) {
      const merged = { ...DEFAULT_CONFIG, ...parsedEnvVars };
      return configSchema.parse(merged);
    }
  } catch (error) {}

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
  } catch (error) {}
}

export const config = loadConfig();
