# Folders

Folders are organizational containers that help you group and organize tags, triggers, and variables within a workspace.

## Overview

Folders provide a way to organize GTM entities (tags, triggers, variables) into logical groups. This makes it easier to manage large containers with many entities.

## Resource Path

```
accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/folders/{folder_id}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `accountId` | string | GTM Account ID |
| `containerId` | string | Container ID |
| `workspaceId` | string | Workspace ID |
| `folderId` | string | Folder ID |
| `name` | string | Folder display name |
| `fingerprint` | string | Fingerprint for optimistic concurrency control |
| `tagManagerUrl` | string | URL to access this folder in GTM UI |

## API Methods

### List Folders

Retrieve all folders in a workspace.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/folders`

**Response:**
```json
{
  "folder": [
    {
      "accountId": "123456",
      "containerId": "7890123",
      "workspaceId": "1",
      "folderId": "1",
      "name": "Analytics"
    }
  ]
}
```

### Get Folder

Retrieve a specific folder.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/folders/{folder_id}`

**Response:** Folder object

### Create Folder

Create a new folder.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/folders`

**Request Body:**
```json
{
  "name": "Analytics"
}
```

**Response:** Created folder object

### Update Folder

Update an existing folder.

**Endpoint:** `PUT /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/folders/{folder_id}`

**Request Body:**
```json
{
  "name": "Updated Folder Name"
}
```

**Response:** Updated folder object

### Delete Folder

Delete a folder (must be empty).

**Endpoint:** `DELETE /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/folders/{folder_id}`

### Revert Folder

Revert a folder to its state in the latest published version.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/folders/{folder_id}:revert`

**Response:** Reverted folder object

### Move Entities to Folder

Move tags, triggers, or variables into a folder.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/folders/{folder_id}:move_entities_to_folder`

**Request Body:**
```json
{
  "tagId": ["1", "2"],
  "triggerId": ["3"],
  "variableId": ["4"]
}
```

### Get Folder Entities

List all entities in a folder.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/folders/{folder_id}/entities`

**Response:**
```json
{
  "tag": [...],
  "trigger": [...],
  "variable": [...]
}
```

## Common Use Cases

1. **Organize by category** - Group related tags (Analytics, Marketing, etc.)
2. **Organize by team** - Separate tags by team or department
3. **Organize by feature** - Group tags by feature or functionality
4. **Move entities** - Reorganize existing entities into folders

## Implementation Notes

- Folder IDs are numeric strings
- Folders can contain tags, triggers, and variables
- Folders must be empty before deletion
- Entities can be moved between folders
- Folders are workspace-specific and must be published to go live
- Use `revert` to undo workspace changes

## Example: Create Folder

```typescript
const folder = await gtmClient.service.accounts.containers.workspaces.folders.create({
  parent: 'accounts/123456/containers/7890123/workspaces/1',
  requestBody: {
    name: 'Analytics'
  }
});
```

## Example: Move Entities to Folder

```typescript
await gtmClient.service.accounts.containers.workspaces.folders.move_entities_to_folder({
  path: 'accounts/123456/containers/7890123/workspaces/1/folders/1',
  requestBody: {
    tagId: ['1', '2'],
    triggerId: ['3']
  }
});
```

