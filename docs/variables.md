# Variables

Variables are named references to dynamic values that can be used in tags, triggers, and other GTM entities. They allow you to reuse values and make configurations more maintainable.

## Overview

A Variable is a named container for a value that can be referenced throughout your GTM configuration. Variables can be constants, data layer values, DOM elements, cookies, or computed values.

## Resource Path

```
accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/variables/{variable_id}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `accountId` | string | GTM Account ID |
| `containerId` | string | Container ID |
| `workspaceId` | string | Workspace ID |
| `variableId` | string | Variable ID |
| `name` | string | Variable display name |
| `type` | string | Variable type (e.g., "c", "v", "jsm", "k") |
| `parameter` | array | Variable parameters (configuration) |
| `formatValue` | object | Format value configuration |
| `fingerprint` | string | Fingerprint for optimistic concurrency control |
| `tagManagerUrl` | string | URL to access this variable in GTM UI |
| `parentFolderId` | string | ID of parent folder (if in a folder) |

## Common Variable Types

### Data Layer Variables

- **v** - Data Layer Variable
  - Accesses values from the data layer
  - Parameter: `dataLayerVersion` (1 or 2), `dataLayerVariable`

### DOM Variables

- **c** - Constant
  - Static string value
  - Parameter: `value`
- **k** - Auto-Event Variable
  - Captures auto-event data (click, form, etc.)
  - Parameter: `autoEventVariableType`
- **jsm** - JavaScript Variable
  - Executes JavaScript to return a value
  - Parameter: `javascript`

### Cookie Variables

- **c** - 1st Party Cookie
  - Reads cookie values
  - Parameter: `cookieName`

### URL Variables

- **u** - URL Variable
  - Extracts parts of the URL
  - Parameter: `componentType` (protocol, host, path, etc.)

### Built-In Variables

- Built-in variables are system-provided (see [Built-In Variables](./built-in-variables.md))
- Common types: Page URL, Page Path, Click Element, Form Element, etc.

## API Methods

### List Variables

Retrieve all variables in a workspace.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/variables`

**Response:**
```json
{
  "variable": [
    {
      "accountId": "123456",
      "containerId": "7890123",
      "workspaceId": "1",
      "variableId": "1",
      "name": "Page URL",
      "type": "u",
      "parameter": [
        {
          "key": "componentType",
          "value": "PAGE_URL",
          "type": "template"
        }
      ]
    }
  ]
}
```

### Get Variable

Retrieve a specific variable.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/variables/{variable_id}`

**Response:** Variable object

### Create Variable

Create a new variable.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/variables`

**Request Body:**
```json
{
  "name": "My Variable",
  "type": "c",
  "parameter": [
    {
      "key": "value",
      "value": "constant-value",
      "type": "template"
    }
  ]
}
```

**Response:** Created variable object

### Update Variable

Update an existing variable.

**Endpoint:** `PUT /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/variables/{variable_id}`

**Request Body:**
```json
{
  "name": "Updated Variable Name",
  "parameter": [
    {
      "key": "value",
      "value": "new-value",
      "type": "template"
    }
  ]
}
```

**Response:** Updated variable object

### Delete Variable

Delete a variable.

**Endpoint:** `DELETE /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/variables/{variable_id}`

### Revert Variable

Revert a variable to its state in the latest published version.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/variables/{variable_id}:revert`

**Response:** Reverted variable object

## Variable Type Examples

### Constant Variable

```json
{
  "name": "Site Name",
  "type": "c",
  "parameter": [
    {
      "key": "value",
      "value": "My Website",
      "type": "template"
    }
  ]
}
```

### Data Layer Variable

```json
{
  "name": "User ID",
  "type": "v",
  "parameter": [
    {
      "key": "dataLayerVersion",
      "value": "2",
      "type": "template"
    },
    {
      "key": "dataLayerVariable",
      "value": "userId",
      "type": "template"
    }
  ]
}
```

### JavaScript Variable

```json
{
  "name": "Page Title",
  "type": "jsm",
  "parameter": [
    {
      "key": "javascript",
      "value": "function() { return document.title; }",
      "type": "template"
    }
  ]
}
```

### URL Variable

```json
{
  "name": "Page Hostname",
  "type": "u",
  "parameter": [
    {
      "key": "componentType",
      "value": "HOST",
      "type": "template"
    }
  ]
}
```

### Cookie Variable

```json
{
  "name": "Session ID",
  "type": "c",
  "parameter": [
    {
      "key": "cookieName",
      "value": "session_id",
      "type": "template"
    }
  ]
}
```

## Using Variables

Variables are referenced in tags and triggers using double curly braces:

- `{{Variable Name}}` - Reference a variable
- `{{Page URL}}` - Reference built-in Page URL variable
- `{{Click Text}}` - Reference built-in Click Text variable

## Common Use Cases

1. **Create constant variables** - Store reusable constant values
2. **Create data layer variables** - Access data layer values
3. **Create URL variables** - Extract URL components
4. **Create JavaScript variables** - Compute values with JavaScript
5. **Create cookie variables** - Read cookie values

## Implementation Notes

- Variable IDs are numeric strings
- Variable names must be unique within a workspace
- Variables can reference other variables
- Use template type for parameter values that should be evaluated
- Variables are workspace-specific and must be published to go live
- Use `revert` to undo workspace changes

## Example: Create Constant Variable

```typescript
const variable = await gtmClient.createVariable(
  '123456',
  '7890123',
  'Site Name',
  'c',
  'My Website'
);
```

## Example: Create Data Layer Variable

```typescript
const dataLayerVar = await gtmClient.service.accounts.containers.workspaces.variables.create({
  parent: 'accounts/123456/containers/7890123/workspaces/1',
  requestBody: {
    name: 'User ID',
    type: 'v',
    parameter: [
      { key: 'dataLayerVersion', value: '2', type: 'template' },
      { key: 'dataLayerVariable', value: 'userId', type: 'template' }
    ]
  }
});
```

