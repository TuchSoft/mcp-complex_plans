import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { getWorkspaceRoot, loadPromptDescription } from "../utils.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import replaceInFile from "replace-in-file";

interface SearchReplaceBlock {
  search: string;
  replace: string;
}

/**
 * Parses SEARCH/REPLACE blocks from content using the exact logic specified:
 * 1. Split input by ">>>>>>> REPLACE" to separate individual blocks
 * 2. Apply regex to each block to extract search/replace parts
 * 3. Trim the results
 */
function parseSearchReplaceBlocks(content: string): SearchReplaceBlock[] {
  // Step 1: Split input by ">>>>>>> REPLACE" to get individual blocks
  const rawBlocks = content
    .split(">>>>>>> REPLACE")
    .filter((s) => s.trim())
    .map((s) => s + ">>>>>>> REPLACE");

  if (rawBlocks.length === 0) {
    return [];
  }

  const blocks: SearchReplaceBlock[] = [];

  // Step 2: Apply regex to each block to extract search/replace parts
  const SEARCH_REPLACE_REGEX =
    /<{7} SEARCH\r?\n(.*?)\r?\n?={7}\r?\n(.*?)\r?\n>{7} REPLACE/gs;

  for (const rawBlock of rawBlocks) {
    const matches = [...rawBlock.matchAll(SEARCH_REPLACE_REGEX)];

    for (const match of matches) {
      if (match.length >= 3) {
        // Step 3: Trim the results
        blocks.push({
          search: match[1].trim(),
          replace: match[2].trim(),
        });
      }
    }
  }

  return blocks;
}

/**
 * Updates an existing plan file in the .complex_plans directory using SEARCH/REPLACE blocks.
 * Always read the plan first to ensure you have the latest content before updating.
 *
 * @param planName - Name of the plan (used for filename)
 * @param editContent - SEARCH/REPLACE blocks defining the changes to apply
 * @param workspaceRoot - Root directory of the workspace ()
 */
export async function updatePlan(
  planName: string,
  editContent: string,
  workspaceRoot?: string,
): Promise<{ applied: number; warnings: string[] }> {
  const root = workspaceRoot || getWorkspaceRoot();
  const planPath = join(root, ".complex_plans", `${planName}.md`);

  // Read the existing plan to ensure we have the latest content
  let existingContent = "";
  try {
    existingContent = readFileSync(planPath, "utf8");
  } catch (error) {
    throw new Error(
      `Plan '${planName}' does not exist. Use createPlan to create a new plan.`,
    );
  }

  // Parse SEARCH/REPLACE blocks from the edit content
  const blocks = parseSearchReplaceBlocks(editContent);

  if (blocks.length === 0) {
    throw new Error(
      "No valid SEARCH/REPLACE blocks found in content.\n" +
        "Expected format:\n" +
        "<<<<<<< SEARCH\n" +
        "[exact content to find]\n" +
        "=======\n" +
        "[new content to replace with]\n" +
        ">>>>>>> REPLACE",
    );
  }

  // Prepare replacements for replace-in-file library
  const replacements = blocks.map((block: SearchReplaceBlock) => ({
    files: planPath,
    from: block.search,
    to: block.replace,
  }));

  // Apply the replacements sequentially to avoid race conditions
  // Each replacement sees the results of the previous ones
  const results = [];
  for (const replacement of replacements) {
    const result = await replaceInFile({
      files: replacement.files,
      from: replacement.from,
      to: replacement.to,
    });
    results.push(result);
  }

  // Count applied changes
  let applied = 0;

  // results is now an array of result arrays (one per replacement)
  for (let i = 0; i < results.length; i++) {
    const resultArray = results[i];

    for (const result of resultArray) {
      if (result.hasChanged && result.numReplacements) {
        applied += result.numReplacements;
      }
    }
  }

  return {
    applied,
    warnings: [],
  };
}

// Define the tool schema
const updatePlanSchema = z.object({
  plan_name: z.string().describe("Name of the plan to update"),
  edit_content: z
    .string()
    .describe(
      "SEARCH/REPLACE blocks defining the changes to apply. " +
        "Format: <<<<<<< SEARCH\\n[exact text to find]\\n=======\\n[new content]\\n>>>>>>> REPLACE. Multiple blocks can be included in a single request to apply multiple changes sequentially.",
    ),
  workspace_root: z.string().describe("Root directory of the workspace"),
});

export function registerUpdatePlanTool(server: McpServer): void {
  server.registerTool(
    "updatePlan",
    {
      description: loadPromptDescription("updatePlan"),
      inputSchema: updatePlanSchema,
    },
    async (params: {
      plan_name: string;
      edit_content: string;
      workspace_root: string;
    }) => {
      const { plan_name, edit_content, workspace_root } = params;
      try {
        const result = await updatePlan(
          plan_name,
          edit_content,
          workspace_root,
        );

        // Check if any changes were actually applied
        if (result.applied === 0) {
          throw new Error(
            `Please try again. No changes were made to plan '${plan_name}'. CRITICAL: The search text was not found or the content was already up to date. You MUST read the file from disk again to get the current content, then verify your SEARCH text matches exactly (including whitespace and formatting).`,
          );
        }

        return {
          content: [
            {
              type: "text" as const,
              text: `Plan '${plan_name}' updated successfully. Applied ${result.applied} change(s).`,
            },
          ],
        };
      } catch (error) {
        throw new Error(
          `Please try again. Failed to update plan: ${error}. IMPORTANT: Always read the file again from disk before attempting another update. The content on disk is the source of truth. Remember: and don't escape newlines.`,
        );
      }
    },
  );
}
