Update an existing plan file in the .complex_plans directory using SEARCH/REPLACE blocks. This tool allows partial edits without rewriting the entire plan.
Use this tool when the user want to add details, review the plan, or one explcity ask to update a plan.
Do not create a new plan when user ask to update plan.
Never create a plan for planning the update of a plan.
Always prefer to specify multiple changes in a single tool call over calling the tool multiple times.
Do not ask confirmation before editing the plan, unless the user request is unclear.
Do not open the plan for the user to review before editing the plan, unless the user request is unclear.
After editing a plan (when all edits are done) open the plan for review with the `openInEditor` tool.
Awlays think with the `sequentialThinking` tool befor updating the plan.
ONLY USE THIS TOOL FOR EDITING PLANS, NOT FOR NORMAL PROJECT FILES.

The content format is:

```
<<<<<<< SEARCH
[exact text to find in the file]
=======
[exact text to replace it with]
>>>>>>> REPLACE
```
You can include multiple SEARCH/REPLACE blocks to make multiple changes to the same file:

```
<<<<<<< SEARCH
[exact text to find in the file]
=======
[exact text to replace it with]
>>>>>>> REPLACE

<<<<<<< SEARCH
[exact text to find in the file]
=======
[exact text to replace it with]
>>>>>>> REPLACE
```

IMPORTANT:

- The SEARCH text must match EXACTLY (including whitespace, indentation, and line endings)
- The SEARCH text must appear exactly once in the file - if it appears multiple times, the tool will error
- Use at exaclty 7 equals signs (=======) between SEARCH and REPLACE sections
- The tool will provide detailed error messages showing context if search text is not found
- Each search/replace block is applied in order, so later blocks see the results of earlier ones
- Be careful with escape sequences in string literals - use `\n` NOT `\\n` for newlines in code
