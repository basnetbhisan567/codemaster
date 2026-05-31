import { NextTopics } from './NextTopics';

export const RoadmapDayView = () => (
  <div className="glass-card p-6">
    <h3 className="font-semibold mb-4">Today's Plan</h3>
    <NextTopics topics={['Arrays', 'Linked Lists', 'Sorting']} />
  </div>
);