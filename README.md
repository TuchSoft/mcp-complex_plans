# MCP Complex Plans Server

A Model Context Protocol (MCP) server designed to enhance AI workflows with advanced planning, sequential thinking, and multi-level configuration capabilities. This server enables AI agents to create structured plans, manage tasks efficiently, and integrate seamlessly with development environments.

**Note**
> This tool has been developed mainly to work with Mistral Vibe CLI, but it should work with any MCP-compatible model. While not extensively tested with other models, contributions and testing are welcome!

**Tip**
> Choose European models when you can, Europe is simply better! 🇪🇺

## Features
- **Plan Creation**: Create structured plans for complex tasks
- **Plan Management**: Delete plans when no longer needed
- **Configuration**: Customizable behavior through configuration
- **Git Integration**: Automatic .gitignore management
- **File Management**: Open files in your preferred editor

## Installation

```bash
npm install -g @modelcontextprotocol/sdk
npx @mattiabonzi/mcp-complex_plans
```

### Mistral Vibe CLI Configuration

To use this server with Mistral Vibe CLI, add the following configuration to your `~/.vibe/config.toml`:

```toml
[[mcp_servers]]
name = "complex_plans"
transport = "stdio"
command = "npx"
args = ["@mattiabonzi/mcp-complex_plans"]

[tools.complex_plans_create_plan]
permission = "always"

[tools.complex_plans_update_plan]
permission = "always"

[tools.complex_plans_open_in_editor]
permission = "always"

[tools.complex_plans_sequentialthinking]
permission = "always"

[tools.complex_plans_delete_plan]
permission = "ask"
```

## Configuration

The server can be configured using a `.complex_plans/config.json` file in your workspace:

```json
{
  "default_editor": "zed",
  "auto_delete_plans": false,
  "add_to_gitignore": true
}
```

**Configuration Options**:

- `default_editor` (string, optional): Default editor for opening files. Default: "zed"
- `auto_delete_plans` (boolean, optional): Automatically delete plans after implementation. Default: false
- `add_to_gitignore` (boolean, optional): Automatically add .complex_plans to .gitignore. Default: true

## Usage

1. Start the server: `node dist/index.js`
2. Use the tools through your MCP client
3. Create plans, manage them, and execute complex tasks

## For Maximum Efficiency

