import { MilestoneCard } from './MilestoneCard';

interface Milestone { id: string; title: string; completed: boolean; date: string; }
interface RoadmapTimelineProps { milestones: Milestone[]; }

export const RoadmapTimeline = ({ milestones }: RoadmapTimelineProps) => (
  <div className="relative">
    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />
    <div className="space-y-4">{milestones.map(m => <MilestoneCard key={m.id} {...m} />)}</div>
  </div>
);