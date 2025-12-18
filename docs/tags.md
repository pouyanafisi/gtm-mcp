# Tags

Tags are snippets of code that execute on your website or app. They can send data to analytics platforms, marketing tools, or other third-party services.

## Overview

A Tag is a configuration that tells GTM when and how to fire tracking code. Tags are associated with triggers that determine when they fire, and can use variables for dynamic data.

## Resource Path

```
accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/tags/{tag_id}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `accountId` | string | GTM Account ID |
| `containerId` | string | Container ID |
| `workspaceId` | string | Workspace ID |
| `tagId` | string | Tag ID |
| `name` | string | Tag display name |
| `type` | string | Tag type (e.g., "gaawc", "gaawe", "ua", "img") |
| `parameter` | array | Tag parameters (key-value pairs) |
| `firingTriggerId` | array | IDs of triggers that fire this tag |
| `blockingTriggerId` | array | IDs of triggers that block this tag |
| `tagFiringOption` | string | Tag firing option ("unlimited", "oncePerEvent", "oncePerLoad") |
| `fingerprint` | string | Fingerprint for optimistic concurrency control |
| `tagManagerUrl` | string | URL to access this tag in GTM UI |
| `parentFolderId` | string | ID of parent folder (if in a folder) |

## Common Tag Types

### Google Analytics Tags

- **gaawc** - Google Analytics: GA4 Configuration
- **gaawe** - Google Analytics: GA4 Event
- **ua** - Universal Analytics (legacy)

### Custom Tags

- **html** - Custom HTML
- **img** - Custom Image
- **csp** - Custom Script Provider

### Third-Party Tags

- **awct** - Google Ads Conversion Tracking
- **sp** - Google Ads Remarketing
- **flc** - Floodlight Counter
- **fls** - Floodlight Sales

## API Methods

### List Tags

Retrieve all tags in a workspace.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/tags`

**Response:**
```json
{
  "tag": [
    {
      "accountId": "123456",
      "containerId": "7890123",
      "workspaceId": "1",
      "tagId": "1",
      "name": "GA4 Configuration",
      "type": "gaawc",
      "parameter": [
        {
          "key": "measurementIdOverride",
          "value": "G-XXXXXXXXXX",
          "type": "template"
        }
      ],
      "firingTriggerId": ["1"],
      "tagFiringOption": "unlimited"
    }
  ]
}
```

### Get Tag

Retrieve a specific tag.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/tags/{tag_id}`

**Response:** Tag object

### Create Tag

Create a new tag.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/tags`

**Request Body:**
```json
{
  "name": "GA4 Configuration",
  "type": "gaawc",
  "parameter": [
    {
      "key": "measurementIdOverride",
      "value": "G-XXXXXXXXXX",
      "type": "template"
    }
  ],
  "firingTriggerId": ["1"]
}
```

**Response:** Created tag object

### Update Tag

Update an existing tag.

**Endpoint:** `PUT /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/tags/{tag_id}`

**Request Body:**
```json
{
  "name": "Updated Tag Name",
  "parameter": [
    {
      "key": "measurementIdOverride",
      "value": "G-YYYYYYYYYY",
      "type": "template"
    }
  ]
}
```

**Response:** Updated tag object

### Delete Tag

Delete a tag.

**Endpoint:** `DELETE /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/tags/{tag_id}`

### Revert Tag

Revert a tag to its state in the latest published version.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/tags/{tag_id}:revert`

**Response:** Reverted tag object

## Tag Parameters

Parameters are key-value pairs that configure tag behavior. Common parameter types:

- **template** - Template value (can use variables like `{{Variable Name}}`)
- **boolean** - Boolean value
- **integer** - Integer value
- **list** - List of values
- **map** - Map of key-value pairs

## Tag Firing Options

- **unlimited** - Fire every time triggers are met
- **oncePerEvent** - Fire once per event
- **oncePerLoad** - Fire once per page load

## Common Use Cases

1. **Create GA4 configuration tag** - Set up Google Analytics 4 tracking
2. **Create event tags** - Track custom events (clicks, form submissions, etc.)
3. **Create custom HTML tags** - Add custom tracking code
4. **Create conversion tags** - Set up conversion tracking for ads
5. **Update tag parameters** - Modify tag configuration

## Implementation Notes

- Tag IDs are numeric strings
- Tags must have at least one firing trigger
- Parameters use template syntax for variables: `{{Variable Name}}`
- Tags are workspace-specific and must be published to go live
- Use `revert` to undo workspace changes

## Example: Create GA4 Configuration Tag

```typescript
const tag = await gtmClient.createTag(
  '123456',
  '7890123',
  'GA4 Configuration',
  'gaawc',
  {
    measurementIdOverride: 'G-XXXXXXXXXX'
  }
);
```

## Example: Create GA4 Event Tag

```typescript
const eventTag = await gtmClient.createTag(
  '123456',
  '7890123',
  'GA4 Event - Button Click',
  'gaawe',
  {
    measurementIdOverride: 'G-XXXXXXXXXX',
    eventName: 'button_click',
    buttonText: '{{Click Text}}'
  }
);
```

## Example: List All Tags

```typescript
const tags = await gtmClient.service.accounts.containers.workspaces.tags.list({
  parent: 'accounts/123456/containers/7890123/workspaces/1'
});
console.log(`Found ${tags.data.tag?.length || 0} tags`);
```

