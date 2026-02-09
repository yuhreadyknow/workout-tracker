import { useState, useMemo } from 'react';
import { useWorkouts } from '../hooks/useWorkouts';
import CalendarGrid from '../components/CalendarGrid';
import ExerciseRow from '../components/ExerciseRow';

export default function History() {
  const { workouts, loading } = useWorkouts();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const completedWorkouts = useMemo(
    () => workouts.filter((w) => w.completed_at),
    [workouts]
  );

  const workoutDates = useMemo(
    () => new Set(completedWorkouts.map((w) => w.date)),
    [completedWorkouts]
  );

  const selectedWorkouts = useMemo(
    () => (selectedDate ? completedWorkouts.filter((w) => w.date === selectedDate) : []),
    [completedWorkouts, selectedDate]
  );

  return (
    <div className="p-4 pb-24 space-y-6">
      <h1 className="text-2xl font-bold text-white">History</h1>

      <div className="bg-slate-800/50 rounded-xl p-4">
        <CalendarGrid
          workoutDates={workoutDates}
          onSelectDate={setSelectedDate}
          selectedDate={selectedDate}
        />
      </div>

      {selectedDate && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </h2>
          {selectedWorkouts.length === 0 ? (
            <div className="text-slate-500 text-sm bg-slate-800/30 rounded-lg p-4 text-center">
              No workouts on this day
            </div>
          ) : (
            <div className="space-y-4">
              {selectedWorkouts.map((w) => (
                <div key={w.id} className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                  <div className="font-semibold text-white">{w.name}</div>
                  <div className="text-xs text-slate-500">
                    {w.exercises.filter((e) => e.completed).length}/{w.exercises.length} completed
                  </div>
                  <div className="space-y-1">
                    {w.exercises.map((ex) => (
                      <ExerciseRow key={ex.id} exercise={ex} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-white mb-3">All Workouts</h2>
        {loading ? (
          <div className="text-slate-500 text-sm">Loading...</div>
        ) : completedWorkouts.length === 0 ? (
          <div className="text-slate-500 text-sm bg-slate-800/30 rounded-lg p-6 text-center">
            No completed workouts yet
          </div>
        ) : (
          <div className="space-y-2">
            {completedWorkouts.map((w) => (
              <div
                key={w.id}
                onClick={() => setSelectedDate(w.date)}
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
                <div className="text-xs text-slate-600">
                  {w.exercises.filter((e) => e.completed).length}/{w.exercises.length}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
