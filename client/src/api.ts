import { v4 as uuid } from 'uuid';
import db from './db';
import type { Template, Workout, ProgressPoint } from './types';

// Templates
export async function getTemplates(): Promise<Template[]> {
  const templates = await db.templates.orderBy('created_at').reverse().toArray();
  const result: Template[] = [];
  for (const t of templates) {
    const exercises = await db.templateExercises.where('template_id').equals(t.id).sortBy('sort_order');
    result.push({ ...t, exercises: exercises as Template['exercises'] });
  }
  return result;
}

export async function getTemplate(id: string): Promise<Template> {
  const t = await db.templates.get(id);
  if (!t) throw new Error('Template not found');
  const exercises = await db.templateExercises.where('template_id').equals(t.id).sortBy('sort_order');
  return { ...t, exercises: exercises as Template['exercises'] };
}

export async function createTemplate(data: { name: string; exercises: Omit<Template['exercises'][0], 'id' | 'template_id'>[] }): Promise<Template> {
  const id = uuid();
  await db.templates.add({ id, name: data.name, created_at: new Date().toISOString() });
  await db.templateExercises.bulkAdd(
    (data.exercises || []).map((ex, i) => ({
      id: uuid(),
      template_id: id,
      name: ex.name,
      weight: ex.weight ?? 0,
      weight_unit: ex.weight_unit ?? 'LB',
      sets: ex.sets ?? 3,
      reps: ex.reps ?? 10,
      sort_order: ex.sort_order ?? i,
    }))
  );
  return getTemplate(id);
}

export async function updateTemplate(id: string, data: { name: string; exercises: Omit<Template['exercises'][0], 'id' | 'template_id'>[] }): Promise<Template> {
  await db.transaction('rw', db.templates, db.templateExercises, async () => {
    await db.templates.update(id, { name: data.name });
    await db.templateExercises.where('template_id').equals(id).delete();
    if (data.exercises && data.exercises.length > 0) {
      await db.templateExercises.bulkAdd(
        data.exercises.map((ex, i) => ({
          id: uuid(),
          template_id: id,
          name: ex.name,
          weight: ex.weight ?? 0,
          weight_unit: ex.weight_unit ?? 'LB',
          sets: ex.sets ?? 3,
          reps: ex.reps ?? 10,
          sort_order: ex.sort_order ?? i,
        }))
      );
    }
  });
  return getTemplate(id);
}

export async function deleteTemplate(id: string): Promise<void> {
  await db.templateExercises.where('template_id').equals(id).delete();
  await db.templates.delete(id);
}

// Workouts
export async function getWorkouts(params?: { date?: string; limit?: number }): Promise<Workout[]> {
  let collection = db.workouts.orderBy('started_at').reverse();
  let workouts = await collection.toArray();

  if (params?.date) {
    workouts = workouts.filter((w) => w.date === params.date);
  }
  if (params?.limit) {
    workouts = workouts.slice(0, params.limit);
  }

  const result: Workout[] = [];
  for (const w of workouts) {
    const exercises = await db.workoutExercises.where('workout_id').equals(w.id).sortBy('sort_order');
    result.push({
      ...w,
      exercises: exercises.map((e) => ({ ...e, completed: !!e.completed })),
    } as Workout);
  }
  return result;
}

export async function getWorkout(id: string): Promise<Workout> {
  const w = await db.workouts.get(id);
  if (!w) throw new Error('Workout not found');
  const exercises = await db.workoutExercises.where('workout_id').equals(w.id).sortBy('sort_order');
  return {
    ...w,
    exercises: exercises.map((e) => ({ ...e, completed: !!e.completed })),
  } as Workout;
}

export async function createWorkout(data: { template_id?: string; name: string }): Promise<Workout> {
  const id = uuid();
  const now = new Date();

  if (data.template_id) {
    const template = await db.templates.get(data.template_id);
    if (!template) throw new Error('Template not found');

    await db.workouts.add({
      id,
      template_id: data.template_id,
      name: data.name || template.name,
      date: now.toISOString().split('T')[0],
      started_at: now.toISOString(),
      completed_at: null,
    });

    const templateExercises = await db.templateExercises.where('template_id').equals(data.template_id).sortBy('sort_order');
    await db.workoutExercises.bulkAdd(
      templateExercises.map((ex) => ({
        id: uuid(),
        workout_id: id,
        name: ex.name,
        weight: ex.weight,
        weight_unit: ex.weight_unit,
        sets: ex.sets,
        reps: ex.reps,
        completed: 0,
        sort_order: ex.sort_order,
      }))
    );
  } else {
    await db.workouts.add({
      id,
      template_id: null,
      name: data.name || 'Custom Workout',
      date: now.toISOString().split('T')[0],
      started_at: now.toISOString(),
      completed_at: null,
    });
  }

  return getWorkout(id);
}

export async function updateWorkout(id: string, data: Partial<Workout>): Promise<Workout> {
  const updates: Record<string, any> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.completed_at !== undefined) updates.completed_at = data.completed_at;
  await db.workouts.update(id, updates);
  return getWorkout(id);
}

export async function addWorkoutExercise(workoutId: string, data: { name: string; weight: number; weight_unit: string; sets: number; reps: number }) {
  const existing = await db.workoutExercises.where('workout_id').equals(workoutId).toArray();
  const maxOrder = existing.length > 0 ? Math.max(...existing.map((e) => e.sort_order)) : -1;

  const exercise = {
    id: uuid(),
    workout_id: workoutId,
    name: data.name,
    weight: data.weight ?? 0,
    weight_unit: data.weight_unit ?? 'LB',
    sets: data.sets ?? 3,
    reps: data.reps ?? 10,
    completed: 0,
    sort_order: maxOrder + 1,
  };

  await db.workoutExercises.add(exercise);
  return { ...exercise, completed: false };
}

export async function patchExercise(workoutId: string, exerciseId: string, data: Partial<{ completed: boolean; weight: number; sets: number; reps: number }>): Promise<void> {
  const updates: Record<string, any> = {};
  if (data.completed !== undefined) updates.completed = data.completed ? 1 : 0;
  if (data.weight !== undefined) updates.weight = data.weight;
  if (data.sets !== undefined) updates.sets = data.sets;
  if (data.reps !== undefined) updates.reps = data.reps;
  await db.workoutExercises.update(exerciseId, updates);
}

// Progress
export async function getExerciseProgress(name: string): Promise<ProgressPoint[]> {
  const completedWorkouts = await db.workouts.filter((w) => w.completed_at !== null).toArray();
  const workoutIds = new Set(completedWorkouts.map((w) => w.id));
  const workoutDateMap = new Map(completedWorkouts.map((w) => [w.id, w.date]));

  const exercises = await db.workoutExercises.where('name').equals(name).toArray();
  const matching = exercises.filter((e) => workoutIds.has(e.workout_id));

  return matching
    .map((e) => ({
      date: workoutDateMap.get(e.workout_id)!,
      weight: e.weight,
      sets: e.sets,
      reps: e.reps,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getExerciseNames(): Promise<string[]> {
  const templateNames = await db.templateExercises.orderBy('name').uniqueKeys();
  const workoutNames = await db.workoutExercises.orderBy('name').uniqueKeys();
  const all = new Set([...templateNames as string[], ...workoutNames as string[]]);
  return [...all].sort();
}
