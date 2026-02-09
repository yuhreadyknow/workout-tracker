import type { WorkoutExercise, TemplateExercise } from '../types';

interface Props {
  exercise: WorkoutExercise | TemplateExercise;
  showCheckbox?: boolean;
  onToggle?: () => void;
  onEdit?: () => void;
}

export default function ExerciseRow({ exercise, showCheckbox, onToggle, onEdit }: Props) {
  const completed = 'completed' in exercise ? exercise.completed : false;

  return (
    <div
      className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-colors ${
        completed ? 'bg-green-900/20' : 'bg-slate-800/50'
      }`}
      onClick={onEdit}
    >
      {showCheckbox && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.();
          }}
          className="flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors touch-manipulation"
          style={{
            borderColor: completed ? '#22c55e' : '#475569',
            backgroundColor: completed ? '#22c55e' : 'transparent',
          }}
        >
          {completed && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      )}
      <div className="flex-1 min-w-0">
        <div className={`font-medium truncate ${completed ? 'line-through text-slate-500' : 'text-white'}`}>
          {exercise.name}
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-400 flex-shrink-0">
        <span className="font-mono">{exercise.weight} {exercise.weight_unit}</span>
        <span className="text-slate-600">|</span>
        <span className="font-mono">{exercise.sets}&times;{exercise.reps}</span>
      </div>
    </div>
  );
}
