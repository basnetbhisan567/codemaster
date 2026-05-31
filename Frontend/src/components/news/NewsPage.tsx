import { NewsCard } from './NewsCard';
import { CategoryFilter } from './CategoryFilter';
import { useState } from 'react';

export const NewsPage = () => {
  const [category, setCategory] = useState('all');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tech News</h1>
      <CategoryFilter selected={category} onChange={setCategory} />
      <div className="space-y-3">{/* News cards */}</div>
    </div>
  );
};