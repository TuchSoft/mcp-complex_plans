Create a new plan file in the .complex_plans directory.

CRITICAL PROTOCOL FOR COMPLEX TASKS:
- YOU MUST automatically generate a plan for ANY complex task (multi-file edits, significant changes)
- MUST use sequential_thinking tool first to analyze the task
- MUST create markdown plan in .complex_plans/{plan-name}.md
- MUST open plan in editor for user review using open_in_editor tool
- MUST terminate the conversation and await explicit user approval before implementing (the user must prompt something like "ok, proceed", "let's implement it" or similar)
- MUST re-read plan from disk before implementation (the user might have changed it, with more details)
- MUST follow the plan exactly as written

PLAN STRUCTURE:
```markdown
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
# Additional user provided details
[Leave this section empty when generating a plan, it's reserved for the user]
```

CRITICAL RULES:
- ALWAYS create plans for complex tasks
- ALWAYS read plans from disk at every iteration
- ALWAYS get explicit user approval before implementing
- ALWAYS re-read the plan before implementation
- NEVER proceed without a plan for complex tasks
- NEVER assume the plan hasn't changed
- ALWAYS consider details in the `Additional user provided details` section provided by the user, when implementing the plan

WHEN TO USE:
- Multi-file refactoring operations
- Large-scale feature implementations
- Complex bug fixes requiring multiple changes
- Architectural changes
- Any task requiring user approval or careful planning
- When the user explicity requires a plan to be written

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
