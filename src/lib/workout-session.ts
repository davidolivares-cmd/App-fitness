import type { Exercise } from '../data/exercises'

export type WorkoutSetLog = { reps: number; weightKg: number; rpe: number | ''; completed: boolean }
export type WorkoutExerciseLog = Pick<Exercise, 'id' | 'name' | 'category' | 'muscle' | 'equipment' | 'detail' | 'imageIndex' | 'image'> & { targetSets: number; targetReps: number; sets: WorkoutSetLog[] }
export type WorkoutSessionLog = { id: string; date: string; startedAt: string; pausedAt?: string; pausedDurationMs: number; completedAt?: string; abandonedAt?: string; exercises: WorkoutExerciseLog[] }

export function createWorkoutSession(date: string, exercises: Exercise[], id: string, startedAt: string): WorkoutSessionLog {
  return {
    id, date, startedAt, pausedDurationMs: 0,
    exercises: exercises.map((exercise) => ({
      id: exercise.id, name: exercise.name, category: exercise.category, muscle: exercise.muscle,
      equipment: exercise.equipment, detail: exercise.detail, imageIndex: exercise.imageIndex, image: exercise.image,
      targetSets: exercise.sets, targetReps: exercise.reps,
      sets: Array.from({ length: exercise.sets }, () => ({ reps: exercise.reps, weightKg: 0, rpe: '', completed: false }))
    }))
  }
}

export function elapsedWorkoutSeconds(session: WorkoutSessionLog, now = Date.now()): number {
  const start = Date.parse(session.startedAt)
  const end = session.pausedAt ? Date.parse(session.pausedAt) : now
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0
  return Math.max(0, Math.floor((end - start - Math.max(0, session.pausedDurationMs)) / 1000))
}

export function pauseWorkoutSession(session: WorkoutSessionLog, now = Date.now()): WorkoutSessionLog {
  if (session.completedAt || session.abandonedAt || session.pausedAt) return session
  return { ...session, pausedAt: new Date(now).toISOString() }
}
