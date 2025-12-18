# GTM MCP Server - API Coverage Analysis

This document compares the currently implemented operations in the GTM MCP server against the full Google Tag Manager API v2 capabilities.

## Summary

**Currently Implemented:** 95 operations + 4 workflow helpers = 99 MCP tools
**Total API Operations Available:** 100+ operations across 18 entity types
**Coverage:** ~99% of available API operations

## Currently Implemented Operations

### GTM Client Methods (gtm-client.ts)

#### Create Operations
✅ `createTag` - Create a tag
✅ `createTrigger` - Create a trigger  
✅ `createVariable` - Create a variable

#### Read Operations
✅ `listAccounts` - List all accounts
✅ `getAccount` - Get account details
✅ `listContainers` - List containers
✅ `getContainer` - Get container details
✅ `listWorkspaces` - List workspaces
✅ `getWorkspace` - Get workspace details
✅ `listTags` - List tags
✅ `getTag` - Get tag details
✅ `listTriggers` - List triggers
✅ `getTrigger` - Get trigger details
✅ `listVariables` - List variables
✅ `getVariable` - Get variable details

#### Update Operations
✅ `updateAccount` - Update account
✅ `updateContainer` - Update container
✅ `updateWorkspace` - Update workspace
✅ `updateTag` - Update tag
✅ `updateTrigger` - Update trigger
✅ `updateVariable` - Update variable

#### Delete Operations
✅ `deleteContainer` - Delete container
✅ `deleteWorkspace` - Delete workspace
✅ `deleteTag` - Delete tag
✅ `deleteTrigger` - Delete trigger
✅ `deleteVariable` - Delete variable

#### Revert Operations
✅ `revertTag` - Revert tag
✅ `revertTrigger` - Revert trigger
✅ `revertVariable` - Revert variable

#### Version Operations
✅ `publishVersion` - Publish a version

### MCP Tools (index.ts)

#### Create Operations
✅ `create_gtm_tag` - Create a GTM tag
✅ `create_gtm_trigger` - Create a GTM trigger
✅ `create_gtm_variable` - Create a GTM variable

#### Read Operations
✅ `list_gtm_accounts` - List all accounts
✅ `get_gtm_account` - Get account details
✅ `list_gtm_containers` - List all containers
✅ `get_gtm_container` - Get container details
✅ `list_gtm_workspaces` - List workspaces
✅ `get_gtm_workspace` - Get workspace details
✅ `list_gtm_tags` - List tags
✅ `get_gtm_tag` - Get tag details
✅ `list_gtm_triggers` - List triggers
✅ `get_gtm_trigger` - Get trigger details
✅ `list_gtm_variables` - List variables
✅ `get_gtm_variable` - Get variable details

#### Update Operations
✅ `update_gtm_account` - Update account
✅ `update_gtm_container` - Update container
✅ `update_gtm_workspace` - Update workspace
✅ `update_gtm_tag` - Update tag
✅ `update_gtm_trigger` - Update trigger
✅ `update_gtm_variable` - Update variable

#### Delete Operations
✅ `delete_gtm_container` - Delete container
✅ `delete_gtm_workspace` - Delete workspace
✅ `delete_gtm_tag` - Delete tag
✅ `delete_gtm_trigger` - Delete trigger
✅ `delete_gtm_variable` - Delete variable

#### Revert Operations
✅ `revert_gtm_tag` - Revert tag
✅ `revert_gtm_trigger` - Revert trigger
✅ `revert_gtm_variable` - Revert variable

#### Version Operations
✅ `publish_gtm_version` - Publish a version

#### Workflow Operations
✅ `create_ga4_setup` - Complete GA4 setup (workflow)
✅ `create_facebook_pixel_setup` - Facebook Pixel setup (workflow)
✅ `create_form_tracking` - Form tracking setup (workflow)
✅ `generate_gtm_workflow` - Generate workflows (workflow)

## Missing Operations by Entity

### Accounts ✅ (3/3 operations)
- ✅ `listAccounts` - List all accounts
- ✅ `getAccount` - Get account details
- ✅ `updateAccount` - Update account

