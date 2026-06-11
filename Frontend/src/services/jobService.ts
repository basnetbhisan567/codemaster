import { apiClient } from './apiClient';

export interface Job {
  id: number;
  title: string;
  company: string;
  company_logo?: string;
  location: string;
  salary?: string;
  description: string;
  requirements?: string[];
  tags?: string[];
  remote?: boolean;
  source?: string;
  posted_at?: string;
  saved?: boolean;
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
}

export interface JobStats {
  total: number;
  remote: number;
  internships: number;
  saved: number;
  applied: number;
}

export interface Application {
  id: number;
  job_id: number;
  job_title: string;
  company: string;
  status: 'saved' | 'applied' | 'interviewing' | 'offered' | 'accepted' | 'rejected';
  ats_score?: number;
  applied_at?: string;
  interview_date?: string | null;
  notes?: string;
}

export interface ResumeData {
  full_name: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  experience: unknown[];
  education: unknown[];
  projects: unknown[];
  portfolio_url: string;
  github_url: string;
  linkedin_url: string;
}

export interface ATSResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  overall_feedback: string;
}

export interface AssistantMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AssistantResponse {
  response: string;
  suggestions?: string[];
  extracted_fields?: Record<string, unknown>;
}

export const jobService = {
  async getAll(
    search?: string,
    remote?: boolean,
    tag?: string
  ): Promise<JobsResponse> {
    const params = new URLSearchParams();

    if (search) params.append('search', search);
    if (remote !== undefined) params.append('remote', remote.toString());
    if (tag) params.append('tag', tag);

    const query = params.toString();
    const res = await apiClient.get<JobsResponse>(`/jobs${query ? `?${query}` : ''}`);

    return res.data ?? { jobs: [], total: 0 };
  },

  async getById(jobId: number): Promise<Job | null> {
    const res = await apiClient.get<Job>(`/jobs/${jobId}`);
    return res.data ?? null;
  },

  async getStats(): Promise<JobStats> {
    const res = await apiClient.get<JobStats>('/jobs/stats');
    return res.data ?? { total: 0, remote: 0, internships: 0, saved: 0, applied: 0 };
  },

  async getApplications(): Promise<Application[]> {
    const res = await apiClient.get<Application[]>('/jobs/applications');
    return res.data ?? [];
  },

  async getResume(): Promise<ResumeData | null> {
    const res = await apiClient.get<{ resume: ResumeData | null }>('/jobs/resume');
    return res.data?.resume ?? null;
  },

  async saveResume(payload: ResumeData): Promise<{ success: boolean }> {
    const res = await apiClient.post<{ success: boolean }>('/jobs/resume', payload);
    return res.data ?? { success: false };
  },

  async reviewResume(jobId?: number | null): Promise<ATSResult> {
    const res = await apiClient.post<ATSResult>('/jobs/resume/review', {
      job_id: jobId ?? null,
    });
    return res.data ?? {
      score: 0,
      strengths: [],
      weaknesses: [],
      suggestions: [],
      overall_feedback: 'No review available.',
    };
  },

  async applyToJob(jobId: number, coverLetter?: string): Promise<{ success: boolean }> {
    const res = await apiClient.post<{ success: boolean }>(`/jobs/apply/${jobId}`, {
      cover_letter: coverLetter || '',
    });
    return res.data ?? { success: false };
  },

  async updateApplicationStatus(
    appId: number,
    status: Application['status']
  ): Promise<{ success: boolean }> {
    const res = await apiClient.put<{ success: boolean }>(`/jobs/applications/${appId}`, {
      status,
    });
    return res.data ?? { success: false };
  },

  async getCareerAdvice(question: string, context?: string): Promise<AssistantResponse> {
    const res = await apiClient.post<AssistantResponse>('/jobs/career-advice', {
      question,
      context: context || '',
    });
    return res.data ?? { response: 'No response available.' };
  },

  async chatAssistant(messages: AssistantMessage[]): Promise<AssistantResponse> {
    const res = await apiClient.post<AssistantResponse>('/jobs/assistant/chat', {
      messages,
    });
    return res.data ?? { response: 'No response available.' };
  },

  async getRecommendations(): Promise<Job[]> {
    const res = await apiClient.get<Job[]>('/jobs/recommendations');
    return res.data ?? [];
  },

  async uploadDocument(file: File): Promise<{ success: boolean; extracted?: unknown }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post<{ success: boolean; extracted?: unknown }>(
      '/jobs/documents/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    return res.data ?? { success: false };
  },
  async saveJob(id: number): Promise<{ success: boolean }> {
  const res = await apiClient.post<{ success: boolean }>(`/jobs/save/${id}`);
  return res.data ?? { success: false };
 }
};