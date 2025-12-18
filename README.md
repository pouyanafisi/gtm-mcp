<div align="center">
  <img src="banner.png" alt="Google Tag Manager MCP Server" width="830">
</div>

# Google Tag Manager MCP Server

![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![GitHub stars](https://img.shields.io/github/stars/pouyanafisi/gtm-mcp?style=flat-square&logo=github)
![GitHub forks](https://img.shields.io/github/forks/pouyanafisi/gtm-mcp?style=flat-square&logo=github)

MCP server for Google Tag Manager API v2. Provides programmatic access to GTM accounts, containers, workspaces, tags, triggers, variables, and version management.

## Requirements

- Node.js 18.0.0+
- Google Cloud Project with Tag Manager API enabled
- OAuth 2.0 credentials (Desktop application type)

## Installation

```bash
cd gtm-mcp
npm install
npm run build
```

## Google Cloud Setup

1. Enable Tag Manager API in Google Cloud Console
2. Create OAuth 2.0 credentials (Desktop application)
3. Download credentials JSON
4. Save as `credentials.json` in `gtm-mcp` directory

## Configuration

Add to your MCP client configuration (`.cursor/mcp.json` or Claude Desktop settings):

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

See `MCP_SETUP.md` for platform-specific instructions.

## Authentication

Run `npm run auth` to authenticate. Token saved to `token.json` and auto-refreshed.

## Operations

99 operations available (95 API operations + 4 workflow helpers). See [OPERATIONS.md](./OPERATIONS.md) for complete reference.

### Categories

- **Accounts**: List, get, update accounts
- **Containers**: List, get, create, update, delete, snippet, lookup, combine, move tag ID
- **Workspaces**: List, get, create, update, delete, status, sync, resolve conflicts, bulk update, quick preview
- **Tags**: List, get, create, update, delete, revert
- **Triggers**: List, get, create, update, delete, revert
- **Variables**: List, get, create, update, delete, revert
- **Built-in Variables**: List, create, delete, revert
- **Folders**: List, get, create, update, delete, revert, move entities, get entities
- **Container Versions**: List, get, update, delete, undelete, set latest, get live, publish
- **Version Headers**: List, get latest
- **Environments**: List, get, create, update, delete, reauthorize
- **User Permissions**: List, get, create, update, delete
- **Clients** (Server-side): List, get, create, update, delete, revert
- **Google Tag Config**: List, get, create, update, delete, revert
- **Templates**: List, get, create, update, delete, revert, import from gallery
- **Transformations** (Server-side): List, get, create, update, delete, revert
- **Zones** (Server-side): List, get
- **Workflows**: GA4 setup, Facebook Pixel, form tracking, site-type workflows

## Usage

### List containers
```
List all containers for account 123456
```

### Create GA4 setup
```
Create GA4 setup with measurement ID G-XXXXXXXXXX for account 123456, container 7890123
```

### Update tag
```
Update tag 1 in account 123456, container 7890123 with new parameters
```

### Publish changes
```
Publish version for account 123456, container 7890123 with name "Version 1.0"
```

## GTM IDs

- Account ID: Numeric string (e.g., `123456`)
- Container ID: Numeric string (e.g., `7890123`)
- Workspace ID: Numeric string (e.g., `1` for default)
- Public Container ID: `GTM-XXXXXXX` format (not used by API)

Find IDs in GTM UI URL or container settings.

## Project Structure

```
gtm-mcp/
├── src/
│   ├── index.ts              # MCP server
│   ├── gtm-client.ts         # GTM API client
│   ├── gtm-components.ts     # Workflow templates
│   ├── auth-helper.ts        # OAuth2 helper
│   └── auth.ts               # Auth script
├── docs/                      # API documentation
├── dist/                      # Compiled output
└── package.json
```

## Development

```bash
npm run dev          # Watch mode
npm run type-check   # Type checking
npm run build        # Build
npm run auth         # Authenticate
npm test             # Run tests
npm run test:run     # Run tests once
npm run test:ui      # Test UI
npm run test:coverage # Coverage report
```

## Documentation

- [OPERATIONS.md](./OPERATIONS.md) - All 99 operations reference
- [docs/](./docs/) - GTM API v2 documentation
- [API_COVERAGE.md](./API_COVERAGE.md) - Implementation coverage
- [MCP_SETUP.md](./MCP_SETUP.md) - Setup instructions
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines

## Troubleshooting

**Authentication fails**: Run `npm run auth` separately. Verify `credentials.json` exists.

**Permission errors**: Verify account has edit access to container. Use numeric IDs, not `GTM-XXX`.

**API errors**: Check account/container IDs. Verify workspace exists. Check rate limits.

**Build errors**: Node.js 18+, run `npm install`, verify TypeScript config.

## License

MIT