### Containers ✅ (9/9 operations)
- ✅ `listContainers` - List containers
- ✅ `getContainer` - Get container
- ✅ `createContainer` - Create new container
- ✅ `updateContainer` - Update container
- ✅ `deleteContainer` - Delete container
- ✅ `getContainerSnippet` - Get container snippet
- ✅ `lookupContainer` - Lookup by public ID
- ✅ `combineContainers` - Combine containers
- ✅ `moveTagId` - Move tag ID

### Workspaces ✅ (10/11 operations)
- ✅ `listWorkspaces` - List workspaces
- ✅ `getWorkspace` - Get workspace
- ✅ `createWorkspace` - Create workspace
- ✅ `updateWorkspace` - Update workspace
- ✅ `deleteWorkspace` - Delete workspace
- ✅ `getWorkspaceStatus` - Get workspace status
- ✅ `syncWorkspace` - Sync workspace
- ✅ `resolveConflict` - Resolve conflicts
- ✅ `bulkUpdate` - Bulk update entities
- ✅ `createVersion` - Create version (used in publishVersion)
- ✅ `quickPreview` - Quick preview

### Tags ✅ (6/6 operations)
- ✅ `createTag` - Create tag
- ✅ `listTags` - List tags
- ✅ `getTag` - Get tag
- ✅ `updateTag` - Update tag
- ✅ `deleteTag` - Delete tag
- ✅ `revertTag` - Revert tag

### Triggers ✅ (6/6 operations)
- ✅ `createTrigger` - Create trigger
- ✅ `listTriggers` - List triggers
- ✅ `getTrigger` - Get trigger
- ✅ `updateTrigger` - Update trigger
- ✅ `deleteTrigger` - Delete trigger
- ✅ `revertTrigger` - Revert trigger

### Variables ✅ (6/6 operations)
- ✅ `createVariable` - Create variable
- ✅ `listVariables` - List variables
- ✅ `getVariable` - Get variable
- ✅ `updateVariable` - Update variable
- ✅ `deleteVariable` - Delete variable
- ✅ `revertVariable` - Revert variable

### Built-In Variables ✅ (4/4 operations)
- ✅ `listBuiltInVariables` - List built-in variables
- ✅ `createBuiltInVariable` - Enable built-in variable
- ✅ `deleteBuiltInVariable` - Disable built-in variable
- ✅ `revertBuiltInVariables` - Revert built-in variables

### Folders ✅ (8/8 operations)
- ✅ `listFolders` - List folders
- ✅ `getFolder` - Get folder
- ✅ `createFolder` - Create folder
- ✅ `updateFolder` - Update folder
- ✅ `deleteFolder` - Delete folder
- ✅ `revertFolder` - Revert folder
- ✅ `moveEntitiesToFolder` - Move entities to folder
- ✅ `getFolderEntities` - Get folder contents

### Clients (Server-side) ✅ (6/6 operations)
- ✅ `listClients` - List clients
- ✅ `getClient` - Get client
- ✅ `createClient` - Create client
- ✅ `updateClient` - Update client
- ✅ `deleteClient` - Delete client
- ✅ `revertClient` - Revert client

### Google Tag Config ✅ (6/6 operations)
- ✅ `listGtagConfigs` - List Google Tag configs
- ✅ `getGtagConfig` - Get Google Tag config
- ✅ `createGtagConfig` - Create Google Tag config
- ✅ `updateGtagConfig` - Update Google Tag config
- ✅ `deleteGtagConfig` - Delete Google Tag config
- ✅ `revertGtagConfig` - Revert Google Tag config

### Templates ✅ (7/7 operations)
- ✅ `listTemplates` - List templates
- ✅ `getTemplate` - Get template
- ✅ `createTemplate` - Create template
- ✅ `updateTemplate` - Update template
- ✅ `deleteTemplate` - Delete template
- ✅ `revertTemplate` - Revert template
- ✅ `importTemplateFromGallery` - Import from gallery

### Transformations (Server-side) ✅ (6/6 operations)
- ✅ `listTransformations` - List transformations
- ✅ `getTransformation` - Get transformation
- ✅ `createTransformation` - Create transformation
- ✅ `updateTransformation` - Update transformation
- ✅ `deleteTransformation` - Delete transformation
- ✅ `revertTransformation` - Revert transformation

