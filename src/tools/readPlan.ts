import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getWorkspaceRoot, loadPromptDescription } from "../utils.js";

/**
 * Reads the content of an existing plan file from the .complex_plans directory.
 * Can optionally add implementation instructions when ready_to_implement is true.
 *
 * @param planName - Name of the plan (used for filename)
 * @param readyToImplement - Whether to include implementation instructions
 * @param workspaceRoot - Root directory of the workspace
 */
export async function readPlan(
  planName: string,
  readyToImplement: boolean = false,
  workspaceRoot?: string,
): Promise<{ content: string; instructions?: string }> {
  const root = workspaceRoot || getWorkspaceRoot();
  const planPath = join(root, ".complex_plans", `${planName}.md`);

  // Check if plan exists
  if (!existsSync(planPath)) {
    throw new Error(
      `Plan '${planName}' does not exist. Use listPlans to see available plans.`,
    );
  }

  // Read the plan content
  const planContent = readFileSync(planPath, "utf8");

  // Add implementation instructions if ready_to_implement is true
  let instructions: string | undefined;
  if (readyToImplement) {
    instructions = loadPromptDescription("readPlanImplementation");
  }

  return {
    content: planContent,
    instructions,
  };
}

// Define the tool schema
const readPlanSchema = z.object({
  plan_name: z.string().describe("Name of the plan to read"),
  ready_to_implement: z
    .boolean()
    .default(false)
    .describe(
      "Set to true only when the user is finally asking to implement the plan. This adds strict implementation instructions.",
    ),
  workspace_root: z.string().describe("Root directory of the workspace"),
});

export function registerReadPlanTool(server: McpServer): void {
  server.registerTool(
    "readPlan",
    {
      description: loadPromptDescription("readPlan"),
      inputSchema: readPlanSchema,
    },
    async (params: {
      plan_name: string;
      ready_to_implement: boolean;
      workspace_root: string;
    }) => {
      const { plan_name, ready_to_implement, workspace_root } = params;
      try {
        const result = await readPlan(
          plan_name,
          ready_to_implement,
          workspace_root,
        );

        // Build the response content
        let responseContent = result.content;
        if (result.instructions) {
          responseContent = result.instructions + "\n" + result.content;
        }

        return {
          content: [
            {
              type: "text" as const,
              text: responseContent,
            },
          ],
        };
      } catch (error) {
        throw new Error(`Failed to read plan: ${error}`);
      }
    },
  );
}
