import { z } from "zod";
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { config } from "../config.js";
import {
  getWorkspaceRoot,
  getPlanDirectory,
  handleGitignore,
  loadPromptDescription,
  tenStamp,
} from "../utils.js";

// Define the tool schema
const createPlanSchema = z.object({
  plan_name: z.string().describe("Name of the plan (used for filename)"),
  plan_content: z.string().describe("Markdown content of the plan"),
  workspace_root: z.string().describe("Root directory of the workspace"),
});

export function registerCreatePlanTool(server: McpServer): void {
  const description =
    loadPromptDescription("createPlan") +
    (config.auto_delete_plans
      ? "\nEnabled - plan must be deleted after implementation with the `deletePlan` tool"
      : "");

  server.registerTool(
    "createPlan",
    {
      title: "Create Plan",
      description,
      inputSchema: createPlanSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (params: {
      plan_name: string;
      plan_content: string;
      workspace_root: string;
    }) => {
      const { plan_name, plan_content, workspace_root } = params;
      const workspaceRoot = getWorkspaceRoot(workspace_root);
      const planDir = getPlanDirectory(workspaceRoot);

      try {
        // Create plans directory if it doesn't exist
        if (!existsSync(planDir)) {
          mkdirSync(planDir, { recursive: true });
          await handleGitignore(workspaceRoot);
        }

        // Write plan file with a sortable ID prefix
        const planId = tenStamp();
        const planFileName = `${planId}-${plan_name}.md`;
        const planFilePath = join(planDir, planFileName);
        writeFileSync(planFilePath, plan_content, "utf-8");

        return {
          content: [
            {
              type: "text",
              text: `Successfully created plan '${planFileName.replace(".md", "")}' at ${planFilePath}`,
            },
          ],
        };
      } catch (error) {
        throw new Error(`Failed to create plan: ${error}`);
      }
    },
  );
}
