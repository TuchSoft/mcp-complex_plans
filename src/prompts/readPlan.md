Read the content of an existing plan file from the .complex_plans directory.
Use this tool INSTEAD OF read_file to retrieve plan details before updates, reviews, or implementation.
Use this tool not the standard `read_file` to read a plan.
ONLY USE THIS TOOL FOR READING PLANS, NOT FOR NORMAL PROJECT FILES

When to use:
- Retrieving plan content for review or updates
- Preparing for plan implementation
- Verifying plan details before making changes
- When the user explicitly asks to read a plan
- ANY TIME you need to read a plan file (use this instead of read_file)

IMPORTANT:
- Always verify the plan exists first using listPlans
- Read the plan content carefully before implementation
- The ready_to_implement flag should only be used when actually starting implementation
- Never set ready_to_implement to true during plan review or editing phases
