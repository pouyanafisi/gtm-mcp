# Workspaces

Workspaces are concurrent editing environments within a container. They allow multiple users to make changes simultaneously without conflicts, and changes are merged when creating a version.

## Overview

A Workspace is a sandbox environment where you can create, modify, and test tags, triggers, variables, and other GTM entities. Each container has at least one workspace (the default workspace), and you can create additional workspaces for parallel development.

## Resource Path

```
accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `accountId` | string | GTM Account ID |
| `containerId` | string | Container ID |
| `workspaceId` | string | Workspace ID |
| `name` | string | Workspace display name |
| `description` | string | Workspace description |
| `fingerprint` | string | Fingerprint for optimistic concurrency control |
| `tagManagerUrl` | string | URL to access this workspace in GTM UI |

## API Methods

### List Workspaces

Retrieve all workspaces in a container.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces`

**Response:**
```json
{
  "workspace": [
    {
      "accountId": "123456",
      "containerId": "7890123",
      "workspaceId": "1",
      "name": "Default Workspace",
      "description": "Default workspace for container",
      "tagManagerUrl": "https://tagmanager.google.com/#/container/accounts/123456/containers/7890123/workspaces/1"
    }
  ]
}
```

### Get Workspace

Retrieve a specific workspace.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}`

**Response:** Workspace object

### Create Workspace

Create a new workspace.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces`

**Request Body:**
```json
{
  "name": "Development Workspace",
  "description": "Workspace for development and testing"
}
```

**Response:** Created workspace object

### Update Workspace

Update an existing workspace.

**Endpoint:** `PUT /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}`

**Request Body:**
```json
{
  "name": "Updated Workspace Name",
  "description": "Updated description"
}
```

**Response:** Updated workspace object

### Delete Workspace

Delete a workspace (cannot delete the default workspace).

**Endpoint:** `DELETE /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}`

### Get Workspace Status

Get the status of a workspace, including sync status and conflicts.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}:getStatus`

**Response:**
```json
{
  "workspaceChange": [
    {
      "type": "TAG",
      "path": "accounts/123456/containers/7890123/workspaces/1/tags/1"
    }
  ],
  "mergeConflict": []
}
```

### Create Version from Workspace

Create a container version from the current workspace state.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}:create_version`

**Request Body:**
```json
{
  "name": "Version 1.0",
  "notes": "Initial release"
}
```

**Response:** Container version object

### Quick Preview

Create a quick preview URL for testing workspace changes.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}:quick_preview`

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "previewUrl": "https://tagmanager.google.com/preview/..."
}
```

### Sync Workspace

Sync workspace with the latest container version.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}:sync`

**Response:** Sync status object

### Resolve Conflict

Resolve a merge conflict in the workspace.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}:resolve_conflict`

**Request Body:**
```json
{
  "conflictId": "123",
  "changeType": "KEEP"
}
```

### Bulk Update

Perform bulk updates to multiple entities in a workspace.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}:bulk_update`

**Request Body:**
```json
{
  "tag": [
    {
      "tagId": "1",
      "name": "Updated Tag Name"
    }
  ]
}
```

## Workspace Entities

The following entities exist within workspaces:

- [Tags](./tags.md) - Tracking code snippets
- [Triggers](./triggers.md) - Event firing conditions
- [Variables](./variables.md) - Dynamic data storage
- [Built-In Variables](./built-in-variables.md) - System variables
- [Folders](./folders.md) - Organizational containers
- [Clients](./clients.md) - Server-side clients
- [Google Tag Config](./google-tag-config.md) - Google Tag settings
- [Templates](./templates.md) - Custom templates
- [Transformations](./transformations.md) - Data transformations
- [Zones](./zones.md) - Tag firing zones

## Common Use Cases

1. **Create development workspace** - Set up a separate workspace for testing
2. **Get workspace status** - Check for conflicts before creating a version
3. **Create version** - Publish workspace changes as a new version
4. **Quick preview** - Test workspace changes before publishing
5. **Sync workspace** - Update workspace with latest published version
6. **Resolve conflicts** - Handle merge conflicts when syncing

## Implementation Notes

- Each container has at least one default workspace
- Workspace IDs are typically "1" for the default workspace
- Changes in workspaces are not live until published as a version
- Multiple workspaces can exist simultaneously
- The default workspace cannot be deleted
- Use `getStatus` to check for conflicts before creating versions

## Example: Get Default Workspace

```typescript
const workspaces = await gtmClient.service.accounts.containers.workspaces.list({
  parent: 'accounts/123456/containers/7890123'
});
const defaultWorkspace = workspaces.data.workspace?.[0];
console.log(`Default workspace: ${defaultWorkspace?.name}`);
```

## Example: Create Version from Workspace

```typescript
const version = await gtmClient.service.accounts.containers.workspaces.create_version({
  path: 'accounts/123456/containers/7890123/workspaces/1',
  requestBody: {
    name: 'Version 1.0',
    notes: 'Initial release'
  }
});
console.log(`Created version: ${version.data.containerVersion?.containerVersionId}`);
```

