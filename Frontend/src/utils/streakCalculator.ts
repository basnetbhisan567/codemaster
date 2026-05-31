export const calculateStreak = (activityDates: string[]): number => {
  if (activityDates.length === 0) return 0;
  
  const sortedDates = [...activityDates].sort().reverse();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }
  
  let streak = 1;
  let currentDate = new Date(sortedDates[0]);
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    
    if (sortedDates[i] === prevDate.toDateString()) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }
  
  return streak;
};

export const getStreakBonus = (streak: number): number => {
  if (streak >= 30) return 50;
  if (streak >= 7) return 25;
  if (streak >= 3) return 10;
  return 0;
};