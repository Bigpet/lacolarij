## LLM use

I explored a variety of LLM tools to build this project.
To drop the buzzwords in one place:
* Anthropic Claude Code (Opus 4.5 mainly)
* Google Antigravity (Gemini 3 High)
* VSCode Cline Extension
* VSCode kilo.code Extension
* z.ai (GLM 4.6 and GLM 4.7)

### IDE Integration

I initially tried the GitHub Copilot VSCode integration.
But since Google Antigravity got released shortly after I switched over to that for a while.
When my free usage limits were reached I switched to using cline/kilo with a Key from z.ai 
to use its GLM-4.6 and after its release GLM-4.7.

### CLI Tools

I briefly tried opencode but quickly switched to Claude Code.
I know Claude Code has some IDE Integrations with VSCode but I preferred to use it in a
separate Terminal Window.
I also made a small utility to quickly change symlinks ~/.claude and ~/.claude.json.
This was done to use z.ai GLM-4.7 whenever my Claude Opus 4.5 usage limits were reached.

### MCP Tools

I didn't have much need for MCP tools in this Project.
I only enabled the [Context 7](https://context7.com/) MCP for some phases of the project.
Later on I disabled it again to save context window space.

### Other Integrations

I briefly tried out GitHub Copilot GitHub integration, but switched to using
Antropics' [Claude GitHub integration](https://support.claude.com/en/articles/10167454-using-the-github-integration).
This was mostly used to instruct the LLM while I was traveling.