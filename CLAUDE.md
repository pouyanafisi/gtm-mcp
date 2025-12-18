# GTM MCP Guidelines for Claude

Guidelines for using the Google Tag Manager MCP server with Claude.

## Entity Hierarchy

```
Account
  ├── Container
  │     ├── Workspace
  │     │     ├── Tag
  │     │     ├── Trigger
  │     │     ├── Variable
  │     │     ├── Built-In Variable
  │     │     ├── Folder
  │     │     ├── Client (server-side)
  │     │     ├── Google Tag Config
  │     │     ├── Template
  │     │     ├── Transformation (server-side)
  │     │     └── Zone (server-side)
  │     ├── Version
  │     ├── Version Header
  │     ├── Environment
  │     └── Destination (server-side)
  └── User Permission
```

## Available Operations

29 operations available. See [OPERATIONS.md](./OPERATIONS.md) for complete reference.

### Core Operations
- Create/read/update/delete: Tags, triggers, variables
- List/get: Accounts, containers, workspaces
- Revert: Tags, triggers, variables
- Publish: Container versions

### Workflows
- `create_ga4_setup` - Complete GA4 setup
- `create_facebook_pixel_setup` - Facebook Pixel
- `create_form_tracking` - Form tracking
- `generate_gtm_workflow` - Site-type workflows

## Usage Guidelines

### Before Operations
1. Verify account/container IDs using `list_gtm_containers`
2. Check for existing entities to avoid duplicates
3. Use workflow tools for common setups

### Naming
- Use descriptive names: `GA4 Configuration - Homepage` not `tag1`
- Follow GTM conventions
- Group related entities in folders

### After Operations
1. Summarize what was created
2. Remind to publish version
3. Suggest testing steps

## Common Workflows

### GA4 Setup
1. Use `create_ga4_setup` with account_id, container_id, measurement_id
2. Explain created components
3. Remind to publish

### Custom Tags
1. Use `create_gtm_tag` with appropriate tag_type
2. Common types: `gaawc` (GA4 Config), `gaawe` (GA4 Event), `html`, `img`
3. Specify firing triggers
4. Use variables for dynamic values

### Ecommerce
1. Use `generate_gtm_workflow` with `workflow_type: "ecommerce"`
2. Provide GA4 measurement ID
3. Optionally include Facebook Pixel ID

## Error Handling

- Authentication fails: Guide to run `npm run auth`
- Invalid IDs: Use `list_gtm_containers` to find correct IDs
- Workspace conflicts: Suggest syncing or resolving conflicts
- Provide clear error messages and next steps

## Important Notes

- Account/Container IDs are numeric (not GTM-XXXXXXX)
- Workspace ID defaults to "1" if not specified
- Changes must be published to go live
- OAuth tokens auto-refresh
