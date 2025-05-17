import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as appErrors from './appErrors';
import appLogger from '@/utils/logger';
import type { Project } from '@commercetools/platform-sdk';
import { ProjectSettingsService } from './projectSettingsService';

vi.mock('@/utils/logger', () => ({
  default: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

const mockExecute = vi.fn();
const mockGet = vi.fn(() => ({ execute: mockExecute }));
const mockAppApiRootInstance = { get: mockGet };

vi.mock('@/api/ctpClient', () => ({
  getAppApiRoot: vi.fn(() => mockAppApiRootInstance),
}));

vi.spyOn(appErrors, 'parseError').mockImplementation((err: unknown) => {
  if (err instanceof appErrors.AppError) return err;
  return new appErrors.AppError('mocked.parsed.error', {
    details: err instanceof Error ? err.message : String(err),
  });
});

describe('ProjectSettingsService', () => {
  let service: ProjectSettingsService;

  const mockProjectData: Project = {
    version: 1,
    key: 'test-project',
    name: 'Test Project Name',
    countries: ['DE', 'US'],
    currencies: ['EUR', 'USD'],
    languages: ['en', 'de'],
    createdAt: '2023-01-01T00:00:00.000Z',
    messages: { enabled: true },
    carts: { deleteDaysAfterLastModification: 30 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ProjectSettingsService();
    service.clearProjectCache();
  });

  describe('fetchProjectData', () => {
    it('should fetch project data from API and cache it on first call', async () => {
      mockExecute.mockResolvedValueOnce({ body: mockProjectData });

      const data = await service.fetchProjectData();

      expect(mockAppApiRootInstance.get).toHaveBeenCalledTimes(1);
      expect(mockExecute).toHaveBeenCalledTimes(1);
      expect(data).toEqual(mockProjectData);
      expect(appLogger.log).toHaveBeenCalledWith(
        'ProjectSettingsService: Fetching project data from API...',
      );
      expect(appLogger.log).toHaveBeenCalledWith(
        'ProjectSettingsService: Project data fetched and cached successfully.',
      );

      const cachedData = await service.fetchProjectData();
      expect(mockAppApiRootInstance.get).toHaveBeenCalledTimes(1);
      expect(cachedData).toEqual(mockProjectData);
      expect(appLogger.log).toHaveBeenCalledWith(
        'ProjectSettingsService: Returning cached project data.',
      );
    });
  });

  describe('getProjectSettings', () => {
    it('should return structured project settings on success', async () => {
      vi.spyOn(service, 'fetchProjectData').mockResolvedValueOnce(
        mockProjectData,
      );

      const settings = await service.getProjectSettings();

      expect(settings).toEqual({
        languages: mockProjectData.languages,
        countries: mockProjectData.countries,
        currencies: mockProjectData.currencies,
        name: mockProjectData.name,
      });
    });

    it('should re-throw error from fetchProjectData', async () => {
      const fetchError = new appErrors.ProjectSettingsFetchError({
        details: 'test fetch error',
      });
      vi.spyOn(service, 'fetchProjectData').mockRejectedValueOnce(fetchError);

      await expect(service.getProjectSettings()).rejects.toThrow(fetchError);
    });

    it('should return empty arrays if properties are missing in projectData', async () => {
      const partialProjectData: Partial<Project> = { name: 'Partial Project' };
      vi.spyOn(service, 'fetchProjectData').mockResolvedValueOnce(
        partialProjectData as Project,
      );

      const settings = await service.getProjectSettings();
      expect(settings).toEqual({
        languages: [],
        countries: [],
        currencies: [],
        name: 'Partial Project',
      });
    });
  });

  describe('clearProjectCache', () => {
    it('should clear the project data cache', async () => {
      mockExecute.mockResolvedValueOnce({ body: mockProjectData });
      await service.fetchProjectData();
      expect(mockAppApiRootInstance.get).toHaveBeenCalledTimes(1);

      service.clearProjectCache();
      expect(appLogger.log).toHaveBeenCalledWith(
        'ProjectSettingsService: Project data cache cleared.',
      );

      mockExecute.mockResolvedValueOnce({ body: mockProjectData });
      await service.fetchProjectData();
      expect(mockAppApiRootInstance.get).toHaveBeenCalledTimes(2);
    });
  });
});
