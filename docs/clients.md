# Clients

Clients are server-side configurations in Google Tag Manager Server-side Tagging. They define how the server processes incoming requests and routes data to destinations.

## Overview

Clients are used in Server-side Tagging to configure how the GTM server processes client requests. They define authentication, request handling, and data routing for server-side containers.

## Resource Path

```
accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/clients/{client_id}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `accountId` | string | GTM Account ID |
| `containerId` | string | Container ID |
| `workspaceId` | string | Workspace ID |
| `clientId` | string | Client ID |
| `name` | string | Client display name |
| `type` | string | Client type (e.g., "GA4", "UA", "FIREBASE") |
| `parameter` | array | Client parameters (configuration) |
| `fingerprint` | string | Fingerprint for optimistic concurrency control |
| `tagManagerUrl` | string | URL to access this client in GTM UI |
| `parentFolderId` | string | ID of parent folder (if in a folder) |

## Common Client Types

### Google Analytics Clients

- **GA4** - Google Analytics 4 client
- **UA** - Universal Analytics client (legacy)
- **FIREBASE** - Firebase Analytics client

### Custom Clients

- **CUSTOM** - Custom client configuration

## API Methods

### List Clients

Retrieve all clients in a workspace.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/clients`

**Response:**
```json
{
  "client": [
    {
      "accountId": "123456",
      "containerId": "7890123",
      "workspaceId": "1",
      "clientId": "1",
      "name": "GA4 Client",
      "type": "GA4",
      "parameter": [
        {
          "key": "measurementId",
          "value": "G-XXXXXXXXXX",
          "type": "template"
        }
      ]
    }
  ]
}
```

### Get Client

Retrieve a specific client.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/clients/{client_id}`

**Response:** Client object

### Create Client

Create a new client.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/clients`

**Request Body:**
```json
{
  "name": "GA4 Client",
  "type": "GA4",
  "parameter": [
    {
      "key": "measurementId",
      "value": "G-XXXXXXXXXX",
      "type": "template"
    }
  ]
}
```

**Response:** Created client object

### Update Client

Update an existing client.

**Endpoint:** `PUT /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/clients/{client_id}`

**Request Body:**
```json
{
  "name": "Updated Client Name",
  "parameter": [
    {
      "key": "measurementId",
      "value": "G-YYYYYYYYYY",
      "type": "template"
    }
  ]
}
```

**Response:** Updated client object

### Delete Client

Delete a client.

**Endpoint:** `DELETE /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/clients/{client_id}`

### Revert Client

Revert a client to its state in the latest published version.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/clients/{client_id}:revert`

**Response:** Reverted client object

## Client Configuration

Clients are configured using parameters. Common parameters include:

### GA4 Client Parameters

- `measurementId` - GA4 Measurement ID
- `apiSecret` - GA4 API Secret (for server-side)
- `firebaseAppId` - Firebase App ID (for Firebase)

### UA Client Parameters

- `trackingId` - Universal Analytics Tracking ID
- `cookieName` - Cookie name for client ID

## Common Use Cases

1. **Configure GA4 client** - Set up Google Analytics 4 server-side tracking
2. **Configure custom clients** - Set up custom server-side processing
3. **Update client settings** - Modify client configuration
4. **Manage multiple clients** - Configure different clients for different purposes

## Implementation Notes

- Clients are only used in Server-side Tagging containers
- Client IDs are numeric strings
- Clients define how the server processes requests
- Clients are workspace-specific and must be published to go live
- Use `revert` to undo workspace changes

## Example: Create GA4 Client

```typescript
const client = await gtmClient.service.accounts.containers.workspaces.clients.create({
  parent: 'accounts/123456/containers/7890123/workspaces/1',
  requestBody: {
    name: 'GA4 Client',
    type: 'GA4',
    parameter: [
      {
        key: 'measurementId',
        value: 'G-XXXXXXXXXX',
        type: 'template'
      }
    ]
  }
});
```