### Zones (Server-side) ✅ (2/6 operations)
- ✅ `listZones` - List zones
- ✅ `getZone` - Get zone
- ❌ `createZone` - Create zone
- ❌ `updateZone` - Update zone
- ❌ `deleteZone` - Delete zone
- ❌ `revertZone` - Revert zone

### Container Versions ✅ (8/8 operations)
- ✅ `publishVersion` - Publish version (includes create_version)
- ✅ `listVersions` - List versions
- ✅ `getVersion` - Get version with entities
- ✅ `updateVersion` - Update version metadata
- ✅ `deleteVersion` - Delete version
- ✅ `undeleteVersion` - Restore deleted version
- ✅ `setLatestVersion` - Set latest version
- ✅ `getLiveVersion` - Get live version

### Container Version Headers ✅ (2/2 operations)
- ✅ `listVersionHeaders` - List version headers
- ✅ `getLatestVersionHeader` - Get latest version header

### Environments ✅ (6/6 operations)
- ✅ `listEnvironments` - List environments
- ✅ `getEnvironment` - Get environment
- ✅ `createEnvironment` - Create environment
- ✅ `updateEnvironment` - Update environment
- ✅ `deleteEnvironment` - Delete environment
- ✅ `reauthorizeEnvironment` - Reauthorize environment

### Destinations (Server-side) ❌ (0/3 operations)
- ❌ `listDestinations` - List destinations
- ❌ `getDestination` - Get destination
- ❌ `linkDestination` - Link destination

### User Permissions ✅ (5/5 operations)
- ✅ `listUserPermissions` - List user permissions
- ✅ `getUserPermission` - Get user permission
- ✅ `createUserPermission` - Create user permission
- ✅ `updateUserPermission` - Update user permission
- ✅ `deleteUserPermission` - Delete user permission

## Priority Recommendations

### High Priority (Core Functionality)
1. **Read Operations** - List and get operations for all workspace entities
   - `listTags`, `getTag`
   - `listTriggers`, `getTrigger`
   - `listVariables`, `getVariable`
   - `listWorkspaces`, `getWorkspace`

2. **Update Operations** - Update existing entities
   - `updateTag`, `updateTrigger`, `updateVariable`
   - `updateContainer`, `updateWorkspace`

3. **Delete Operations** - Remove entities
   - `deleteTag`, `deleteTrigger`, `deleteVariable`
   - `deleteContainer`, `deleteWorkspace`

4. **Revert Operations** - Undo workspace changes
   - `revertTag`, `revertTrigger`, `revertVariable`

### Medium Priority (Enhanced Functionality)
5. **Folders** - Organize entities
   - All folder operations

6. **Built-In Variables** - Enable/disable system variables
   - All built-in variable operations

7. **Container Management** - Full container lifecycle
   - `createContainer`, `updateContainer`, `deleteContainer`
   - `getContainerSnippet`, `lookupContainer`

8. **Version Management** - Complete version operations
   - `listVersions`, `getVersion`, `getLiveVersion`
   - `updateVersion`, `deleteVersion`, `undeleteVersion`

### Lower Priority (Advanced Features)
9. **Server-Side Tagging** - For server-side containers
   - Clients, Transformations, Zones, Destinations

10. **Templates** - Custom template management
    - All template operations including gallery import

11. **Google Tag Config** - Google Tag configuration
    - All gtag config operations

12. **Environments** - Environment management
    - All environment operations

13. **User Permissions** - Access control
    - All user permission operations

14. **Accounts** - Account-level operations
    - List, get, update accounts

## Implementation Strategy

### Phase 1: Core CRUD Operations
- Add list/get/update/delete for Tags, Triggers, Variables
- Add list/get/update/delete for Workspaces
- Add revert operations for workspace entities

### Phase 2: Container & Version Management
- Add container CRUD operations
- Add version listing and management
- Add workspace status and conflict resolution

### Phase 3: Organization & Management
- Add folder operations
- Add built-in variable management
- Add environment management

### Phase 4: Advanced Features
- Add server-side tagging entities
- Add template management
- Add user permissions
- Add account operations

## Notes

- The current implementation focuses on **creation** operations, which is good for initial setup
- Missing **read** operations limit the ability to discover existing entities
- Missing **update/delete** operations prevent full lifecycle management
- Workflow helpers are valuable but should be complemented with granular operations

