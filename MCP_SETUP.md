# Whop MCP Configuration

This document explains how to configure the Whop MCP (Model Context Protocol) server for accessing Whop documentation directly in Cursor.

## Global Configuration (Recommended)

Add the Whop docs MCP server to your global Cursor configuration:

**Location:** `~/.cursor/config/mcp.json`

```json
{
  "mcpServers": {
    "whop-docs": {
      "url": "https://docs.whop.com/mcp"
    }
  }
}
```

**Note:** You may need to restart Cursor after adding this configuration for it to take effect.

## Project-Level Configuration

The project-level `.mcp.json` file has also been configured with the Whop docs server. This ensures the MCP server is available when working on this project.

## Benefits

With the Whop MCP server configured, you can:

- Access Whop documentation directly in Cursor
- Get real-time best practices and API updates
- Receive accurate code examples and patterns
- Stay up-to-date with Whop SDK changes

## Verification

After configuring, you can verify the MCP server is working by:

1. Restarting Cursor
2. Checking if Whop documentation is accessible through Cursor's MCP tools
3. Using `@doc` mentions in Cursor chat to reference Whop docs

## Additional Resources

- [Whop Developer Documentation](https://docs.whop.com)
- [Whop SDK Documentation](https://docs.whop.com/sdk)
- [Whop API Reference](https://docs.whop.com/developer/api)
