export interface Template {
  id: string;
  name: string;
  created_at: string;
  exercises: TemplateExercise[];
}

export interface TemplateExercise {
  id: string;
  template_id: string;
  name: string;
  weight: number;
  weight_unit: 'LB' | 'KG';
  sets: number;
  reps: number;
  sort_order: number;
}

export interface Workout {
  id: string;
  template_id: string | null;
  name: string;
  date: string;
  started_at: string;
  completed_at: string | null;
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  name: string;
  weight: number;
  weight_unit: string;
  sets: number;
  reps: number;
  completed: boolean;
  sort_order: number;
}

export interface ProgressPoint {
  date: string;
  weight: number;
  sets: number;
  reps: number;
}
