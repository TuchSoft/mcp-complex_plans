#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import configuration functions
import { loadConfig, DEFAULT_CONFIG } from "./config.js";

// Import tools
import { registerOpenInEditorTool } from "./tools/openInEditor.js";
import { registerCreatePlanTool } from "./tools/createPlan.js";
import { registerDeletePlanTool } from "./tools/deletePlan.js";
import { registerUpdatePlanTool } from "./tools/updatePlan.js";
import { registerListPlansTool } from "./tools/listPlans.js";
import { registerSequentialThinkingTools } from "./tools/sequentialThinking.js";

// Parse CLI arguments for configuration
function parseCliArgs(): Partial<typeof DEFAULT_CONFIG> {
  const cliConfig: Partial<typeof DEFAULT_CONFIG> = {};

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];

    if (arg.startsWith("--default-editor=")) {
      cliConfig.default_editor = arg.split("=")[1];
    } else if (arg.startsWith("--auto-delete-plans=")) {
      cliConfig.auto_delete_plans = arg.split("=")[1] === "true";
    } else if (arg.startsWith("--add-to-gitignore=")) {
      cliConfig.add_to_gitignore = arg.split("=")[1] === "true";
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
Usage: ${process.argv[1]} [options]

Configuration Priority Order:
  1. .complex_plans/config.json file
  2. Environment variables (MCP_*)
  3. CLI arguments
  4. Default values

Options:
  --default-editor=<editor>    Default editor for opening files (default: "${DEFAULT_CONFIG.default_editor}")
                              Env var: MCP_DEFAULT_EDITOR
  --auto-delete-plans=<true|false>  Automatically delete plans after implementation (default: ${DEFAULT_CONFIG.auto_delete_plans})
                                  Env var: MCP_AUTO_DELETE_PLANS
  --add-to-gitignore=<true|false>    Automatically add .complex_plans to .gitignore (default: ${DEFAULT_CONFIG.add_to_gitignore})
                                Env var: MCP_ADD_TO_GITIGNORE
  --disabled-tools=<tool1,tool2>  Comma-separated list of tools to disable
  --disabled-tools <tool>        Disable a specific tool (can be used multiple times)
                              Env var: MCP_COMPLEX_PLANS_DISABLED_TOOLS (comma-separated)
  --help, -h                     Show this help message

Environment Variables:
  MCP_DEFAULT_EDITOR         Same as --default-editor
  MCP_AUTO_DELETE_PLANS     Same as --auto-delete-plans (true/false)
  MCP_ADD_TO_GITIGNORE       Same as --add-to-gitignore (true/false)
  MCP_COMPLEX_PLANS_DISABLED_TOOLS  Comma-separated list of tools to disable`);
      process.exit(0);
    }
  }

  return cliConfig;
}

// Load configuration with CLI arguments
const cliArgs = parseCliArgs();
const config = loadConfig(cliArgs);

// Create MCP server
const server = new McpServer({
  name: "MCP Complex Plans Server",
  version: "1.0.0",
});

// Register tools based on configuration
const toolRegistrations = [
  { name: "openInEditor", register: registerOpenInEditorTool },
  { name: "createPlan", register: registerCreatePlanTool },
  { name: "deletePlan", register: registerDeletePlanTool },
  { name: "updatePlan", register: registerUpdatePlanTool },
  { name: "listPlans", register: registerListPlansTool },
  { name: "sequentialThinking", register: registerSequentialThinkingTools },
];

// Register only enabled tools
for (const tool of toolRegistrations) {
  if (!config.disabled_tools?.includes(tool.name)) {
    tool.register(server);
  }
}

// Connect to stdio transport
const transport = new StdioServerTransport();

// Start the server
async function main() {
  try {
    await server.connect(transport);
  } catch (error) {
    process.exit(1);
  }
}

main();
