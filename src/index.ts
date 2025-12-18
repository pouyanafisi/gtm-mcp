#!/usr/bin/env node
/**
 * Google Tag Manager MCP Server
 * Main server file that handles MCP protocol communication
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { GTMClient } from './gtm-client.js';
import {
  createGA4Setup,
  createFacebookPixelSetup,
  createFormTracking,
  generateGTMWorkflow,
} from './gtm-components.js';

// Initialize GTM client
const gtmClient = new GTMClient();

// Create MCP server
const server = new Server(
  {
    name: 'gtm-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool schemas using Zod
const CreateTagSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  tag_name: z.string().describe('Name of the tag'),
  tag_type: z.string().describe('Tag type (e.g., "gaawc", "awct", "ua")'),
  parameters: z.record(z.any()).optional().describe('Tag parameters'),
});

const CreateTriggerSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  trigger_name: z.string().describe('Name of the trigger'),
  trigger_type: z.string().describe('Trigger type (e.g., "click", "pageview")'),
  conditions: z.array(z.any()).optional().describe('Trigger conditions'),
});

const CreateVariableSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  variable_name: z.string().describe('Name of the variable'),
  variable_type: z.string().describe('Variable type (e.g., "c", "v", "jsm")'),
  value: z.string().optional().describe('Variable value'),
});

const ListContainersSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
});

const GetContainerSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
});

const PublishVersionSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  name: z.string().optional().describe('Version name'),
  notes: z.string().optional().describe('Version notes'),
});

const CreateGA4SetupSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  measurement_id: z.string().describe('GA4 Measurement ID (e.g., G-XXXXXXXXXX)'),
});

const CreateFacebookPixelSetupSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  pixel_id: z.string().describe('Facebook Pixel ID'),
});

const CreateFormTrackingSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  form_selector: z
    .string()
    .describe('CSS selector for the form (e.g., #contact-form)'),
  event_name: z
    .string()
    .optional()
    .default('form_submit')
    .describe('Event name to fire'),
});

const GenerateWorkflowSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  workflow_type: z
    .enum(['ecommerce', 'lead_generation', 'content_site'])
    .describe('Type of workflow to generate'),
  ga4_measurement_id: z.string().optional().describe('GA4 Measurement ID (optional)'),
  facebook_pixel_id: z.string().optional().describe('Facebook Pixel ID (optional)'),
});

// Read operation schemas
const ListAccountsSchema = z.object({});

const GetAccountSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
});

const ListWorkspacesSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
});

const GetWorkspaceSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  workspace_id: z.string().describe('GTM workspace ID'),
});

const ListTagsSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const GetTagSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  tag_id: z.string().describe('GTM tag ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const ListTriggersSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const GetTriggerSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  trigger_id: z.string().describe('GTM trigger ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const ListVariablesSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const GetVariableSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  variable_id: z.string().describe('GTM variable ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

// Update operation schemas
const UpdateAccountSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  name: z.string().optional().describe('Account name'),
  share_data: z.boolean().optional().describe('Whether to share data anonymously'),
});

const UpdateContainerSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  name: z.string().optional().describe('Container name'),
  domain_name: z.array(z.string()).optional().describe('Domain names'),
  time_zone_country_id: z.string().optional().describe('Timezone country ID'),
  time_zone_id: z.string().optional().describe('Timezone ID'),
  notes: z.string().optional().describe('Container notes'),
});

const UpdateWorkspaceSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  workspace_id: z.string().describe('GTM workspace ID'),
  name: z.string().optional().describe('Workspace name'),
  description: z.string().optional().describe('Workspace description'),
});

const UpdateTagSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  tag_id: z.string().describe('GTM tag ID'),
  name: z.string().optional().describe('Tag name'),
  tag_type: z.string().optional().describe('Tag type'),
  parameters: z.record(z.any()).optional().describe('Tag parameters'),
  firing_trigger_id: z.array(z.string()).optional().describe('Firing trigger IDs'),
  blocking_trigger_id: z.array(z.string()).optional().describe('Blocking trigger IDs'),
  tag_firing_option: z.string().optional().describe('Tag firing option'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const UpdateTriggerSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  trigger_id: z.string().describe('GTM trigger ID'),
  name: z.string().optional().describe('Trigger name'),
  trigger_type: z.string().optional().describe('Trigger type'),
  conditions: z.array(z.any()).optional().describe('Trigger conditions'),
  wait_for_tags: z.boolean().optional().describe('Wait for tags'),
  wait_for_tags_timeout: z.number().optional().describe('Wait for tags timeout (ms)'),
  check_validation: z.boolean().optional().describe('Check validation'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const UpdateVariableSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  variable_id: z.string().describe('GTM variable ID'),
  name: z.string().optional().describe('Variable name'),
  variable_type: z.string().optional().describe('Variable type'),
  value: z.string().optional().describe('Variable value'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

// Delete operation schemas
const DeleteContainerSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
});

const DeleteWorkspaceSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  workspace_id: z.string().describe('GTM workspace ID'),
});

const DeleteTagSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  tag_id: z.string().describe('GTM tag ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const DeleteTriggerSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  trigger_id: z.string().describe('GTM trigger ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const DeleteVariableSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  variable_id: z.string().describe('GTM variable ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

// Revert operation schemas
const RevertTagSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  tag_id: z.string().describe('GTM tag ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const RevertTriggerSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  trigger_id: z.string().describe('GTM trigger ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const RevertVariableSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  variable_id: z.string().describe('GTM variable ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

// Container operation schemas
const CreateContainerSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  name: z.string().describe('Container name'),
  usage_context: z.array(z.string()).optional().describe('Usage contexts (web, android, ios, server)'),
  domain_name: z.array(z.string()).optional().describe('Domain names'),
  time_zone_country_id: z.string().optional().describe('Timezone country ID'),
  time_zone_id: z.string().optional().describe('Timezone ID'),
  notes: z.string().optional().describe('Container notes'),
});

const GetContainerSnippetSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
});

const LookupContainerSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  public_id: z.string().optional().describe('Public container ID (GTM-XXXXXXX)'),
  destination_id: z.string().optional().describe('Destination ID for server-side containers'),
});

const CombineContainersSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID (destination)'),
  source_container_id: z.string().describe('Source container ID to combine from'),
  allow_user_variable_conflict: z.boolean().optional().describe('Allow user variable conflicts'),
});

const MoveTagIdSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID (source)'),
  tag_id: z.string().describe('Tag ID to move'),
  destination_container_id: z.string().describe('Destination container ID'),
});

// Workspace operation schemas
const CreateWorkspaceSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  name: z.string().describe('Workspace name'),
  description: z.string().optional().describe('Workspace description'),
});

const GetWorkspaceStatusSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  workspace_id: z.string().describe('GTM workspace ID'),
});

const SyncWorkspaceSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  workspace_id: z.string().describe('GTM workspace ID'),
});

const ResolveConflictSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  workspace_id: z.string().describe('GTM workspace ID'),
  conflict_id: z.string().describe('Conflict ID'),
  change_type: z.enum(['KEEP', 'DELETE']).describe('Change type to resolve conflict'),
});

const BulkUpdateSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  workspace_id: z.string().describe('GTM workspace ID'),
  tag: z.array(z.any()).optional().describe('Tag updates'),
  trigger: z.array(z.any()).optional().describe('Trigger updates'),
  variable: z.array(z.any()).optional().describe('Variable updates'),
  folder: z.array(z.any()).optional().describe('Folder updates'),
});

// Folder operation schemas
const ListFoldersSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const GetFolderSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  folder_id: z.string().describe('GTM folder ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const CreateFolderSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  name: z.string().describe('Folder name'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const UpdateFolderSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  folder_id: z.string().describe('GTM folder ID'),
  name: z.string().describe('Folder name'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

// Built-in variable operation schemas
const ListBuiltInVariablesSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const CreateBuiltInVariableSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  type: z.string().describe('Built-in variable type (e.g., PAGE_URL, CLICK_ELEMENT)'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const DeleteBuiltInVariableSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  type: z.string().describe('Built-in variable type'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const RevertBuiltInVariablesSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

// Container version operation schemas
const ListVersionsSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
});

const GetVersionSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  version_id: z.string().describe('GTM version ID'),
});

// Additional folder operation schemas
const DeleteFolderSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  folder_id: z.string().describe('GTM folder ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const RevertFolderSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  folder_id: z.string().describe('GTM folder ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

// Additional container version operation schemas
const UpdateVersionSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  version_id: z.string().describe('GTM version ID'),
  name: z.string().optional().describe('Version name'),
  description: z.string().optional().describe('Version description'),
});

const DeleteVersionSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  version_id: z.string().describe('GTM version ID'),
});

const UndeleteVersionSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  version_id: z.string().describe('GTM version ID'),
});

const SetLatestVersionSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  version_id: z.string().describe('GTM version ID'),
});

const GetLiveVersionSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
});

// Container version header operation schemas
const ListVersionHeadersSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
});

const GetLatestVersionHeaderSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
});

// Workspace quick preview schema
const QuickPreviewSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  url: z.string().describe('URL to preview'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

// Additional folder operation schemas
const MoveEntitiesToFolderSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  folder_id: z.string().describe('GTM folder ID'),
  tag_ids: z.array(z.string()).optional().describe('Array of tag IDs to move'),
  trigger_ids: z.array(z.string()).optional().describe('Array of trigger IDs to move'),
  variable_ids: z.array(z.string()).optional().describe('Array of variable IDs to move'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const GetFolderEntitiesSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  folder_id: z.string().describe('GTM folder ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

// Environment operation schemas
const ListEnvironmentsSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
});

const GetEnvironmentSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  environment_id: z.string().describe('GTM environment ID'),
});

const CreateEnvironmentSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  name: z.string().describe('Environment name'),
  type: z.string().describe('Environment type (user, live, latest)'),
  description: z.string().optional().describe('Environment description'),
  url: z.string().optional().describe('Environment URL (for preview environments)'),
});

const UpdateEnvironmentSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  environment_id: z.string().describe('GTM environment ID'),
  name: z.string().optional().describe('Environment name'),
  description: z.string().optional().describe('Environment description'),
  url: z.string().optional().describe('Environment URL'),
});

const DeleteEnvironmentSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  environment_id: z.string().describe('GTM environment ID'),
});

const ReauthorizeEnvironmentSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  environment_id: z.string().describe('GTM environment ID'),
});

// User permission operation schemas
const ListUserPermissionsSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
});

const GetUserPermissionSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  permission_id: z.string().describe('GTM user permission ID'),
});

const CreateUserPermissionSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  email_address: z.string().describe('Email address of the user'),
  account_access_permission: z.string().describe('Account access permission (admin, user, noAccess)'),
  container_access: z
    .array(
      z.object({
        container_id: z.string(),
        permission: z.string(),
      })
    )
    .optional()
    .describe('Array of container access permissions'),
});

const UpdateUserPermissionSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  permission_id: z.string().describe('GTM user permission ID'),
  account_access_permission: z.string().optional().describe('Account access permission'),
  container_access: z
    .array(
      z.object({
        container_id: z.string(),
        permission: z.string(),
      })
    )
    .optional()
    .describe('Array of container access permissions'),
});

const DeleteUserPermissionSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  permission_id: z.string().describe('GTM user permission ID'),
});

// Client operation schemas (Server-side)
const ListClientsSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const GetClientSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  client_id: z.string().describe('GTM client ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const CreateClientSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  name: z.string().describe('Client name'),
  type: z.string().describe('Client type (e.g., GA4, UA, FIREBASE, CUSTOM)'),
  parameters: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
        type: z.string().optional(),
      })
    )
    .optional()
    .describe('Client parameters (configuration)'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const UpdateClientSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  client_id: z.string().describe('GTM client ID'),
  name: z.string().optional().describe('Client name'),
  parameters: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
        type: z.string().optional(),
      })
    )
    .optional()
    .describe('Client parameters'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const DeleteClientSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  client_id: z.string().describe('GTM client ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const RevertClientSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  client_id: z.string().describe('GTM client ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

// Google Tag Config operation schemas
const ListGtagConfigsSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const GetGtagConfigSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  config_id: z.string().describe('GTM Google Tag Config ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const CreateGtagConfigSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  tag_id: z.string().describe('Google Tag ID (e.g., G-XXXXXXXXXX)'),
  parameters: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
        type: z.string().optional(),
      })
    )
    .optional()
    .describe('Configuration parameters'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const UpdateGtagConfigSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  config_id: z.string().describe('GTM Google Tag Config ID'),
  tag_id: z.string().optional().describe('Google Tag ID'),
  parameters: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
        type: z.string().optional(),
      })
    )
    .optional()
    .describe('Configuration parameters'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const DeleteGtagConfigSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  config_id: z.string().describe('GTM Google Tag Config ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const RevertGtagConfigSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  config_id: z.string().describe('GTM Google Tag Config ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

// Template operation schemas
const ListTemplatesSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const GetTemplateSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  template_id: z.string().describe('GTM template ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const CreateTemplateSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  name: z.string().describe('Template name'),
  template_data: z.string().describe('Template data (JSON string)'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const UpdateTemplateSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  template_id: z.string().describe('GTM template ID'),
  name: z.string().optional().describe('Template name'),
  template_data: z.string().optional().describe('Template data (JSON string)'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const DeleteTemplateSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  template_id: z.string().describe('GTM template ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const RevertTemplateSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  template_id: z.string().describe('GTM template ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const ImportTemplateFromGallerySchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  gallery_reference: z
    .object({
      host: z.string(),
      owner: z.string(),
      repository: z.string(),
      signature: z.string(),
    })
    .describe('Gallery reference object'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

// Transformation operation schemas (Server-side)
const ListTransformationsSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const GetTransformationSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  transformation_id: z.string().describe('GTM transformation ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const CreateTransformationSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  name: z.string().describe('Transformation name'),
  type: z.string().describe('Transformation type (e.g., CUSTOM)'),
  parameters: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
        type: z.string().optional(),
      })
    )
    .optional()
    .describe('Transformation parameters'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const UpdateTransformationSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  transformation_id: z.string().describe('GTM transformation ID'),
  name: z.string().optional().describe('Transformation name'),
  parameters: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
        type: z.string().optional(),
      })
    )
    .optional()
    .describe('Transformation parameters'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const DeleteTransformationSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  transformation_id: z.string().describe('GTM transformation ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const RevertTransformationSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  transformation_id: z.string().describe('GTM transformation ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

// Zone operation schemas (Server-side)
const ListZonesSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

const GetZoneSchema = z.object({
  account_id: z.string().describe('GTM account ID'),
  container_id: z.string().describe('GTM container ID'),
  zone_id: z.string().describe('GTM zone ID'),
  workspace_id: z.string().optional().describe('GTM workspace ID (optional, uses default if not provided)'),
});

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_gtm_tag',
        description: 'Create a GTM tag in a container',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            tag_name: { type: 'string', description: 'Name of the tag' },
            tag_type: {
              type: 'string',
              description: 'Tag type (e.g., "gaawc", "awct", "ua")',
            },
            parameters: {
              type: 'object',
              description: 'Tag parameters',
            },
          },
          required: ['account_id', 'container_id', 'tag_name', 'tag_type'],
        },
      },
      {
        name: 'create_gtm_trigger',
        description: 'Create a GTM trigger',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            trigger_name: { type: 'string', description: 'Name of the trigger' },
            trigger_type: {
              type: 'string',
              description: 'Trigger type (e.g., "click", "pageview")',
            },
            conditions: {
              type: 'array',
              description: 'Trigger conditions',
            },
          },
          required: [
            'account_id',
            'container_id',
            'trigger_name',
            'trigger_type',
          ],
        },
      },
      {
        name: 'create_gtm_variable',
        description: 'Create a GTM variable',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            variable_name: { type: 'string', description: 'Name of the variable' },
            variable_type: {
              type: 'string',
              description: 'Variable type (e.g., "c", "v", "jsm")',
            },
            value: { type: 'string', description: 'Variable value' },
          },
          required: [
            'account_id',
            'container_id',
            'variable_name',
            'variable_type',
          ],
        },
      },
      {
        name: 'list_gtm_containers',
        description: 'List all GTM containers for an account',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
          },
          required: ['account_id'],
        },
      },
      {
        name: 'get_gtm_container',
        description: 'Get details of a GTM container',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
          },
          required: ['account_id', 'container_id'],
        },
      },
      {
        name: 'publish_gtm_version',
        description: 'Publish a GTM container version',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            name: { type: 'string', description: 'Version name' },
            notes: { type: 'string', description: 'Version notes' },
          },
          required: ['account_id', 'container_id'],
        },
      },
      {
        name: 'create_ga4_setup',
        description:
          'Create complete Google Analytics 4 setup with config tag and common events',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            measurement_id: {
              type: 'string',
              description: 'GA4 Measurement ID (e.g., G-XXXXXXXXXX)',
            },
          },
          required: ['account_id', 'container_id', 'measurement_id'],
        },
      },
      {
        name: 'create_facebook_pixel_setup',
        description: 'Create Facebook Pixel tracking setup',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            pixel_id: { type: 'string', description: 'Facebook Pixel ID' },
          },
          required: ['account_id', 'container_id', 'pixel_id'],
        },
      },
      {
        name: 'create_form_tracking',
        description: 'Create form submission tracking setup',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            form_selector: {
              type: 'string',
              description: 'CSS selector for the form (e.g., #contact-form)',
            },
            event_name: {
              type: 'string',
              description: 'Event name to fire',
              default: 'form_submit',
            },
          },
          required: ['account_id', 'container_id', 'form_selector'],
        },
      },
      {
        name: 'generate_gtm_workflow',
        description:
          'Generate complete workflows for different site types (ecommerce, lead_generation, content_site)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            workflow_type: {
              type: 'string',
              enum: ['ecommerce', 'lead_generation', 'content_site'],
              description: 'Type of workflow to generate',
            },
            ga4_measurement_id: {
              type: 'string',
              description: 'GA4 Measurement ID (optional)',
            },
            facebook_pixel_id: {
              type: 'string',
              description: 'Facebook Pixel ID (optional)',
            },
          },
          required: ['account_id', 'container_id', 'workflow_type'],
        },
      },
      // Read operations
      {
        name: 'list_gtm_accounts',
        description: 'List all GTM accounts accessible to the authenticated user',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'get_gtm_account',
        description: 'Get details of a GTM account',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
          },
          required: ['account_id'],
        },
      },
      {
        name: 'list_gtm_workspaces',
        description: 'List all workspaces in a container',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
          },
          required: ['account_id', 'container_id'],
        },
      },
      {
        name: 'get_gtm_workspace',
        description: 'Get details of a GTM workspace',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            workspace_id: { type: 'string', description: 'GTM workspace ID' },
          },
          required: ['account_id', 'container_id', 'workspace_id'],
        },
      },
      {
        name: 'list_gtm_tags',
        description: 'List all tags in a workspace',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id'],
        },
      },
      {
        name: 'get_gtm_tag',
        description: 'Get details of a GTM tag',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            tag_id: { type: 'string', description: 'GTM tag ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'tag_id'],
        },
      },
      {
        name: 'list_gtm_triggers',
        description: 'List all triggers in a workspace',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id'],
        },
      },
      {
        name: 'get_gtm_trigger',
        description: 'Get details of a GTM trigger',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            trigger_id: { type: 'string', description: 'GTM trigger ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'trigger_id'],
        },
      },
      {
        name: 'list_gtm_variables',
        description: 'List all variables in a workspace',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id'],
        },
      },
      {
        name: 'get_gtm_variable',
        description: 'Get details of a GTM variable',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            variable_id: { type: 'string', description: 'GTM variable ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'variable_id'],
        },
      },
      // Update operations
      {
        name: 'update_gtm_account',
        description: 'Update a GTM account',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            name: { type: 'string', description: 'Account name' },
            share_data: {
              type: 'boolean',
              description: 'Whether to share data anonymously',
            },
          },
          required: ['account_id'],
        },
      },
      {
        name: 'update_gtm_container',
        description: 'Update a GTM container',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            name: { type: 'string', description: 'Container name' },
            domain_name: {
              type: 'array',
              items: { type: 'string' },
              description: 'Domain names',
            },
            time_zone_country_id: { type: 'string', description: 'Timezone country ID' },
            time_zone_id: { type: 'string', description: 'Timezone ID' },
            notes: { type: 'string', description: 'Container notes' },
          },
          required: ['account_id', 'container_id'],
        },
      },
      {
        name: 'update_gtm_workspace',
        description: 'Update a GTM workspace',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            workspace_id: { type: 'string', description: 'GTM workspace ID' },
            name: { type: 'string', description: 'Workspace name' },
            description: { type: 'string', description: 'Workspace description' },
          },
          required: ['account_id', 'container_id', 'workspace_id'],
        },
      },
      {
        name: 'update_gtm_tag',
        description: 'Update a GTM tag',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            tag_id: { type: 'string', description: 'GTM tag ID' },
            name: { type: 'string', description: 'Tag name' },
            tag_type: { type: 'string', description: 'Tag type' },
            parameters: { type: 'object', description: 'Tag parameters' },
            firing_trigger_id: {
              type: 'array',
              items: { type: 'string' },
              description: 'Firing trigger IDs',
            },
            blocking_trigger_id: {
              type: 'array',
              items: { type: 'string' },
              description: 'Blocking trigger IDs',
            },
            tag_firing_option: { type: 'string', description: 'Tag firing option' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'tag_id'],
        },
      },
      {
        name: 'update_gtm_trigger',
        description: 'Update a GTM trigger',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            trigger_id: { type: 'string', description: 'GTM trigger ID' },
            name: { type: 'string', description: 'Trigger name' },
            trigger_type: { type: 'string', description: 'Trigger type' },
            conditions: { type: 'array', description: 'Trigger conditions' },
            wait_for_tags: { type: 'boolean', description: 'Wait for tags' },
            wait_for_tags_timeout: {
              type: 'number',
              description: 'Wait for tags timeout (ms)',
            },
            check_validation: { type: 'boolean', description: 'Check validation' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'trigger_id'],
        },
      },
      {
        name: 'update_gtm_variable',
        description: 'Update a GTM variable',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            variable_id: { type: 'string', description: 'GTM variable ID' },
            name: { type: 'string', description: 'Variable name' },
            variable_type: { type: 'string', description: 'Variable type' },
            value: { type: 'string', description: 'Variable value' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'variable_id'],
        },
      },
      // Delete operations
      {
        name: 'delete_gtm_container',
        description: 'Delete a GTM container',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
          },
          required: ['account_id', 'container_id'],
        },
      },
      {
        name: 'delete_gtm_workspace',
        description: 'Delete a GTM workspace',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            workspace_id: { type: 'string', description: 'GTM workspace ID' },
          },
          required: ['account_id', 'container_id', 'workspace_id'],
        },
      },
      {
        name: 'delete_gtm_tag',
        description: 'Delete a GTM tag',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            tag_id: { type: 'string', description: 'GTM tag ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'tag_id'],
        },
      },
      {
        name: 'delete_gtm_trigger',
        description: 'Delete a GTM trigger',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            trigger_id: { type: 'string', description: 'GTM trigger ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'trigger_id'],
        },
      },
      {
        name: 'delete_gtm_variable',
        description: 'Delete a GTM variable',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            variable_id: { type: 'string', description: 'GTM variable ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'variable_id'],
        },
      },
      // Revert operations
      {
        name: 'revert_gtm_tag',
        description: 'Revert a GTM tag to its state in the latest published version',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            tag_id: { type: 'string', description: 'GTM tag ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'tag_id'],
        },
      },
      {
        name: 'revert_gtm_trigger',
        description: 'Revert a GTM trigger to its state in the latest published version',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            trigger_id: { type: 'string', description: 'GTM trigger ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'trigger_id'],
        },
      },
      {
        name: 'revert_gtm_variable',
        description: 'Revert a GTM variable to its state in the latest published version',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            variable_id: { type: 'string', description: 'GTM variable ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'variable_id'],
        },
      },
      // Container operations
      {
        name: 'create_gtm_container',
        description: 'Create a new GTM container',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            name: { type: 'string', description: 'Container name' },
            usage_context: {
              type: 'array',
              items: { type: 'string' },
              description: 'Usage contexts (web, android, ios, server)',
            },
            domain_name: {
              type: 'array',
              items: { type: 'string' },
              description: 'Domain names',
            },
            time_zone_country_id: { type: 'string', description: 'Timezone country ID' },
            time_zone_id: { type: 'string', description: 'Timezone ID' },
            notes: { type: 'string', description: 'Container notes' },
          },
          required: ['account_id', 'name'],
        },
      },
      {
        name: 'get_gtm_container_snippet',
        description: 'Get the JavaScript snippet for a container',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
          },
          required: ['account_id', 'container_id'],
        },
      },
      {
        name: 'lookup_gtm_container',
        description: 'Look up a container by public ID',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            public_id: {
              type: 'string',
              description: 'Public container ID (GTM-XXXXXXX)',
            },
            destination_id: {
              type: 'string',
              description: 'Destination ID for server-side containers',
            },
          },
          required: ['account_id'],
        },
      },
      {
        name: 'combine_gtm_containers',
        description: 'Combine multiple containers',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID (destination)' },
            source_container_id: {
              type: 'string',
              description: 'Source container ID to combine from',
            },
            allow_user_variable_conflict: {
              type: 'boolean',
              description: 'Allow user variable conflicts',
            },
          },
          required: ['account_id', 'container_id', 'source_container_id'],
        },
      },
      {
        name: 'move_gtm_tag_id',
        description: 'Move a tag ID from one container to another',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID (source)' },
            tag_id: { type: 'string', description: 'Tag ID to move' },
            destination_container_id: {
              type: 'string',
              description: 'Destination container ID',
            },
          },
          required: ['account_id', 'container_id', 'tag_id', 'destination_container_id'],
        },
      },
      // Workspace operations
      {
        name: 'create_gtm_workspace',
        description: 'Create a new GTM workspace',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            name: { type: 'string', description: 'Workspace name' },
            description: { type: 'string', description: 'Workspace description' },
          },
          required: ['account_id', 'container_id', 'name'],
        },
      },
      {
        name: 'get_gtm_workspace_status',
        description: 'Get workspace status (changes and conflicts)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            workspace_id: { type: 'string', description: 'GTM workspace ID' },
          },
          required: ['account_id', 'container_id', 'workspace_id'],
        },
      },
      {
        name: 'sync_gtm_workspace',
        description: 'Sync workspace with latest container version',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            workspace_id: { type: 'string', description: 'GTM workspace ID' },
          },
          required: ['account_id', 'container_id', 'workspace_id'],
        },
      },
      {
        name: 'resolve_gtm_conflict',
        description: 'Resolve a merge conflict in workspace',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            workspace_id: { type: 'string', description: 'GTM workspace ID' },
            conflict_id: { type: 'string', description: 'Conflict ID' },
            change_type: {
              type: 'string',
              enum: ['KEEP', 'DELETE'],
              description: 'Change type to resolve conflict',
            },
          },
          required: ['account_id', 'container_id', 'workspace_id', 'conflict_id', 'change_type'],
        },
      },
      {
        name: 'bulk_update_gtm_workspace',
        description: 'Perform bulk updates to multiple entities in workspace',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            workspace_id: { type: 'string', description: 'GTM workspace ID' },
            tag: { type: 'array', description: 'Tag updates' },
            trigger: { type: 'array', description: 'Trigger updates' },
            variable: { type: 'array', description: 'Variable updates' },
            folder: { type: 'array', description: 'Folder updates' },
          },
          required: ['account_id', 'container_id', 'workspace_id'],
        },
      },
      // Folder operations
      {
        name: 'list_gtm_folders',
        description: 'List all folders in a workspace',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id'],
        },
      },
      {
        name: 'get_gtm_folder',
        description: 'Get details of a GTM folder',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            folder_id: { type: 'string', description: 'GTM folder ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'folder_id'],
        },
      },
      {
        name: 'create_gtm_folder',
        description: 'Create a new GTM folder',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            name: { type: 'string', description: 'Folder name' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'name'],
        },
      },
      {
        name: 'update_gtm_folder',
        description: 'Update a GTM folder',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            folder_id: { type: 'string', description: 'GTM folder ID' },
            name: { type: 'string', description: 'Folder name' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'folder_id', 'name'],
        },
      },
      // Built-in variable operations
      {
        name: 'list_gtm_built_in_variables',
        description: 'List all built-in variables in a workspace',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id'],
        },
      },
      {
        name: 'create_gtm_built_in_variable',
        description: 'Enable a built-in variable in workspace',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            type: {
              type: 'string',
              description: 'Built-in variable type (e.g., PAGE_URL, CLICK_ELEMENT)',
            },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'type'],
        },
      },
      {
        name: 'delete_gtm_built_in_variable',
        description: 'Disable a built-in variable in workspace',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            type: { type: 'string', description: 'Built-in variable type' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'type'],
        },
      },
      {
        name: 'revert_gtm_built_in_variables',
        description: 'Revert built-in variables to their state in the latest published version',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id'],
        },
      },
      // Container version operations
      {
        name: 'list_gtm_versions',
        description: 'List all versions of a container',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
          },
          required: ['account_id', 'container_id'],
        },
      },
      {
        name: 'get_gtm_version',
        description: 'Get version details with all entities',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            version_id: { type: 'string', description: 'GTM version ID' },
          },
          required: ['account_id', 'container_id', 'version_id'],
        },
      },
      // Additional folder operations
      {
        name: 'delete_gtm_folder',
        description: 'Delete a GTM folder (must be empty)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            folder_id: { type: 'string', description: 'GTM folder ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'folder_id'],
        },
      },
      {
        name: 'revert_gtm_folder',
        description: 'Revert a GTM folder to its state in the latest published version',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            folder_id: { type: 'string', description: 'GTM folder ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'folder_id'],
        },
      },
      // Additional container version operations
      {
        name: 'update_gtm_version',
        description: 'Update version metadata (name, description)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            version_id: { type: 'string', description: 'GTM version ID' },
            name: { type: 'string', description: 'Version name' },
            description: { type: 'string', description: 'Version description' },
          },
          required: ['account_id', 'container_id', 'version_id'],
        },
      },
      {
        name: 'delete_gtm_version',
        description: 'Delete a version (soft delete - can be undeleted)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            version_id: { type: 'string', description: 'GTM version ID' },
          },
          required: ['account_id', 'container_id', 'version_id'],
        },
      },
      {
        name: 'undelete_gtm_version',
        description: 'Restore a deleted version',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            version_id: { type: 'string', description: 'GTM version ID' },
          },
          required: ['account_id', 'container_id', 'version_id'],
        },
      },
      {
        name: 'set_latest_gtm_version',
        description: 'Set a version as the latest (for preview purposes)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            version_id: { type: 'string', description: 'GTM version ID' },
          },
          required: ['account_id', 'container_id', 'version_id'],
        },
      },
      {
        name: 'get_live_gtm_version',
        description: 'Get the currently live (published) version',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
          },
          required: ['account_id', 'container_id'],
        },
      },
      // Container version header operations
      {
        name: 'list_gtm_version_headers',
        description: 'List all version headers for a container (lightweight metadata)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
          },
          required: ['account_id', 'container_id'],
        },
      },
      {
        name: 'get_latest_gtm_version_header',
        description: 'Get the latest version header',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
          },
          required: ['account_id', 'container_id'],
        },
      },
      // Workspace quick preview
      {
        name: 'quick_preview_gtm_workspace',
        description: 'Create a quick preview URL for testing workspace changes',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            url: { type: 'string', description: 'URL to preview' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'url'],
        },
      },
      // Additional folder operations
      {
        name: 'move_entities_to_gtm_folder',
        description: 'Move tags, triggers, or variables into a folder',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            folder_id: { type: 'string', description: 'GTM folder ID' },
            tag_ids: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of tag IDs to move',
            },
            trigger_ids: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of trigger IDs to move',
            },
            variable_ids: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of variable IDs to move',
            },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'folder_id'],
        },
      },
      {
        name: 'get_gtm_folder_entities',
        description: 'List all entities (tags, triggers, variables) in a folder',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            folder_id: { type: 'string', description: 'GTM folder ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'folder_id'],
        },
      },
      // Environment operations
      {
        name: 'list_gtm_environments',
        description: 'List all environments for a container',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
          },
          required: ['account_id', 'container_id'],
        },
      },
      {
        name: 'get_gtm_environment',
        description: 'Get environment details',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            environment_id: { type: 'string', description: 'GTM environment ID' },
          },
          required: ['account_id', 'container_id', 'environment_id'],
        },
      },
      {
        name: 'create_gtm_environment',
        description: 'Create a new environment',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            name: { type: 'string', description: 'Environment name' },
            type: { type: 'string', description: 'Environment type (user, live, latest)' },
            description: { type: 'string', description: 'Environment description' },
            url: { type: 'string', description: 'Environment URL (for preview environments)' },
          },
          required: ['account_id', 'container_id', 'name', 'type'],
        },
      },
      {
        name: 'update_gtm_environment',
        description: 'Update an environment',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            environment_id: { type: 'string', description: 'GTM environment ID' },
            name: { type: 'string', description: 'Environment name' },
            description: { type: 'string', description: 'Environment description' },
            url: { type: 'string', description: 'Environment URL' },
          },
          required: ['account_id', 'container_id', 'environment_id'],
        },
      },
      {
        name: 'delete_gtm_environment',
        description: 'Delete an environment',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            environment_id: { type: 'string', description: 'GTM environment ID' },
          },
          required: ['account_id', 'container_id', 'environment_id'],
        },
      },
      {
        name: 'reauthorize_gtm_environment',
        description: 'Reauthorize an environment (regenerate authorization code)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            environment_id: { type: 'string', description: 'GTM environment ID' },
          },
          required: ['account_id', 'container_id', 'environment_id'],
        },
      },
      // User permission operations
      {
        name: 'list_gtm_user_permissions',
        description: 'List all user permissions for an account',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
          },
          required: ['account_id'],
        },
      },
      {
        name: 'get_gtm_user_permission',
        description: 'Get user permission details',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            permission_id: { type: 'string', description: 'GTM user permission ID' },
          },
          required: ['account_id', 'permission_id'],
        },
      },
      // Additional user permission operations
      {
        name: 'create_gtm_user_permission',
        description: 'Create a new user permission (grant access)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            email_address: { type: 'string', description: 'Email address of the user' },
            account_access_permission: {
              type: 'string',
              description: 'Account access permission (admin, user, noAccess)',
            },
            container_access: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  container_id: { type: 'string' },
                  permission: { type: 'string' },
                },
              },
              description: 'Array of container access permissions',
            },
          },
          required: ['account_id', 'email_address', 'account_access_permission'],
        },
      },
      {
        name: 'update_gtm_user_permission',
        description: 'Update a user permission',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            permission_id: { type: 'string', description: 'GTM user permission ID' },
            account_access_permission: {
              type: 'string',
              description: 'Account access permission',
            },
            container_access: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  container_id: { type: 'string' },
                  permission: { type: 'string' },
                },
              },
              description: 'Array of container access permissions',
            },
          },
          required: ['account_id', 'permission_id'],
        },
      },
      {
        name: 'delete_gtm_user_permission',
        description: 'Delete a user permission (revoke access)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            permission_id: { type: 'string', description: 'GTM user permission ID' },
          },
          required: ['account_id', 'permission_id'],
        },
      },
      // Client operations (Server-side)
      {
        name: 'list_gtm_clients',
        description: 'List all clients in a workspace (Server-side Tagging)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id'],
        },
      },
      {
        name: 'get_gtm_client',
        description: 'Get client details (Server-side Tagging)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            client_id: { type: 'string', description: 'GTM client ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'client_id'],
        },
      },
      {
        name: 'create_gtm_client',
        description: 'Create a new client (Server-side Tagging)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            name: { type: 'string', description: 'Client name' },
            type: { type: 'string', description: 'Client type (e.g., GA4, UA, FIREBASE, CUSTOM)' },
            parameters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  value: { type: 'string' },
                  type: { type: 'string' },
                },
              },
              description: 'Client parameters (configuration)',
            },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'name', 'type'],
        },
      },
      {
        name: 'update_gtm_client',
        description: 'Update a client (Server-side Tagging)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            client_id: { type: 'string', description: 'GTM client ID' },
            name: { type: 'string', description: 'Client name' },
            parameters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  value: { type: 'string' },
                  type: { type: 'string' },
                },
              },
              description: 'Client parameters',
            },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'client_id'],
        },
      },
      {
        name: 'delete_gtm_client',
        description: 'Delete a client (Server-side Tagging)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            client_id: { type: 'string', description: 'GTM client ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'client_id'],
        },
      },
      {
        name: 'revert_gtm_client',
        description: 'Revert a client to its state in the latest published version (Server-side Tagging)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            client_id: { type: 'string', description: 'GTM client ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'client_id'],
        },
      },
      // Google Tag Config operations
      {
        name: 'list_gtm_gtag_configs',
        description: 'List all Google Tag configs in a workspace',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id'],
        },
      },
      // Additional Google Tag Config operations
      {
        name: 'get_gtm_gtag_config',
        description: 'Get Google Tag config details',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            config_id: { type: 'string', description: 'GTM Google Tag Config ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'config_id'],
        },
      },
      {
        name: 'create_gtm_gtag_config',
        description: 'Create a new Google Tag config',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            tag_id: { type: 'string', description: 'Google Tag ID (e.g., G-XXXXXXXXXX)' },
            parameters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  value: { type: 'string' },
                  type: { type: 'string' },
                },
              },
              description: 'Configuration parameters',
            },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'tag_id'],
        },
      },
      {
        name: 'update_gtm_gtag_config',
        description: 'Update a Google Tag config',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            config_id: { type: 'string', description: 'GTM Google Tag Config ID' },
            tag_id: { type: 'string', description: 'Google Tag ID' },
            parameters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  value: { type: 'string' },
                  type: { type: 'string' },
                },
              },
              description: 'Configuration parameters',
            },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'config_id'],
        },
      },
      {
        name: 'delete_gtm_gtag_config',
        description: 'Delete a Google Tag config',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            config_id: { type: 'string', description: 'GTM Google Tag Config ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'config_id'],
        },
      },
      {
        name: 'revert_gtm_gtag_config',
        description: 'Revert a Google Tag config to its state in the latest published version',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            config_id: { type: 'string', description: 'GTM Google Tag Config ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'config_id'],
        },
      },
      // Template operations
      {
        name: 'list_gtm_templates',
        description: 'List all templates in a workspace',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id'],
        },
      },
      {
        name: 'get_gtm_template',
        description: 'Get template details',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            template_id: { type: 'string', description: 'GTM template ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'template_id'],
        },
      },
      {
        name: 'create_gtm_template',
        description: 'Create a new template',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            name: { type: 'string', description: 'Template name' },
            template_data: { type: 'string', description: 'Template data (JSON string)' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'name', 'template_data'],
        },
      },
      {
        name: 'update_gtm_template',
        description: 'Update a template',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            template_id: { type: 'string', description: 'GTM template ID' },
            name: { type: 'string', description: 'Template name' },
            template_data: { type: 'string', description: 'Template data (JSON string)' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'template_id'],
        },
      },
      {
        name: 'delete_gtm_template',
        description: 'Delete a template',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            template_id: { type: 'string', description: 'GTM template ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'template_id'],
        },
      },
      {
        name: 'revert_gtm_template',
        description: 'Revert a template to its state in the latest published version',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            template_id: { type: 'string', description: 'GTM template ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'template_id'],
        },
      },
      {
        name: 'import_gtm_template_from_gallery',
        description: 'Import a template from the Community Template Gallery',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            gallery_reference: {
              type: 'object',
              properties: {
                host: { type: 'string' },
                owner: { type: 'string' },
                repository: { type: 'string' },
                signature: { type: 'string' },
              },
              description: 'Gallery reference object',
            },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'gallery_reference'],
        },
      },
      // Transformation operations (Server-side)
      {
        name: 'list_gtm_transformations',
        description: 'List all transformations in a workspace (Server-side Tagging)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id'],
        },
      },
      {
        name: 'get_gtm_transformation',
        description: 'Get transformation details (Server-side Tagging)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            transformation_id: { type: 'string', description: 'GTM transformation ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'transformation_id'],
        },
      },
      {
        name: 'create_gtm_transformation',
        description: 'Create a new transformation (Server-side Tagging)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            name: { type: 'string', description: 'Transformation name' },
            type: { type: 'string', description: 'Transformation type (e.g., CUSTOM)' },
            parameters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  value: { type: 'string' },
                  type: { type: 'string' },
                },
              },
              description: 'Transformation parameters',
            },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'name', 'type'],
        },
      },
      {
        name: 'update_gtm_transformation',
        description: 'Update a transformation (Server-side Tagging)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            transformation_id: { type: 'string', description: 'GTM transformation ID' },
            name: { type: 'string', description: 'Transformation name' },
            parameters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  value: { type: 'string' },
                  type: { type: 'string' },
                },
              },
              description: 'Transformation parameters',
            },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'transformation_id'],
        },
      },
      {
        name: 'delete_gtm_transformation',
        description: 'Delete a transformation (Server-side Tagging)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            transformation_id: { type: 'string', description: 'GTM transformation ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'transformation_id'],
        },
      },
      {
        name: 'revert_gtm_transformation',
        description: 'Revert a transformation to its state in the latest published version (Server-side Tagging)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            transformation_id: { type: 'string', description: 'GTM transformation ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'transformation_id'],
        },
      },
      // Zone operations (Server-side)
      {
        name: 'list_gtm_zones',
        description: 'List all zones in a workspace (Server-side Tagging)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id'],
        },
      },
      {
        name: 'get_gtm_zone',
        description: 'Get zone details (Server-side Tagging)',
        inputSchema: {
          type: 'object',
          properties: {
            account_id: { type: 'string', description: 'GTM account ID' },
            container_id: { type: 'string', description: 'GTM container ID' },
            zone_id: { type: 'string', description: 'GTM zone ID' },
            workspace_id: {
              type: 'string',
              description: 'GTM workspace ID (optional, uses default if not provided)',
            },
          },
          required: ['account_id', 'container_id', 'zone_id'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Ensure client is authenticated
  if (!gtmClient['service']) {
    try {
      await gtmClient.authenticate();
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Authentication error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  try {
    switch (name) {
      case 'create_gtm_tag': {
        const params = CreateTagSchema.parse(args);
        const result = await gtmClient.createTag(
          params.account_id,
          params.container_id,
          params.tag_name,
          params.tag_type,
          params.parameters || {}
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_gtm_trigger': {
        const params = CreateTriggerSchema.parse(args);
        const result = await gtmClient.createTrigger(
          params.account_id,
          params.container_id,
          params.trigger_name,
          params.trigger_type,
          params.conditions || []
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_gtm_variable': {
        const params = CreateVariableSchema.parse(args);
        const result = await gtmClient.createVariable(
          params.account_id,
          params.container_id,
          params.variable_name,
          params.variable_type,
          params.value || ''
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'list_gtm_containers': {
        const params = ListContainersSchema.parse(args);
        const result = await gtmClient.listContainers(params.account_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_gtm_container': {
        const params = GetContainerSchema.parse(args);
        const result = await gtmClient.getContainer(
          params.account_id,
          params.container_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'publish_gtm_version': {
        const params = PublishVersionSchema.parse(args);
        const result = await gtmClient.publishVersion(
          params.account_id,
          params.container_id,
          params.name || 'Published via MCP',
          params.notes || ''
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_ga4_setup': {
        const params = CreateGA4SetupSchema.parse(args);
        const result = await createGA4Setup(
          gtmClient,
          params.account_id,
          params.container_id,
          params.measurement_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_facebook_pixel_setup': {
        const params = CreateFacebookPixelSetupSchema.parse(args);
        const result = await createFacebookPixelSetup(
          gtmClient,
          params.account_id,
          params.container_id,
          params.pixel_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_form_tracking': {
        const params = CreateFormTrackingSchema.parse(args);
        const result = await createFormTracking(
          gtmClient,
          params.account_id,
          params.container_id,
          params.form_selector,
          params.event_name
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'generate_gtm_workflow': {
        const params = GenerateWorkflowSchema.parse(args);
        const result = await generateGTMWorkflow(
          gtmClient,
          params.account_id,
          params.container_id,
          params.workflow_type,
          params.ga4_measurement_id,
          params.facebook_pixel_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Read operations
      case 'list_gtm_accounts': {
        const params = ListAccountsSchema.parse(args);
        const result = await gtmClient.listAccounts();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_gtm_account': {
        const params = GetAccountSchema.parse(args);
        const result = await gtmClient.getAccount(params.account_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'list_gtm_workspaces': {
        const params = ListWorkspacesSchema.parse(args);
        const result = await gtmClient.listWorkspaces(
          params.account_id,
          params.container_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_gtm_workspace': {
        const params = GetWorkspaceSchema.parse(args);
        const result = await gtmClient.getWorkspace(
          params.account_id,
          params.container_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'list_gtm_tags': {
        const params = ListTagsSchema.parse(args);
        const result = await gtmClient.listTags(
          params.account_id,
          params.container_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_gtm_tag': {
        const params = GetTagSchema.parse(args);
        const result = await gtmClient.getTag(
          params.account_id,
          params.container_id,
          params.tag_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'list_gtm_triggers': {
        const params = ListTriggersSchema.parse(args);
        const result = await gtmClient.listTriggers(
          params.account_id,
          params.container_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_gtm_trigger': {
        const params = GetTriggerSchema.parse(args);
        const result = await gtmClient.getTrigger(
          params.account_id,
          params.container_id,
          params.trigger_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'list_gtm_variables': {
        const params = ListVariablesSchema.parse(args);
        const result = await gtmClient.listVariables(
          params.account_id,
          params.container_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_gtm_variable': {
        const params = GetVariableSchema.parse(args);
        const result = await gtmClient.getVariable(
          params.account_id,
          params.container_id,
          params.variable_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Update operations
      case 'update_gtm_account': {
        const params = UpdateAccountSchema.parse(args);
        const result = await gtmClient.updateAccount(
          params.account_id,
          params.name,
          params.share_data
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'update_gtm_container': {
        const params = UpdateContainerSchema.parse(args);
        const result = await gtmClient.updateContainer(
          params.account_id,
          params.container_id,
          {
            name: params.name,
            domainName: params.domain_name,
            timeZoneCountryId: params.time_zone_country_id,
            timeZoneId: params.time_zone_id,
            notes: params.notes,
          }
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'update_gtm_workspace': {
        const params = UpdateWorkspaceSchema.parse(args);
        const result = await gtmClient.updateWorkspace(
          params.account_id,
          params.container_id,
          params.workspace_id,
          params.name,
          params.description
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'update_gtm_tag': {
        const params = UpdateTagSchema.parse(args);
        const result = await gtmClient.updateTag(
          params.account_id,
          params.container_id,
          params.tag_id,
          {
            name: params.name,
            type: params.tag_type,
            parameters: params.parameters,
            firingTriggerId: params.firing_trigger_id,
            blockingTriggerId: params.blocking_trigger_id,
            tagFiringOption: params.tag_firing_option,
          },
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'update_gtm_trigger': {
        const params = UpdateTriggerSchema.parse(args);
        const result = await gtmClient.updateTrigger(
          params.account_id,
          params.container_id,
          params.trigger_id,
          {
            name: params.name,
            type: params.trigger_type,
            conditions: params.conditions,
            waitForTags: params.wait_for_tags,
            waitForTagsTimeout: params.wait_for_tags_timeout,
            checkValidation: params.check_validation,
          },
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'update_gtm_variable': {
        const params = UpdateVariableSchema.parse(args);
        const result = await gtmClient.updateVariable(
          params.account_id,
          params.container_id,
          params.variable_id,
          {
            name: params.name,
            type: params.variable_type,
            value: params.value,
          },
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Delete operations
      case 'delete_gtm_container': {
        const params = DeleteContainerSchema.parse(args);
        const result = await gtmClient.deleteContainer(
          params.account_id,
          params.container_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'delete_gtm_workspace': {
        const params = DeleteWorkspaceSchema.parse(args);
        const result = await gtmClient.deleteWorkspace(
          params.account_id,
          params.container_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'delete_gtm_tag': {
        const params = DeleteTagSchema.parse(args);
        const result = await gtmClient.deleteTag(
          params.account_id,
          params.container_id,
          params.tag_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'delete_gtm_trigger': {
        const params = DeleteTriggerSchema.parse(args);
        const result = await gtmClient.deleteTrigger(
          params.account_id,
          params.container_id,
          params.trigger_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'delete_gtm_variable': {
        const params = DeleteVariableSchema.parse(args);
        const result = await gtmClient.deleteVariable(
          params.account_id,
          params.container_id,
          params.variable_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Revert operations
      case 'revert_gtm_tag': {
        const params = RevertTagSchema.parse(args);
        const result = await gtmClient.revertTag(
          params.account_id,
          params.container_id,
          params.tag_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'revert_gtm_trigger': {
        const params = RevertTriggerSchema.parse(args);
        const result = await gtmClient.revertTrigger(
          params.account_id,
          params.container_id,
          params.trigger_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'revert_gtm_variable': {
        const params = RevertVariableSchema.parse(args);
        const result = await gtmClient.revertVariable(
          params.account_id,
          params.container_id,
          params.variable_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Container operations
      case 'create_gtm_container': {
        const params = CreateContainerSchema.parse(args);
        const result = await gtmClient.createContainer(
          params.account_id,
          params.name,
          params.usage_context,
          params.domain_name,
          params.time_zone_country_id,
          params.time_zone_id,
          params.notes
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_gtm_container_snippet': {
        const params = GetContainerSnippetSchema.parse(args);
        const result = await gtmClient.getContainerSnippet(
          params.account_id,
          params.container_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'lookup_gtm_container': {
        const params = LookupContainerSchema.parse(args);
        const result = await gtmClient.lookupContainer(
          params.account_id,
          params.public_id,
          params.destination_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'combine_gtm_containers': {
        const params = CombineContainersSchema.parse(args);
        const result = await gtmClient.combineContainers(
          params.account_id,
          params.container_id,
          params.source_container_id,
          params.allow_user_variable_conflict
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'move_gtm_tag_id': {
        const params = MoveTagIdSchema.parse(args);
        const result = await gtmClient.moveTagId(
          params.account_id,
          params.container_id,
          params.tag_id,
          params.destination_container_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Workspace operations
      case 'create_gtm_workspace': {
        const params = CreateWorkspaceSchema.parse(args);
        const result = await gtmClient.createWorkspace(
          params.account_id,
          params.container_id,
          params.name,
          params.description
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_gtm_workspace_status': {
        const params = GetWorkspaceStatusSchema.parse(args);
        const result = await gtmClient.getWorkspaceStatus(
          params.account_id,
          params.container_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'sync_gtm_workspace': {
        const params = SyncWorkspaceSchema.parse(args);
        const result = await gtmClient.syncWorkspace(
          params.account_id,
          params.container_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'resolve_gtm_conflict': {
        const params = ResolveConflictSchema.parse(args);
        const result = await gtmClient.resolveConflict(
          params.account_id,
          params.container_id,
          params.workspace_id,
          params.conflict_id,
          params.change_type
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'bulk_update_gtm_workspace': {
        const params = BulkUpdateSchema.parse(args);
        const result = await gtmClient.bulkUpdate(
          params.account_id,
          params.container_id,
          params.workspace_id,
          {
            tag: params.tag,
            trigger: params.trigger,
            variable: params.variable,
            folder: params.folder,
          }
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Folder operations
      case 'list_gtm_folders': {
        const params = ListFoldersSchema.parse(args);
        const result = await gtmClient.listFolders(
          params.account_id,
          params.container_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_gtm_folder': {
        const params = GetFolderSchema.parse(args);
        const result = await gtmClient.getFolder(
          params.account_id,
          params.container_id,
          params.folder_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_gtm_folder': {
        const params = CreateFolderSchema.parse(args);
        const result = await gtmClient.createFolder(
          params.account_id,
          params.container_id,
          params.name,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'update_gtm_folder': {
        const params = UpdateFolderSchema.parse(args);
        const result = await gtmClient.updateFolder(
          params.account_id,
          params.container_id,
          params.folder_id,
          params.name,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Built-in variable operations
      case 'list_gtm_built_in_variables': {
        const params = ListBuiltInVariablesSchema.parse(args);
        const result = await gtmClient.listBuiltInVariables(
          params.account_id,
          params.container_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_gtm_built_in_variable': {
        const params = CreateBuiltInVariableSchema.parse(args);
        const result = await gtmClient.createBuiltInVariable(
          params.account_id,
          params.container_id,
          params.type,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'delete_gtm_built_in_variable': {
        const params = DeleteBuiltInVariableSchema.parse(args);
        const result = await gtmClient.deleteBuiltInVariable(
          params.account_id,
          params.container_id,
          params.type,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'revert_gtm_built_in_variables': {
        const params = RevertBuiltInVariablesSchema.parse(args);
        const result = await gtmClient.revertBuiltInVariables(
          params.account_id,
          params.container_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Container version operations
      case 'list_gtm_versions': {
        const params = ListVersionsSchema.parse(args);
        const result = await gtmClient.listVersions(
          params.account_id,
          params.container_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_gtm_version': {
        const params = GetVersionSchema.parse(args);
        const result = await gtmClient.getVersion(
          params.account_id,
          params.container_id,
          params.version_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Additional folder operations
      case 'delete_gtm_folder': {
        const params = DeleteFolderSchema.parse(args);
        const result = await gtmClient.deleteFolder(
          params.account_id,
          params.container_id,
          params.folder_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'revert_gtm_folder': {
        const params = RevertFolderSchema.parse(args);
        const result = await gtmClient.revertFolder(
          params.account_id,
          params.container_id,
          params.folder_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Additional container version operations
      case 'update_gtm_version': {
        const params = UpdateVersionSchema.parse(args);
        const result = await gtmClient.updateVersion(
          params.account_id,
          params.container_id,
          params.version_id,
          params.name,
          params.description
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'delete_gtm_version': {
        const params = DeleteVersionSchema.parse(args);
        const result = await gtmClient.deleteVersion(
          params.account_id,
          params.container_id,
          params.version_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'undelete_gtm_version': {
        const params = UndeleteVersionSchema.parse(args);
        const result = await gtmClient.undeleteVersion(
          params.account_id,
          params.container_id,
          params.version_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'set_latest_gtm_version': {
        const params = SetLatestVersionSchema.parse(args);
        const result = await gtmClient.setLatestVersion(
          params.account_id,
          params.container_id,
          params.version_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_live_gtm_version': {
        const params = GetLiveVersionSchema.parse(args);
        const result = await gtmClient.getLiveVersion(
          params.account_id,
          params.container_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Container version header operations
      case 'list_gtm_version_headers': {
        const params = ListVersionHeadersSchema.parse(args);
        const result = await gtmClient.listVersionHeaders(
          params.account_id,
          params.container_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_latest_gtm_version_header': {
        const params = GetLatestVersionHeaderSchema.parse(args);
        const result = await gtmClient.getLatestVersionHeader(
          params.account_id,
          params.container_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Workspace quick preview
      case 'quick_preview_gtm_workspace': {
        const params = QuickPreviewSchema.parse(args);
        const result = await gtmClient.quickPreview(
          params.account_id,
          params.container_id,
          params.url,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Additional folder operations
      case 'move_entities_to_gtm_folder': {
        const params = MoveEntitiesToFolderSchema.parse(args);
        const result = await gtmClient.moveEntitiesToFolder(
          params.account_id,
          params.container_id,
          params.folder_id,
          params.tag_ids,
          params.trigger_ids,
          params.variable_ids,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_gtm_folder_entities': {
        const params = GetFolderEntitiesSchema.parse(args);
        const result = await gtmClient.getFolderEntities(
          params.account_id,
          params.container_id,
          params.folder_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Environment operations
      case 'list_gtm_environments': {
        const params = ListEnvironmentsSchema.parse(args);
        const result = await gtmClient.listEnvironments(
          params.account_id,
          params.container_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_gtm_environment': {
        const params = GetEnvironmentSchema.parse(args);
        const result = await gtmClient.getEnvironment(
          params.account_id,
          params.container_id,
          params.environment_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_gtm_environment': {
        const params = CreateEnvironmentSchema.parse(args);
        const result = await gtmClient.createEnvironment(
          params.account_id,
          params.container_id,
          params.name,
          params.type,
          params.description,
          params.url
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'update_gtm_environment': {
        const params = UpdateEnvironmentSchema.parse(args);
        const result = await gtmClient.updateEnvironment(
          params.account_id,
          params.container_id,
          params.environment_id,
          params.name,
          params.description,
          params.url
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'delete_gtm_environment': {
        const params = DeleteEnvironmentSchema.parse(args);
        const result = await gtmClient.deleteEnvironment(
          params.account_id,
          params.container_id,
          params.environment_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'reauthorize_gtm_environment': {
        const params = ReauthorizeEnvironmentSchema.parse(args);
        const result = await gtmClient.reauthorizeEnvironment(
          params.account_id,
          params.container_id,
          params.environment_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // User permission operations
      case 'list_gtm_user_permissions': {
        const params = ListUserPermissionsSchema.parse(args);
        const result = await gtmClient.listUserPermissions(params.account_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_gtm_user_permission': {
        const params = GetUserPermissionSchema.parse(args);
        const result = await gtmClient.getUserPermission(
          params.account_id,
          params.permission_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Additional user permission operations
      case 'create_gtm_user_permission': {
        const params = CreateUserPermissionSchema.parse(args);
        const containerAccess = params.container_access?.map((ca) => ({
          containerId: ca.container_id,
          permission: ca.permission,
        }));
        const result = await gtmClient.createUserPermission(
          params.account_id,
          params.email_address,
          { permission: params.account_access_permission },
          containerAccess
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'update_gtm_user_permission': {
        const params = UpdateUserPermissionSchema.parse(args);
        const containerAccess = params.container_access?.map((ca) => ({
          containerId: ca.container_id,
          permission: ca.permission,
        }));
        const result = await gtmClient.updateUserPermission(
          params.account_id,
          params.permission_id,
          params.account_access_permission
            ? { permission: params.account_access_permission }
            : undefined,
          containerAccess
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'delete_gtm_user_permission': {
        const params = DeleteUserPermissionSchema.parse(args);
        const result = await gtmClient.deleteUserPermission(
          params.account_id,
          params.permission_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Client operations (Server-side)
      case 'list_gtm_clients': {
        const params = ListClientsSchema.parse(args);
        const result = await gtmClient.listClients(
          params.account_id,
          params.container_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_gtm_client': {
        const params = GetClientSchema.parse(args);
        const result = await gtmClient.getClient(
          params.account_id,
          params.container_id,
          params.client_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_gtm_client': {
        const params = CreateClientSchema.parse(args);
        const result = await gtmClient.createClient(
          params.account_id,
          params.container_id,
          params.name,
          params.type,
          params.parameters,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'update_gtm_client': {
        const params = UpdateClientSchema.parse(args);
        const result = await gtmClient.updateClient(
          params.account_id,
          params.container_id,
          params.client_id,
          params.name,
          params.parameters,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'delete_gtm_client': {
        const params = DeleteClientSchema.parse(args);
        const result = await gtmClient.deleteClient(
          params.account_id,
          params.container_id,
          params.client_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'revert_gtm_client': {
        const params = RevertClientSchema.parse(args);
        const result = await gtmClient.revertClient(
          params.account_id,
          params.container_id,
          params.client_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Google Tag Config operations
      case 'list_gtm_gtag_configs': {
        const params = ListGtagConfigsSchema.parse(args);
        const result = await gtmClient.listGtagConfigs(
          params.account_id,
          params.container_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Additional Google Tag Config operations
      case 'get_gtm_gtag_config': {
        const params = GetGtagConfigSchema.parse(args);
        const result = await gtmClient.getGtagConfig(
          params.account_id,
          params.container_id,
          params.config_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_gtm_gtag_config': {
        const params = CreateGtagConfigSchema.parse(args);
        const result = await gtmClient.createGtagConfig(
          params.account_id,
          params.container_id,
          params.tag_id,
          params.parameters,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'update_gtm_gtag_config': {
        const params = UpdateGtagConfigSchema.parse(args);
        const result = await gtmClient.updateGtagConfig(
          params.account_id,
          params.container_id,
          params.config_id,
          params.tag_id,
          params.parameters,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'delete_gtm_gtag_config': {
        const params = DeleteGtagConfigSchema.parse(args);
        const result = await gtmClient.deleteGtagConfig(
          params.account_id,
          params.container_id,
          params.config_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'revert_gtm_gtag_config': {
        const params = RevertGtagConfigSchema.parse(args);
        const result = await gtmClient.revertGtagConfig(
          params.account_id,
          params.container_id,
          params.config_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Template operations
      case 'list_gtm_templates': {
        const params = ListTemplatesSchema.parse(args);
        const result = await gtmClient.listTemplates(
          params.account_id,
          params.container_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_gtm_template': {
        const params = GetTemplateSchema.parse(args);
        const result = await gtmClient.getTemplate(
          params.account_id,
          params.container_id,
          params.template_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_gtm_template': {
        const params = CreateTemplateSchema.parse(args);
        const result = await gtmClient.createTemplate(
          params.account_id,
          params.container_id,
          params.name,
          params.template_data,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'update_gtm_template': {
        const params = UpdateTemplateSchema.parse(args);
        const result = await gtmClient.updateTemplate(
          params.account_id,
          params.container_id,
          params.template_id,
          params.name,
          params.template_data,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'delete_gtm_template': {
        const params = DeleteTemplateSchema.parse(args);
        const result = await gtmClient.deleteTemplate(
          params.account_id,
          params.container_id,
          params.template_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'revert_gtm_template': {
        const params = RevertTemplateSchema.parse(args);
        const result = await gtmClient.revertTemplate(
          params.account_id,
          params.container_id,
          params.template_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'import_gtm_template_from_gallery': {
        const params = ImportTemplateFromGallerySchema.parse(args);
        const result = await gtmClient.importTemplateFromGallery(
          params.account_id,
          params.container_id,
          params.gallery_reference,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Transformation operations (Server-side)
      case 'list_gtm_transformations': {
        const params = ListTransformationsSchema.parse(args);
        const result = await gtmClient.listTransformations(
          params.account_id,
          params.container_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_gtm_transformation': {
        const params = GetTransformationSchema.parse(args);
        const result = await gtmClient.getTransformation(
          params.account_id,
          params.container_id,
          params.transformation_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_gtm_transformation': {
        const params = CreateTransformationSchema.parse(args);
        const result = await gtmClient.createTransformation(
          params.account_id,
          params.container_id,
          params.name,
          params.type,
          params.parameters,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'update_gtm_transformation': {
        const params = UpdateTransformationSchema.parse(args);
        const result = await gtmClient.updateTransformation(
          params.account_id,
          params.container_id,
          params.transformation_id,
          params.name,
          params.parameters,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'delete_gtm_transformation': {
        const params = DeleteTransformationSchema.parse(args);
        const result = await gtmClient.deleteTransformation(
          params.account_id,
          params.container_id,
          params.transformation_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'revert_gtm_transformation': {
        const params = RevertTransformationSchema.parse(args);
        const result = await gtmClient.revertTransformation(
          params.account_id,
          params.container_id,
          params.transformation_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Zone operations (Server-side)
      case 'list_gtm_zones': {
        const params = ListZonesSchema.parse(args);
        const result = await gtmClient.listZones(
          params.account_id,
          params.container_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_gtm_zone': {
        const params = GetZoneSchema.parse(args);
        const result = await gtmClient.getZone(
          params.account_id,
          params.container_id,
          params.zone_id,
          params.workspace_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Main entry point
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('GTM MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});

