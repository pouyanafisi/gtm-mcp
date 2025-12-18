# Supported Operations

Reference for all 99 GTM MCP server operations.

---

## Table of Contents

- [Create Operations](#create-operations)
- [Read Operations](#read-operations)
- [Update Operations](#update-operations)
- [Delete Operations](#delete-operations)
- [Revert Operations](#revert-operations)
- [Version Operations](#version-operations)
- [Workflow Operations](#workflow-operations)

---

## Create Operations

### `create_gtm_tag`

Create a GTM tag in a container.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `tag_name` (string, required): Name of the tag
- `tag_type` (string, required): Tag type (e.g., "gaawc", "awct", "ua", "html", "img")
- `parameters` (object, optional): Tag parameters (key-value pairs)

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "tag_name": "GA4 Configuration",
  "tag_type": "gaawc",
  "parameters": {
    "measurementIdOverride": "G-XXXXXXXXXX"
  }
}
```

**Common Tag Types:**
- `gaawc` - Google Analytics: GA4 Configuration
- `gaawe` - Google Analytics: GA4 Event
- `ua` - Universal Analytics (legacy)
- `html` - Custom HTML
- `img` - Custom Image
- `awct` - Google Ads Conversion Tracking

---

### `create_gtm_trigger`

Create a GTM trigger.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `trigger_name` (string, required): Name of the trigger
- `trigger_type` (string, required): Trigger type (e.g., "click", "pageview", "formSubmission")
- `conditions` (array, optional): Trigger conditions

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "trigger_name": "All Pages",
  "trigger_type": "pageview",
  "conditions": []
}
```

**Common Trigger Types:**
- `pageview` - Page view trigger
- `click` - Click trigger
- `formSubmission` - Form submission trigger
- `customEvent` - Custom event trigger
- `domReady` - DOM ready trigger
- `windowLoaded` - Window loaded trigger

---

### `create_gtm_variable`

Create a GTM variable.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `variable_name` (string, required): Name of the variable
- `variable_type` (string, required): Variable type (e.g., "c", "v", "jsm", "k")
- `value` (string, optional): Variable value

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "variable_name": "Site Name",
  "variable_type": "c",
  "value": "My Website"
}
```

**Common Variable Types:**
- `c` - Constant
- `v` - Data Layer Variable
- `jsm` - JavaScript Variable
- `k` - Auto-Event Variable
- `u` - URL Variable

---

## Read Operations

### `list_gtm_accounts`

List all GTM accounts accessible to the authenticated user.

**Parameters:**
- None

**Example:**
```json
{}
```

**Returns:** Array of account objects with `accountId`, `name`, `shareData`, etc.

---

### `get_gtm_account`

Get details of a GTM account.

**Parameters:**
- `account_id` (string, required): GTM account ID

**Example:**
```json
{
  "account_id": "123456"
}
```

**Returns:** Account object with details

---

### `list_gtm_containers`

List all GTM containers for an account.

**Parameters:**
- `account_id` (string, required): GTM account ID

**Example:**
```json
{
  "account_id": "123456"
}
```

**Returns:** Array of container objects

---

### `get_gtm_container`

Get details of a GTM container.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123"
}
```

**Returns:** Container object with details

---

### `list_gtm_workspaces`

List all workspaces in a container.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123"
}
```

**Returns:** Array of workspace objects

---

### `get_gtm_workspace`

Get details of a GTM workspace.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `workspace_id` (string, required): GTM workspace ID

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "workspace_id": "1"
}
```

**Returns:** Workspace object with details

---

### `list_gtm_tags`

List all tags in a workspace.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123"
}
```

**Returns:** Array of tag objects

---

### `get_gtm_tag`

Get details of a GTM tag.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `tag_id` (string, required): GTM tag ID
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "tag_id": "1"
}
```

**Returns:** Tag object with details

---

### `list_gtm_triggers`

List all triggers in a workspace.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123"
}
```

**Returns:** Array of trigger objects

---

### `get_gtm_trigger`

Get details of a GTM trigger.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `trigger_id` (string, required): GTM trigger ID
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "trigger_id": "1"
}
```

**Returns:** Trigger object with details

---

### `list_gtm_variables`

List all variables in a workspace.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123"
}
```

**Returns:** Array of variable objects

---

### `get_gtm_variable`

Get details of a GTM variable.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `variable_id` (string, required): GTM variable ID
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "variable_id": "1"
}
```

**Returns:** Variable object with details

---

## Update Operations

### `update_gtm_account`

Update a GTM account.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `name` (string, optional): Account name
- `share_data` (boolean, optional): Whether to share data anonymously

**Example:**
```json
{
  "account_id": "123456",
  "name": "Updated Account Name",
  "share_data": false
}
```

---

### `update_gtm_container`

Update a GTM container.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `name` (string, optional): Container name
- `domain_name` (array of strings, optional): Domain names
- `time_zone_country_id` (string, optional): Timezone country ID
- `time_zone_id` (string, optional): Timezone ID
- `notes` (string, optional): Container notes

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "name": "Updated Container Name",
  "domain_name": ["example.com", "www.example.com"]
}
```

---

### `update_gtm_workspace`

Update a GTM workspace.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `workspace_id` (string, required): GTM workspace ID
- `name` (string, optional): Workspace name
- `description` (string, optional): Workspace description

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "workspace_id": "1",
  "name": "Updated Workspace Name",
  "description": "Updated description"
}
```

