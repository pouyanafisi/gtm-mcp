# Templates

Templates are custom tag, trigger, or variable templates that can be created and reused in GTM. They allow you to build custom functionality beyond the built-in tag types.

## Overview

Templates are custom code definitions that extend GTM's functionality. They can be created from scratch or imported from the Community Template Gallery. Templates define the structure, parameters, and behavior of custom tags, triggers, or variables.

## Resource Path

```
accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/templates/{template_id}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `accountId` | string | GTM Account ID |
| `containerId` | string | Container ID |
| `workspaceId` | string | Workspace ID |
| `templateId` | string | Template ID |
| `name` | string | Template display name |
| `fingerprint` | string | Fingerprint for optimistic concurrency control |
| `tagManagerUrl` | string | URL to access this template in GTM UI |

## Template Types

- **Tag Templates** - Custom tag implementations
- **Trigger Templates** - Custom trigger implementations
- **Variable Templates** - Custom variable implementations

## API Methods

### List Templates

Retrieve all templates in a workspace.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/templates`

**Response:**
```json
{
  "template": [
    {
      "accountId": "123456",
      "containerId": "7890123",
      "workspaceId": "1",
      "templateId": "1",
      "name": "Custom Tag Template"
    }
  ]
}
```

### Get Template

Retrieve a specific template.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/templates/{template_id}`

**Response:** Template object

### Create Template

Create a new template.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/templates`

**Request Body:**
```json
{
  "name": "Custom Tag Template",
  "templateData": "..."
}
```

**Response:** Created template object

### Update Template

Update an existing template.

**Endpoint:** `PUT /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/templates/{template_id}`

**Request Body:**
```json
{
  "name": "Updated Template Name",
  "templateData": "..."
}
```

**Response:** Updated template object

### Delete Template

Delete a template.

**Endpoint:** `DELETE /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/templates/{template_id}`

### Revert Template

Revert a template to its state in the latest published version.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/templates/{template_id}:revert`

**Response:** Reverted template object

### Import from Gallery

Import a template from the Community Template Gallery.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}/templates:import_from_gallery`

**Request Body:**
```json
{
  "galleryReference": {
    "host": "tagmanager.google.com",
    "owner": "community",
    "repository": "templates",
    "signature": "..."
  }
}
```

**Response:** Imported template object

## Template Data

Templates are defined using template data, which includes:

- **Metadata** - Template name, description, icon
- **Parameters** - Input parameters for the template
- **Code** - JavaScript code that implements the template
- **Permissions** - Required permissions (e.g., access to cookies, storage)

## Common Use Cases

1. **Create custom tags** - Build custom tag implementations
2. **Create custom triggers** - Build custom trigger logic
3. **Create custom variables** - Build custom variable calculations
4. **Import community templates** - Use templates from the gallery
5. **Share templates** - Share custom templates across containers

## Implementation Notes

- Templates are workspace-specific
- Template IDs are numeric strings
- Templates can be complex and require knowledge of GTM's template API
- Templates are workspace-specific and must be published to go live
- Use `revert` to undo workspace changes
- Importing from gallery requires a gallery reference

## Example: List Templates

```typescript
const templates = await gtmClient.service.accounts.containers.workspaces.templates.list({
  parent: 'accounts/123456/containers/7890123/workspaces/1'
});
console.log(`Found ${templates.data.template?.length || 0} templates`);
```

