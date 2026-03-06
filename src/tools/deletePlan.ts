import { z } from "zod";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getWorkspaceRoot, getPlanDirectory } from "../utils.js";

// Define the tool schema
const deletePlanSchema = z.object({
  plan_name: z.string().describe("Name of the plan to delete"),
  workspace_root: z
    .string()
    .optional()
    .describe(
      "Root directory of the workspace (defaults to current directory)",
    ),
});

export function registerDeletePlanTool(server: McpServer): void {
  server.registerTool(
    "delete_plan",
    {
      description:
        "Delete a plan file from the .complex_plans directory. Note that the directory itself is kept intact as empty directories are not committed to git. Use this tool when a plan has been completed and is no longer needed, when you want to clean up old or obsolete plans, or when you need to remove sensitive information from plans. This operation cannot be undone.",
      inputSchema: deletePlanSchema,
    },
    async (params: { plan_name: string; workspace_root?: string }) => {
      const { plan_name, workspace_root } = params;
      const workspaceRoot = getWorkspaceRoot(workspace_root);
      const planDir = getPlanDirectory(workspaceRoot);
      const planPath = join(planDir, plan_name);
      const planFilePath = join(planPath, "plan.md");

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
