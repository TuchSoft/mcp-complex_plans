import { z } from "zod";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  getWorkspaceRoot,
  getPlanDirectory,
  loadPromptDescription,
  resolvePlanFile,
} from "../utils.js";

// Define the tool schema
const deletePlanSchema = z.object({
  plan_name: z.string().describe("Name of the plan to delete"),
  workspace_root: z.string().describe("Root directory of the workspace"),
});

export function registerDeletePlanTool(server: McpServer): void {
  server.registerTool(
    "deletePlan",
    {
      title: "Delete Plan",
      description: loadPromptDescription("deletePlan"),
      inputSchema: deletePlanSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params: { plan_name: string; workspace_root: string }) => {
      const { plan_name, workspace_root } = params;
      const workspaceRoot = getWorkspaceRoot(workspace_root);
      const planDir = getPlanDirectory(workspaceRoot);
      const planFilePath = resolvePlanFile(planDir, plan_name);

      try {
        if (!existsSync(planFilePath)) {
          throw new Error(
            `Plan '${plan_name}' does not exist at ${planFilePath}`,
          );
        }

        // Delete only the plan file, keep the directory
        rmSync(planFilePath);

        return {
          content: [
            {
              type: "text",
              text: `Successfully deleted plan '${plan_name}' from ${planFilePath}`,
            },
          ],
        };
      } catch (error) {
        throw new Error(`Failed to delete plan: ${error}`);
      }
    },
  );
}
