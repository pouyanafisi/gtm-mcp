import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GTMClient } from '../src/gtm-client.js';
import { google } from 'googleapis';

// Mock googleapis
vi.mock('googleapis', () => {
  const mockService = {
      accounts: {
      list: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
    user_permissions: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
      containers: {
        list: vi.fn(),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        snippet: vi.fn(),
        lookup: vi.fn(),
        combine: vi.fn(),
        move_tag_id: vi.fn(),
        workspaces: {
          list: vi.fn(),
          get: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
          getStatus: vi.fn(),
          sync: vi.fn(),
          resolve_conflict: vi.fn(),
          bulk_update: vi.fn(),
          create_version: vi.fn(),
          quick_preview: vi.fn(),
          tags: {
            list: vi.fn(),
            get: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            revert: vi.fn(),
          },
          triggers: {
            list: vi.fn(),
            get: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            revert: vi.fn(),
          },
          variables: {
            list: vi.fn(),
            get: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            revert: vi.fn(),
          },
          folders: {
            list: vi.fn(),
            get: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            revert: vi.fn(),
          },
          built_in_variables: {
            list: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
            revert: vi.fn(),
          },
        },
        versions: {
          list: vi.fn(),
          get: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
          publish: vi.fn(),
          undelete: vi.fn(),
          set_latest: vi.fn(),
          live: vi.fn(),
        },
        version_headers: {
          list: vi.fn(),
          latest: vi.fn(),
        },
        environments: {
          list: vi.fn(),
          get: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
      },
    },
  };

  return {
    google: {
      tagmanager: vi.fn(() => mockService),
    },
  };
});

describe('GTMClient', () => {
  let client: GTMClient;
  let mockService: any;

  beforeEach(() => {
    client = new GTMClient({
      credentialsPath: 'test-credentials.json',
      tokenPath: 'test-token.json',
    });
    mockService = (google.tagmanager as any)();
    // Mock authenticate to set service
    vi.spyOn(client, 'authenticate').mockResolvedValue(undefined);
    (client as any).service = mockService;
  });

  describe('Account Operations', () => {
    it('should list accounts', async () => {
      const mockAccounts = [{ accountId: '123', name: 'Test Account' }];
      mockService.accounts.list.mockResolvedValue({
        data: { account: mockAccounts },
      });

      const result = await client.listAccounts();

      expect(result.success).toBe(true);
      expect(result.accounts).toEqual(mockAccounts);
      expect(mockService.accounts.list).toHaveBeenCalled();
    });

    it('should get account', async () => {
      const mockAccount = { accountId: '123', name: 'Test Account' };
      mockService.accounts.get.mockResolvedValue({ data: mockAccount });

      const result = await client.getAccount('123');

      expect(result.success).toBe(true);
      expect(result.account).toEqual(mockAccount);
      expect(mockService.accounts.get).toHaveBeenCalledWith({
        path: 'accounts/123',
      });
    });

    it('should update account', async () => {
      const mockAccount = { accountId: '123', name: 'Test Account', fingerprint: 'abc' };
      mockService.accounts.get.mockResolvedValue({ data: mockAccount });
      mockService.accounts.update.mockResolvedValue({ data: { ...mockAccount, name: 'Updated' } });

      const result = await client.updateAccount('123', 'Updated Name');

      expect(result.success).toBe(true);
      expect(mockService.accounts.update).toHaveBeenCalled();
    });
  });

  describe('Container Operations', () => {
    it('should list containers', async () => {
      const mockContainers = [{ containerId: '456', name: 'Test Container' }];
      mockService.accounts.containers.list.mockResolvedValue({
        data: { container: mockContainers },
      });

      const result = await client.listContainers('123');

      expect(result.success).toBe(true);
      expect(result.containers).toEqual(mockContainers);
    });

    it('should get container', async () => {
      const mockContainer = { containerId: '456', name: 'Test Container' };
      mockService.accounts.containers.get.mockResolvedValue({ data: mockContainer });

      const result = await client.getContainer('123', '456');

      expect(result.success).toBe(true);
      expect(result.container).toEqual(mockContainer);
    });

    it('should create container', async () => {
      const mockContainer = { containerId: '456', name: 'New Container' };
      mockService.accounts.containers.create.mockResolvedValue({ data: mockContainer });

      const result = await client.createContainer('123', 'New Container', ['web']);

      expect(result.success).toBe(true);
      expect(result.container).toEqual(mockContainer);
      expect(mockService.accounts.containers.create).toHaveBeenCalledWith({
        parent: 'accounts/123',
        requestBody: expect.objectContaining({
          name: 'New Container',
          usageContext: ['web'],
        }),
      });
    });

    it('should get container snippet', async () => {
      const mockSnippet = '<script>GTM-XXXXXXX</script>';
      mockService.accounts.containers.snippet.mockResolvedValue({
        data: { snippet: mockSnippet },
      });

      const result = await client.getContainerSnippet('123', '456');

      expect(result.success).toBe(true);
      expect(result.snippet).toBe(mockSnippet);
    });

    it('should lookup container by public ID', async () => {
      const mockContainer = { containerId: '456', publicId: 'GTM-XXXXXXX' };
      mockService.accounts.containers.lookup.mockResolvedValue({ data: mockContainer });

      const result = await client.lookupContainer('123', 'GTM-XXXXXXX');

      expect(result.success).toBe(true);
      expect(result.container).toEqual(mockContainer);
    });

    it('should combine containers', async () => {
      const mockContainer = { containerId: '456', name: 'Combined Container' };
      (mockService.accounts.containers as any).combine.mockResolvedValue({
        data: mockContainer,
      });

      const result = await client.combineContainers('123', '456', '789', true);

      expect(result.success).toBe(true);
      expect(result.container).toEqual(mockContainer);
      expect((mockService.accounts.containers as any).combine).toHaveBeenCalledWith({
        path: 'accounts/123/containers/456',
        requestBody: {
          sourceContainerId: '789',
          allowUserVariableConflict: true,
        },
      });
    });

    it('should move tag ID between containers', async () => {
      const mockContainer = { containerId: '456', name: 'Destination Container' };
      (mockService.accounts.containers as any).move_tag_id.mockResolvedValue({
        data: mockContainer,
      });

      const result = await client.moveTagId('123', '456', 'tag1', '789');

      expect(result.success).toBe(true);
      expect(result.container).toEqual(mockContainer);
      expect((mockService.accounts.containers as any).move_tag_id).toHaveBeenCalledWith({
        path: 'accounts/123/containers/456',
        requestBody: {
          tagId: 'tag1',
          destinationContainerId: '789',
        },
      });
    });
  });

  describe('Workspace Operations', () => {
    beforeEach(() => {
      // Mock getWorkspaceId
      mockService.accounts.containers.workspaces.list.mockResolvedValue({
        data: { workspace: [{ workspaceId: '1' }] },
      });
    });

    it('should list workspaces', async () => {
      const mockWorkspaces = [{ workspaceId: '1', name: 'Default Workspace' }];
      mockService.accounts.containers.workspaces.list.mockResolvedValue({
        data: { workspace: mockWorkspaces },
      });

      const result = await client.listWorkspaces('123', '456');

      expect(result.success).toBe(true);
      expect(result.workspaces).toEqual(mockWorkspaces);
    });

    it('should get workspace', async () => {
      const mockWorkspace = { workspaceId: '1', name: 'Default Workspace' };
      mockService.accounts.containers.workspaces.get.mockResolvedValue({
        data: mockWorkspace,
      });

      const result = await client.getWorkspace('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.workspace).toEqual(mockWorkspace);
    });

    it('should create workspace', async () => {
      const mockWorkspace = { workspaceId: '2', name: 'New Workspace' };
      mockService.accounts.containers.workspaces.create.mockResolvedValue({
        data: mockWorkspace,
      });

      const result = await client.createWorkspace('123', '456', 'New Workspace');

      expect(result.success).toBe(true);
      expect(result.workspace).toEqual(mockWorkspace);
    });

    it('should get workspace status', async () => {
      const mockStatus = { workspaceChange: [], mergeConflict: [] };
      mockService.accounts.containers.workspaces.getStatus.mockResolvedValue({
        data: mockStatus,
      });

      const result = await client.getWorkspaceStatus('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.status).toEqual(mockStatus);
    });

    it('should sync workspace', async () => {
      const mockSync = { mergeConflict: [] };
      mockService.accounts.containers.workspaces.sync.mockResolvedValue({
        data: mockSync,
      });

      const result = await client.syncWorkspace('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.syncResult).toEqual(mockSync);
    });

    it('should resolve conflict', async () => {
      const mockConflict = { conflictId: 'conflict1', changeType: 'KEEP' };
      (mockService.accounts.containers.workspaces as any).resolve_conflict.mockResolvedValue({
        data: mockConflict,
      });

      const result = await client.resolveConflict('123', '456', '1', 'conflict1', 'KEEP');

      expect(result.success).toBe(true);
      expect(result.conflict).toEqual(mockConflict);
      expect((mockService.accounts.containers.workspaces as any).resolve_conflict).toHaveBeenCalledWith({
        path: 'accounts/123/containers/456/workspaces/1',
        requestBody: {
          conflictId: 'conflict1',
          changeType: 'KEEP',
        },
      });
    });

    it('should bulk update workspace entities', async () => {
      const mockResult = { tag: [{ tagId: '1', name: 'Updated Tag' }] };
      (mockService.accounts.containers.workspaces as any).bulk_update.mockResolvedValue({
        data: mockResult,
      });

      const result = await client.bulkUpdate('123', '456', '1', {
        tag: [{ tagId: '1', name: 'Updated Tag' }],
      });

      expect(result.success).toBe(true);
      expect(result.result).toEqual(mockResult);
      expect((mockService.accounts.containers.workspaces as any).bulk_update).toHaveBeenCalled();
    });
  });

  describe('Tag Operations', () => {
    beforeEach(() => {
      mockService.accounts.containers.workspaces.list.mockResolvedValue({
        data: { workspace: [{ workspaceId: '1' }] },
      });
    });

    it('should create tag', async () => {
      const mockTag = { tagId: '1', name: 'Test Tag', type: 'gaawc' };
      mockService.accounts.containers.workspaces.tags.create.mockResolvedValue({
        data: mockTag,
      });

      const result = await client.createTag('123', '456', 'Test Tag', 'gaawc', {
        measurementIdOverride: 'G-XXXXXXX',
      });

      expect(result.success).toBe(true);
      expect(result.tag).toEqual(mockTag);
    });

    it('should list tags', async () => {
      const mockTags = [{ tagId: '1', name: 'Test Tag' }];
      mockService.accounts.containers.workspaces.tags.list.mockResolvedValue({
        data: { tag: mockTags },
      });

      const result = await client.listTags('123', '456');

      expect(result.success).toBe(true);
      expect(result.tags).toEqual(mockTags);
    });

    it('should get tag', async () => {
      const mockTag = { tagId: '1', name: 'Test Tag' };
      mockService.accounts.containers.workspaces.tags.get.mockResolvedValue({
        data: mockTag,
      });

      const result = await client.getTag('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.tag).toEqual(mockTag);
    });

    it('should update tag', async () => {
      const mockTag = { tagId: '1', name: 'Test Tag', fingerprint: 'abc' };
      mockService.accounts.containers.workspaces.tags.get.mockResolvedValue({
        data: mockTag,
      });
      mockService.accounts.containers.workspaces.tags.update.mockResolvedValue({
        data: { ...mockTag, name: 'Updated Tag' },
      });

      const result = await client.updateTag('123', '456', '1', { name: 'Updated Tag' });

      expect(result.success).toBe(true);
    });

    it('should delete tag', async () => {
      mockService.accounts.containers.workspaces.tags.delete.mockResolvedValue({});

      const result = await client.deleteTag('123', '456', '1');

      expect(result.success).toBe(true);
    });

    it('should revert tag', async () => {
      const mockTag = { tagId: '1', name: 'Reverted Tag' };
      mockService.accounts.containers.workspaces.tags.revert.mockResolvedValue({
        data: mockTag,
      });

      const result = await client.revertTag('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.tag).toEqual(mockTag);
    });
  });

  describe('Trigger Operations', () => {
    beforeEach(() => {
      mockService.accounts.containers.workspaces.list.mockResolvedValue({
        data: { workspace: [{ workspaceId: '1' }] },
      });
    });

    it('should create trigger', async () => {
      const mockTrigger = { triggerId: '1', name: 'Test Trigger', type: 'pageview' };
      mockService.accounts.containers.workspaces.triggers.create.mockResolvedValue({
        data: mockTrigger,
      });

      const result = await client.createTrigger('123', '456', 'Test Trigger', 'pageview');

      expect(result.success).toBe(true);
      expect(result.trigger).toEqual(mockTrigger);
    });

    it('should list triggers', async () => {
      const mockTriggers = [{ triggerId: '1', name: 'Test Trigger' }];
      mockService.accounts.containers.workspaces.triggers.list.mockResolvedValue({
        data: { trigger: mockTriggers },
      });

      const result = await client.listTriggers('123', '456');

      expect(result.success).toBe(true);
      expect(result.triggers).toEqual(mockTriggers);
    });

    it('should get trigger', async () => {
      const mockTrigger = { triggerId: '1', name: 'Test Trigger' };
      mockService.accounts.containers.workspaces.triggers.get.mockResolvedValue({
        data: mockTrigger,
      });

      const result = await client.getTrigger('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.trigger).toEqual(mockTrigger);
    });

    it('should update trigger', async () => {
      const mockTrigger = { triggerId: '1', name: 'Test Trigger', fingerprint: 'abc' };
      mockService.accounts.containers.workspaces.triggers.get.mockResolvedValue({
        data: mockTrigger,
      });
      mockService.accounts.containers.workspaces.triggers.update.mockResolvedValue({
        data: { ...mockTrigger, name: 'Updated Trigger' },
      });

      const result = await client.updateTrigger('123', '456', '1', { name: 'Updated Trigger' });

      expect(result.success).toBe(true);
    });

    it('should delete trigger', async () => {
      mockService.accounts.containers.workspaces.triggers.delete.mockResolvedValue({});

      const result = await client.deleteTrigger('123', '456', '1');

      expect(result.success).toBe(true);
    });

    it('should revert trigger', async () => {
      const mockTrigger = { triggerId: '1', name: 'Reverted Trigger' };
      mockService.accounts.containers.workspaces.triggers.revert.mockResolvedValue({
        data: mockTrigger,
      });

      const result = await client.revertTrigger('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.trigger).toEqual(mockTrigger);
    });
  });

  describe('Variable Operations', () => {
    beforeEach(() => {
      mockService.accounts.containers.workspaces.list.mockResolvedValue({
        data: { workspace: [{ workspaceId: '1' }] },
      });
    });

    it('should create variable', async () => {
      const mockVariable = { variableId: '1', name: 'Test Variable', type: 'c' };
      mockService.accounts.containers.workspaces.variables.create.mockResolvedValue({
        data: mockVariable,
      });

      const result = await client.createVariable('123', '456', 'Test Variable', 'c', 'value');

      expect(result.success).toBe(true);
      expect(result.variable).toEqual(mockVariable);
    });

    it('should list variables', async () => {
      const mockVariables = [{ variableId: '1', name: 'Test Variable' }];
      mockService.accounts.containers.workspaces.variables.list.mockResolvedValue({
        data: { variable: mockVariables },
      });

      const result = await client.listVariables('123', '456');

      expect(result.success).toBe(true);
      expect(result.variables).toEqual(mockVariables);
    });

    it('should get variable', async () => {
      const mockVariable = { variableId: '1', name: 'Test Variable' };
      mockService.accounts.containers.workspaces.variables.get.mockResolvedValue({
        data: mockVariable,
      });

      const result = await client.getVariable('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.variable).toEqual(mockVariable);
    });

    it('should update variable', async () => {
      const mockVariable = { variableId: '1', name: 'Test Variable', fingerprint: 'abc' };
      mockService.accounts.containers.workspaces.variables.get.mockResolvedValue({
        data: mockVariable,
      });
      mockService.accounts.containers.workspaces.variables.update.mockResolvedValue({
        data: { ...mockVariable, name: 'Updated Variable' },
      });

      const result = await client.updateVariable('123', '456', '1', { name: 'Updated Variable' });

      expect(result.success).toBe(true);
    });

    it('should delete variable', async () => {
      mockService.accounts.containers.workspaces.variables.delete.mockResolvedValue({});

      const result = await client.deleteVariable('123', '456', '1');

      expect(result.success).toBe(true);
    });

    it('should revert variable', async () => {
      const mockVariable = { variableId: '1', name: 'Reverted Variable' };
      mockService.accounts.containers.workspaces.variables.revert.mockResolvedValue({
        data: mockVariable,
      });

      const result = await client.revertVariable('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.variable).toEqual(mockVariable);
    });
  });

  describe('Folder Operations', () => {
    beforeEach(() => {
      mockService.accounts.containers.workspaces.list.mockResolvedValue({
        data: { workspace: [{ workspaceId: '1' }] },
      });
    });

    it('should list folders', async () => {
      const mockFolders = [{ folderId: '1', name: 'Analytics' }];
      mockService.accounts.containers.workspaces.folders.list.mockResolvedValue({
        data: { folder: mockFolders },
      });

      const result = await client.listFolders('123', '456');

      expect(result.success).toBe(true);
      expect(result.folders).toEqual(mockFolders);
    });

    it('should get folder', async () => {
      const mockFolder = { folderId: '1', name: 'Analytics' };
      mockService.accounts.containers.workspaces.folders.get.mockResolvedValue({
        data: mockFolder,
      });

      const result = await client.getFolder('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.folder).toEqual(mockFolder);
    });

    it('should create folder', async () => {
      const mockFolder = { folderId: '1', name: 'Analytics' };
      mockService.accounts.containers.workspaces.folders.create.mockResolvedValue({
        data: mockFolder,
      });

      const result = await client.createFolder('123', '456', 'Analytics');

      expect(result.success).toBe(true);
      expect(result.folder).toEqual(mockFolder);
    });

    it('should update folder', async () => {
      const mockFolder = { folderId: '1', name: 'Analytics', fingerprint: 'abc' };
      mockService.accounts.containers.workspaces.folders.get.mockResolvedValue({
        data: mockFolder,
      });
      mockService.accounts.containers.workspaces.folders.update.mockResolvedValue({
        data: { ...mockFolder, name: 'Updated Folder' },
      });

      const result = await client.updateFolder('123', '456', '1', 'Updated Folder');

      expect(result.success).toBe(true);
    });

    it('should delete folder', async () => {
      mockService.accounts.containers.workspaces.folders.delete.mockResolvedValue({});

      const result = await client.deleteFolder('123', '456', '1');

      expect(result.success).toBe(true);
    });

    it('should revert folder', async () => {
      const mockFolder = { folderId: '1', name: 'Reverted Folder' };
      mockService.accounts.containers.workspaces.folders.revert.mockResolvedValue({
        data: mockFolder,
      });

      const result = await client.revertFolder('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.folder).toEqual(mockFolder);
    });

    it('should move entities to folder', async () => {
      (mockService.accounts.containers.workspaces.folders as any).move_entities_to_folder = vi
        .fn()
        .mockResolvedValue({});

      const result = await client.moveEntitiesToFolder(
        '123',
        '456',
        '1',
        ['1', '2'],
        ['3'],
        ['4']
      );

      expect(result.success).toBe(true);
    });

    it('should get folder entities', async () => {
      const mockEntities = {
        tag: [{ tagId: '1' }],
        trigger: [{ triggerId: '3' }],
        variable: [{ variableId: '4' }],
      };
      (mockService.accounts.containers.workspaces.folders as any).entities = vi
        .fn()
        .mockResolvedValue({
          data: mockEntities,
        });

      const result = await client.getFolderEntities('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.entities).toEqual(mockEntities);
    });
  });

  describe('Built-In Variable Operations', () => {
    beforeEach(() => {
      mockService.accounts.containers.workspaces.list.mockResolvedValue({
        data: { workspace: [{ workspaceId: '1' }] },
      });
    });

    it('should list built-in variables', async () => {
      const mockVariables = [{ type: 'PAGE_URL', name: 'Page URL' }];
      mockService.accounts.containers.workspaces.built_in_variables.list.mockResolvedValue({
        data: { builtInVariable: mockVariables },
      });

      const result = await client.listBuiltInVariables('123', '456');

      expect(result.success).toBe(true);
      expect(result.builtInVariables).toEqual(mockVariables);
    });

    it('should create built-in variable', async () => {
      const mockVariable = { type: 'PAGE_URL', name: 'Page URL' };
      mockService.accounts.containers.workspaces.built_in_variables.create.mockResolvedValue({
        data: mockVariable,
      });

      const result = await client.createBuiltInVariable('123', '456', 'PAGE_URL');

      expect(result.success).toBe(true);
      expect(result.builtInVariable).toEqual(mockVariable);
    });

    it('should delete built-in variable', async () => {
      mockService.accounts.containers.workspaces.built_in_variables.delete.mockResolvedValue({});

      const result = await client.deleteBuiltInVariable('123', '456', 'PAGE_URL');

      expect(result.success).toBe(true);
    });

    it('should revert built-in variables', async () => {
      const mockVariables = [{ type: 'PAGE_URL', name: 'Page URL' }];
      mockService.accounts.containers.workspaces.built_in_variables.revert.mockResolvedValue({
        data: { builtInVariable: mockVariables },
      });

      const result = await client.revertBuiltInVariables('123', '456');

      expect(result.success).toBe(true);
      expect(result.builtInVariables).toEqual(mockVariables);
    });
  });

  describe('Version Operations', () => {
    beforeEach(() => {
      mockService.accounts.containers.workspaces.list.mockResolvedValue({
        data: { workspace: [{ workspaceId: '1' }] },
      });
      mockService.accounts.containers.workspaces.create_version.mockResolvedValue({
        data: {
          containerVersion: {
            path: 'accounts/123/containers/456/versions/1',
            containerVersionId: '1',
          },
        },
      });
      mockService.accounts.containers.versions.publish.mockResolvedValue({
        data: { containerVersion: { containerVersionId: '1' } },
      });
    });

    it('should list versions', async () => {
      const mockVersions = [{ containerVersionId: '1', name: 'Version 1.0' }];
      (mockService.accounts.containers.versions as any).list.mockResolvedValue({
        data: { containerVersion: mockVersions },
      });

      const result = await client.listVersions('123', '456');

      expect(result.success).toBe(true);
      expect(result.versions).toEqual(mockVersions);
    });

    it('should get version', async () => {
      const mockVersion = {
        containerVersionId: '1',
        name: 'Version 1.0',
        tag: [],
        trigger: [],
        variable: [],
      };
      mockService.accounts.containers.versions.get.mockResolvedValue({
        data: mockVersion,
      });

      const result = await client.getVersion('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.version).toEqual(mockVersion);
    });

    it('should update version', async () => {
      const mockVersion = {
        containerVersionId: '1',
        name: 'Version 1.0',
        fingerprint: 'abc',
      };
      mockService.accounts.containers.versions.get.mockResolvedValue({
        data: mockVersion,
      });
      mockService.accounts.containers.versions.update.mockResolvedValue({
        data: { ...mockVersion, name: 'Updated Version' },
      });

      const result = await client.updateVersion('123', '456', '1', 'Updated Version');

      expect(result.success).toBe(true);
    });

    it('should delete version', async () => {
      mockService.accounts.containers.versions.delete.mockResolvedValue({});

      const result = await client.deleteVersion('123', '456', '1');

      expect(result.success).toBe(true);
    });

    it('should undelete version', async () => {
      const mockVersion = { containerVersionId: '1', name: 'Restored Version' };
      mockService.accounts.containers.versions.undelete.mockResolvedValue({
        data: mockVersion,
      });

      const result = await client.undeleteVersion('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.version).toEqual(mockVersion);
    });

    it('should set latest version', async () => {
      const mockVersion = { containerVersionId: '1', name: 'Latest Version' };
      mockService.accounts.containers.versions.set_latest.mockResolvedValue({
        data: mockVersion,
      });

      const result = await client.setLatestVersion('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.version).toEqual(mockVersion);
    });

    it('should get live version', async () => {
      const mockVersion = { containerVersionId: '1', name: 'Live Version' };
      mockService.accounts.containers.versions.live.mockResolvedValue({
        data: mockVersion,
      });

      const result = await client.getLiveVersion('123', '456');

      expect(result.success).toBe(true);
      expect(result.version).toEqual(mockVersion);
    });

    it('should publish version', async () => {
      const result = await client.publishVersion('123', '456', 'Version 1.0', 'Test notes');

      expect(result.success).toBe(true);
      expect(result.version).toBeDefined();
      expect(mockService.accounts.containers.workspaces.create_version).toHaveBeenCalled();
      expect(mockService.accounts.containers.versions.publish).toHaveBeenCalled();
    });
  });

  describe('Container Version Header Operations', () => {
    it('should list version headers', async () => {
      const mockHeaders = [{ containerVersionId: '1', name: 'Version 1.0' }];
      mockService.accounts.containers.version_headers.list.mockResolvedValue({
        data: { containerVersionHeader: mockHeaders },
      });

      const result = await client.listVersionHeaders('123', '456');

      expect(result.success).toBe(true);
      expect(result.versionHeaders).toEqual(mockHeaders);
    });

    it('should get latest version header', async () => {
      const mockHeader = { containerVersionId: '1', name: 'Latest Version' };
      mockService.accounts.containers.version_headers.latest.mockResolvedValue({
        data: mockHeader,
      });

      const result = await client.getLatestVersionHeader('123', '456');

      expect(result.success).toBe(true);
      expect(result.versionHeader).toEqual(mockHeader);
    });
  });

  describe('Workspace Quick Preview', () => {
    beforeEach(() => {
      mockService.accounts.containers.workspaces.list.mockResolvedValue({
        data: { workspace: [{ workspaceId: '1' }] },
      });
    });

    it('should create quick preview URL', async () => {
      const mockPreview = { previewUrl: 'https://tagmanager.google.com/preview/...' };
      (mockService.accounts.containers.workspaces as any).quick_preview = vi
        .fn()
        .mockResolvedValue({
          data: mockPreview,
        });

      const result = await client.quickPreview('123', '456', 'https://example.com');

      expect(result.success).toBe(true);
      expect(result.previewUrl).toBe(mockPreview.previewUrl);
    });
  });

  describe('Environment Operations', () => {
    it('should list environments', async () => {
      const mockEnvironments = [{ environmentId: '1', name: 'Default' }];
      mockService.accounts.containers.environments = {
        list: vi.fn().mockResolvedValue({
          data: { environment: mockEnvironments },
        }),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };

      const result = await client.listEnvironments('123', '456');

      expect(result.success).toBe(true);
      expect(result.environments).toEqual(mockEnvironments);
    });

    it('should get environment', async () => {
      const mockEnvironment = { environmentId: '1', name: 'Default', type: 'live' };
      mockService.accounts.containers.environments.get.mockResolvedValue({
        data: mockEnvironment,
      });

      const result = await client.getEnvironment('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.environment).toEqual(mockEnvironment);
    });

    it('should create environment', async () => {
      const mockEnvironment = { environmentId: '1', name: 'Development', type: 'user' };
      mockService.accounts.containers.environments.create.mockResolvedValue({
        data: mockEnvironment,
      });

      const result = await client.createEnvironment('123', '456', 'Development', 'user');

      expect(result.success).toBe(true);
      expect(result.environment).toEqual(mockEnvironment);
    });

    it('should update environment', async () => {
      const mockEnvironment = {
        environmentId: '1',
        name: 'Development',
        fingerprint: 'abc',
      };
      mockService.accounts.containers.environments.get.mockResolvedValue({
        data: mockEnvironment,
      });
      mockService.accounts.containers.environments.update.mockResolvedValue({
        data: { ...mockEnvironment, name: 'Updated Environment' },
      });

      const result = await client.updateEnvironment('123', '456', '1', 'Updated Environment');

      expect(result.success).toBe(true);
    });

    it('should delete environment', async () => {
      mockService.accounts.containers.environments.delete.mockResolvedValue({});

      const result = await client.deleteEnvironment('123', '456', '1');

      expect(result.success).toBe(true);
    });

    it('should reauthorize environment', async () => {
      const mockEnvironment = {
        environmentId: '1',
        authorizationCode: 'new-auth-code',
      };
      (mockService.accounts.containers.environments as any).reauthorize = vi
        .fn()
        .mockResolvedValue({
          data: mockEnvironment,
        });

      const result = await client.reauthorizeEnvironment('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.environment).toEqual(mockEnvironment);
    });
  });

  describe('Client Operations (Server-side)', () => {
    beforeEach(() => {
      mockService.accounts.containers.workspaces.list.mockResolvedValue({
        data: { workspace: [{ workspaceId: '1' }] },
      });
    });

    it('should list clients', async () => {
      const mockClients = [{ clientId: '1', name: 'GA4 Client', type: 'GA4' }];
      (mockService.accounts.containers.workspaces as any).clients = {
        list: vi.fn().mockResolvedValue({
          data: { client: mockClients },
        }),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        revert: vi.fn(),
      };

      const result = await client.listClients('123', '456');

      expect(result.success).toBe(true);
      expect(result.clients).toEqual(mockClients);
    });

    it('should get client', async () => {
      const mockClient = { clientId: '1', name: 'GA4 Client', type: 'GA4' };
      (mockService.accounts.containers.workspaces as any).clients = {
        get: vi.fn().mockResolvedValue({
          data: mockClient,
        }),
      };

      const result = await client.getClient('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.client).toEqual(mockClient);
    });

    it('should create client', async () => {
      const mockClient = { clientId: '1', name: 'GA4 Client', type: 'GA4' };
      (mockService.accounts.containers.workspaces as any).clients = {
        create: vi.fn().mockResolvedValue({
          data: mockClient,
        }),
      };

      const result = await client.createClient('123', '456', 'GA4 Client', 'GA4', [
        { key: 'measurementId', value: 'G-XXXXXXXXXX' },
      ]);

      expect(result.success).toBe(true);
      expect(result.client).toEqual(mockClient);
    });

    it('should update client', async () => {
      const mockClient = { clientId: '1', name: 'GA4 Client', fingerprint: 'abc' };
      (mockService.accounts.containers.workspaces as any).clients = {
        get: vi.fn().mockResolvedValue({
          data: mockClient,
        }),
        update: vi.fn().mockResolvedValue({
          data: { ...mockClient, name: 'Updated Client' },
        }),
      };

      const result = await client.updateClient('123', '456', '1', 'Updated Client');

      expect(result.success).toBe(true);
    });

    it('should delete client', async () => {
      (mockService.accounts.containers.workspaces as any).clients = {
        delete: vi.fn().mockResolvedValue({}),
      };

      const result = await client.deleteClient('123', '456', '1');

      expect(result.success).toBe(true);
    });

    it('should revert client', async () => {
      const mockClient = { clientId: '1', name: 'Reverted Client' };
      (mockService.accounts.containers.workspaces as any).clients = {
        revert: vi.fn().mockResolvedValue({
          data: mockClient,
        }),
      };

      const result = await client.revertClient('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.client).toEqual(mockClient);
    });
  });

  describe('Google Tag Config Operations', () => {
    beforeEach(() => {
      mockService.accounts.containers.workspaces.list.mockResolvedValue({
        data: { workspace: [{ workspaceId: '1' }] },
      });
    });

    it('should list Google Tag configs', async () => {
      const mockConfigs = [{ gtagConfigId: '1', tagId: 'G-XXXXXXXXXX' }];
      (mockService.accounts.containers.workspaces as any).gtag_config = {
        list: vi.fn().mockResolvedValue({
          data: { gtagConfig: mockConfigs },
        }),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        revert: vi.fn(),
      };

      const result = await client.listGtagConfigs('123', '456');

      expect(result.success).toBe(true);
      expect(result.gtagConfigs).toEqual(mockConfigs);
    });

    it('should get Google Tag config', async () => {
      const mockConfig = { gtagConfigId: '1', tagId: 'G-XXXXXXXXXX' };
      (mockService.accounts.containers.workspaces as any).gtag_config.get.mockResolvedValue({
        data: mockConfig,
      });

      const result = await client.getGtagConfig('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.gtagConfig).toEqual(mockConfig);
    });

    it('should create Google Tag config', async () => {
      const mockConfig = { gtagConfigId: '1', tagId: 'G-XXXXXXXXXX' };
      (mockService.accounts.containers.workspaces as any).gtag_config.create.mockResolvedValue({
        data: mockConfig,
      });

      const result = await client.createGtagConfig('123', '456', 'G-XXXXXXXXXX', [
        { key: 'send_page_view', value: 'true', type: 'boolean' },
      ]);

      expect(result.success).toBe(true);
      expect(result.gtagConfig).toEqual(mockConfig);
    });

    it('should update Google Tag config', async () => {
      const mockConfig = { gtagConfigId: '1', tagId: 'G-XXXXXXXXXX', fingerprint: 'abc' };
      (mockService.accounts.containers.workspaces as any).gtag_config.get.mockResolvedValue({
        data: mockConfig,
      });
      (mockService.accounts.containers.workspaces as any).gtag_config.update.mockResolvedValue({
        data: { ...mockConfig, tagId: 'G-YYYYYYYYYY' },
      });

      const result = await client.updateGtagConfig('123', '456', '1', 'G-YYYYYYYYYY');

      expect(result.success).toBe(true);
    });

    it('should delete Google Tag config', async () => {
      (mockService.accounts.containers.workspaces as any).gtag_config.delete.mockResolvedValue({});

      const result = await client.deleteGtagConfig('123', '456', '1');

      expect(result.success).toBe(true);
    });

    it('should revert Google Tag config', async () => {
      const mockConfig = { gtagConfigId: '1', tagId: 'G-XXXXXXXXXX' };
      (mockService.accounts.containers.workspaces as any).gtag_config.revert.mockResolvedValue({
        data: mockConfig,
      });

      const result = await client.revertGtagConfig('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.gtagConfig).toEqual(mockConfig);
    });
  });

  describe('Template Operations', () => {
    beforeEach(() => {
      mockService.accounts.containers.workspaces.list.mockResolvedValue({
        data: { workspace: [{ workspaceId: '1' }] },
      });
    });

    it('should list templates', async () => {
      const mockTemplates = [{ templateId: '1', name: 'Custom Tag Template' }];
      (mockService.accounts.containers.workspaces as any).templates = {
        list: vi.fn().mockResolvedValue({
          data: { template: mockTemplates },
        }),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        revert: vi.fn(),
        import_from_gallery: vi.fn(),
      };

      const result = await client.listTemplates('123', '456');

      expect(result.success).toBe(true);
      expect(result.templates).toEqual(mockTemplates);
    });

    it('should get template', async () => {
      const mockTemplate = { templateId: '1', name: 'Custom Tag Template' };
      (mockService.accounts.containers.workspaces as any).templates.get.mockResolvedValue({
        data: mockTemplate,
      });

      const result = await client.getTemplate('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.template).toEqual(mockTemplate);
    });

    it('should create template', async () => {
      const mockTemplate = { templateId: '1', name: 'Custom Tag Template' };
      (mockService.accounts.containers.workspaces as any).templates.create.mockResolvedValue({
        data: mockTemplate,
      });

      const result = await client.createTemplate('123', '456', 'Custom Tag Template', '{}');

      expect(result.success).toBe(true);
      expect(result.template).toEqual(mockTemplate);
    });

    it('should update template', async () => {
      const mockTemplate = { templateId: '1', name: 'Custom Tag Template', fingerprint: 'abc' };
      (mockService.accounts.containers.workspaces as any).templates.get.mockResolvedValue({
        data: mockTemplate,
      });
      (mockService.accounts.containers.workspaces as any).templates.update.mockResolvedValue({
        data: { ...mockTemplate, name: 'Updated Template' },
      });

      const result = await client.updateTemplate('123', '456', '1', 'Updated Template');

      expect(result.success).toBe(true);
    });

    it('should delete template', async () => {
      (mockService.accounts.containers.workspaces as any).templates.delete.mockResolvedValue({});

      const result = await client.deleteTemplate('123', '456', '1');

      expect(result.success).toBe(true);
    });

    it('should revert template', async () => {
      const mockTemplate = { templateId: '1', name: 'Reverted Template' };
      (mockService.accounts.containers.workspaces as any).templates.revert.mockResolvedValue({
        data: mockTemplate,
      });

      const result = await client.revertTemplate('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.template).toEqual(mockTemplate);
    });

    it('should import template from gallery', async () => {
      const mockTemplate = { templateId: '1', name: 'Imported Template' };
      (mockService.accounts.containers.workspaces as any).templates.import_from_gallery = vi
        .fn()
        .mockResolvedValue({
          data: mockTemplate,
        });

      const result = await client.importTemplateFromGallery('123', '456', {
        host: 'tagmanager.google.com',
        owner: 'community',
        repository: 'templates',
        signature: 'abc123',
      });

      expect(result.success).toBe(true);
      expect(result.template).toEqual(mockTemplate);
    });
  });

  describe('Transformation Operations (Server-side)', () => {
    beforeEach(() => {
      mockService.accounts.containers.workspaces.list.mockResolvedValue({
        data: { workspace: [{ workspaceId: '1' }] },
      });
    });

    it('should list transformations', async () => {
      const mockTransformations = [{ transformationId: '1', name: 'Data Transformation' }];
      (mockService.accounts.containers.workspaces as any).transformations = {
        list: vi.fn().mockResolvedValue({
          data: { transformation: mockTransformations },
        }),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        revert: vi.fn(),
      };

      const result = await client.listTransformations('123', '456');

      expect(result.success).toBe(true);
      expect(result.transformations).toEqual(mockTransformations);
    });

    it('should get transformation', async () => {
      const mockTransformation = { transformationId: '1', name: 'Data Transformation' };
      (mockService.accounts.containers.workspaces as any).transformations.get.mockResolvedValue({
        data: mockTransformation,
      });

      const result = await client.getTransformation('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.transformation).toEqual(mockTransformation);
    });

    it('should create transformation', async () => {
      const mockTransformation = { transformationId: '1', name: 'Data Transformation', type: 'CUSTOM' };
      (mockService.accounts.containers.workspaces as any).transformations.create.mockResolvedValue({
        data: mockTransformation,
      });

      const result = await client.createTransformation('123', '456', 'Data Transformation', 'CUSTOM', [
        { key: 'code', value: 'function transform(data) { ... }' },
      ]);

      expect(result.success).toBe(true);
      expect(result.transformation).toEqual(mockTransformation);
    });

    it('should update transformation', async () => {
      const mockTransformation = { transformationId: '1', name: 'Data Transformation', fingerprint: 'abc' };
      (mockService.accounts.containers.workspaces as any).transformations.get.mockResolvedValue({
        data: mockTransformation,
      });
      (mockService.accounts.containers.workspaces as any).transformations.update.mockResolvedValue({
        data: { ...mockTransformation, name: 'Updated Transformation' },
      });

      const result = await client.updateTransformation('123', '456', '1', 'Updated Transformation');

      expect(result.success).toBe(true);
    });

    it('should delete transformation', async () => {
      (mockService.accounts.containers.workspaces as any).transformations.delete.mockResolvedValue({});

      const result = await client.deleteTransformation('123', '456', '1');

      expect(result.success).toBe(true);
    });

    it('should revert transformation', async () => {
      const mockTransformation = { transformationId: '1', name: 'Reverted Transformation' };
      (mockService.accounts.containers.workspaces as any).transformations.revert.mockResolvedValue({
        data: mockTransformation,
      });

      const result = await client.revertTransformation('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.transformation).toEqual(mockTransformation);
    });
  });

  describe('Zone Operations (Server-side)', () => {
    beforeEach(() => {
      mockService.accounts.containers.workspaces.list.mockResolvedValue({
        data: { workspace: [{ workspaceId: '1' }] },
      });
    });

    it('should list zones', async () => {
      const mockZones = [{ zoneId: '1', name: 'Default Zone' }];
      (mockService.accounts.containers.workspaces as any).zones = {
        list: vi.fn().mockResolvedValue({
          data: { zone: mockZones },
        }),
        get: vi.fn(),
      };

      const result = await client.listZones('123', '456');

      expect(result.success).toBe(true);
      expect(result.zones).toEqual(mockZones);
    });

    it('should get zone', async () => {
      const mockZone = { zoneId: '1', name: 'Default Zone' };
      (mockService.accounts.containers.workspaces as any).zones.get.mockResolvedValue({
        data: mockZone,
      });

      const result = await client.getZone('123', '456', '1');

      expect(result.success).toBe(true);
      expect(result.zone).toEqual(mockZone);
    });
  });

  describe('User Permission Operations', () => {
    it('should list user permissions', async () => {
      const mockPermissions = [
        { userPermissionId: '1', emailAddress: 'user@example.com' },
      ];
      mockService.accounts.user_permissions.list.mockResolvedValue({
        data: { userPermission: mockPermissions },
      });

      const result = await client.listUserPermissions('123');

      expect(result.success).toBe(true);
      expect(result.userPermissions).toEqual(mockPermissions);
    });

    it('should get user permission', async () => {
      const mockPermission = {
        userPermissionId: '1',
        emailAddress: 'user@example.com',
        accountAccess: { permission: 'user' },
      };
      mockService.accounts.user_permissions.get.mockResolvedValue({
        data: mockPermission,
      });

      const result = await client.getUserPermission('123', '1');

      expect(result.success).toBe(true);
      expect(result.userPermission).toEqual(mockPermission);
    });

    it('should create user permission', async () => {
      const mockPermission = {
        userPermissionId: '1',
        emailAddress: 'user@example.com',
        accountAccess: { permission: 'user' },
      };
      mockService.accounts.user_permissions.create.mockResolvedValue({
        data: mockPermission,
      });

      const result = await client.createUserPermission(
        '123',
        'user@example.com',
        { permission: 'user' },
        [{ containerId: '456', permission: 'edit' }]
      );

      expect(result.success).toBe(true);
      expect(result.userPermission).toEqual(mockPermission);
    });

    it('should update user permission', async () => {
      const mockPermission = {
        userPermissionId: '1',
        emailAddress: 'user@example.com',
        accountAccess: { permission: 'user' },
        fingerprint: 'abc',
      };
      mockService.accounts.user_permissions.get.mockResolvedValue({
        data: mockPermission,
      });
      mockService.accounts.user_permissions.update.mockResolvedValue({
        data: { ...mockPermission, accountAccess: { permission: 'admin' } },
      });

      const result = await client.updateUserPermission(
        '123',
        '1',
        { permission: 'admin' },
        [{ containerId: '456', permission: 'publish' }]
      );

      expect(result.success).toBe(true);
    });

    it('should delete user permission', async () => {
      mockService.accounts.user_permissions.delete.mockResolvedValue({});

      const result = await client.deleteUserPermission('123', '1');

      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockService.accounts.list.mockRejectedValue(new Error('API Error'));

      const result = await client.listAccounts();

      expect(result.success).toBe(false);
      expect(result.error).toBe('API Error');
    });

    it('should handle missing service', async () => {
      const testClient = new GTMClient();
      (testClient as any).service = null;

      await expect(testClient.listAccounts()).rejects.toThrow(
        'Service not initialized'
      );
    });

    it('should handle container update errors', async () => {
      mockService.accounts.containers.get.mockRejectedValue(new Error('Not found'));

      const result = await client.updateContainer('123', '456', { name: 'Updated' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not found');
    });
  });
});

