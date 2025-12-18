# MCP Configuration Setup

Configuration instructions for the GTM MCP server.

## Configuration

```json
{
  "mcpServers": {
    "gtm": {
      "command": "node",
      "args": ["/absolute/path/to/gtm-mcp/dist/index.js"],
      "env": {
        "GTM_CREDENTIALS_FILE": "/absolute/path/to/gtm-mcp/credentials.json",
        "GTM_TOKEN_FILE": "/absolute/path/to/gtm-mcp/token.json"
      }
    }
  }
}
```

Replace `/absolute/path/to/gtm-mcp` with your project path.

## Platform Setup

### Cursor IDE

1. Create or edit `.cursor/mcp.json` in project root
2. Add configuration above
3. Update paths
4. Restart Cursor

**Location**: `.cursor/mcp.json`

### Claude Desktop

1. Edit configuration file:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`
2. Add GTM server to `mcpServers`
3. Restart Claude Desktop

### Gemini

1. Locate Gemini MCP configuration (varies by integration)
2. Add GTM server configuration
3. Restart integration

## Required Files

- `credentials.json` - OAuth credentials from Google Cloud Console
- `token.json` - Created after authentication (`npm run auth`)

## Verification

1. Restart IDE/AI assistant
2. GTM server should appear in available MCP servers
3. Test with `list_gtm_containers`
4. If auth required, run `npm run auth`

## Troubleshooting

**Server not found:**
- Verify `dist/index.js` path is correct
- Run `npm run build`
- Check Node.js is in PATH

**Authentication errors:**
- Run `npm run auth`
- Verify `credentials.json` exists and is valid
- Check file permissions

**Path issues:**
- Use absolute paths
- Windows: Use forward slashes or escaped backslashes (`C:\\path\\to\\file`)
- Verify all paths point to existing files
