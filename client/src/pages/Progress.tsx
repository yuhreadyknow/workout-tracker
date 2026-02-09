import { useState, useEffect } from 'react';
import ProgressChart from '../components/ProgressChart';
import * as api from '../api';
import type { ProgressPoint } from '../types';

export default function Progress() {
  const [names, setNames] = useState<string[]>([]);
  const [selected, setSelected] = useState('');
  const [data, setData] = useState<ProgressPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getExerciseNames().then((n) => {
      setNames(n);
      if (n.length > 0 && !selected) setSelected(n[0]);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    api.getExerciseProgress(selected).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [selected]);

  const maxWeight = data.length > 0 ? Math.max(...data.map((d) => d.weight)) : 0;
  const maxVolume = data.length > 0 ? Math.max(...data.map((d) => d.weight * d.sets * d.reps)) : 0;

  return (
    <div className="p-4 pb-24 space-y-6">
      <h1 className="text-2xl font-bold text-white">Progress</h1>

      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full bg-slate-800 text-white rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
      >
        {names.length === 0 && <option value="">No exercises yet</option>}
        {names.map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>

      <div className="bg-slate-800/50 rounded-xl p-4">
        <h2 className="text-sm font-medium text-slate-400 mb-3">Weight Over Time</h2>
        {loading ? (
          <div className="text-slate-500 text-sm h-48 flex items-center justify-center">Loading...</div>
        ) : (
          <ProgressChart data={data} />
        )}
      </div>

      {data.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400">{maxWeight}</div>
            <div className="text-xs text-slate-500 mt-1">Max Weight</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">{maxVolume.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">Max Volume</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="text-2xl font-bold text-purple-400">{data.length}</div>
            <div className="text-xs text-slate-500 mt-1">Sessions</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="text-2xl font-bold text-amber-400">
              {data.length >= 2
                ? `${data[data.length - 1].weight - data[0].weight > 0 ? '+' : ''}${data[data.length - 1].weight - data[0].weight}`
                : '—'}
            </div>
            <div className="text-xs text-slate-500 mt-1">Weight Change</div>
          </div>
        </div>
      )}
    </div>
  );
}
