import { z } from "zod";
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { config } from "../config.js";
import {
  getWorkspaceRoot,
  getPlanDirectory,
  handleGitignore,
} from "../utils.js";

// Define the tool schema
const createPlanSchema = z.object({
  plan_name: z.string().describe("Name of the plan (used for filename)"),
  plan_content: z.string().describe("Markdown content of the plan"),
  workspace_root: z
    .string()
    .optional()
    .describe(
      "Root directory of the workspace (defaults to current directory)",
    ),
});

export function registerCreatePlanTool(server: McpServer): void {
  server.registerTool(
    "create_plan",
    {
      description: `Create a new plan file in the .complex_plans directory.

CRITICAL PROTOCOL FOR COMPLEX TASKS:
- YOU MUST automatically generate a plan for ANY complex task (multi-file edits, significant changes)
- MUST use sequential_thinking tool first to analyze the task
- MUST create markdown plan in .complex_plans/{plan-name}.md
- MUST open plan in editor for user review using open_in_editor tool
- MUST terminate the conversation and await explicit user approval before implementing (the user must prompt something like "ok, proceed", "let's implement it" or similar)
- MUST re-read plan from disk before implementation (the user might have changed it, with more details)
- MUST follow the plan exactly as written

PLAN STRUCTURE:
# Plan: [Task Name]
## Goal
[2-3 line summary of what will be accomplished]
## Steps
1. [Specific Action] -> [Specific File:Line]
2. [Specific Action] -> [Specific File:Line]
## Risks/Doubts
- [Questions for user]
- "No other details needed" (if none)
## Verification
- [Test commands]
- [Verification steps]

CRITICAL RULES:
- ALWAYS create plans for complex tasks
- ALWAYS read plans from disk at every iteration
- ALWAYS get explicit user approval before implementing
- ALWAYS re-read the plan before implementation
- NEVER proceed without a plan for complex tasks
- NEVER assume the plan hasn't changed

AUTO-DELETE: ${config.auto_delete_plans ? "Enabled - plan will be deleted after implementation" : "Disabled - plan will be preserved"}

WHEN TO USE:
- Multi-file refactoring operations
- Large-scale feature implementations
- Complex bug fixes requiring multiple changes
- Architectural changes
- Any task requiring user approval or careful planning

TOOL INTEGRATION:
- sequential_thinking: Use before plan creation for analysis
- open_in_editor: Use to show plans to users for review
- read_file: Use to re-read plans before implementation
- delete_plan: Called automatically if auto_delete_plans enabled
- todo: Use for implementation task tracking

EXECUTION PROCESS:
- User ask for a complex task
- You MUST call \`create_plan\` to create a markdown plan
- You MUST terminate the conversation and ask the user to review the plan
- The user could supply additional information and/or ask question, call the \`update_plan\` to update the plan with new information provided by the user.
- Only when the user prompt something like "ok, proceed", "let's implement it" or similar, you can proceed with the implementation of the plan or installing any dependency

IMPORTANT: After creating a plan, you MUST call the open_in_editor tool to show the plan to the user. The process MUST be interrupted at this point, and you MUST return control to the user. You MUST NOT proceed with any other actions until the user has explicitly confirmed the plan. Ask the user to review the plan and provide explicit confirmation before proceeding with any other actions. Always re-read the plan from the file to ensure you have the latest content.

CRITICAL: DO NOT PROCEED WITH IMPLEMENTATION UNTIL THE USER HAS EXPLICITLY CONFIRMED THE PLAN. The model must wait for the user to review and approve the plan before taking any further steps. This is a mandatory requirement and must be strictly followed.`,
      inputSchema: createPlanSchema,
    },
    async (params: {
      plan_name: string;
      plan_content: string;
      workspace_root?: string;
    }) => {
      const { plan_name, plan_content, workspace_root } = params;
      const workspaceRoot = getWorkspaceRoot(workspace_root);
      const planDir = getPlanDirectory(workspaceRoot);

      try {
        // Create .complex_plans directory if it doesn't exist
        if (!existsSync(planDir)) {
          mkdirSync(planDir, { recursive: true });
          await handleGitignore(workspaceRoot);
        }

        // Create plan directory
        const planPath = join(planDir, plan_name);
        if (!existsSync(planPath)) {
          mkdirSync(planPath, { recursive: true });
        }

        // Write plan file
        const planFilePath = join(planPath, "plan.md");
        writeFileSync(planFilePath, plan_content, "utf-8");

        return {
          content: [
            {
              type: "text",
              text: `Successfully created plan '${plan_name}' at ${planFilePath}`,
            },
          ],
        };
      } catch (error) {
        throw new Error(`Failed to create plan: ${error}`);
      }
    },
  );
}