---

### `update_gtm_tag`

Update a GTM tag.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `tag_id` (string, required): GTM tag ID
- `name` (string, optional): Tag name
- `tag_type` (string, optional): Tag type
- `parameters` (object, optional): Tag parameters
- `firing_trigger_id` (array of strings, optional): Firing trigger IDs
- `blocking_trigger_id` (array of strings, optional): Blocking trigger IDs
- `tag_firing_option` (string, optional): Tag firing option ("unlimited", "oncePerEvent", "oncePerLoad")
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "tag_id": "1",
  "name": "Updated Tag Name",
  "parameters": {
    "measurementIdOverride": "G-YYYYYYYYYY"
  }
}
```

---

### `update_gtm_trigger`

Update a GTM trigger.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `trigger_id` (string, required): GTM trigger ID
- `name` (string, optional): Trigger name
- `trigger_type` (string, optional): Trigger type
- `conditions` (array, optional): Trigger conditions
- `wait_for_tags` (boolean, optional): Wait for tags
- `wait_for_tags_timeout` (number, optional): Wait for tags timeout (milliseconds)
- `check_validation` (boolean, optional): Check validation
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "trigger_id": "1",
  "name": "Updated Trigger Name",
  "conditions": [
    {
      "type": "equals",
      "parameter": [
        {"key": "arg0", "value": "{{Page URL}}", "type": "template"},
        {"key": "arg1", "value": "example.com", "type": "template"}
      ]
    }
  ]
}
```

---

### `update_gtm_variable`

Update a GTM variable.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `variable_id` (string, required): GTM variable ID
- `name` (string, optional): Variable name
- `variable_type` (string, optional): Variable type
- `value` (string, optional): Variable value
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "variable_id": "1",
  "name": "Updated Variable Name",
  "value": "new-value"
}
```

---

## Delete Operations

### `delete_gtm_container`

Delete a GTM container.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123"
}
```

**Warning:** This operation is permanent and cannot be undone.

---

### `delete_gtm_workspace`

Delete a GTM workspace.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `workspace_id` (string, required): GTM workspace ID

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "workspace_id": "1"
}
```

**Note:** The default workspace cannot be deleted.

---

### `delete_gtm_tag`

Delete a GTM tag.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `tag_id` (string, required): GTM tag ID
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "tag_id": "1"
}
```

---

### `delete_gtm_trigger`

Delete a GTM trigger.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `trigger_id` (string, required): GTM trigger ID
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "trigger_id": "1"
}
```

---

### `delete_gtm_variable`

Delete a GTM variable.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `variable_id` (string, required): GTM variable ID
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "variable_id": "1"
}
```

---

## Revert Operations

### `revert_gtm_tag`

Revert a GTM tag to its state in the latest published version.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `tag_id` (string, required): GTM tag ID
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "tag_id": "1"
}
```

**Use Case:** Undo workspace changes to a tag, restoring it to the published version.

---

### `revert_gtm_trigger`

Revert a GTM trigger to its state in the latest published version.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `trigger_id` (string, required): GTM trigger ID
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "trigger_id": "1"
}
```

**Use Case:** Undo workspace changes to a trigger, restoring it to the published version.

---

### `revert_gtm_variable`

Revert a GTM variable to its state in the latest published version.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `variable_id` (string, required): GTM variable ID
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "variable_id": "1"
}
```

**Use Case:** Undo workspace changes to a variable, restoring it to the published version.

---

## Folder Operations

### `list_gtm_folders`

List all folders in a workspace.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123"
}
```

---

### `get_gtm_folder`

Get details of a GTM folder.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `folder_id` (string, required): GTM folder ID
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

---

### `create_gtm_folder`

Create a new GTM folder.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `name` (string, required): Folder name
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

---

### `update_gtm_folder`

Update a GTM folder.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `folder_id` (string, required): GTM folder ID
- `name` (string, required): Folder name
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

---

### `delete_gtm_folder`

Delete a GTM folder (must be empty).

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `folder_id` (string, required): GTM folder ID
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

---

