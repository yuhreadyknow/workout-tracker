import { useState, useEffect, useCallback } from 'react';
import type { Workout } from '../types';
import * as api from '../api';

export function useWorkouts(params?: { date?: string; limit?: number }) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getWorkouts(params);
      setWorkouts(data);
    } catch (err) {
      console.error('Failed to load workouts', err);
    } finally {
      setLoading(false);
    }
  }, [params?.date, params?.limit]);

  useEffect(() => { refresh(); }, [refresh]);

  return { workouts, loading, refresh };
}

export function useWorkout(id: string | undefined) {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.getWorkout(id);
      setWorkout(data);
    } catch (err) {
      console.error('Failed to load workout', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);

  return { workout, loading, refresh, setWorkout };
}
