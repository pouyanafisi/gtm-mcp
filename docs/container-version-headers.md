# Container Version Headers

Container Version Headers provide lightweight metadata about container versions without loading all version entities. They're useful for listing versions and getting basic information.

## Overview

Version Headers are lightweight representations of container versions that include only metadata (ID, name, description) without the full entity data. They're more efficient for listing and browsing versions.

## Resource Path

```
accounts/{account_id}/containers/{container_id}/version_headers/{version_header_id}
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

## API Methods

### List Version Headers

Retrieve all version headers for a container.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/version_headers`

**Response:**
```json
{
  "containerVersionHeader": [
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

### Get Latest Version Header

Get the latest version header.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/version_headers:latest`

**Response:**
```json
{
  "accountId": "123456",
  "containerId": "7890123",
  "containerVersionId": "1",
  "name": "Version 1.0",
  "description": "Initial release"
}
```

## Common Use Cases

1. **List versions efficiently** - Get version list without loading full entities
2. **Get latest version info** - Quickly check the latest version
3. **Browse version history** - View version names and descriptions

## Implementation Notes

- Version headers are lightweight - they don't include tag/trigger/variable data
- Use headers for listing and browsing versions
- Use full version objects when you need entity data
- Headers are read-only metadata

## Example: List Version Headers

```typescript
const headers = await gtmClient.service.accounts.containers.version_headers.list({
  parent: 'accounts/123456/containers/7890123'
});
console.log(`Found ${headers.data.containerVersionHeader?.length || 0} versions`);
```

## Example: Get Latest Version Header

```typescript
const latest = await gtmClient.service.accounts.containers.version_headers.latest({
  parent: 'accounts/123456/containers/7890123'
});
console.log(`Latest version: ${latest.data.name}`);
```

