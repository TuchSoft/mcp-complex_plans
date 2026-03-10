import { z } from "zod";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { config } from "../config.js";
import { loadPromptDescription } from "../utils.js";

const execAsync = promisify(exec);

// Define the tool schema
const openInZedSchema = z.object({
  filepath: z
    .string()
    .describe("Path to the file to open in the configured editor"),
});

// Helper function to get editor command based on configuration
function getEditorCommand(filepath: string): string {
  const editor = config.default_editor || "zed";

  switch (editor.toLowerCase()) {
    case "zed":
      return `zed -a "${filepath}"`; // Requires Zed CLI: https://zed.dev/docs/cli
    case "vscode":
    case "code":
      return `code "${filepath}"`; // Requires VS Code CLI: https://code.visualstudio.com/docs/setup/mac
    case "sublime":
    case "subl":
      return `subl "${filepath}"`; // Requires Sublime Text CLI: https://www.sublimetext.com/docs/command_line.html
    case "atom":
      return `atom "${filepath}"`; // Requires Atom CLI: https://flight-manual.atom.io/getting-started/sections/atom-basics/
    case "vim":
    case "nvim":
      return `${editor} "${filepath}"`; // Requires Vim/Neovim: https://www.vim.org/
    case "emacs":
      return `emacs "${filepath}"`; // Requires Emacs: https://www.gnu.org/software/emacs/
    case "nano":
      return `nano "${filepath}"`; // Requires Nano (usually pre-installed on Unix systems)
    case "pycharm":
      return `charm "${filepath}"`; // Requires PyCharm CLI: https://www.jetbrains.com/help/pycharm/working-with-the-ide-features-from-command-line.html
    case "webstorm":
      return `webstorm "${filepath}"`; // Requires WebStorm CLI: https://www.jetbrains.com/help/webstorm/working-with-the-ide-features-from-command-line.html
    case "intellij":
      return `idea "${filepath}"`; // Requires IntelliJ IDEA CLI: https://www.jetbrains.com/help/idea/working-with-the-ide-features-from-command-line.html
    case "phpstorm":
      return `phpstorm "${filepath}"`; // Requires PhpStorm CLI
    case "goland":
      return `goland "${filepath}"`; // Requires GoLand CLI
    case "rider":
      return `rider "${filepath}"`; // Requires Rider CLI
    case "clion":
      return `clion "${filepath}"`; // Requires CLion CLI
    case "rubyine":
      return `rubyine "${filepath}"`; // Requires RubyMine CLI
    case "datagrip":
      return `datagrip "${filepath}"`; // Requires DataGrip CLI
    case "androidstudio":
      return `studio "${filepath}"`; // Requires Android Studio CLI
    case "notepad++":
      return `notepad++ "${filepath}"`; // Windows only, requires Notepad++ with CLI support
    case "textmate":
      return `mate "${filepath}"`; // Requires TextMate CLI: https://macromates.com/
    case "bbedit":
      return `bbedit "${filepath}"`; // Requires BBEdit CLI: https://www.barebones.com/products/bbedit/
    case "nova":
      return `nova "${filepath}"`; // Requires Nova CLI: https://nova.app/
    default:
      // Fallback to zed if editor is not recognized

      return `zed -a "${filepath}"`;
  }
}

export function registerOpenInEditorTool(server: McpServer): void {
  server.registerTool(
    "openInEditor",
    {
      description: loadPromptDescription("openInEditor"),
      inputSchema: openInZedSchema,
    },
    async (params: { filepath: string }) => {
      const { filepath } = params;
      try {
        const command = getEditorCommand(filepath);
        await execAsync(command);
        return {
          content: [
            {
              type: "text",
              text: `Successfully opened ${filepath} in ${config.default_editor}. NOW INTERRUPT THE CONVERSATION AND ASK THE USER TO REVIEW THE PLAN using \`Please review the plan\``,
            },
          ],
        };
      } catch (error) {
        throw new Error(
          `Failed to open file in ${config.default_editor}: ${error}`,
        );
      }
    },
  );
}