### `revert_gtm_folder`

Revert a GTM folder to its state in the latest published version.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `folder_id` (string, required): GTM folder ID
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

---

### `move_entities_to_gtm_folder`

Move tags, triggers, or variables into a folder.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `folder_id` (string, required): GTM folder ID
- `tag_ids` (array of strings, optional): Array of tag IDs to move
- `trigger_ids` (array of strings, optional): Array of trigger IDs to move
- `variable_ids` (array of strings, optional): Array of variable IDs to move
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

---

### `get_gtm_folder_entities`

List all entities (tags, triggers, variables) in a folder.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `folder_id` (string, required): GTM folder ID
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

---

## Built-In Variable Operations

### `list_gtm_built_in_variables`

List all built-in variables in a workspace.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

---

### `create_gtm_built_in_variable`

Enable a built-in variable in workspace.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `type` (string, required): Built-in variable type (e.g., PAGE_URL, CLICK_ELEMENT)
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

---

### `delete_gtm_built_in_variable`

Disable a built-in variable in workspace.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `type` (string, required): Built-in variable type
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

---

### `revert_gtm_built_in_variables`

Revert built-in variables to their state in the latest published version.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

---

## Version Operations

### `publish_gtm_version`

Publish a GTM container version to make it live.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `name` (string, optional): Version name (default: "Published via MCP")
- `notes` (string, optional): Version notes

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "name": "Version 1.0",
  "notes": "Initial release with GA4 setup"
}
```

**Use Case:** After making changes in a workspace, publish them as a new version to make them live.

**Important:** This operation creates a new version from the workspace and publishes it immediately.

---

### `list_gtm_versions`

List all versions of a container.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID

---

### `get_gtm_version`

Get version details with all entities.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `version_id` (string, required): GTM version ID

---

### `update_gtm_version`

Update version metadata (name, description).

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `version_id` (string, required): GTM version ID
- `name` (string, optional): Version name
- `description` (string, optional): Version description

---

### `delete_gtm_version`

Delete a version (soft delete - can be undeleted).

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `version_id` (string, required): GTM version ID

---

### `undelete_gtm_version`

Restore a deleted version.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `version_id` (string, required): GTM version ID

---

### `set_latest_gtm_version`

Set a version as the latest (for preview purposes).

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `version_id` (string, required): GTM version ID

---

### `get_live_gtm_version`

Get the currently live (published) version.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID

---

## Version Header Operations

### `list_gtm_version_headers`

List all version headers for a container (lightweight metadata).

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID

---

### `get_latest_gtm_version_header`

Get the latest version header.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID

---

## Workspace Operations

### `quick_preview_gtm_workspace`

Create a quick preview URL for testing workspace changes.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `url` (string, required): URL to preview
- `workspace_id` (string, optional): GTM workspace ID (uses default if not provided)

---

## Workflow Operations

### `create_ga4_setup`

Create a complete Google Analytics 4 setup with configuration tag and common events.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `measurement_id` (string, required): GA4 Measurement ID (e.g., G-XXXXXXXXXX)

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "measurement_id": "G-XXXXXXXXXX"
}
```

**What it creates:**
- GA4 Configuration Tag (sends pageviews automatically)
- Page View Trigger (fires on all pages)
- Scroll Depth Event (tracks 90% scroll)
- Outbound Click Event (tracks external link clicks)
- File Download Event (tracks PDF, DOC, XLS downloads)

---

### `create_facebook_pixel_setup`

Create Facebook Pixel tracking setup.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `pixel_id` (string, required): Facebook Pixel ID

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "pixel_id": "123456789"
}
```

**What it creates:**
- Facebook Pixel Base Code tag
- Page View Trigger

---

### `create_form_tracking`

Create form submission tracking setup.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `form_selector` (string, required): CSS selector for the form (e.g., #contact-form)
- `event_name` (string, optional): Event name to fire (default: "form_submit")

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "form_selector": "#contact-form",
  "event_name": "form_submit"
}
```

**What it creates:**
- Form Submit Trigger (fires on form submission)
- Custom Event Tag (fires the specified event)

---

### `generate_gtm_workflow`

Generate complete workflows for different site types.

**Parameters:**
- `account_id` (string, required): GTM account ID
- `container_id` (string, required): GTM container ID
- `workflow_type` (string, required): Type of workflow - one of: "ecommerce", "lead_generation", "content_site"
- `ga4_measurement_id` (string, optional): GA4 Measurement ID
- `facebook_pixel_id` (string, optional): Facebook Pixel ID

**Example:**
```json
{
  "account_id": "123456",
  "container_id": "7890123",
  "workflow_type": "ecommerce",
  "ga4_measurement_id": "G-XXXXXXXXXX",
  "facebook_pixel_id": "123456789"
}
```

