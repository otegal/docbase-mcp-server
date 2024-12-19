# docbase-mcp-server MCP Server

A DocBase Model Context Protocol server

### Resources

- Not Implements

### Tools

- `docbase-posts-search` - Search posts

### Prompts

- Not Implements

## Development

Install dependencies:

```bash
npm install
```

Build the server:

```bash
npm run build
```

For development with auto-rebuild:

```bash
npm run watch
```

## Installation

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "docbase-mcp-server": {
      "command": "/path/to/docbase-mcp-server/build/index.js"
    }
  }
}
```

### On WSL

```json
{
  "mcpServers": {
    "docbase-mcp-server": {
      "command": "wsl",
      "args": [
        "DOCBASE_ACCESS_TOKEN=your-access-token",
        "DOCBASE_TEAM_NAME=your-team-name",
        "node",
        "/path/to/docbase-mcp-server/build/index.js"
      ]
    }
  }
}
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.
