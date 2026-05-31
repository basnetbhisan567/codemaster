import { apiClient } from './apiClient';

export const validationService = {
  async validateCode(code: string, language: string): Promise<any> {
    const response = await apiClient.post('/validation/code', { code, language });
    return response.data;
  },

  async validateProject(projectId: string): Promise<any> {
    const response = await apiClient.post(`/validation/project/${projectId}`);
    return response.data;
  },

  async getValidationCriteria(): Promise<any> {
    const response = await apiClient.get('/validation/criteria');
    return response.data;
  },
};