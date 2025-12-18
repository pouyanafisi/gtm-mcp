# Container Versions

Container Versions are published snapshots of a container's configuration. They represent the live state of tags, triggers, variables, and other entities at a specific point in time.

## Overview

A Container Version is a frozen snapshot of a container's configuration. Once published, a version becomes the live configuration that runs on websites and apps. Versions cannot be modified; to make changes, you create a new version from a workspace.

## Resource Path

```
accounts/{account_id}/containers/{container_id}/versions/{version_id}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `accountId` | string | GTM Account ID |
| `containerId` | string | Container ID |
| `containerVersionId` | string | Version ID |
| `name` | string | Version name |
| `description` | string | Version description |
| `fingerprint` | string | Fingerprint for optimistic concurrency control |
| `tag` | array | Tags in this version |
| `trigger` | array | Triggers in this version |
| `variable` | array | Variables in this version |
| `folder` | array | Folders in this version |
| `builtInVariable` | array | Built-in variables in this version |
| `client` | array | Clients in this version (server-side) |
| `transformation` | array | Transformations in this version (server-side) |
| `tagManagerUrl` | string | URL to access this version in GTM UI |

## API Methods

### List Versions

Retrieve all versions of a container.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/versions`

**Response:**
```json
{
  "containerVersion": [
    {
      "accountId": "123456",
      "containerId": "7890123",
      "containerVersionId": "1",
      "name": "Version 1.0",
      "description": "Initial release"
    }
  ]
}
```

### Get Version

Retrieve a specific version with all its entities.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/versions/{version_id}`

**Response:**
```json
{
  "accountId": "123456",
  "containerId": "7890123",
  "containerVersionId": "1",
  "name": "Version 1.0",
  "description": "Initial release",
  "tag": [...],
  "trigger": [...],
  "variable": [...]
}
```

### Update Version

Update version metadata (name, description). Note: You cannot modify the entities in a version.

**Endpoint:** `PUT /tagmanager/v2/accounts/{account_id}/containers/{container_id}/versions/{version_id}`

**Request Body:**
```json
{
  "name": "Updated Version Name",
  "description": "Updated description"
}
```

**Response:** Updated version object

### Delete Version

Delete a version (soft delete - can be undeleted).

**Endpoint:** `DELETE /tagmanager/v2/accounts/{account_id}/containers/{container_id}/versions/{version_id}`

### Undelete Version

Restore a deleted version.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/versions/{version_id}:undelete`

**Response:** Restored version object

### Publish Version

Publish a version to make it live.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/versions/{version_id}:publish`

**Response:**
```json
{
  "containerVersion": {
    "containerVersionId": "1",
    "name": "Version 1.0"
  }
}
```

### Set Latest Version

Set a version as the latest (for preview purposes).

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/versions/{version_id}:set_latest`

**Response:** Version object

### Get Live Version

Get the currently live (published) version.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/versions:live`

**Response:** Live version object

## Version Workflow

1. **Create workspace changes** - Make changes in a workspace
2. **Create version** - Create a version from the workspace
3. **Preview version** - Test the version (optional)
4. **Publish version** - Make the version live

## Common Use Cases

1. **Publish changes** - Publish workspace changes as a new version
2. **Get live version** - Retrieve the currently live version
3. **List version history** - View all versions of a container
4. **Restore version** - Undelete a previously deleted version
5. **Update version metadata** - Change version name or description

## Implementation Notes

- Version IDs are numeric strings
- Versions are immutable - entities cannot be modified
- Only one version can be live at a time
- Publishing a version makes it the live version
- Deleted versions can be restored with `undelete`
- Use `set_latest` to preview a version without publishing

## Example: Publish Version

```typescript
const version = await gtmClient.publishVersion(
  '123456',
  '7890123',
  'Version 1.0',
  'Initial release'
);
console.log(`Published version: ${version.version?.containerVersionId}`);
```

## Example: Get Live Version

```typescript
const liveVersion = await gtmClient.service.accounts.containers.versions.live({
  parent: 'accounts/123456/containers/7890123'
});
console.log(`Live version: ${liveVersion.data.containerVersion?.name}`);
```

## Example: List All Versions

```typescript
const versions = await gtmClient.service.accounts.containers.versions.list({
  parent: 'accounts/123456/containers/7890123'
});
console.log(`Found ${versions.data.containerVersion?.length || 0} versions`);
```