For maximum efficiency, [edit your system prompt](https://github.com/mistralai/mistral-vibe?tab=readme-ov-file#custom-system-prompts) to include a snippet like the following to instruct the model when to use this tool:

```markdown
**FOR COMPLEX, MULTI-FILE EDITS, ALWAYS GENERATE A MARKDOWN PLAN FIRST:** if the user request a complex task that require editing multiple files, traverse the project or make a lot of changes, **YOU MUST** create a markdown plan and ask the user to confirm it before proceeding, use the `complex_plans_create_plan` tool (and consequitive `complex_plans_update_plan`, `complex_plans_open_in_editor`, (optional) `complex_plans_delete_plan` tools).
**ALWAYS** ask the user to review and accept the plan after calling `complex_plans_open_in_editor` **BEFORE** doing anything else, do not proceed with the implementation until the user has accepted the plan.
Follow the instrucion provided by the tool itself.
Also if the user request a plan creation **ALWAYS** use the `complex_plans_create_plan` tool.
```

Optionally, add also this other block to ensure the chain of thought is used whenever possible:

```markdown
**ALWAYS USE AN INTERNAL CHAIN OF THOUGHT**: Before answering to the user, writing code, editing a file, or performing whatever action, **always** use an internal chain of thought to verify your findings trough the use of the `complex_plans_sequentialthinking` tool.
Use as many tokens as you believe are necessary for your internal reasoning.
Output limit and verbosity constraints do not apply to your internal reasoning.
Always use the `complex_plans_sequentialthinking` tool for any task that is not a direct question-answer, as a rule of thumb if you are reading a file, you must also use the `complex_plans_sequentialthinking` tool.
```

## Tools

### create_plan

**Description**: Create a new plan file in the .complex_plans directory

**Parameters**:
- `plan_name` (string, required): Name of the plan (used for filename)
- `plan_content` (string, required): Markdown content of the plan
- `workspace_root` (string, optional): Root directory of the workspace (defaults to current directory)

**When to use**:
- When you need to break down a complex task into manageable steps
- When you want to create a reusable plan for future reference
- When you need to document your thought process for complex operations

**Plan Structure**:
```markdown
# Plan: [Task Name]
## Goal
[max 3-line summary]
## Steps
1. [Action] → [File]
2. [Action] → [File]
## Risks/Doubts
- [Question for user]
- [Assumption]
## Verification
- Run `npm test` (example)
- Check `logs/debug.txt` (example)
```

### delete_plan

**Description**: Delete a plan file from the .complex_plans directory

**Parameters**:
- `plan_name` (string, required): Name of the plan to delete
- `workspace_root` (string, optional): Root directory of the workspace (defaults to current directory)

**When to use**:
- When a plan has been completed and is no longer needed
- When you want to clean up old or obsolete plans
- When you need to remove sensitive information from plans

**Important notes**:
- The plan directory is not deleted, only the plan.md file is removed
- This operation cannot be undone
- If auto_delete_plans is enabled in configuration, this will be called automatically after plan implementation

### open_in_editor

**Description**: Open a file in the configured editor at a specific location

**Parameters**:
- `filepath` (string, required): Path to the file to open in the configured editor

**When to use**:
- When you need to quickly open a file in your preferred editor
- When you want to navigate to a specific file location
- When you need to review or edit files during plan execution

**Supported Editors**:

**Important**
> Most editors has not been tested, contribusions are welcome!

The tool supports multiple editors through configuration. Set `default_editor` in `.mcp-config.json` to one of:

### Modern Editors (require CLI installation):
- `zed` (default) - [Zed CLI Setup](https://zed.dev/docs/reference/cli)
- `vscode` or `code` - [VS Code CLI Setup](https://code.visualstudio.com/docs/setup/mac)
- `sublime` or `subl` - [Sublime Text CLI](https://www.sublimetext.com/docs/command_line.html)

### JetBrains IDEs (require CLI tools):
- `pycharm` - [PyCharm CLI](https://www.jetbrains.com/help/pycharm/working-with-the-ide-features-from-command-line.html)
- `webstorm` - [WebStorm CLI](https://www.jetbrains.com/help/webstorm/working-with-the-ide-features-from-command-line.html)
- `intellij` - [IntelliJ IDEA CLI](https://www.jetbrains.com/help/idea/working-with-the-ide-features-from-command-line.html)
- `phpstorm` - Requires PhpStorm CLI tools
- `goland` - Requires GoLand CLI tools
- `rider` - Requires Rider CLI tools
- `clion` - Requires CLion CLI tools
- `rubyine` - Requires RubyMine CLI tools
- `datagrip` - Requires DataGrip CLI tools
- `androidstudio` - Requires Android Studio CLI (`studio` command)

### Terminal Editors (usually pre-installed):
- `vim` or `nvim` - [Vim](https://www.vim.org/)
- `emacs` - [Emacs](https://www.gnu.org/software/emacs/)
- `nano` - Usually pre-installed on Unix systems

### Other Editors:
- `notepad++` - Windows only, requires Notepad++ with CLI support
- `textmate` - [TextMate CLI](https://macromates.com/)
- `bbedit` - [BBEdit CLI](https://www.barebones.com/products/bbedit/)
- `nova` - [Nova CLI](https://nova.app/)

### CLI Installation Requirements:

**Important**
> Most editors require their command-line tools to be installed and available in your system PATH. For example:

- **VS Code**: Run `code --install-extension` or add VS Code to PATH
- **Zed**: Install Zed and ensure `zed` command is available
- **JetBrains IDEs**: Install the "Command Line Tools" from the IDE settings
- **Sublime Text**: Install the CLI tools from Sublime Text preferences

If you get "command not found" errors, you need to install the corresponding CLI tools for your chosen editor.

Example configuration:
```json
{
  "default_editor": "vscode",
  "auto_delete_plans": false,
  "add_to_gitignore": true
}
```

**Troubleshooting**:
- If your editor isn't opening, check if the command works in your terminal first
- Use `which editor-name` (Unix) or `where editor-name` (Windows) to verify CLI availability
- The tool will fall back to Zed if the configured editor is not recognized

## Usage

1. Start the server: `node dist/index.js`
2. Use the tools through your MCP client
3. Create plans, manage them, and execute complex tasks

## Sequential Thinking Integration ✨

This server now includes **fully integrated sequential thinking functionality**! The `sequentialthinking` tool is built directly into our server, providing a unified experience for both planning and deep thinking.

### Sequential Thinking Tool

**Tool Name**: `sequentialthinking`

**Description**: A detailed tool for dynamic and reflective problem-solving through thoughts. This tool helps analyze problems through a flexible thinking process that can adapt and evolve.

### Key Features

- **Structured Thought Process**: Break down complex problems into manageable steps
- **Branching Support**: Explore alternative approaches and thought paths
- **Revision Capabilities**: Revisit and refine previous thoughts
- **Multi-step Analysis**: Maintain context across multiple thinking steps
- **Hypothesis Generation**: Develop and verify solution hypotheses
- **Adaptive Thinking**: Adjust thought count and approach as understanding deepens

### When to Use

- Breaking down complex problems into steps
- Planning and design with room for revision
- Analysis that might need course correction
- Problems where the full scope isn't initially clear
- Multi-step problem solving requirements
- Maintaining context across extended reasoning
- Filtering out irrelevant information

### Parameters

```typescript
{
  thought: string; // Your current thinking step
  nextThoughtNeeded: boolean; // Whether another thought step is needed
  thoughtNumber: number; // Current thought number (e.g., 1, 2, 3)
  totalThoughts: number; // Estimated total thoughts needed (e.g., 5, 10)
  isRevision?: boolean; // Whether this revises previous thinking
  revisesThought?: number; // Which thought is being reconsidered
  branchFromThought?: number; // Branching point thought number
  branchId?: string; // Branch identifier
  needsMoreThoughts?: boolean; // If more thoughts are needed
}
```

### Response Format

```typescript
{
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  branches: string[]; // Active branch identifiers
  thoughtHistoryLength: number; // Total thoughts processed
}
```

### Example Usage

```json
{
  "thought": "First, I need to analyze the requirements and break down the problem into smaller components",
  "nextThoughtNeeded": true,
  "thoughtNumber": 1,
  "totalThoughts": 4
}
```

### Advanced Features

**Branching**: Create alternative thought paths for exploring different approaches

```json
{
  "thought": "Alternative approach: What if we use a different database structure?",
  "nextThoughtNeeded": true,
  "thoughtNumber": 3,
  "totalThoughts": 5,
  "branchFromThought": 2,
  "branchId": "db-alternative"
}
```

**Revisions**: Revisit and refine previous thoughts

```json
{
  "thought": "Actually, the initial database approach has security concerns",
  "nextThoughtNeeded": true,
  "thoughtNumber": 4,
  "totalThoughts": 6,
  "isRevision": true,
  "revisesThought": 2
}
```

### Visual Thought Formatting

The server includes beautiful console formatting for thoughts:
- 💭 Thought N/M - Regular thoughts
- 🔄 Revision N/M - Thought revisions
- 🌿 Branch N/M - Branched thoughts

### Benefits of Integration

1. **Unified Workflow**: No need to run separate servers
2. **Consistent Experience**: Same tool interface for planning and thinking
3. **Better Performance**: Integrated architecture
4. **Simplified Setup**: Single server installation
5. **Enhanced Features**: Custom enhancements and improvements

## Development

```bash
npm install
npm run dev  # Start development server
npm run build  # Build for production
```

## License

MIT
