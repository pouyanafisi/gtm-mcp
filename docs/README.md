# Google Tag Manager API v2 Documentation

Documentation for Google Tag Manager API v2 entities and operations.

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
  │     │     ├── Client
  │     │     ├── Google Tag Config
  │     │     ├── Template
  │     │     ├── Transformation
  │     │     └── Zone
  │     ├── Version
  │     ├── Version Header
  │     ├── Environment
  │     └── Destination
  └── User Permission
```

## Documentation Files

### Core Entities
- [Accounts](./accounts.md)
- [Containers](./containers.md)
- [Workspaces](./workspaces.md)
- [Container Versions](./container-versions.md)
- [Container Version Headers](./container-version-headers.md)

### Workspace Entities
- [Tags](./tags.md)
- [Triggers](./triggers.md)
- [Variables](./variables.md)
- [Built-In Variables](./built-in-variables.md)
- [Folders](./folders.md)
- [Clients](./clients.md)
- [Google Tag Config](./google-tag-config.md)
- [Templates](./templates.md)
- [Transformations](./transformations.md)
- [Zones](./zones.md)

### Supporting Entities
- [Environments](./environments.md)
- [Destinations](./destinations.md)
- [User Permissions](./user-permissions.md)

## API Reference

[Google Tag Manager API v2](https://developers.google.com/tag-platform/tag-manager/api/v2)

## Authentication

OAuth 2.0 scopes required:
- `https://www.googleapis.com/auth/tagmanager.edit.containers`
- `https://www.googleapis.com/auth/tagmanager.publish`

## Resource Paths

- Account: `accounts/{account_id}`
- Container: `accounts/{account_id}/containers/{container_id}`
- Workspace: `accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}`
- Tag: `accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/tags/{tag_id}`

## Standard Operations

Most entities support:
- `list` - Retrieve all entities
- `get` - Retrieve specific entity
- `create` - Create new entity
- `update` - Update entity
- `delete` - Delete entity
- `revert` - Revert changes (workspace entities)

## HTTP Status Codes

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Verification

See [VERIFICATION.md](./VERIFICATION.md) for implementation checklist.
