# GTM MCP Guidelines for Gemini

Guidelines for using the Google Tag Manager MCP server with Gemini.

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

99 operations available (95 API operations + 4 workflow helpers). See [OPERATIONS.md](./OPERATIONS.md) for complete reference.

### Accounts (3)
- `list_gtm_accounts` - List all GTM accounts
- `get_gtm_account` - Get account details
- `update_gtm_account` - Update account settings

### Containers (7)
- `list_gtm_containers` - List containers in account
- `get_gtm_container` - Get container details
- `create_gtm_container` - Create new container
- `update_gtm_container` - Update container
- `delete_gtm_container` - Delete container
- `get_gtm_container_snippet` - Get container snippet
- `lookup_gtm_container` - Lookup by public ID

### Workspaces (11)
- `list_gtm_workspaces` - List workspaces
- `get_gtm_workspace` - Get workspace details
- `create_gtm_workspace` - Create workspace
- `update_gtm_workspace` - Update workspace
- `delete_gtm_workspace` - Delete workspace
- `get_gtm_workspace_status` - Get workspace status
- `sync_gtm_workspace` - Sync workspace
- `resolve_gtm_conflict` - Resolve merge conflicts
- `bulk_update_gtm_workspace` - Bulk update entities
- `create_gtm_version` - Create version from workspace
- `quick_preview_gtm_workspace` - Get preview URL

### Tags (6)
- `list_gtm_tags` - List tags
- `get_gtm_tag` - Get tag details
- `create_gtm_tag` - Create tag
- `update_gtm_tag` - Update tag
- `delete_gtm_tag` - Delete tag
- `revert_gtm_tag` - Revert tag changes

### Triggers (6)
- `list_gtm_triggers` - List triggers
- `get_gtm_trigger` - Get trigger details
- `create_gtm_trigger` - Create trigger
- `update_gtm_trigger` - Update trigger
- `delete_gtm_trigger` - Delete trigger
- `revert_gtm_trigger` - Revert trigger changes

### Variables (6)
- `list_gtm_variables` - List variables
- `get_gtm_variable` - Get variable details
- `create_gtm_variable` - Create variable
- `update_gtm_variable` - Update variable
- `delete_gtm_variable` - Delete variable
- `revert_gtm_variable` - Revert variable changes

### Built-In Variables (4)
- `list_gtm_built_in_variables` - List built-in variables
- `create_gtm_built_in_variable` - Enable built-in variable
- `delete_gtm_built_in_variable` - Disable built-in variable
- `revert_gtm_built_in_variables` - Revert all built-in variables

### Folders (8)
- `list_gtm_folders` - List folders
- `get_gtm_folder` - Get folder details
- `create_gtm_folder` - Create folder
- `update_gtm_folder` - Update folder
- `delete_gtm_folder` - Delete folder
- `revert_gtm_folder` - Revert folder changes
- `move_entities_to_gtm_folder` - Move entities to folder
- `get_gtm_folder_entities` - Get folder contents

### Container Versions (8)
- `publish_gtm_version` - Publish version
- `list_gtm_versions` - List versions
- `get_gtm_version` - Get version details
- `update_gtm_version` - Update version notes
- `delete_gtm_version` - Delete version
- `undelete_gtm_version` - Restore deleted version
- `set_latest_gtm_version` - Set latest version
- `get_live_gtm_version` - Get live version

### Container Version Headers (2)
- `list_gtm_version_headers` - List version headers
- `get_latest_gtm_version_header` - Get latest header

### Environments (6)
- `list_gtm_environments` - List environments
- `get_gtm_environment` - Get environment details
- `create_gtm_environment` - Create environment
- `update_gtm_environment` - Update environment
- `delete_gtm_environment` - Delete environment
- `reauthorize_gtm_environment` - Reauthorize environment

### User Permissions (5)
- `list_gtm_user_permissions` - List user permissions
- `get_gtm_user_permission` - Get permission details
- `create_gtm_user_permission` - Create permission
- `update_gtm_user_permission` - Update permission
- `delete_gtm_user_permission` - Delete permission

### Clients (6) - Server-side Tagging
- `list_gtm_clients` - List clients
- `get_gtm_client` - Get client details
- `create_gtm_client` - Create client
- `update_gtm_client` - Update client
- `delete_gtm_client` - Delete client
- `revert_gtm_client` - Revert client changes

### Google Tag Config (6)
- `list_gtm_gtag_configs` - List gtag configs
- `get_gtm_gtag_config` - Get config details
- `create_gtm_gtag_config` - Create config
- `update_gtm_gtag_config` - Update config
- `delete_gtm_gtag_config` - Delete config
- `revert_gtm_gtag_config` - Revert config changes

### Templates (7)
- `list_gtm_templates` - List templates
- `get_gtm_template` - Get template details
- `create_gtm_template` - Create template
- `update_gtm_template` - Update template
- `delete_gtm_template` - Delete template
- `revert_gtm_template` - Revert template changes
- `import_gtm_template_from_gallery` - Import from gallery

### Transformations (6) - Server-side Tagging
- `list_gtm_transformations` - List transformations
- `get_gtm_transformation` - Get transformation details
- `create_gtm_transformation` - Create transformation
- `update_gtm_transformation` - Update transformation
- `delete_gtm_transformation` - Delete transformation
- `revert_gtm_transformation` - Revert transformation changes

### Zones (2) - Server-side Tagging
- `list_gtm_zones` - List zones
- `get_gtm_zone` - Get zone details

### Workflow Helpers (4)
- `create_ga4_setup` - Complete GA4 setup
- `create_facebook_pixel_setup` - Facebook Pixel setup
- `create_form_tracking` - Form tracking setup
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
