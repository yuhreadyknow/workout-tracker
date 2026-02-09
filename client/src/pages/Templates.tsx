import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTemplates } from '../hooks/useTemplates';
import * as api from '../api';

export default function Templates() {
  const { templates, loading, refresh } = useTemplates();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const createTemplate = async () => {
    if (!newName.trim()) return;
    const t = await api.createTemplate({ name: newName.trim(), exercises: [] });
    setNewName('');
    setShowCreate(false);
    navigate(`/templates/${t.id}`);
  };

  const startWorkout = async (templateId: string, name: string) => {
    const w = await api.createWorkout({ template_id: templateId, name });
    navigate(`/workout/${w.id}`);
  };

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Templates</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium touch-manipulation"
        >
          + New
        </button>
      </div>

      {showCreate && (
        <div className="bg-slate-800 rounded-lg p-4 space-y-3">
          <input
            type="text"
            placeholder="Template name (e.g., Push Day)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createTemplate()}
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={() => setShowCreate(false)} className="flex-1 bg-slate-700 text-slate-300 py-2 rounded-lg text-sm">
              Cancel
            </button>
            <button onClick={createTemplate} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium">
              Create
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-slate-500 text-sm">Loading...</div>
      ) : templates.length === 0 ? (
        <div className="text-slate-500 text-sm bg-slate-800/30 rounded-lg p-8 text-center">
          No templates yet. Create one to get started!
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => navigate(`/templates/${t.id}`)}
                  className="font-semibold text-white text-left touch-manipulation"
                >
                  {t.name}
                </button>
                <button
                  onClick={() => startWorkout(t.id, t.name)}
                  className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium touch-manipulation"
                >
                  Start
                </button>
              </div>
              <div className="space-y-1">
                {t.exercises.slice(0, 3).map((ex) => (
                  <div key={ex.id} className="flex justify-between text-sm text-slate-400">
                    <span className="truncate">{ex.name}</span>
                    <span className="font-mono ml-2 flex-shrink-0">{ex.weight} {ex.weight_unit} {ex.sets}&times;{ex.reps}</span>
                  </div>
                ))}
                {t.exercises.length > 3 && (
                  <div className="text-xs text-slate-600">+{t.exercises.length - 3} more</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
