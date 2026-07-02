import { z } from "zod";
import { readdirSync, existsSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  getWorkspaceRoot,
  getPlanDirectory,
  loadPromptDescription,
} from "../utils.js";
import { config } from "../config.js";

// Define the tool schema
const listPlansSchema = z.object({
  workspace_root: z.string().describe("Root directory of the workspace"),
});

export function registerListPlansTool(server: McpServer): void {
  server.registerTool(
    "listPlans",
    {
      title: "List Plans",
      description: loadPromptDescription("listPlans"),
      inputSchema: listPlansSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params: { workspace_root: string }) => {
      const { workspace_root } = params;
      const workspaceRoot = getWorkspaceRoot(workspace_root);
      const planDir = getPlanDirectory(workspaceRoot);

      try {
        // Check if plans directory exists
        if (!existsSync(planDir)) {
          return {
            content: [
              {
                type: "text",
                text: `No plans found. The ${config.plans_dir} directory does not exist yet.`,
              },
            ],
          };
        }

        // Read all items in the plans directory
        const items = readdirSync(planDir, { withFileTypes: true });

        // Filter only markdown files (each plan is a .md file)
        const plans = items
          .filter((item) => item.isFile() && item.name.endsWith(".md"))
          .map((item) => item.name.replace(".md", ""));

        if (plans.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No plans found in the ${config.plans_dir} directory.`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `Found ${plans.length} plan(s): ${plans.join(", ")}`,
            },
          ],
        };
      } catch (error) {
        throw new Error(`Failed to list plans: ${error}`);
      }
    },
  );
}
