import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import chalk from "chalk";
import { loadPromptDescription } from "../utils.js";

// Integrated Sequential Thinking Server
class SequentialThinkingServer {
  thoughtHistory: any[] = [];
  branches: Record<string, any[]> = {};
  disableThoughtLogging: boolean;

  constructor() {
    this.disableThoughtLogging =
      (process.env.DISABLE_THOUGHT_LOGGING || "").toLowerCase() === "true";
  }

  formatThought(thoughtData: any): string {
    const {
      thoughtNumber,
      totalThoughts,
      thought,
      isRevision,
      revisesThought,
      branchFromThought,
      branchId,
    } = thoughtData;
    let prefix = "";
    let context = "";
    if (isRevision) {
      prefix = chalk.yellow("🔄 Revision");
      context = ` (revising thought ${revisesThought})`;
    } else if (branchFromThought) {
      prefix = chalk.green("🌿 Branch");
      context = ` (from thought ${branchFromThought}, ID: ${branchId})`;
    } else {
      prefix = chalk.blue("💭 Thought");
      context = "";
    }
    const header = `${prefix} ${thoughtNumber}/${totalThoughts}${context}`;
    const border = "─".repeat(Math.max(header.length, thought.length) + 4);
    return `
┌${border}┐
│ ${header} │
├${border}┤
│ ${thought.padEnd(border.length - 2)} │
└${border}┘`;
  }

  processThought(input: any) {
    try {
      // Validation happens at the tool registration layer via Zod
      // Adjust totalThoughts if thoughtNumber exceeds it
      if (input.thoughtNumber > input.totalThoughts) {
        input.totalThoughts = input.thoughtNumber;
      }
      this.thoughtHistory.push(input);
      if (input.branchFromThought && input.branchId) {
        if (!this.branches[input.branchId]) {
          this.branches[input.branchId] = [];
        }
        this.branches[input.branchId].push(input);
      }
      if (!this.disableThoughtLogging) {
        const formattedThought = this.formatThought(input);
      }

      // Generate the response
      const response = {
        thoughtNumber: input.thoughtNumber,
        totalThoughts: input.totalThoughts,
        nextThoughtNeeded: input.nextThoughtNeeded,
        branches: Object.keys(this.branches),
        thoughtHistoryLength: this.thoughtHistory.length,
      };

      return {
        isError: false,
        content: [
          {
            type: "text",
            text: JSON.stringify(response),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error processing thought: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
}

// Initialize our integrated sequential thinking server
const thinkingServer = new SequentialThinkingServer();

/**
 * Registers the sequential thinking tool with our server
 * This provides integrated sequential thinking functionality
 */
export function registerSequentialThinkingTools(server: McpServer): void {
  server.registerTool(
    "sequentialThinking",
    {
      title: "Sequential Thinking",
      description: loadPromptDescription("sequentialThinking"),
      inputSchema: z.object({
        thought: z.string().describe("Your current thinking step"),
        nextThoughtNeeded: z
          .boolean()
          .describe("Whether another thought step is needed"),
        thoughtNumber: z
          .number()
          .int()
          .min(1)
          .describe("Current thought number (numeric value, e.g., 1, 2, 3)"),
        totalThoughts: z
          .number()
          .int()
          .min(1)
          .describe(
            "Estimated total thoughts needed (numeric value, e.g., 5, 10)",
          ),
        isRevision: z
          .boolean()
          .optional()
          .describe("Whether this revises previous thinking"),
        revisesThought: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe("Which thought is being reconsidered"),
        branchFromThought: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe("Branching point thought number"),
        branchId: z.string().optional().describe("Branch identifier"),
        needsMoreThoughts: z
          .boolean()
          .optional()
          .describe("If more thoughts are needed"),
      }),
      outputSchema: z.object({
        thoughtNumber: z.number(),
        totalThoughts: z.number(),
        nextThoughtNeeded: z.boolean(),
        branches: z.array(z.string()),
        thoughtHistoryLength: z.number(),
      }),
    },
    async (args) => {
      const result = thinkingServer.processThought(args);
      if (result.isError) {
        return {
          content: [
            {
              type: "text",
              text: result.content[0].text,
            },
          ],
        };
      }
      // Parse the JSON response to get structured content
      const parsedContent = JSON.parse(result.content[0].text);
      return {
        content: [
          {
            type: "text",
            text: result.content[0].text,
          },
        ],
        structuredContent: parsedContent,
      };
    },
  );
}
