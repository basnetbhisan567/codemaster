import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProjectUploader } from './ProjectUploader';
import { AIReviewPanel } from './AIReviewPanel';
import { useAIValidation } from '../../hooks/useAIValidation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { ProjectComparison } from './ProjectComparison';

export const ValidationDashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const { isAnalyzing, analysisResult, analyzeProject } = useAIValidation();

  const handleProjectSubmit = async (files: FileList | string) => {
    await analyzeProject(files);
    setActiveTab('review');
  };

  return (
    <div className="glass-card p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="upload">1. Upload</TabsTrigger>
          <TabsTrigger value="review" disabled={!analysisResult}>2. Review</TabsTrigger>
          <TabsTrigger value="compare" disabled={!analysisResult}>3. Compare</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <ProjectUploader onSubmit={handleProjectSubmit} isLoading={isAnalyzing} />
        </TabsContent>

        <TabsContent value="review">
          {analysisResult && <AIReviewPanel result={analysisResult} />}
        </TabsContent>

        <TabsContent value="compare">
          {analysisResult && <ProjectComparison result={analysisResult} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};