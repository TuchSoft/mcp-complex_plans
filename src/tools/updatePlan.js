import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { getWorkspaceRoot } from "../utils.js";
import { z } from "zod";

/**
 * Updates an existing plan file in the .complex_plans directory.
 * Always read the plan first to ensure you have the latest content before updating.
 *
 * @param {string} planName - Name of the plan (used for filename)
 * @param {string} newContent - The complete new content for the plan (markdown format)
 * @param {string} [workspaceRoot] - Root directory of the workspace (defaults to current directory)
 */
export async function updatePlan(planName, newContent, workspaceRoot) {
  const root = workspaceRoot || getWorkspaceRoot();
  const planDir = join(root, ".complex_plans", planName);
  const planPath = join(planDir, "plan.md");

  // Read the existing plan to ensure we have the latest content
  let existingContent = "";
  try {
    existingContent = readFileSync(planPath, "utf8");
  } catch (error) {
    throw new Error(
      `Plan '${planName}' does not exist. Use createPlan to create a new plan.`,
    );
  }

  // Write the new content to the plan file
  writeFileSync(planPath, newContent, "utf8");

  console.log(`Plan '${planName}' updated successfully.`);
}

// Define the tool schema
const updatePlanSchema = z.object({
  plan_name: z.string().describe("Name of the plan to update"),
  plan_content: z.string().describe("Complete new content for the plan (markdown format)"),
  workspace_root: z.string().optional().describe("Root directory of the workspace (defaults to current directory)"),
});

export function registerUpdatePlanTool(server) {
  server.registerTool(
    "update_plan",
    {
      description: "[mcp-complex_plans] Update an existing plan file in the .complex_plans directory. Always read the plan first to ensure you have the latest content before updating.",
      inputSchema: updatePlanSchema,
    },
    async (params) => {
      const { plan_name, plan_content, workspace_root } = params;
      try {
        await updatePlan(plan_name, plan_content, workspace_root);
        return {
          content: [
            {
              type: "text",
              text: `Plan '${plan_name}' updated successfully.`,
            },
          ],
        };
      } catch (error) {
        throw new Error(`Failed to update plan: ${error}`);
      }
    },
  );
}
