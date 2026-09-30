# tg-notify-mcp

A small MCP (Model Context Protocol) server that lets an AI assistant talk to me through a Telegram bot. It is built for long-running, hands-off tasks such as phone automation: the assistant reports progress and asks for a decision instead of guessing.

## Tools

| Tool | What it does |
| --- | --- |
| `tg_notify` | Sends a message with a level: `info`, `progress` (silent), `done`, `warn`, `error`. |
| `tg_ask` | Sends a question with 2-6 buttons and waits for the answer. A typed reply is returned as text. On timeout it returns `timeout`, and the assistant must not proceed on its own. |

## Layout

- `src/mcp.js`: JSON-RPC 2.0 handling (stateless Streamable HTTP): `initialize`, `ping`, `tools/list`, `tools/call`.
- `src/tools.js`: tool definitions, input validation, and execution.
- `src/format.js`: Telegram HTML message formatting, HTML escaping, truncation.
- `scripts/redeploy.mjs`: re-uploads the code to Cloudflare Workers and keeps the existing secrets.

## Notes

- Bot token, chat id, and Cloudflare token are never stored in code. They are read from environment variables or Worker secrets.
- Status: early personal project. The Telegram client, config, and ask modules are not in this repo yet.
