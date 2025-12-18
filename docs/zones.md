# Zones

Zones are server-side entities that define tag firing zones in Server-side Tagging. They control which tags fire in which contexts.

## Overview

Zones are used in Server-side Tagging to organize and control tag firing. They allow you to group tags and control when they execute based on zone configuration.

## Resource Path

```
accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/zones/{zone_id}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `accountId` | string | GTM Account ID |
| `containerId` | string | Container ID |
| `workspaceId` | string | Workspace ID |
| `zoneId` | string | Zone ID |
| `name` | string | Zone display name |
| `type` | string | Zone type |
| `parameter` | array | Zone parameters |
| `fingerprint` | string | Fingerprint for optimistic concurrency control |
| `tagManagerUrl` | string | URL to access this zone in GTM UI |
| `parentFolderId` | string | ID of parent folder (if in a folder) |

## API Methods

### List Zones

Retrieve all zones in a workspace.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/zones`

**Response:**
```json
{
  "zone": [
    {
      "accountId": "123456",
      "containerId": "7890123",
      "workspaceId": "1",
      "zoneId": "1",
      "name": "Default Zone",
      "type": "ZONE_TYPE_UNSPECIFIED"
    }
  ]
}
```

### Get Zone

Retrieve a specific zone.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/zones/{zone_id}`

**Response:** Zone object

### Create Zone

Create a new zone.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/zones`

**Request Body:**
```json
{
  "name": "Custom Zone",
  "type": "ZONE_TYPE_UNSPECIFIED",
  "parameter": []
}
```

**Response:** Created zone object

### Update Zone

Update an existing zone.

**Endpoint:** `PUT /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/zones/{zone_id}`

**Request Body:**
```json
{
  "name": "Updated Zone Name",
  "parameter": []
}
```

**Response:** Updated zone object

### Delete Zone

Delete a zone.

**Endpoint:** `DELETE /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/zones/{zone_id}`

### Revert Zone

Revert a zone to its state in the latest published version.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/zones/{zone_id}:revert`

**Response:** Reverted zone object

## Common Use Cases

1. **Organize tag firing** - Group tags by zone
2. **Control tag execution** - Control when tags fire based on zone
3. **Separate environments** - Use zones for different environments

## Implementation Notes

- Zones are only used in Server-side Tagging containers
- Zone IDs are numeric strings
- Zones control tag firing in server-side contexts
- Zones are workspace-specific and must be published to go live
- Use `revert` to undo workspace changes

## Example: List Zones

```typescript
const zones = await gtmClient.service.accounts.containers.workspaces.zones.list({
  parent: 'accounts/123456/containers/7890123/workspaces/1'
});
console.log(`Found ${zones.data.zone?.length || 0} zones`);
```

