# Triggers

Triggers define when tags should fire. They listen for specific events or conditions and activate associated tags when those conditions are met.

## Overview

A Trigger is a condition that determines when a tag should execute. Triggers can be based on page views, clicks, form submissions, custom events, or other conditions.

## Resource Path

```
accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/triggers/{trigger_id}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `accountId` | string | GTM Account ID |
| `containerId` | string | Container ID |
| `workspaceId` | string | Workspace ID |
| `triggerId` | string | Trigger ID |
| `name` | string | Trigger display name |
| `type` | string | Trigger type (e.g., "pageview", "click", "formSubmission") |
| `customEventFilter` | array | Custom event filter conditions |
| `autoEventFilter` | array | Auto event filter conditions |
| `waitForTags` | boolean | Wait for tags to fire before continuing |
| `waitForTagsTimeout` | integer | Timeout for waiting for tags (milliseconds) |
| `checkValidation` | boolean | Check validation before firing |
| `fingerprint` | string | Fingerprint for optimistic concurrency control |
| `tagManagerUrl` | string | URL to access this trigger in GTM UI |
| `parentFolderId` | string | ID of parent folder (if in a folder) |

## Common Trigger Types

### Page-Based Triggers

- **pageview** - Fires on page views
- **domReady** - Fires when DOM is ready
- **windowLoaded** - Fires when window is loaded

### Interaction Triggers

- **click** - Fires on element clicks
- **formSubmission** - Fires on form submissions
- **linkClick** - Fires on link clicks
- **visibility** - Fires when element becomes visible

### Custom Event Triggers

- **customEvent** - Fires on custom events
- **elementVisibility** - Fires when element visibility changes

### Timer Triggers

- **timer** - Fires at specified intervals
- **scrollDepth** - Fires at scroll depth thresholds

## API Methods

### List Triggers

Retrieve all triggers in a workspace.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/triggers`

**Response:**
```json
{
  "trigger": [
    {
      "accountId": "123456",
      "containerId": "7890123",
      "workspaceId": "1",
      "triggerId": "1",
      "name": "All Pages",
      "type": "pageview"
    }
  ]
}
```

### Get Trigger

Retrieve a specific trigger.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/triggers/{trigger_id}`

**Response:** Trigger object

### Create Trigger

Create a new trigger.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/triggers`

**Request Body:**
```json
{
  "name": "All Pages",
  "type": "pageview"
}
```

**Response:** Created trigger object

### Update Trigger

Update an existing trigger.

**Endpoint:** `PUT /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/triggers/{trigger_id}`

**Request Body:**
```json
{
  "name": "Updated Trigger Name",
  "type": "click",
  "autoEventFilter": [
    {
      "type": "equals",
      "parameter": [
        {
          "key": "arg0",
          "value": "{{Click Element}}",
          "type": "template"
        },
        {
          "key": "arg1",
          "value": "button",
          "type": "template"
        }
      ]
    }
  ]
}
```

**Response:** Updated trigger object

### Delete Trigger

Delete a trigger.

**Endpoint:** `DELETE /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/triggers/{trigger_id}`

### Revert Trigger

Revert a trigger to its state in the latest published version.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/triggers/{trigger_id}:revert`

**Response:** Reverted trigger object

## Trigger Conditions

Triggers use filter conditions to determine when they fire. Common condition types:

### Equals
```json
{
  "type": "equals",
  "parameter": [
    {"key": "arg0", "value": "{{Page URL}}", "type": "template"},
    {"key": "arg1", "value": "example.com", "type": "template"}
  ]
}
```

### Contains
```json
{
  "type": "contains",
  "parameter": [
    {"key": "arg0", "value": "{{Click URL}}", "type": "template"},
    {"key": "arg1", "value": "/checkout", "type": "template"}
  ]
}
```

### Starts With
```json
{
  "type": "startsWith",
  "parameter": [
    {"key": "arg0", "value": "{{Page Path}}", "type": "template"},
    {"key": "arg1", "value": "/blog", "type": "template"}
  ]
}
```

### Regex Match
```json
{
  "type": "matchRegex",
  "parameter": [
    {"key": "arg0", "value": "{{Page URL}}", "type": "template"},
    {"key": "arg1", "value": ".*\\.pdf$", "type": "template"}
  ]
}
```

## Common Use Cases

1. **Create pageview trigger** - Fire tags on all page views
2. **Create click trigger** - Fire tags on button/link clicks
3. **Create form submission trigger** - Fire tags on form submissions
4. **Create custom event trigger** - Fire tags on custom events
5. **Create conditional triggers** - Fire tags based on URL, element, or other conditions

## Implementation Notes

- Trigger IDs are numeric strings
- Triggers can have multiple filter conditions (AND logic)
- Use `autoEventFilter` for automatic event filtering
- Use `customEventFilter` for custom event filtering
- Triggers are workspace-specific and must be published to go live
- Use `revert` to undo workspace changes

## Example: Create Pageview Trigger

```typescript
const trigger = await gtmClient.createTrigger(
  '123456',
  '7890123',
  'All Pages',
  'pageview',
  []
);
```

## Example: Create Click Trigger with Condition

```typescript
const clickTrigger = await gtmClient.createTrigger(
  '123456',
  '7890123',
  'Button Clicks',
  'click',
  [
    {
      type: 'equals',
      parameter: [
        { key: 'arg0', value: '{{Click Element}}', type: 'template' },
        { key: 'arg1', value: 'button.submit', type: 'template' }
      ]
    }
  ]
);
```

## Example: Create Form Submission Trigger

```typescript
const formTrigger = await gtmClient.createTrigger(
  '123456',
  '7890123',
  'Contact Form Submit',
  'formSubmission',
  [
    {
      type: 'equals',
      parameter: [
        { key: 'arg0', value: '{{Form Element}}', type: 'template' },
        { key: 'arg1', value: '#contact-form', type: 'template' }
      ]
    }
  ]
);
```

