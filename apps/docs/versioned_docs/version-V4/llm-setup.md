---
sidebar_position: 11
---

# Code editors and LLM setup

LLMs often rely on outdated or generic information. Use this guide to help set up your code editor to pull in more accurate, up-to-date documentation and examples. It will help provide better answers and generate more accurate Semaphore code using LLMs (large language models) and MCP (Model Context Protocol) servers.

## Quick use

[llms.txt](https://docs.semaphore.pse.dev/llms.txt) is a compact, text version of the Semaphore docs.

Add this link directly to your chat window for enhanced context.

## Permanent setup

Depending on your IDE, you can add custom docs to VS Code, Cursor or others.

Example for Cursor...

1. Press `CMD + Shift + P` (unix), `Ctrl + Shift + P` (Windows)
1. Type `Add new custom docs`.
1. Add https://docs.semaphore.pse.dev/llms.txt
1. In chat you can know `@docs` and choose `semaphore` to provide additional context.

Refer to the documentation of your IDE to properly set it up.

## MCP Server

Depending on your IDE, you can add a MCP server to communicate your docs to the AI model.

-   [Context7 MCP server](https://github.com/upstash/context7) is a server that provides many libraries, incl. Semaphore.

Example for Cursor...

1. Press `CMD + Shift + J` (unix), `Ctrl + Shift + J` (Windows)
1. Click on `MCP` on the sidebar
1. Click `Add new global MCP server`
1. Add the following code to `mcp.json`

```
{
  "mcpServers": {
    "Context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

You can now prompt anything about Semaphore and write `use context7` at the end of your prompt. E.g. `create a new Semaphore identity in TypeScript. use context`. This will call the MCP tool and automatically fetch the latest documentation.

Refer to the documentation of your IDE to properly set it up.
