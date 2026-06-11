export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'interviewing'
  | 'offered'
  | 'accepted'
  | 'rejected';

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
  status: ApplicationStatus;
  ats_score?: number;
  applied_at?: string;
  interview_date?: string | null;
  notes?: string;
}

export interface ResumeExperience {
  company?: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

export interface ResumeEducation {
  school?: string;
  degree?: string;
  field?: string;
  start_date?: string;
  end_date?: string;
}

export interface ResumeProject {
  name?: string;
  description?: string;
  url?: string;
}

export interface ResumeData {
  full_name: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
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