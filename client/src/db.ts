import Dexie, { type EntityTable } from 'dexie';
import { v4 as uuid } from 'uuid';

export interface DbTemplate {
  id: string;
  name: string;
  created_at: string;
}

export interface DbTemplateExercise {
  id: string;
  template_id: string;
  name: string;
  weight: number;
  weight_unit: string;
  sets: number;
  reps: number;
  sort_order: number;
}

export interface DbWorkout {
  id: string;
  template_id: string | null;
  name: string;
  date: string;
  started_at: string;
  completed_at: string | null;
}

export interface DbWorkoutExercise {
  id: string;
  workout_id: string;
  name: string;
  weight: number;
  weight_unit: string;
  sets: number;
  reps: number;
  completed: number;
  sort_order: number;
}

const db = new Dexie('WorkoutTracker') as Dexie & {
  templates: EntityTable<DbTemplate, 'id'>;
  templateExercises: EntityTable<DbTemplateExercise, 'id'>;
  workouts: EntityTable<DbWorkout, 'id'>;
  workoutExercises: EntityTable<DbWorkoutExercise, 'id'>;
};

db.version(1).stores({
  templates: 'id, created_at',
  templateExercises: 'id, template_id, sort_order',
  workouts: 'id, template_id, date, started_at, completed_at',
  workoutExercises: 'id, workout_id, name, sort_order',
});

export default db;

// Seed data on first use
export async function seedIfEmpty() {
  const count = await db.templates.count();
  if (count > 0) return;

  const templateId = uuid();

  await db.templates.add({
    id: templateId,
    name: 'Push Day',
    created_at: new Date().toISOString(),
  });

  const exercises = [
    { name: 'Machine Bench Press', weight: 145, sets: 5, reps: 5 },
    { name: 'Machine Incline Press', weight: 100, sets: 3, reps: 6 },
    { name: 'Dumbbell Shoulder Press', weight: 40, sets: 3, reps: 10 },
    { name: 'Cable Lateral Raise', weight: 15, sets: 3, reps: 15 },
    { name: 'Tricep Pushdown', weight: 50, sets: 3, reps: 12 },
  ];

  await db.templateExercises.bulkAdd(
    exercises.map((ex, i) => ({
      id: uuid(),
      template_id: templateId,
      name: ex.name,
      weight: ex.weight,
      weight_unit: 'LB',
      sets: ex.sets,
      reps: ex.reps,
      sort_order: i,
    }))
  );
}
