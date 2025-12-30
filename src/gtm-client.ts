/**
 * Google Tag Manager API Client
 * Handles authentication and API interactions with Google Tag Manager
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { tagmanager_v2 } from 'googleapis';
import { join } from 'path';
import { authorize } from './auth-helper.js';

export interface GTMClientConfig {
  credentialsPath?: string;
  tokenPath?: string;
}

export interface CreateTagParams {
  [key: string]: string | number | boolean;
}

export interface TriggerCondition {
  type: string;
  parameter: Array<{
    key: string;
    value: string;
    type: string;
  }>;
}

export class GTMClient {
  private service: tagmanager_v2.Tagmanager | null = null;
  private oauth2Client: OAuth2Client | null = null;
  private credentialsPath: string;
  private tokenPath: string;

  constructor(config: GTMClientConfig = {}) {
    this.credentialsPath =
      config.credentialsPath ||
      process.env.GTM_CREDENTIALS_FILE ||
      join(process.cwd(), 'credentials.json');
    this.tokenPath =
      config.tokenPath ||
      process.env.GTM_TOKEN_FILE ||
      join(process.cwd(), 'token.json');
  }

  /**
   * Authenticate with Google Tag Manager API
   */
  async authenticate(): Promise<void> {
    this.oauth2Client = await authorize(this.credentialsPath, this.tokenPath);

    // Build the service
    this.service = google.tagmanager({
      version: 'v2',
      auth: this.oauth2Client,
    });
  }

  /**
   * Get the default workspace ID for a container
   */
  private async getWorkspaceId(
    accountId: string,
    containerId: string
  ): Promise<string> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response = await this.service.accounts.containers.workspaces.list({
        parent: `accounts/${accountId}/containers/${containerId}`,
      });

      const workspaces = response.data.workspace || [];

      if (workspaces.length > 0) {
        return workspaces[0].workspaceId || '';
      }

      // Create a default workspace if none exists
      const createResponse =
        await this.service.accounts.containers.workspaces.create({
          parent: `accounts/${accountId}/containers/${containerId}`,
          requestBody: {
            name: 'Default Workspace',
          },
        });

      return createResponse.data.workspaceId || '';
    } catch (error: any) {
      throw new Error(`Failed to get workspace: ${error.message}`);
    }
  }

  /**
   * Create a GTM tag
   */
  async createTag(
    accountId: string,
    containerId: string,
    tagName: string,
    tagType: string,
    parameters: CreateTagParams = {}
  ): Promise<{ success: boolean; tag?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const workspaceId = await this.getWorkspaceId(accountId, containerId);

      // Build parameter list with proper types
      const paramList = Object.entries(parameters).map(([key, value]) => ({
        key,
        value: String(value),
        type: 'template' as const,
      }));

      const tagBody: tagmanager_v2.Schema$Tag = {
        name: tagName,
        type: tagType,
        parameter: paramList,
      };

      const response = await this.service.accounts.containers.workspaces.tags.create(
        {
          parent: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
          requestBody: tagBody,
        }
      );

      return { success: true, tag: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a GTM trigger
   */
  async createTrigger(
    accountId: string,
    containerId: string,
    triggerName: string,
    triggerType: string,
    conditions: TriggerCondition[] = []
  ): Promise<{ success: boolean; trigger?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const workspaceId = await this.getWorkspaceId(accountId, containerId);

      const triggerBody: tagmanager_v2.Schema$Trigger = {
        name: triggerName,
        type: triggerType,
        customEventFilter: conditions.length > 0 ? conditions : undefined,
      };

      const response =
        await this.service.accounts.containers.workspaces.triggers.create({
          parent: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
          requestBody: triggerBody,
        });

      return { success: true, trigger: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a GTM variable
   */
  async createVariable(
    accountId: string,
    containerId: string,
    variableName: string,
    variableType: string,
    value: string = ''
  ): Promise<{ success: boolean; variable?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const workspaceId = await this.getWorkspaceId(accountId, containerId);

      // Determine parameter key based on variable type
      let parameter: tagmanager_v2.Schema$Parameter[] | undefined;

      if (value) {
        if (variableType === 'v') {
          // Data Layer Variable: key is 'name'
          parameter = [{ key: 'name', value, type: 'template' }];
        } else if (variableType === 'c') {
          // Constant: key is 'value'
          parameter = [{ key: 'value', value, type: 'template' }];
        } else if (variableType === 'jsm') {
          // Custom JavaScript: key is 'javascript'
          parameter = [{ key: 'javascript', value, type: 'template' }];
        } else {
          // Other types: default to 'value'
          parameter = [{ key: 'value', value, type: 'template' }];
        }
      }

      const variableBody: tagmanager_v2.Schema$Variable = {
        name: variableName,
        type: variableType,
        parameter,
      };

      const response =
        await this.service.accounts.containers.workspaces.variables.create({
          parent: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
          requestBody: variableBody,
        });

      return { success: true, variable: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List all containers for an account
   */
  async listContainers(
    accountId: string
  ): Promise<{ success: boolean; containers?: any[]; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response = await this.service.accounts.containers.list({
        parent: `accounts/${accountId}`,
      });

      return {
        success: true,
        containers: response.data.container || [],
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get container details
   */
  async getContainer(
    accountId: string,
    containerId: string
  ): Promise<{ success: boolean; container?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response = await this.service.accounts.containers.get({
        path: `accounts/${accountId}/containers/${containerId}`,
      });

      return { success: true, container: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new container
   */
  async createContainer(
    accountId: string,
    name: string,
    usageContext: string[] = ['web'],
    domainName?: string[],
    timeZoneCountryId?: string,
    timeZoneId?: string,
    notes?: string
  ): Promise<{ success: boolean; container?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const containerBody: tagmanager_v2.Schema$Container = {
        name,
        usageContext,
        ...(domainName && { domainName }),
        ...(timeZoneCountryId && { timeZoneCountryId }),
        ...(timeZoneId && { timeZoneId }),
        ...(notes && { notes }),
      };

      const response = await this.service.accounts.containers.create({
        parent: `accounts/${accountId}`,
        requestBody: containerBody,
      });

      return { success: true, container: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get container snippet
   */
  async getContainerSnippet(
    accountId: string,
    containerId: string
  ): Promise<{ success: boolean; snippet?: string; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response = await this.service.accounts.containers.snippet({
        path: `accounts/${accountId}/containers/${containerId}`,
      });

      return { success: true, snippet: response.data.snippet || undefined };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Lookup container by public ID
   */
  async lookupContainer(
    accountId: string,
    publicId?: string,
    destinationId?: string
  ): Promise<{ success: boolean; container?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const params: any = {
        parent: `accounts/${accountId}`,
      };
      if (publicId) params.publicId = publicId;
      if (destinationId) params.destinationId = destinationId;

      const response = await this.service.accounts.containers.lookup(params);

      return { success: true, container: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Combine containers
   */
  async combineContainers(
    accountId: string,
    containerId: string,
    sourceContainerId: string,
    allowUserVariableConflict?: boolean
  ): Promise<{ success: boolean; container?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response = await (this.service.accounts.containers as any).combine({
        path: `accounts/${accountId}/containers/${containerId}`,
        requestBody: {
          sourceContainerId,
          allowUserVariableConflict,
        },
      });

      return { success: true, container: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Move tag ID from one container to another
   */
  async moveTagId(
    accountId: string,
    containerId: string,
    tagId: string,
    destinationContainerId: string
  ): Promise<{ success: boolean; container?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response = await (this.service.accounts.containers as any).move_tag_id({
        path: `accounts/${accountId}/containers/${containerId}`,
        requestBody: {
          tagId,
          destinationContainerId,
        },
      });

      return { success: true, container: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Publish a container version
   */
  async publishVersion(
    accountId: string,
    containerId: string,
    name: string = 'Published via MCP',
    notes: string = ''
  ): Promise<{ success: boolean; version?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const workspaceId = await this.getWorkspaceId(accountId, containerId);
      const workspacePath = `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`;

      // Create a new version from the workspace
      const versionResponse =
        await this.service.accounts.containers.workspaces.create_version({
          path: workspacePath,
          requestBody: { name, notes },
        });

      const containerVersion = versionResponse.data.containerVersion;
      const versionPath = containerVersion?.path;

      if (!versionPath) {
        return {
          success: false,
          error: 'Could not extract version path from response',
        };
      }

      // Publish the version
      const published = await this.service.accounts.containers.versions.publish({
        path: versionPath,
      });

      return { success: true, version: published.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== READ OPERATIONS ====================

  /**
   * List all accounts
   */
  async listAccounts(): Promise<{
    success: boolean;
    accounts?: any[];
    error?: string;
  }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response = await this.service.accounts.list();
      return {
        success: true,
        accounts: response.data.account || [],
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get account details
   */
  async getAccount(
    accountId: string
  ): Promise<{ success: boolean; account?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response = await this.service.accounts.get({
        path: `accounts/${accountId}`,
      });
      return { success: true, account: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List all workspaces in a container
   */
  async listWorkspaces(
    accountId: string,
    containerId: string
  ): Promise<{ success: boolean; workspaces?: any[]; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response = await this.service.accounts.containers.workspaces.list({
        parent: `accounts/${accountId}/containers/${containerId}`,
      });
      return {
        success: true,
        workspaces: response.data.workspace || [],
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get workspace details
   */
  async getWorkspace(
    accountId: string,
    containerId: string,
    workspaceId: string
  ): Promise<{ success: boolean; workspace?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response = await this.service.accounts.containers.workspaces.get({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
      });
      return { success: true, workspace: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new workspace
   */
  async createWorkspace(
    accountId: string,
    containerId: string,
    name: string,
    description?: string
  ): Promise<{ success: boolean; workspace?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const workspaceBody: tagmanager_v2.Schema$Workspace = {
        name,
        ...(description && { description }),
      };

      const response =
        await this.service.accounts.containers.workspaces.create({
          parent: `accounts/${accountId}/containers/${containerId}`,
          requestBody: workspaceBody,
        });

      return { success: true, workspace: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get workspace status (changes and conflicts)
   */
  async getWorkspaceStatus(
    accountId: string,
    containerId: string,
    workspaceId: string
  ): Promise<{ success: boolean; status?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response =
        await this.service.accounts.containers.workspaces.getStatus({
          path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
        });

      return { success: true, status: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync workspace with latest container version
   */
  async syncWorkspace(
    accountId: string,
    containerId: string,
    workspaceId: string
  ): Promise<{ success: boolean; syncResult?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response =
        await this.service.accounts.containers.workspaces.sync({
          path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
        });

      return { success: true, syncResult: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Resolve a merge conflict in workspace
   */
  async resolveConflict(
    accountId: string,
    containerId: string,
    workspaceId: string,
    conflictId: string,
    changeType: 'KEEP' | 'DELETE'
  ): Promise<{ success: boolean; conflict?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response = await (this.service.accounts.containers.workspaces as any).resolve_conflict({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
        requestBody: {
          conflictId,
          changeType,
        },
      });

      return { success: true, conflict: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Bulk update entities in workspace
   */
  async bulkUpdate(
    accountId: string,
    containerId: string,
    workspaceId: string,
    updates: {
      tag?: any[];
      trigger?: any[];
      variable?: any[];
      folder?: any[];
    }
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const requestBody: any = {};
      if (updates.tag) requestBody.tag = updates.tag;
      if (updates.trigger) requestBody.trigger = updates.trigger;
      if (updates.variable) requestBody.variable = updates.variable;
      if (updates.folder) requestBody.folder = updates.folder;

      // Note: bulk_update might not be available in the API client
      // Using the method directly with any type
      const workspacePath = `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`;
      const response = await (this.service.accounts.containers.workspaces as any).bulk_update({
        path: workspacePath,
        requestBody,
      });

      return { success: true, result: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List all tags in a workspace
   */
  async listTags(
    accountId: string,
    containerId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; tags?: any[]; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response = await this.service.accounts.containers.workspaces.tags.list(
        {
          parent: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}`,
        }
      );
      return {
        success: true,
        tags: response.data.tag || [],
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get tag details
   */
  async getTag(
    accountId: string,
    containerId: string,
    tagId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; tag?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response = await this.service.accounts.containers.workspaces.tags.get(
        {
          path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/tags/${tagId}`,
        }
      );
      return { success: true, tag: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List all triggers in a workspace
   */
  async listTriggers(
    accountId: string,
    containerId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; triggers?: any[]; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response =
        await this.service.accounts.containers.workspaces.triggers.list({
          parent: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}`,
        });
      return {
        success: true,
        triggers: response.data.trigger || [],
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get trigger details
   */
  async getTrigger(
    accountId: string,
    containerId: string,
    triggerId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; trigger?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response =
        await this.service.accounts.containers.workspaces.triggers.get({
          path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/triggers/${triggerId}`,
        });
      return { success: true, trigger: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List all variables in a workspace
   */
  async listVariables(
    accountId: string,
    containerId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; variables?: any[]; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response =
        await this.service.accounts.containers.workspaces.variables.list({
          parent: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}`,
        });
      return {
        success: true,
        variables: response.data.variable || [],
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get variable details
   */
  async getVariable(
    accountId: string,
    containerId: string,
    variableId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; variable?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response =
        await this.service.accounts.containers.workspaces.variables.get({
          path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/variables/${variableId}`,
        });
      return { success: true, variable: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== UPDATE OPERATIONS ====================

  /**
   * Update an account
   */
  async updateAccount(
    accountId: string,
    name?: string,
    shareData?: boolean
  ): Promise<{ success: boolean; account?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      // First get the account to preserve fingerprint
      const current = await this.service.accounts.get({
        path: `accounts/${accountId}`,
      });

      const updateBody: tagmanager_v2.Schema$Account = {
        ...current.data,
        ...(name !== undefined && { name }),
        ...(shareData !== undefined && { shareData }),
      };

      const response = await this.service.accounts.update({
        path: `accounts/${accountId}`,
        requestBody: updateBody,
      });
      return { success: true, account: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a container
   */
  async updateContainer(
    accountId: string,
    containerId: string,
    updates: {
      name?: string;
      domainName?: string[];
      timeZoneCountryId?: string;
      timeZoneId?: string;
      notes?: string;
    }
  ): Promise<{ success: boolean; container?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      // First get the container to preserve fingerprint
      const current = await this.service.accounts.containers.get({
        path: `accounts/${accountId}/containers/${containerId}`,
      });

      const updateBody: tagmanager_v2.Schema$Container = {
        ...current.data,
        ...updates,
      };

      const response = await this.service.accounts.containers.update({
        path: `accounts/${accountId}/containers/${containerId}`,
        requestBody: updateBody,
      });
      return { success: true, container: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a workspace
   */
  async updateWorkspace(
    accountId: string,
    containerId: string,
    workspaceId: string,
    name?: string,
    description?: string
  ): Promise<{ success: boolean; workspace?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      // First get the workspace to preserve fingerprint
      const current = await this.service.accounts.containers.workspaces.get({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
      });

      const updateBody: tagmanager_v2.Schema$Workspace = {
        ...current.data,
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      };

      const response = await this.service.accounts.containers.workspaces.update(
        {
          path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
          requestBody: updateBody,
        }
      );
      return { success: true, workspace: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a tag
   */
  async updateTag(
    accountId: string,
    containerId: string,
    tagId: string,
    updates: {
      name?: string;
      type?: string;
      parameters?: CreateTagParams;
      firingTriggerId?: string[];
      blockingTriggerId?: string[];
      tagFiringOption?: string;
    },
    workspaceId?: string
  ): Promise<{ success: boolean; tag?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));

      // First get the tag to preserve fingerprint
      const current = await this.service.accounts.containers.workspaces.tags.get(
        {
          path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/tags/${tagId}`,
        }
      );

      const updateBody: tagmanager_v2.Schema$Tag = {
        ...current.data,
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.type !== undefined && { type: updates.type }),
        ...(updates.firingTriggerId !== undefined && {
          firingTriggerId: updates.firingTriggerId,
        }),
        ...(updates.blockingTriggerId !== undefined && {
          blockingTriggerId: updates.blockingTriggerId,
        }),
        ...(updates.tagFiringOption !== undefined && {
          tagFiringOption: updates.tagFiringOption,
        }),
      };

      // Update parameters if provided
      if (updates.parameters) {
        updateBody.parameter = Object.entries(updates.parameters).map(
          ([key, value]) => ({
            key,
            value: String(value),
            type: 'template' as const,
          })
        );
      }

      const response = await this.service.accounts.containers.workspaces.tags.update(
        {
          path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/tags/${tagId}`,
          requestBody: updateBody,
        }
      );
      return { success: true, tag: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a trigger
   */
  async updateTrigger(
    accountId: string,
    containerId: string,
    triggerId: string,
    updates: {
      name?: string;
      type?: string;
      conditions?: TriggerCondition[];
      waitForTags?: boolean;
      waitForTagsTimeout?: number;
      checkValidation?: boolean;
    },
    workspaceId?: string
  ): Promise<{ success: boolean; trigger?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));

      // First get the trigger to preserve fingerprint
      const current =
        await this.service.accounts.containers.workspaces.triggers.get({
          path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/triggers/${triggerId}`,
        });

      const updateBody: any = {
        ...current.data,
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.type !== undefined && { type: updates.type }),
      };

      // Handle optional properties
      if (updates.waitForTags !== undefined) {
        updateBody.waitForTags = updates.waitForTags;
      }
      if (updates.waitForTagsTimeout !== undefined) {
        updateBody.waitForTagsTimeout = updates.waitForTagsTimeout;
      }
      if (updates.checkValidation !== undefined) {
        updateBody.checkValidation = updates.checkValidation;
      }

      // Update conditions if provided
      if (updates.conditions !== undefined) {
        updateBody.customEventFilter =
          updates.conditions.length > 0 ? updates.conditions : undefined;
      }

      const response =
        await this.service.accounts.containers.workspaces.triggers.update({
          path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/triggers/${triggerId}`,
          requestBody: updateBody,
        });
      return { success: true, trigger: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a variable
   */
  async updateVariable(
    accountId: string,
    containerId: string,
    variableId: string,
    updates: {
      name?: string;
      type?: string;
      value?: string;
    },
    workspaceId?: string
  ): Promise<{ success: boolean; variable?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));

      // First get the variable to preserve fingerprint
      const current =
        await this.service.accounts.containers.workspaces.variables.get({
          path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/variables/${variableId}`,
        });

      const updateBody: tagmanager_v2.Schema$Variable = {
        ...current.data,
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.type !== undefined && { type: updates.type }),
      };

      // Update value if provided
      if (updates.value !== undefined) {
        updateBody.parameter = updates.value
          ? [{ key: 'value', value: updates.value, type: 'template' }]
          : undefined;
      }

      const response =
        await this.service.accounts.containers.workspaces.variables.update({
          path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/variables/${variableId}`,
          requestBody: updateBody,
        });
      return { success: true, variable: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== DELETE OPERATIONS ====================

  /**
   * Delete a container
   */
  async deleteContainer(
    accountId: string,
    containerId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      await this.service.accounts.containers.delete({
        path: `accounts/${accountId}/containers/${containerId}`,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a workspace
   */
  async deleteWorkspace(
    accountId: string,
    containerId: string,
    workspaceId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      await this.service.accounts.containers.workspaces.delete({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a tag
   */
  async deleteTag(
    accountId: string,
    containerId: string,
    tagId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      await this.service.accounts.containers.workspaces.tags.delete({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/tags/${tagId}`,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a trigger
   */
  async deleteTrigger(
    accountId: string,
    containerId: string,
    triggerId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      await this.service.accounts.containers.workspaces.triggers.delete({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/triggers/${triggerId}`,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a variable
   */
  async deleteVariable(
    accountId: string,
    containerId: string,
    variableId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      await this.service.accounts.containers.workspaces.variables.delete({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/variables/${variableId}`,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== REVERT OPERATIONS ====================

  /**
   * Revert a tag to its state in the latest published version
   */
  async revertTag(
    accountId: string,
    containerId: string,
    tagId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; tag?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response = await this.service.accounts.containers.workspaces.tags.revert(
        {
          path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/tags/${tagId}`,
        }
      );
      return { success: true, tag: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Revert a trigger to its state in the latest published version
   */
  async revertTrigger(
    accountId: string,
    containerId: string,
    triggerId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; trigger?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response =
        await this.service.accounts.containers.workspaces.triggers.revert({
          path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/triggers/${triggerId}`,
        });
      return { success: true, trigger: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Revert a variable to its state in the latest published version
   */
  async revertVariable(
    accountId: string,
    containerId: string,
    variableId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; variable?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response =
        await this.service.accounts.containers.workspaces.variables.revert({
          path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/variables/${variableId}`,
        });
      return { success: true, variable: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== FOLDER OPERATIONS ====================

  /**
   * List all folders in a workspace
   */
  async listFolders(
    accountId: string,
    containerId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; folders?: any[]; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response =
        await this.service.accounts.containers.workspaces.folders.list({
          parent: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}`,
        });
      return {
        success: true,
        folders: response.data.folder || [],
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get folder details
   */
  async getFolder(
    accountId: string,
    containerId: string,
    folderId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; folder?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response =
        await this.service.accounts.containers.workspaces.folders.get({
          path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/folders/${folderId}`,
        });
      return { success: true, folder: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a folder
   */
  async createFolder(
    accountId: string,
    containerId: string,
    name: string,
    workspaceId?: string
  ): Promise<{ success: boolean; folder?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const folderBody: tagmanager_v2.Schema$Folder = {
        name,
      };

      const response =
        await this.service.accounts.containers.workspaces.folders.create({
          parent: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}`,
          requestBody: folderBody,
        });

      return { success: true, folder: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a folder
   */
  async updateFolder(
    accountId: string,
    containerId: string,
    folderId: string,
    name: string,
    workspaceId?: string
  ): Promise<{ success: boolean; folder?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));

      // First get the folder to preserve fingerprint
      const current =
        await this.service.accounts.containers.workspaces.folders.get({
          path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/folders/${folderId}`,
        });

      const updateBody: tagmanager_v2.Schema$Folder = {
        ...current.data,
        name,
      };

      const response =
        await this.service.accounts.containers.workspaces.folders.update({
          path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/folders/${folderId}`,
          requestBody: updateBody,
        });
      return { success: true, folder: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a folder
   */
  async deleteFolder(
    accountId: string,
    containerId: string,
    folderId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      await this.service.accounts.containers.workspaces.folders.delete({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/folders/${folderId}`,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Revert a folder to its state in the latest published version
   */
  async revertFolder(
    accountId: string,
    containerId: string,
    folderId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; folder?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response =
        await this.service.accounts.containers.workspaces.folders.revert({
          path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/folders/${folderId}`,
        });
      return { success: true, folder: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Move entities (tags, triggers, variables) into a folder
   */
  async moveEntitiesToFolder(
    accountId: string,
    containerId: string,
    folderId: string,
    tagIds?: string[],
    triggerIds?: string[],
    variableIds?: string[],
    workspaceId?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const requestBody: any = {};
      if (tagIds && tagIds.length > 0) {
        requestBody.tagId = tagIds;
      }
      if (triggerIds && triggerIds.length > 0) {
        requestBody.triggerId = triggerIds;
      }
      if (variableIds && variableIds.length > 0) {
        requestBody.variableId = variableIds;
      }

      await (this.service.accounts.containers.workspaces.folders as any).move_entities_to_folder({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/folders/${folderId}`,
        requestBody,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all entities in a folder
   */
  async getFolderEntities(
    accountId: string,
    containerId: string,
    folderId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; entities?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response = await (this.service.accounts.containers.workspaces.folders as any).entities({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/folders/${folderId}`,
      });
      return { success: true, entities: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== BUILT-IN VARIABLE OPERATIONS ====================

  /**
   * List all built-in variables in a workspace
   */
  async listBuiltInVariables(
    accountId: string,
    containerId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; builtInVariables?: any[]; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response =
        await this.service.accounts.containers.workspaces.built_in_variables.list(
          {
            parent: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}`,
          }
        );
      return {
        success: true,
        builtInVariables: response.data.builtInVariable || [],
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Enable a built-in variable
   */
  async createBuiltInVariable(
    accountId: string,
    containerId: string,
    type: string,
    workspaceId?: string
  ): Promise<{ success: boolean; builtInVariable?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));

      const response =
        await this.service.accounts.containers.workspaces.built_in_variables.create(
          {
            parent: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}`,
            type: [type],
          }
        );

      return { success: true, builtInVariable: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Disable a built-in variable
   */
  async deleteBuiltInVariable(
    accountId: string,
    containerId: string,
    type: string,
    workspaceId?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      await this.service.accounts.containers.workspaces.built_in_variables.delete(
        {
          path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/built_in_variables/${type}`,
        }
      );
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Revert built-in variables to their state in the latest published version
   */
  async revertBuiltInVariables(
    accountId: string,
    containerId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; builtInVariables?: any[]; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response =
        await this.service.accounts.containers.workspaces.built_in_variables.revert(
          {
            path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}`,
          }
        );
      return {
        success: true,
        builtInVariables: (response.data as any).builtInVariable || [],
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== CONTAINER VERSION OPERATIONS ====================

  /**
   * List all versions of a container
   */
  async listVersions(
    accountId: string,
    containerId: string
  ): Promise<{ success: boolean; versions?: any[]; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response = await (this.service.accounts.containers.versions as any).list({
        parent: `accounts/${accountId}/containers/${containerId}`,
      });
      return {
        success: true,
        versions: response.data.containerVersion || [],
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get version details with all entities
   */
  async getVersion(
    accountId: string,
    containerId: string,
    versionId: string
  ): Promise<{ success: boolean; version?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response = await this.service.accounts.containers.versions.get({
        path: `accounts/${accountId}/containers/${containerId}/versions/${versionId}`,
      });
      return { success: true, version: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update version metadata (name, description)
   */
  async updateVersion(
    accountId: string,
    containerId: string,
    versionId: string,
    name?: string,
    description?: string
  ): Promise<{ success: boolean; version?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      // First get the version to preserve fingerprint
      const current = await this.service.accounts.containers.versions.get({
        path: `accounts/${accountId}/containers/${containerId}/versions/${versionId}`,
      });

      const updateBody: any = {
        ...current.data,
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      };

      const response = await this.service.accounts.containers.versions.update({
        path: `accounts/${accountId}/containers/${containerId}/versions/${versionId}`,
        requestBody: updateBody,
      });
      return { success: true, version: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a version (soft delete)
   */
  async deleteVersion(
    accountId: string,
    containerId: string,
    versionId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      await this.service.accounts.containers.versions.delete({
        path: `accounts/${accountId}/containers/${containerId}/versions/${versionId}`,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Undelete a version (restore deleted version)
   */
  async undeleteVersion(
    accountId: string,
    containerId: string,
    versionId: string
  ): Promise<{ success: boolean; version?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response = await (this.service.accounts.containers.versions as any).undelete({
        path: `accounts/${accountId}/containers/${containerId}/versions/${versionId}`,
      });
      return { success: true, version: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Set a version as the latest (for preview)
   */
  async setLatestVersion(
    accountId: string,
    containerId: string,
    versionId: string
  ): Promise<{ success: boolean; version?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response = await (this.service.accounts.containers.versions as any).set_latest({
        path: `accounts/${accountId}/containers/${containerId}/versions/${versionId}`,
      });
      return { success: true, version: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get the currently live (published) version
   */
  async getLiveVersion(
    accountId: string,
    containerId: string
  ): Promise<{ success: boolean; version?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response = await (this.service.accounts.containers.versions as any).live({
        parent: `accounts/${accountId}/containers/${containerId}`,
      });
      return { success: true, version: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== CONTAINER VERSION HEADER OPERATIONS ====================

  /**
   * List all version headers for a container
   */
  async listVersionHeaders(
    accountId: string,
    containerId: string
  ): Promise<{ success: boolean; versionHeaders?: any[]; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response = await (this.service.accounts.containers as any).version_headers.list({
        parent: `accounts/${accountId}/containers/${containerId}`,
      });
      return {
        success: true,
        versionHeaders: response.data.containerVersionHeader || [],
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get the latest version header
   */
  async getLatestVersionHeader(
    accountId: string,
    containerId: string
  ): Promise<{ success: boolean; versionHeader?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response = await (this.service.accounts.containers as any).version_headers.latest({
        parent: `accounts/${accountId}/containers/${containerId}`,
      });
      return { success: true, versionHeader: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== WORKSPACE QUICK PREVIEW ====================

  /**
   * Create a quick preview URL for testing workspace changes
   */
  async quickPreview(
    accountId: string,
    containerId: string,
    url: string,
    workspaceId?: string
  ): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response = await (this.service.accounts.containers.workspaces as any).quick_preview({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}`,
        requestBody: { url },
      });
      return { success: true, previewUrl: response.data.previewUrl };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== ENVIRONMENT OPERATIONS ====================

  /**
   * List all environments for a container
   */
  async listEnvironments(
    accountId: string,
    containerId: string
  ): Promise<{ success: boolean; environments?: any[]; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response = await this.service.accounts.containers.environments.list({
        parent: `accounts/${accountId}/containers/${containerId}`,
      });
      return {
        success: true,
        environments: response.data.environment || [],
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get environment details
   */
  async getEnvironment(
    accountId: string,
    containerId: string,
    environmentId: string
  ): Promise<{ success: boolean; environment?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response = await this.service.accounts.containers.environments.get({
        path: `accounts/${accountId}/containers/${containerId}/environments/${environmentId}`,
      });
      return { success: true, environment: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new environment
   */
  async createEnvironment(
    accountId: string,
    containerId: string,
    name: string,
    type: string,
    description?: string,
    url?: string
  ): Promise<{ success: boolean; environment?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const requestBody: any = {
        name,
        type,
      };
      if (description) {
        requestBody.description = description;
      }
      if (url) {
        requestBody.url = url;
      }

      const response = await this.service.accounts.containers.environments.create({
        parent: `accounts/${accountId}/containers/${containerId}`,
        requestBody,
      });
      return { success: true, environment: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update an environment
   */
  async updateEnvironment(
    accountId: string,
    containerId: string,
    environmentId: string,
    name?: string,
    description?: string,
    url?: string
  ): Promise<{ success: boolean; environment?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      // First get the environment to preserve fingerprint
      const current = await this.service.accounts.containers.environments.get({
        path: `accounts/${accountId}/containers/${containerId}/environments/${environmentId}`,
      });

      const updateBody: any = {
        ...current.data,
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(url !== undefined && { url }),
      };

      const response = await this.service.accounts.containers.environments.update({
        path: `accounts/${accountId}/containers/${containerId}/environments/${environmentId}`,
        requestBody: updateBody,
      });
      return { success: true, environment: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete an environment
   */
  async deleteEnvironment(
    accountId: string,
    containerId: string,
    environmentId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      await this.service.accounts.containers.environments.delete({
        path: `accounts/${accountId}/containers/${containerId}/environments/${environmentId}`,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Reauthorize an environment (regenerate authorization code)
   */
  async reauthorizeEnvironment(
    accountId: string,
    containerId: string,
    environmentId: string
  ): Promise<{ success: boolean; environment?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response = await (this.service.accounts.containers.environments as any).reauthorize({
        path: `accounts/${accountId}/containers/${containerId}/environments/${environmentId}`,
      });
      return { success: true, environment: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== USER PERMISSION OPERATIONS ====================

  /**
   * List all user permissions for an account
   */
  async listUserPermissions(
    accountId: string
  ): Promise<{ success: boolean; userPermissions?: any[]; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response = await this.service.accounts.user_permissions.list({
        parent: `accounts/${accountId}`,
      });
      return {
        success: true,
        userPermissions: response.data.userPermission || [],
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user permission details
   */
  async getUserPermission(
    accountId: string,
    permissionId: string
  ): Promise<{ success: boolean; userPermission?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const response = await this.service.accounts.user_permissions.get({
        path: `accounts/${accountId}/user_permissions/${permissionId}`,
      });
      return { success: true, userPermission: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new user permission
   */
  async createUserPermission(
    accountId: string,
    emailAddress: string,
    accountAccess: { permission: string },
    containerAccess?: Array<{ containerId: string; permission: string }>
  ): Promise<{ success: boolean; userPermission?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const requestBody: any = {
        emailAddress,
        accountAccess,
      };
      if (containerAccess && containerAccess.length > 0) {
        requestBody.containerAccess = containerAccess;
      }

      const response = await this.service.accounts.user_permissions.create({
        parent: `accounts/${accountId}`,
        requestBody,
      });
      return { success: true, userPermission: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a user permission
   */
  async updateUserPermission(
    accountId: string,
    permissionId: string,
    accountAccess?: { permission: string },
    containerAccess?: Array<{ containerId: string; permission: string }>
  ): Promise<{ success: boolean; userPermission?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      // First get the permission to preserve fingerprint
      const current = await this.service.accounts.user_permissions.get({
        path: `accounts/${accountId}/user_permissions/${permissionId}`,
      });

      const updateBody: any = {
        ...current.data,
        ...(accountAccess && { accountAccess }),
        ...(containerAccess && { containerAccess }),
      };

      const response = await this.service.accounts.user_permissions.update({
        path: `accounts/${accountId}/user_permissions/${permissionId}`,
        requestBody: updateBody,
      });
      return { success: true, userPermission: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a user permission (revoke access)
   */
  async deleteUserPermission(
    accountId: string,
    permissionId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      await this.service.accounts.user_permissions.delete({
        path: `accounts/${accountId}/user_permissions/${permissionId}`,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== CLIENT OPERATIONS (Server-side) ====================

  /**
   * List all clients in a workspace
   */
  async listClients(
    accountId: string,
    containerId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; clients?: any[]; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response = await (this.service.accounts.containers.workspaces as any).clients.list({
        parent: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}`,
      });
      return {
        success: true,
        clients: response.data.client || [],
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get client details
   */
  async getClient(
    accountId: string,
    containerId: string,
    clientId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; client?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response = await (this.service.accounts.containers.workspaces as any).clients.get({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/clients/${clientId}`,
      });
      return { success: true, client: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new client
   */
  async createClient(
    accountId: string,
    containerId: string,
    name: string,
    type: string,
    parameters?: any[],
    workspaceId?: string
  ): Promise<{ success: boolean; client?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const requestBody: any = {
        name,
        type,
      };
      if (parameters && parameters.length > 0) {
        requestBody.parameter = parameters;
      }

      const response = await (this.service.accounts.containers.workspaces as any).clients.create({
        parent: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}`,
        requestBody,
      });
      return { success: true, client: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a client
   */
  async updateClient(
    accountId: string,
    containerId: string,
    clientId: string,
    name?: string,
    parameters?: any[],
    workspaceId?: string
  ): Promise<{ success: boolean; client?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));

      // First get the client to preserve fingerprint
      const current = await (this.service.accounts.containers.workspaces as any).clients.get({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/clients/${clientId}`,
      });

      const updateBody: any = {
        ...current.data,
        ...(name !== undefined && { name }),
        ...(parameters !== undefined && { parameter: parameters }),
      };

      const response = await (this.service.accounts.containers.workspaces as any).clients.update({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/clients/${clientId}`,
        requestBody: updateBody,
      });
      return { success: true, client: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a client
   */
  async deleteClient(
    accountId: string,
    containerId: string,
    clientId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      await (this.service.accounts.containers.workspaces as any).clients.delete({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/clients/${clientId}`,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Revert a client to its state in the latest published version
   */
  async revertClient(
    accountId: string,
    containerId: string,
    clientId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; client?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response = await (this.service.accounts.containers.workspaces as any).clients.revert({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/clients/${clientId}`,
      });
      return { success: true, client: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== GOOGLE TAG CONFIG OPERATIONS ====================

  /**
   * List all Google Tag configs in a workspace
   */
  async listGtagConfigs(
    accountId: string,
    containerId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; gtagConfigs?: any[]; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response = await (this.service.accounts.containers.workspaces as any).gtag_config.list({
        parent: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}`,
      });
      return {
        success: true,
        gtagConfigs: response.data.gtagConfig || [],
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Google Tag config details
   */
  async getGtagConfig(
    accountId: string,
    containerId: string,
    configId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; gtagConfig?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response = await (this.service.accounts.containers.workspaces as any).gtag_config.get({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/gtag_config/${configId}`,
      });
      return { success: true, gtagConfig: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new Google Tag config
   */
  async createGtagConfig(
    accountId: string,
    containerId: string,
    tagId: string,
    parameters?: any[],
    workspaceId?: string
  ): Promise<{ success: boolean; gtagConfig?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const requestBody: any = {
        tagId,
      };
      if (parameters && parameters.length > 0) {
        requestBody.parameter = parameters;
      }

      const response = await (this.service.accounts.containers.workspaces as any).gtag_config.create({
        parent: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}`,
        requestBody,
      });
      return { success: true, gtagConfig: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a Google Tag config
   */
  async updateGtagConfig(
    accountId: string,
    containerId: string,
    configId: string,
    tagId?: string,
    parameters?: any[],
    workspaceId?: string
  ): Promise<{ success: boolean; gtagConfig?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));

      // First get the config to preserve fingerprint
      const current = await (this.service.accounts.containers.workspaces as any).gtag_config.get({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/gtag_config/${configId}`,
      });

      const updateBody: any = {
        ...current.data,
        ...(tagId !== undefined && { tagId }),
        ...(parameters !== undefined && { parameter: parameters }),
      };

      const response = await (this.service.accounts.containers.workspaces as any).gtag_config.update({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/gtag_config/${configId}`,
        requestBody: updateBody,
      });
      return { success: true, gtagConfig: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a Google Tag config
   */
  async deleteGtagConfig(
    accountId: string,
    containerId: string,
    configId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      await (this.service.accounts.containers.workspaces as any).gtag_config.delete({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/gtag_config/${configId}`,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Revert a Google Tag config to its state in the latest published version
   */
  async revertGtagConfig(
    accountId: string,
    containerId: string,
    configId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; gtagConfig?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response = await (this.service.accounts.containers.workspaces as any).gtag_config.revert({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/gtag_config/${configId}`,
      });
      return { success: true, gtagConfig: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== TEMPLATE OPERATIONS ====================

  /**
   * List all templates in a workspace
   */
  async listTemplates(
    accountId: string,
    containerId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; templates?: any[]; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response = await (this.service.accounts.containers.workspaces as any).templates.list({
        parent: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}`,
      });
      return {
        success: true,
        templates: response.data.template || [],
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get template details
   */
  async getTemplate(
    accountId: string,
    containerId: string,
    templateId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; template?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response = await (this.service.accounts.containers.workspaces as any).templates.get({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/templates/${templateId}`,
      });
      return { success: true, template: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new template
   */
  async createTemplate(
    accountId: string,
    containerId: string,
    name: string,
    templateData: string,
    workspaceId?: string
  ): Promise<{ success: boolean; template?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const requestBody: any = {
        name,
        templateData,
      };

      const response = await (this.service.accounts.containers.workspaces as any).templates.create({
        parent: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}`,
        requestBody,
      });
      return { success: true, template: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a template
   */
  async updateTemplate(
    accountId: string,
    containerId: string,
    templateId: string,
    name?: string,
    templateData?: string,
    workspaceId?: string
  ): Promise<{ success: boolean; template?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));

      // First get the template to preserve fingerprint
      const current = await (this.service.accounts.containers.workspaces as any).templates.get({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/templates/${templateId}`,
      });

      const updateBody: any = {
        ...current.data,
        ...(name !== undefined && { name }),
        ...(templateData !== undefined && { templateData }),
      };

      const response = await (this.service.accounts.containers.workspaces as any).templates.update({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/templates/${templateId}`,
        requestBody: updateBody,
      });
      return { success: true, template: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(
    accountId: string,
    containerId: string,
    templateId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      await (this.service.accounts.containers.workspaces as any).templates.delete({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/templates/${templateId}`,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Revert a template to its state in the latest published version
   */
  async revertTemplate(
    accountId: string,
    containerId: string,
    templateId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; template?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response = await (this.service.accounts.containers.workspaces as any).templates.revert({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/templates/${templateId}`,
      });
      return { success: true, template: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Import a template from the Community Template Gallery
   */
  async importTemplateFromGallery(
    accountId: string,
    containerId: string,
    galleryReference: {
      host: string;
      owner: string;
      repository: string;
      signature: string;
    },
    workspaceId?: string
  ): Promise<{ success: boolean; template?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response = await (this.service.accounts.containers.workspaces as any).templates.import_from_gallery({
        parent: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}`,
        requestBody: { galleryReference },
      });
      return { success: true, template: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== TRANSFORMATION OPERATIONS (Server-side) ====================

  /**
   * List all transformations in a workspace
   */
  async listTransformations(
    accountId: string,
    containerId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; transformations?: any[]; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response = await (this.service.accounts.containers.workspaces as any).transformations.list({
        parent: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}`,
      });
      return {
        success: true,
        transformations: response.data.transformation || [],
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get transformation details
   */
  async getTransformation(
    accountId: string,
    containerId: string,
    transformationId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; transformation?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response = await (this.service.accounts.containers.workspaces as any).transformations.get({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/transformations/${transformationId}`,
      });
      return { success: true, transformation: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new transformation
   */
  async createTransformation(
    accountId: string,
    containerId: string,
    name: string,
    type: string,
    parameters?: any[],
    workspaceId?: string
  ): Promise<{ success: boolean; transformation?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const requestBody: any = {
        name,
        type,
      };
      if (parameters && parameters.length > 0) {
        requestBody.parameter = parameters;
      }

      const response = await (this.service.accounts.containers.workspaces as any).transformations.create({
        parent: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}`,
        requestBody,
      });
      return { success: true, transformation: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a transformation
   */
  async updateTransformation(
    accountId: string,
    containerId: string,
    transformationId: string,
    name?: string,
    parameters?: any[],
    workspaceId?: string
  ): Promise<{ success: boolean; transformation?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));

      // First get the transformation to preserve fingerprint
      const current = await (this.service.accounts.containers.workspaces as any).transformations.get({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/transformations/${transformationId}`,
      });

      const updateBody: any = {
        ...current.data,
        ...(name !== undefined && { name }),
        ...(parameters !== undefined && { parameter: parameters }),
      };

      const response = await (this.service.accounts.containers.workspaces as any).transformations.update({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/transformations/${transformationId}`,
        requestBody: updateBody,
      });
      return { success: true, transformation: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a transformation
   */
  async deleteTransformation(
    accountId: string,
    containerId: string,
    transformationId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      await (this.service.accounts.containers.workspaces as any).transformations.delete({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/transformations/${transformationId}`,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Revert a transformation to its state in the latest published version
   */
  async revertTransformation(
    accountId: string,
    containerId: string,
    transformationId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; transformation?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response = await (this.service.accounts.containers.workspaces as any).transformations.revert({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/transformations/${transformationId}`,
      });
      return { success: true, transformation: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== ZONE OPERATIONS (Server-side) ====================

  /**
   * List all zones in a workspace
   */
  async listZones(
    accountId: string,
    containerId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; zones?: any[]; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response = await (this.service.accounts.containers.workspaces as any).zones.list({
        parent: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}`,
      });
      return {
        success: true,
        zones: response.data.zone || [],
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get zone details
   */
  async getZone(
    accountId: string,
    containerId: string,
    zoneId: string,
    workspaceId?: string
  ): Promise<{ success: boolean; zone?: any; error?: string }> {
    if (!this.service) {
      throw new Error('Service not initialized. Call authenticate() first.');
    }

    try {
      const wsId =
        workspaceId || (await this.getWorkspaceId(accountId, containerId));
      const response = await (this.service.accounts.containers.workspaces as any).zones.get({
        path: `accounts/${accountId}/containers/${containerId}/workspaces/${wsId}/zones/${zoneId}`,
      });
      return { success: true, zone: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

