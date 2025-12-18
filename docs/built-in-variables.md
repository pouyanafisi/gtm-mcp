# Built-In Variables

Built-in variables are pre-configured system variables provided by Google Tag Manager. They automatically capture common data points without requiring custom configuration.

## Overview

Built-in variables are automatically available in GTM and provide access to common data points like page information, click data, form data, and more. They can be enabled or disabled in a workspace but cannot be created or deleted.

## Resource Path

```
accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/built_in_variables
```

## Common Built-In Variables

### Page Variables

- **Page URL** - Full URL of the current page
- **Page Hostname** - Hostname of the current page
- **Page Path** - Path portion of the URL
- **Page Title** - Title of the current page
- **Referrer** - URL of the referring page

### Click Variables

- **Click Element** - Element that was clicked
- **Click Classes** - CSS classes of clicked element
- **Click ID** - ID of clicked element
- **Click Target** - Target attribute of clicked element
- **Click Text** - Text content of clicked element
- **Click URL** - URL of clicked link

### Form Variables

- **Form Element** - Form element that was submitted
- **Form Classes** - CSS classes of form element
- **Form ID** - ID of form element
- **Form Target** - Target attribute of form element
- **Form Text** - Text content of form element
- **Form URL** - URL of form action

### Video Variables

- **Video Provider** - Video provider (YouTube, Vimeo, etc.)
- **Video Status** - Status of video playback
- **Video URL** - URL of video
- **Video Title** - Title of video
- **Video Duration** - Duration of video
- **Video Current Time** - Current playback time
- **Video Percent** - Percentage of video watched

### Scroll Variables

- **Scroll Depth Threshold** - Scroll depth threshold
- **Scroll Depth Units** - Units for scroll depth (percent or pixels)
- **Scroll Direction** - Direction of scroll (vertical or horizontal)

### Error Variables

- **Error Message** - JavaScript error message
- **Error URL** - URL where error occurred
- **Error Line** - Line number where error occurred

## API Methods

### List Built-In Variables

Retrieve all built-in variables in a workspace.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/built_in_variables`

**Response:**
```json
{
  "builtInVariable": [
    {
      "accountId": "123456",
      "containerId": "7890123",
      "workspaceId": "1",
      "type": "PAGE_URL",
      "name": "Page URL"
    }
  ]
}
```

### Create Built-In Variable

Enable a built-in variable in the workspace.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/built_in_variables`

**Request Body:**
```json
{
  "type": "PAGE_URL"
}
```

**Response:** Created built-in variable object

### Delete Built-In Variable

Disable a built-in variable in the workspace.

**Endpoint:** `DELETE /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/built_in_variables/{type}`

**Parameters:**
- `type` (path, required): Built-in variable type (e.g., "PAGE_URL")

### Revert Built-In Variables

Revert built-in variables to their state in the latest published version.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/built_in_variables:revert`

## Built-In Variable Types

### Page Variables

- `PAGE_URL` - Page URL
- `PAGE_HOSTNAME` - Page hostname
- `PAGE_PATH` - Page path
- `PAGE_TITLE` - Page title
- `REFERRER` - Referrer URL

### Click Variables

- `CLICK_ELEMENT` - Click element
- `CLICK_CLASSES` - Click classes
- `CLICK_ID` - Click ID
- `CLICK_TARGET` - Click target
- `CLICK_TEXT` - Click text
- `CLICK_URL` - Click URL

### Form Variables

- `FORM_ELEMENT` - Form element
- `FORM_CLASSES` - Form classes
- `FORM_ID` - Form ID
- `FORM_TARGET` - Form target
- `FORM_TEXT` - Form text
- `FORM_URL` - Form URL

### Video Variables

- `VIDEO_PROVIDER` - Video provider
- `VIDEO_STATUS` - Video status
- `VIDEO_URL` - Video URL
- `VIDEO_TITLE` - Video title
- `VIDEO_DURATION` - Video duration
- `VIDEO_CURRENT_TIME` - Video current time
- `VIDEO_PERCENT` - Video percent watched

### Scroll Variables

- `SCROLL_DEPTH_THRESHOLD` - Scroll depth threshold
- `SCROLL_DEPTH_UNITS` - Scroll depth units
- `SCROLL_DIRECTION` - Scroll direction

### Error Variables

- `ERROR_MESSAGE` - Error message
- `ERROR_URL` - Error URL
- `ERROR_LINE` - Error line number

## Common Use Cases

1. **Enable page variables** - Access page information in tags
2. **Enable click variables** - Track click interactions
3. **Enable form variables** - Track form submissions
4. **Enable video variables** - Track video engagement
5. **Enable scroll variables** - Track scroll depth

## Implementation Notes

- Built-in variables are system-provided and cannot be created or deleted
- They can be enabled or disabled in a workspace
- Once enabled, they can be referenced like regular variables: `{{Page URL}}`
- Built-in variables are automatically available in published versions
- Use `revert` to restore built-in variable state

## Example: Enable Built-In Variables

```typescript
// Enable Page URL variable
await gtmClient.service.accounts.containers.workspaces.built_in_variables.create({
  parent: 'accounts/123456/containers/7890123/workspaces/1',
  requestBody: {
    type: 'PAGE_URL'
  }
});

// Enable Click Text variable
await gtmClient.service.accounts.containers.workspaces.built_in_variables.create({
  parent: 'accounts/123456/containers/7890123/workspaces/1',
  requestBody: {
    type: 'CLICK_TEXT'
  }
});
```

## Example: List Enabled Built-In Variables

```typescript
const builtInVars = await gtmClient.service.accounts.containers.workspaces.built_in_variables.list({
  parent: 'accounts/123456/containers/7890123/workspaces/1'
});
console.log(`Enabled built-in variables: ${builtInVars.data.builtInVariable?.length || 0}`);
```

