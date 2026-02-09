import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkouts } from '../hooks/useWorkouts';
import { useTemplates } from '../hooks/useTemplates';
import * as api from '../api';
import type { Template } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { workouts, loading } = useWorkouts();
  const { templates } = useTemplates();
  const [showPicker, setShowPicker] = useState(false);

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const recentWorkouts = useMemo(
    () => workouts.filter((w) => w.completed_at).slice(0, 3),
    [workouts]
  );

  const weekStreak = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - start.getDay());
    const startStr = start.toISOString().split('T')[0];
    const days = new Set(
      workouts
        .filter((w) => w.completed_at && w.date >= startStr)
        .map((w) => w.date)
    );
    return days.size;
  }, [workouts]);

  const startWorkout = async (template?: Template) => {
    try {
      const workout = await api.createWorkout(
        template ? { template_id: template.id, name: template.name } : { name: 'Custom Workout' }
      );
      navigate(`/workout/${workout.id}`);
    } catch (err) {
      console.error('Failed to start workout', err);
    }
  };

  return (
    <div className="p-4 pb-24 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{greeting}</h1>
        <p className="text-slate-400 text-sm">{dateStr}</p>
      </div>

      <button
        onClick={() => setShowPicker(true)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl text-lg transition-colors touch-manipulation"
      >
        Start Workout
      </button>

      {showPicker && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="bg-slate-900 w-full rounded-t-2xl p-4 pb-8 space-y-3 max-h-[60vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-white">Choose a template</h2>
              <button onClick={() => setShowPicker(false)} className="text-slate-400 p-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => { setShowPicker(false); startWorkout(t); }}
                className="w-full text-left bg-slate-800 rounded-lg p-4 touch-manipulation"
              >
                <div className="font-medium text-white">{t.name}</div>
                <div className="text-sm text-slate-400">{t.exercises.length} exercises</div>
              </button>
            ))}
            <button
              onClick={() => { setShowPicker(false); startWorkout(); }}
              className="w-full text-left bg-slate-800 rounded-lg p-4 border border-dashed border-slate-600 touch-manipulation"
            >
              <div className="font-medium text-slate-300">Blank Workout</div>
              <div className="text-sm text-slate-500">Start from scratch</div>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/50 rounded-xl p-4">
          <div className="text-3xl font-bold text-blue-400">{weekStreak}</div>
          <div className="text-xs text-slate-500 mt-1">days this week</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4">
          <div className="text-3xl font-bold text-green-400">{workouts.filter(w => w.completed_at).length}</div>
          <div className="text-xs text-slate-500 mt-1">total workouts</div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Recent Workouts</h2>
        {loading ? (
          <div className="text-slate-500 text-sm">Loading...</div>
        ) : recentWorkouts.length === 0 ? (
          <div className="text-slate-500 text-sm bg-slate-800/30 rounded-lg p-6 text-center">
            No completed workouts yet. Start your first one!
          </div>
        ) : (
          <div className="space-y-2">
            {recentWorkouts.map((w) => (
              <div
                key={w.id}
                onClick={() => navigate(`/history`)}
                className="bg-slate-800/50 rounded-lg p-3 flex justify-between items-center touch-manipulation"
              >
                <div>
                  <div className="font-medium text-white">{w.name}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(w.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' \u00b7 '}
                    {w.exercises.length} exercises
                  </div>
                </div>
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
