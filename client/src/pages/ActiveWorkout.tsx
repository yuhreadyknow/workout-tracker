import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkout } from '../hooks/useWorkouts';
import ExerciseRow from '../components/ExerciseRow';
import ExerciseForm from '../components/ExerciseForm';
import * as api from '../api';

export default function ActiveWorkout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workout, loading, refresh, setWorkout } = useWorkout(id);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!workout?.started_at) return;
    const start = new Date(workout.started_at).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [workout?.started_at]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const toggleExercise = async (exerciseId: string, completed: boolean) => {
    if (!workout) return;
    await api.patchExercise(workout.id, exerciseId, { completed: !completed });
    setWorkout({
      ...workout,
      exercises: workout.exercises.map((e) =>
        e.id === exerciseId ? { ...e, completed: !completed } : e
      ),
    });
  };

  const addExercise = async (data: { name: string; weight: number; weight_unit: 'LB' | 'KG'; sets: number; reps: number }) => {
    if (!workout) return;
    const newEx = await api.addWorkoutExercise(workout.id, data);
    setWorkout({ ...workout, exercises: [...workout.exercises, newEx as any] });
    setShowAddForm(false);
  };

  const updateExercise = async (exerciseId: string, data: { name: string; weight: number; weight_unit: 'LB' | 'KG'; sets: number; reps: number }) => {
    if (!workout) return;
    await api.patchExercise(workout.id, exerciseId, { weight: data.weight, sets: data.sets, reps: data.reps });
    setWorkout({
      ...workout,
      exercises: workout.exercises.map((e) =>
        e.id === exerciseId ? { ...e, ...data } : e
      ),
    });
    setEditingId(null);
  };

  const finishWorkout = async () => {
    if (!workout) return;
    await api.updateWorkout(workout.id, { completed_at: new Date().toISOString() } as any);
    navigate('/');
  };

  if (loading || !workout) {
    return <div className="flex items-center justify-center h-screen text-slate-500">Loading...</div>;
  }

  const completedCount = workout.exercises.filter((e) => e.completed).length;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="text-slate-400 touch-manipulation">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-center">
          <div className="font-semibold text-white">{workout.name}</div>
          <div className="text-xs text-slate-400 font-mono">{formatTime(elapsed)}</div>
        </div>
        <div className="w-6" />
      </div>

      <div className="px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="flex-1 bg-slate-800 rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all"
              style={{ width: workout.exercises.length ? `${(completedCount / workout.exercises.length) * 100}%` : '0%' }}
            />
          </div>
          <span>{completedCount}/{workout.exercises.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-32">
        {workout.exercises.map((ex) =>
          editingId === ex.id ? (
            <ExerciseForm
              key={ex.id}
              initial={{ name: ex.name, weight: ex.weight, weight_unit: ex.weight_unit as 'LB' | 'KG', sets: ex.sets, reps: ex.reps }}
              onSave={(data) => updateExercise(ex.id, data)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <ExerciseRow
              key={ex.id}
              exercise={ex}
              showCheckbox
              onToggle={() => toggleExercise(ex.id, ex.completed)}
              onEdit={() => setEditingId(ex.id)}
            />
          )
        )}

        {showAddForm ? (
          <ExerciseForm onSave={addExercise} onCancel={() => setShowAddForm(false)} />
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 border border-dashed border-slate-700 rounded-lg text-slate-500 text-sm touch-manipulation"
          >
            + Add Exercise
          </button>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950">
        <button
          onClick={finishWorkout}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl text-lg transition-colors touch-manipulation"
        >
          Finish Workout
        </button>
      </div>
    </div>
  );
}