**Workflow Types:**

1. **ecommerce** - Enhanced ecommerce tracking
   - GA4 setup (if measurement ID provided)
   - Purchase event
   - Add to cart event
   - Remove from cart event
   - Begin checkout event

2. **lead_generation** - Lead generation tracking
   - GA4 setup (if measurement ID provided)
   - Form tracking (#contact-form)
   - CTA click tracking

3. **content_site** - Content site tracking
   - GA4 setup (if measurement ID provided)
   - Newsletter signup event
   - Social share event
   - Video play event
   - Article read event

---

## Operation Summary by Category

### Create Operations (7)
- `create_gtm_tag`
- `create_gtm_trigger`
- `create_gtm_variable`
- `create_gtm_container`
- `create_gtm_workspace`
- `create_gtm_folder`
- `create_gtm_built_in_variable`

### Read Operations (18)
- `list_gtm_accounts`
- `get_gtm_account`
- `list_gtm_containers`
- `get_gtm_container`
- `get_gtm_container_snippet`
- `lookup_gtm_container`
- `list_gtm_workspaces`
- `get_gtm_workspace`
- `get_gtm_workspace_status`
- `list_gtm_tags`
- `get_gtm_tag`
- `list_gtm_triggers`
- `get_gtm_trigger`
- `list_gtm_variables`
- `get_gtm_variable`
- `list_gtm_folders`
- `get_gtm_folder`
- `list_gtm_built_in_variables`
- `list_gtm_versions`
- `get_gtm_version`

### Update Operations (7)
- `update_gtm_account`
- `update_gtm_container`
- `update_gtm_workspace`
- `update_gtm_tag`
- `update_gtm_trigger`
- `update_gtm_variable`
- `update_gtm_folder`

### Delete Operations (7)
- `delete_gtm_container`
- `delete_gtm_workspace`
- `delete_gtm_tag`
- `delete_gtm_trigger`
- `delete_gtm_variable`
- `delete_gtm_built_in_variable`
- `delete_gtm_folder`

### Revert Operations (5)
- `revert_gtm_tag`
- `revert_gtm_trigger`
- `revert_gtm_variable`
- `revert_gtm_built_in_variables`
- `revert_gtm_folder`

### Container Operations (2)
- `combine_gtm_containers`
- `move_gtm_tag_id`

### Workspace Operations (4)
- `sync_gtm_workspace`
- `resolve_gtm_conflict`
- `bulk_update_gtm_workspace`
- `quick_preview_gtm_workspace`

### Version Operations (8)
- `publish_gtm_version`
- `list_gtm_versions`
- `get_gtm_version`
- `update_gtm_version`
- `delete_gtm_version`
- `undelete_gtm_version`
- `set_latest_gtm_version`
- `get_live_gtm_version`

### Version Header Operations (2)
- `list_gtm_version_headers`
- `get_latest_gtm_version_header`

### Folder Operations (8)
- `list_gtm_folders`
- `get_gtm_folder`
- `create_gtm_folder`
- `update_gtm_folder`
- `delete_gtm_folder`
- `revert_gtm_folder`
- `move_entities_to_gtm_folder`
- `get_gtm_folder_entities`

### Environment Operations (6)
- `list_gtm_environments`
- `get_gtm_environment`
- `create_gtm_environment`
- `update_gtm_environment`
- `delete_gtm_environment`
- `reauthorize_gtm_environment`

### User Permission Operations (5)
- `list_gtm_user_permissions`
- `get_gtm_user_permission`
- `create_gtm_user_permission`
- `update_gtm_user_permission`
- `delete_gtm_user_permission`

### Client Operations (6) - Server-side Tagging
- `list_gtm_clients`
- `get_gtm_client`
- `create_gtm_client`
- `update_gtm_client`
- `delete_gtm_client`
- `revert_gtm_client`

### Google Tag Config Operations (6)
- `list_gtm_gtag_configs`
- `get_gtm_gtag_config`
- `create_gtm_gtag_config`
- `update_gtm_gtag_config`
- `delete_gtm_gtag_config`
- `revert_gtm_gtag_config`

### Template Operations (5)
- `list_gtm_templates`
- `get_gtm_template`
- `create_gtm_template`
- `update_gtm_template`
- `delete_gtm_template`

### Workflow Operations (4)
- `create_ga4_setup`
- `create_facebook_pixel_setup`
- `create_form_tracking`
- `generate_gtm_workflow`

---

## Notes

- Authentication required (OAuth 2.0)
- Workspace ID optional (defaults to default workspace)
- Account/Container IDs are numeric strings (not GTM-XXXXXXX)
- Changes require publishing to go live
- Revert restores to published state
- Delete is permanent

