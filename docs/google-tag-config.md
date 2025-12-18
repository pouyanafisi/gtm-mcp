# Google Tag Config

Google Tag Config is a workspace entity that configures the Google Tag (gtag.js) for a container. It allows you to manage Google Tag settings centrally.

## Overview

Google Tag Config provides a centralized way to configure the Google Tag (gtag.js) that loads on your website. It manages settings like measurement IDs, consent mode, and other Google Tag parameters.

## Resource Path

```
accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/gtag_config/{config_id}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `accountId` | string | GTM Account ID |
| `containerId` | string | Container ID |
| `workspaceId` | string | Workspace ID |
| `gtagConfigId` | string | Google Tag Config ID |
| `tagId` | string | Google Tag ID (e.g., G-XXXXXXXXXX) |
| `parameter` | array | Configuration parameters |
| `fingerprint` | string | Fingerprint for optimistic concurrency control |
| `tagManagerUrl` | string | URL to access this config in GTM UI |

## API Methods

### List Google Tag Configs

Retrieve all Google Tag configs in a workspace.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/gtag_config`

**Response:**
```json
{
  "gtagConfig": [
    {
      "accountId": "123456",
      "containerId": "7890123",
      "workspaceId": "1",
      "gtagConfigId": "1",
      "tagId": "G-XXXXXXXXXX",
      "parameter": [
        {
          "key": "send_page_view",
          "value": "true",
          "type": "boolean"
        }
      ]
    }
  ]
}
```

### Get Google Tag Config

Retrieve a specific Google Tag config.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/gtag_config/{config_id}`

**Response:** Google Tag Config object

### Create Google Tag Config

Create a new Google Tag config.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/gtag_config`

**Request Body:**
```json
{
  "tagId": "G-XXXXXXXXXX",
  "parameter": [
    {
      "key": "send_page_view",
      "value": "true",
      "type": "boolean"
    }
  ]
}
```

**Response:** Created Google Tag Config object

### Update Google Tag Config

Update an existing Google Tag config.

**Endpoint:** `PUT /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/gtag_config/{config_id}`

**Request Body:**
```json
{
  "tagId": "G-YYYYYYYYYY",
  "parameter": [
    {
      "key": "send_page_view",
      "value": "false",
      "type": "boolean"
    }
  ]
}
```

**Response:** Updated Google Tag Config object

### Delete Google Tag Config

Delete a Google Tag config.

**Endpoint:** `DELETE /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/gtag_config/{config_id}`

### Revert Google Tag Config

Revert a Google Tag config to its state in the latest published version.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/gtag_config/{config_id}:revert`

**Response:** Reverted Google Tag Config object

## Common Parameters

- `send_page_view` - Automatically send page views (boolean)
- `cookie_flags` - Cookie flags for consent mode
- `custom_parameter` - Custom parameters to send with events

## Common Use Cases

1. **Configure Google Tag** - Set up Google Tag with measurement ID
2. **Enable consent mode** - Configure consent mode settings
3. **Customize page view tracking** - Control automatic page view sending
4. **Add custom parameters** - Include custom data with all events

## Implementation Notes

- Google Tag Config is workspace-specific
- The `tagId` is typically a GA4 Measurement ID (G-XXXXXXXXXX)
- Parameters can be of various types (boolean, string, etc.)
- Configs are workspace-specific and must be published to go live
- Use `revert` to undo workspace changes

## Example: Create Google Tag Config

```typescript
const config = await gtmClient.service.accounts.containers.workspaces.gtag_config.create({
  parent: 'accounts/123456/containers/7890123/workspaces/1',
  requestBody: {
    tagId: 'G-XXXXXXXXXX',
    parameter: [
      {
        key: 'send_page_view',
        value: 'true',
        type: 'boolean'
      }
    ]
  }
});
```

