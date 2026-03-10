# Conversation Examples

This folder contains examples of conversations, comparing the tool with custom system prompts to default settings (no tool, default system prompt) using the standard "plan" mode.

I'll add more examples over time.

## "Switch provider" example
In this example, I've asked the model to switch the provider used for mailing and contact management.
The input prompt is short and concise just for the example; realistically, you would want to provide more details when executing real-world tasks.

- `chat_switch-provider_no-tool` => Chat transcription of the attempt with default settings (it also contains the plan content, as the CLI failed to write the plan to a file).
- `chat_switch-provider_with-tool` => Chat transcription using the tool and custom system prompt.
- `plan_switch_provider_with-tool` => The plan generated using the tool and custom system prompt, persisted inside the project.
