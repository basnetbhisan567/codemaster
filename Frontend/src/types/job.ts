export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Freelance';
export type ExperienceLevel = 'Entry Level' | 'Mid Level' | 'Senior' | 'Lead' | 'Principal';
export type JobCategory = 'Frontend' | 'Backend' | 'Full Stack' | 'DevOps' | 'Data Science' | 'Mobile' | 'AI/ML' | 'Cloud' | 'Security' | 'Other';

export type Job = {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: JobType;
  experience: ExperienceLevel;
  category: JobCategory;
  salary: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  tags: string[];
  remote: boolean;
  postedAt: string;
  deadline?: string;
  applyUrl: string;
  saved: boolean;
  views: number;
};

export type JobFilters = {
  search: string;
  type: JobType | 'All';
  experience: ExperienceLevel | 'All';
  category: JobCategory | 'All';
  location: string;
  remote: boolean | null;
  salaryMin: string;
};

export type JobApplication = {
  id: string;
  jobId: string;
  userId: string;
  status: 'pending' | 'reviewed' | 'interview' | 'rejected' | 'offered';
  appliedAt: string;
  notes?: string;
};