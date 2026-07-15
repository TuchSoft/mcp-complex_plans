#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import configuration functions
import { config, DEFAULT_CONFIG } from "./config.js";

// Import tools
import { registerOpenInEditorTool } from "./tools/openInEditor.js";
import { registerCreatePlanTool } from "./tools/createPlan.js";
import { registerDeletePlanTool } from "./tools/deletePlan.js";
import { registerUpdatePlanTool } from "./tools/updatePlan.js";
import { registerListPlansTool } from "./tools/listPlans.js";
import { registerReadPlanTool } from "./tools/readPlan.js";
import { registerSequentialThinkingTools } from "./tools/sequentialThinking.js";

// CLI argument parsing/merging lives in config.ts (loadConfig/parseCliArgs) so
// there is a single source of truth for configuration. This only handles the
// `--help` early exit, which is specific to the CLI entry point.
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
Usage: ${process.argv[1]} [options]

Configuration Priority Order:
  1. <plans_dir>/config.json file (default: ${DEFAULT_CONFIG.plans_dir}/config.json)
  2. Environment variables (MCP_COMPLEX_PLANS_*)
  3. CLI arguments
  4. Default values

Options:
  --default-editor=<editor>    Default editor for opening files (default: "${DEFAULT_CONFIG.default_editor}")
                              Env var: MCP_COMPLEX_PLANS_DEFAULT_EDITOR
  --auto-delete-plans=<true|false>  Automatically delete plans after implementation (default: ${DEFAULT_CONFIG.auto_delete_plans})
                                  Env var: MCP_COMPLEX_PLANS_AUTO_DELETE_PLANS
  --add-to-gitignore=<true|false>    Automatically add the plans directory to .gitignore (default: ${DEFAULT_CONFIG.add_to_gitignore})
                                Env var: MCP_COMPLEX_PLANS_ADD_TO_GITIGNORE
  --plans-dir=<dir>            Directory name used to store plan files (default: "${DEFAULT_CONFIG.plans_dir}")
                              Env var: MCP_COMPLEX_PLANS_PLANS_DIR
  --disabled-tools=<tool1,tool2>  Comma-separated list of tools to disable
  --disabled-tools <tool>        Disable a specific tool (can be used multiple times)
                              Env var: MCP_COMPLEX_PLANS_DISABLED_TOOLS (comma-separated)
  --help, -h                     Show this help message

Environment Variables:
  MCP_COMPLEX_PLANS_DEFAULT_EDITOR         Same as --default-editor
  MCP_COMPLEX_PLANS_AUTO_DELETE_PLANS     Same as --auto-delete-plans (true/false)
  MCP_COMPLEX_PLANS_ADD_TO_GITIGNORE       Same as --add-to-gitignore (true/false)
  MCP_COMPLEX_PLANS_PLANS_DIR              Same as --plans-dir
  MCP_COMPLEX_PLANS_DISABLED_TOOLS  Comma-separated list of tools to disable`);
  process.exit(0);
}

// Build the server-wide instructions sent to the agent at initialization.
const baseInstructions =
  "In this chat the `complex_plans` toolset is active. Ignore your built-in planning tool and refer to the following for all your planning needs.";

const historicalNote = config.auto_delete_plans
  ? ""
  : `\n\nThe content of the \`${config.plans_dir}\` directory may be used to explain historic decisions and project progression. Consider that plans there might be old, stale, never implemented, or changed significantly. Refer to them only as historical data to compare against the present or git history.`;

const instructions = baseInstructions + historicalNote;

// Create MCP server
const server = new McpServer(
  {
    name: "MCP Complex Plans Server",
    version: "1.3.2",
  },
  { instructions },
);

// Register tools based on configuration
const toolRegistrations = [
  { name: "openInEditor", register: registerOpenInEditorTool },
  { name: "createPlan", register: registerCreatePlanTool },
  { name: "deletePlan", register: registerDeletePlanTool },
  { name: "updatePlan", register: registerUpdatePlanTool },
  { name: "listPlans", register: registerListPlansTool },
  { name: "readPlan", register: registerReadPlanTool },
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
