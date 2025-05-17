import appLogger from '@/utils/logger';
import { type Project } from '@commercetools/platform-sdk';
import { appApiRoot } from '@/api/ctpClient';
import { parseCtpError, AuthError } from './authErrors';
import { AuthMessageKey } from '@/localization/i18nKeys';

interface ProjectSettings {
  languages: string[];
  countries: string[];
  currencies: string[];
  name: string;
}

class ProjectSettingsService {
  private projectCache: Project | null = null;

  private async fetchFullProjectData(): Promise<Project> {
    if (this.projectCache) {
      appLogger.log('ProjectSettingsService: Returning cached project data.');
      return this.projectCache;
    }

    appLogger.log('ProjectSettingsService: Fetching project data from API...');
    try {
      const projectResponse = await appApiRoot.get().execute();

      if (projectResponse.body) {
        this.projectCache = projectResponse.body;
        appLogger.log(
          'ProjectSettingsService: Project data fetched and cached successfully.',
        );
        return this.projectCache;
      }
      throw new AuthError(AuthMessageKey.UnknownError, {
        details: 'Project data body is empty',
      });
    } catch (error: unknown) {
      appLogger.error(
        'ProjectSettingsService: Failed to fetch project data:',
        error,
      );
      this.projectCache = null;
      throw parseCtpError(error);
    }
  }

  async getProjectSettings(): Promise<ProjectSettings | null> {
    try {
      const projectData = await this.fetchFullProjectData();
      return {
        languages: projectData.languages || [],
        countries: projectData.countries || [],
        currencies: projectData.currencies || [],
        name: projectData.name || 'Unknown Project',
      };
    } catch (error) {
      appLogger.error(
        'ProjectSettingsService: Failed to fetch project settings:',
        error,
      );
      return null;
    }
  }

  async getProjectLanguages(): Promise<string[]> {
    try {
      const projectData = await this.fetchFullProjectData();
      return projectData.languages || [];
    } catch (error) {
      appLogger.error(
        'ProjectSettingsService: Failed to fetch project languages:',
        error,
      );
      return [];
    }
  }

  async getProjectCountries(): Promise<string[]> {
    try {
      const projectData = await this.fetchFullProjectData();
      return projectData.countries || [];
    } catch (error) {
      appLogger.error(
        'ProjectSettingsService: Failed to fetch project countries:',
        error,
      );
      return [];
    }
  }

  public clearProjectCache(): void {
    this.projectCache = null;
    appLogger.log('ProjectSettingsService: Project data cache cleared.');
  }
}

export default new ProjectSettingsService();
