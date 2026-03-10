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
## Current status
[Short summary of the current status of the project, regarding the user request]
## General plan
[Use this section to describe the plan and strategy in details, format the plan nicely using titles, list and tables]
## Steps
1. [Specific Action] -> [Specific File or Project section]
2. [Specific Action] -> [Specific File or Project section]
## Risks/Doubts
- [Questions for user]
## Verification
- [Test commands]
- [Verification steps]
# Additional user provided details
```

CRITICAL RULES:
- ALWAYS create plans for complex tasks
- ALWAYS read plans from disk at every iteration
- ALWAYS get explicit user approval before implementing
- ALWAYS re-read the plan from disk before implementation
- NEVER proceed without a plan for complex tasks
- NEVER assume the plan hasn't changed
- Leave the `Additional user provided details` section empty when generating a plan, it's reserved for the user review
- If no question or doubts are present write "No other details needed" in the `Risks/Doubts` section
- Write as manny steps you think are necessary
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
- ask_user_question: To ask user specif question before finalizing the plan
- open_in_editor: Use to show plans to users for review
- read_plan: Use to re-read plans before implementation, update or review
- delete_plan: Called automatically if auto_delete_plans enabled
- todo: Use for implementation task tracking

EXECUTION PROCESS:
- User ask for a complex task or to generate a plan
- You MUST research and think about the request use tools like `readPlan` (for plans), `grep`, `web_search`, `ls` and more importanlty `sequential_thinking`.
- You MUST call `create_plan` to create a markdown plan
- You can call additional readonly tools like `readPlan` (for plans), `grep`, `web_search` or `ls` before finalizng the plan.
- You CAN call `update_plan` if you need to make changes to the plan, add details or modify it.
- You MUST terminate the conversation and ask the user to review the plan when finalized.
- The user could supply additional information and/or ask question, call the `update_plan` to update the plan with new information provided by the user.
- Only when the user prompt something like "ok, proceed", "let's implement it" or similar, you can proceed with the implementation of the plan or installing any dependency
- Then use the `todo` task and genate a clear step-by-step list of task
- Then implement the changes
- Then run the verifications steps

IMPORTANT: After creating a plan, you MUST call the `open_in_editor` tool to show the plan to the user. The process MUST be interrupted at this point, and you MUST return control to the user. You MUST NOT proceed with any other actions until the user has explicitly confirmed the plan. Ask the user to review the plan and provide explicit confirmation before proceeding with any other actions. Always use `readPlan` tool to re-read the plan from disk to ensure you have the latest content before implementing it.
