import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { Project } from '../types/project';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectService.getAll().then(setProjects).finally(() => setLoading(false));
  }, []);

  const submitProject = async (projectId: string, code: string) => {
    await projectService.submitProject(projectId, code);
  };

  return { projects, loading, submitProject };
};