import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTemplate } from '../hooks/useTemplates';
import ExerciseRow from '../components/ExerciseRow';
import ExerciseForm from '../components/ExerciseForm';
import * as api from '../api';
import type { TemplateExercise } from '../types';

export default function TemplateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { template, loading, refresh } = useTemplate(id);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');

  if (loading || !template) {
    return <div className="flex items-center justify-center h-screen text-slate-500">Loading...</div>;
  }

  const saveExercises = async (exercises: Omit<TemplateExercise, 'id' | 'template_id'>[]) => {
    await api.updateTemplate(template.id, { name: template.name, exercises });
    refresh();
  };

  const addExercise = async (data: { name: string; weight: number; weight_unit: 'LB' | 'KG'; sets: number; reps: number }) => {
    const exercises = [
      ...template.exercises.map((e) => ({
        name: e.name, weight: e.weight, weight_unit: e.weight_unit, sets: e.sets, reps: e.reps, sort_order: e.sort_order,
      })),
      { ...data, sort_order: template.exercises.length },
    ];
    await saveExercises(exercises);
    setShowAddForm(false);
  };

  const removeExercise = async (idx: number) => {
    const exercises = template.exercises
      .filter((_, i) => i !== idx)
      .map((e, i) => ({
        name: e.name, weight: e.weight, weight_unit: e.weight_unit, sets: e.sets, reps: e.reps, sort_order: i,
      }));
    await saveExercises(exercises);
  };

  const startWorkout = async () => {
    const w = await api.createWorkout({ template_id: template.id, name: template.name });
    navigate(`/workout/${w.id}`);
  };

  const saveName = async () => {
    if (!editName.trim()) return;
    await api.updateTemplate(template.id, {
      name: editName.trim(),
      exercises: template.exercises.map((e) => ({
        name: e.name, weight: e.weight, weight_unit: e.weight_unit, sets: e.sets, reps: e.reps, sort_order: e.sort_order,
      })),
    });
    setEditing(false);
    refresh();
  };

  const deleteTemplate = async () => {
    await api.deleteTemplate(template.id);
    navigate('/templates');
  };

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/templates')} className="text-slate-400 touch-manipulation">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {editing ? (
          <div className="flex-1 flex gap-2">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveName()}
              className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-1 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button onClick={saveName} className="text-blue-400 text-sm font-medium">Save</button>
          </div>
        ) : (
          <h1
            className="text-2xl font-bold text-white flex-1"
            onClick={() => { setEditing(true); setEditName(template.name); }}
          >
            {template.name}
          </h1>
        )}
      </div>

      <div className="space-y-2">
        {template.exercises.map((ex, i) => (
          <div key={ex.id} className="flex items-center gap-2">
            <div className="flex-1">
              <ExerciseRow exercise={ex} />
            </div>
            <button
              onClick={() => removeExercise(i)}
              className="text-red-400/60 hover:text-red-400 p-2 touch-manipulation flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>

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

      <div className="space-y-2 pt-4">
        <button
          onClick={startWorkout}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors touch-manipulation"
        >
          Start Workout
        </button>
        <button
          onClick={deleteTemplate}
          className="w-full text-red-400/60 text-sm py-2 touch-manipulation"
        >
          Delete Template
        </button>
      </div>
    </div>
  );
}
