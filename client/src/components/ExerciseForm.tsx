import { useState } from 'react';

interface ExerciseFormData {
  name: string;
  weight: number;
  weight_unit: 'LB' | 'KG';
  sets: number;
  reps: number;
}

interface Props {
  initial?: Partial<ExerciseFormData>;
  onSave: (data: ExerciseFormData) => void;
  onCancel: () => void;
}

export default function ExerciseForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [weight, setWeight] = useState(initial?.weight ?? 0);
  const [weightUnit, setWeightUnit] = useState<'LB' | 'KG'>(initial?.weight_unit ?? 'LB');
  const [sets, setSets] = useState(initial?.sets ?? 3);
  const [reps, setReps] = useState(initial?.reps ?? 10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), weight, weight_unit: weightUnit, sets, reps });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-4 space-y-3">
      <input
        type="text"
        placeholder="Exercise name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
      />
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-slate-500 mb-1 block">Weight</label>
          <div className="flex">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full bg-slate-700 text-white rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={0}
              step={2.5}
            />
            <button
              type="button"
              onClick={() => setWeightUnit(weightUnit === 'LB' ? 'KG' : 'LB')}
              className="bg-slate-600 text-slate-300 px-3 py-2 text-sm rounded-r-lg"
            >
              {weightUnit}
            </button>
          </div>
        </div>
        <div className="w-20">
          <label className="text-xs text-slate-500 mb-1 block">Sets</label>
          <input
            type="number"
            value={sets}
            onChange={(e) => setSets(Number(e.target.value))}
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={1}
          />
        </div>
        <div className="w-20">
          <label className="text-xs text-slate-500 mb-1 block">Reps</label>
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(Number(e.target.value))}
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={1}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-slate-700 text-slate-300 py-2 rounded-lg text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium"
        >
          Save
        </button>
      </div>
    </form>
  );
}
