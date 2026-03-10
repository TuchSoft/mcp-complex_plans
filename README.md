# MCP Complex Plans Server

A Model Context Protocol (MCP) server designed to enhance AI workflows with advanced planning and sequential thinking capabilities. This server enables AI agents to create structured plans, manage tasks efficiently, and integrate seamlessly with development environments.

**Note**
> This tool has been developed mainly to work with Mistral Vibe CLI, but it should work with any MCP-compatible model. While not extensively tested with other models, contributions and testing are welcome!

**Tip**
> Choose European models when you can, Europe is simply better! 🇪🇺

## Features

- **Plan Creation & Management**: Create, update, list, and delete structured plans for complex tasks
- **Sequential Thinking**: Integrated tool for dynamic problem-solving and analysis
- **Configuration**: Customizable behavior through configuration files, CLI arguments, and environment variables
- **Git Integration**: Automatic .gitignore management
- **Editor Integration**: Open files in your preferred editor for review

All tools operate safely within the `.complex_plans` directory and can be used in both `chat` and `plan` modes.

## Installation

### Mistral Vibe CLI Configuration

To use this server with Mistral Vibe CLI, add the following configuration to your `~/.vibe/config.toml`:

**Important**
> Remove the `mcp_servers = []` line from the upper part of the file for this to work!

```toml
[[mcp_servers]]
name = "complex_plans"
transport = "stdio"
command = "npx"
args = ["-y", "@tuchsoft/mcp-complex-plans"]

[tools.complex_plans_createPlan]
permission = "always"
[tools.complex_plans_updatePlan]
permission = "always"
[tools.complex_plans_openInEditor]
permission = "always"
[tools.complex_plans_sequentialThinking]
permission = "always"
[tools.complex_plans_listPlans]
permission = "always"
[tools.complex_plans_readPlans]
permission = "always"
[tools.complex_plans_deletePlan]
permission = "ask"
```

#### Use in plan/chat mode

To use the tools in plan/chat mode, create or edit the `~/.vibe/agents/plan.toml` (and/or `chat.toml`) configuration file:

```toml
enabled_tools = [
    "complex_plans_createPlan",
    "complex_plans_updatePlan",
    "complex_plans_openInEditor",
    "complex_plans_sequentialThinking",
    "complex_plans_listPlans"
]
```

### For better results

For better results, [edit your system prompt](https://github.com/mistralai/mistral-vibe?tab=readme-ov-file#custom-system-prompts) to include a snippet like the following to instruct the model when to use this tool:

```markdown
**FOR COMPLEX, MULTI-FILE EDITS, ALWAYS GENERATE A MARKDOWN PLAN FIRST:** if the user request a complex task that require editing multiple files, traverse the project or make a lot of changes, **YOU MUST** create a markdown plan and ask the user to confirm it before proceeding, use the `complex_plans_createPlan` tool (and consequitive `complex_plans_readPlan`, `complex_plans_updatePlan`, `complex_plans_listPlans`, `complex_plans_openInEditor`, (optional) `complex_plans_deletePlan` tools).
**ALWAYS** ask the user to review and accept the plan after calling `complex_plans_openInEditor` and **BEFORE** doing anything else, do not proceed with the implementation until the user has accepted the plan.
Follow the instrucion provided by the tool itself.
Also if the user request a plan creation **ALWAYS** use the `complex_plans_createPlan` tool.
```

Optionally, add also this other block to ensure the chain of thought is used whenever possible:

```markdown
**ALWAYS USE AN INTERNAL CHAIN OF THOUGHT**: Before answering to the user, writing code, editing a file, or performing whatever action, **always** use an internal chain of thought to verify your findings trough the use of the `complex_plans_sequentialthinking` tool.
Use as many tokens as you believe are necessary for your internal reasoning.
Output limit and verbosity constraints do not apply to your internal reasoning.
Always use the `complex_plans_sequentialthinking` tool for any task that is not a direct question-answer, as a rule of thumb if you are reading a file, you must also use the `complex_plans_sequentialthinking` tool.
```

## Usage

1. The model should decide on its own when to use the tool when the task is complex, long, or requires editing many files.
2. To force the model to create a plan, simply include something like `Create a plan before implementing`
3. To edit a plan:
   - You can do it manually by editing the plan file. The section `Additional user provided details` is where you can provide additional information the model missed. Remember to remove from the `Risks/Doubts` section anything for which you provide a clear answer.
   - You can ask the model to do so by prompting `Edit the plan to...` (or `Edit my XYZ plan to...` if not in the same conversation)

## Configuration

The server supports multiple configuration methods with the following **priority order** (highest to lowest):

1. **Configuration file at project level** (`[your_project]/.complex_plans/config.json`) - Highest priority
2. **CLI arguments** - Override environment variables
3. **Environment variables** - Override default values
4. **Default values** - Lowest priority

### Configuration Options

| Option | Type | Default | CLI Argument | Environment Variable | Description |
|--------|------|---------|--------------|----------------------|-------------|
| `default_editor` | string | `"zed"` | `--default-editor=` | `MCP_COMPLEX_PLANS_DEFAULT_EDITOR` | Default editor for opening files |
| `auto_delete_plans` | boolean | `false` | `--auto-delete-plans=` | `MCP_COMPLEX_PLANS_AUTO_DELETE_PLANS` | Automatically delete plans after implementation |
| `add_to_gitignore` | boolean | `true` | `--add-to-gitignore=` | `MCP_COMPLEX_PLANS_ADD_TO_GITIGNORE` | Automatically add .complex_plans to .gitignore |
| `disabled_tools` | string[] | `[]` | `--disabled-tools=` | `MCP_COMPLEX_PLANS_DISABLED_TOOLS` | List of tools to disable (comma-separated) |

### Configuration Examples

**Configuration file** (`.complex_plans/config.json`):
```json
{
  "default_editor": "vscode",
  "auto_delete_plans": false,
  "add_to_gitignore": true,
  "disabled_tools": ["listPlans"]
}
```

**CLI arguments:**
```bash
node dist/index.js --default-editor=vscode --auto-delete-plans=false --disabled-tools=listPlans,deletePlan
```

**Environment variables:**
```bash
export MCP_COMPLEX_PLANS_DEFAULT_EDITOR="vscode"
export MCP_COMPLEX_PLANS_AUTO_DELETE_PLANS="false"
export MCP_COMPLEX_PLANS_DISABLED_TOOLS="listPlans,deletePlan"
```

## Tools

### Available Tools

- **createPlan**: Create structured plans for complex tasks
- **updatePlan**: Modify existing plans using SEARCH/REPLACE blocks
- **deletePlan**: Remove completed or obsolete plans
- **listPlans**: List all available plans in the current project
- **openInEditor**: Open files in your configured editor for review
- **sequentialThinking**: Dynamic problem-solving and analysis tool

### Sequential thinking

The sequential thinking implementation is based on [sequentialthinking](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking), for detailed tool documentation and usage patterns, refer to that repo.



## Development

```bash
npm install
npm run build
npm link #To then test using npx as normal
```

## License

MIT
