import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import { useLockdownStore } from '../../stores/lockdownStore';
import { Button } from '../ui/Button';
import { Card } from '../ui/card';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const FocusScheduler = () => {
  const { schedule, setSchedule } = useLockdownStore();

  const toggleDay = (day: string) => {
    const newDays = schedule.days.includes(day)
      ? schedule.days.filter(d => d !== day)
      : [...schedule.days, day];
    setSchedule({ days: newDays });
  };

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Focus Schedule</h3>
            <p className="text-sm text-muted-foreground">Auto-lock during study time</p>
          </div>
        </div>
        <button
          onClick={() => setSchedule({ enabled: !schedule.enabled })}
          className="text-2xl"
        >
          {schedule.enabled ? (
            <ToggleRight className="w-8 h-8 text-primary" />
          ) : (
            <ToggleLeft className="w-8 h-8 text-muted-foreground" />
          )}
        </button>
      </div>

      {schedule.enabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Time</label>
              <input
                type="time"
                value={schedule.startTime}
                onChange={(e) => setSchedule({ startTime: e.target.value })}
                className="w-full p-3 glass rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Time</label>
              <input
                type="time"
                value={schedule.endTime}
                onChange={(e) => setSchedule({ endTime: e.target.value })}
                className="w-full p-3 glass rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Repeat on</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    schedule.days.includes(day)
                      ? 'bg-primary text-white'
                      : 'glass text-muted-foreground hover:text-white'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
            <p className="text-sm text-primary flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Next focus: {schedule.days[0] || 'Not scheduled'} at {schedule.startTime}
            </p>
          </div>
        </motion.div>
      )}
    </Card>
  );
};