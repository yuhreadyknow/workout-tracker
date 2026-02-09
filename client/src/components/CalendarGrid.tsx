import { useMemo, useState } from 'react';

interface Props {
  workoutDates: Set<string>;
  onSelectDate: (date: string) => void;
  selectedDate: string | null;
}

export default function CalendarGrid({ workoutDates, onSelectDate, selectedDate }: Props) {
  const [offset, setOffset] = useState(0);

  const { year, month, days, firstDayOfWeek, monthLabel } = useMemo(() => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const firstDay = d.getDay();
    return {
      year: y,
      month: m,
      days: daysInMonth,
      firstDayOfWeek: firstDay,
      monthLabel: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };
  }, [offset]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let i = 1; i <= days; i++) cells.push(i);

  const toDateStr = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${m}-${dd}`;
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setOffset(offset - 1)} className="text-slate-400 p-2 touch-manipulation">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-white font-medium">{monthLabel}</span>
        <button onClick={() => setOffset(offset + 1)} className="text-slate-400 p-2 touch-manipulation">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const dateStr = toDateStr(day);
          const hasWorkout = workoutDates.has(dateStr);
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === today;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`relative aspect-square flex items-center justify-center rounded-lg text-sm touch-manipulation transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : isToday
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {day}
              {hasWorkout && (
                <span
                  className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-white' : 'bg-blue-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
