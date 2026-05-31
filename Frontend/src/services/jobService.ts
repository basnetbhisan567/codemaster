import { apiClient } from './apiClient';

export const jobService = {
  async getAll(search?: string, remote?: boolean, tag?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (remote !== undefined) params.append('remote', remote.toString());
    if (tag) params.append('tag', tag);
    const query = params.toString();
    const res = await apiClient.get<any>(`/jobs/${query ? '?' + query : ''}`);
    return res.data;
  },
  async getById(jobId: number) {
    const res = await apiClient.get<any>(`/jobs/${jobId}`);
    return res.data;
  },
};