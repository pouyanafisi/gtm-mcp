# Transformations

Transformations are server-side processing rules that modify data before it's sent to destinations. They're used in Server-side Tagging to transform, filter, or enrich event data.

## Overview

Transformations are server-side entities that process incoming data and modify it before routing to destinations. They can be used to transform data formats, filter events, enrich data, or perform calculations.

## Resource Path

```
accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/transformations/{transformation_id}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `accountId` | string | GTM Account ID |
| `containerId` | string | Container ID |
| `workspaceId` | string | Workspace ID |
| `transformationId` | string | Transformation ID |
| `name` | string | Transformation display name |
| `type` | string | Transformation type |
| `parameter` | array | Transformation parameters |
| `fingerprint` | string | Fingerprint for optimistic concurrency control |
| `tagManagerUrl` | string | URL to access this transformation in GTM UI |
| `parentFolderId` | string | ID of parent folder (if in a folder) |

## Transformation Types

- **Custom** - Custom transformation code
- **Built-in** - Pre-built transformation types

## API Methods

### List Transformations

Retrieve all transformations in a workspace.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/transformations`

**Response:**
```json
{
  "transformation": [
    {
      "accountId": "123456",
      "containerId": "7890123",
      "workspaceId": "1",
      "transformationId": "1",
      "name": "Data Transformation",
      "type": "CUSTOM"
    }
  ]
}
```

### Get Transformation

Retrieve a specific transformation.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/transformations/{transformation_id}`

**Response:** Transformation object

### Create Transformation

Create a new transformation.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/transformations`

**Request Body:**
```json
{
  "name": "Data Transformation",
  "type": "CUSTOM",
  "parameter": [
    {
      "key": "code",
      "value": "function transform(data) { ... }",
      "type": "template"
    }
  ]
}
```

**Response:** Created transformation object

### Update Transformation

Update an existing transformation.

**Endpoint:** `PUT /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/transformations/{transformation_id}`

**Request Body:**
```json
{
  "name": "Updated Transformation",
  "parameter": [
    {
      "key": "code",
      "value": "function transform(data) { ... }",
      "type": "template"
    }
  ]
}
```

**Response:** Updated transformation object

### Delete Transformation

Delete a transformation.

**Endpoint:** `DELETE /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/transformations/{transformation_id}`

### Revert Transformation

Revert a transformation to its state in the latest published version.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/transformations/{transformation_id}:revert`

**Response:** Reverted transformation object

## Common Use Cases

1. **Transform data formats** - Convert data between formats
2. **Filter events** - Filter out unwanted events
3. **Enrich data** - Add additional data to events
4. **Calculate values** - Perform calculations on data
5. **Normalize data** - Standardize data formats

## Implementation Notes

- Transformations are only used in Server-side Tagging containers
- Transformation IDs are numeric strings
- Transformations process data server-side before routing to destinations
- Transformations are workspace-specific and must be published to go live
- Use `revert` to undo workspace changes

## Example: Create Transformation

```typescript
const transformation = await gtmClient.service.accounts.containers.workspaces.transformations.create({
  parent: 'accounts/123456/containers/7890123/workspaces/1',
  requestBody: {
    name: 'Data Transformation',
    type: 'CUSTOM',
    parameter: [
      {
        key: 'code',
        value: 'function transform(data) { return data; }',
        type: 'template'
      }
    ]
  }
});
```

