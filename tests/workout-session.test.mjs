import test from 'node:test'
import assert from 'node:assert/strict'
import { createWorkoutSession, elapsedWorkoutSeconds } from '../src/lib/workout-session.ts'

const exercise = { id: 'squat', name: 'Sentadilla', category: 'Tren inferior', muscle: 'Piernas', equipment: 'Barra', detail: 'Baja controlado.', imageIndex: 0, sets: 3, reps: 10 }

test('a workout session snapshots exercise targets and creates a log for each set', () => {
  const session = createWorkoutSession('2026-10-18', [exercise], 'session-1', '2026-10-18T10:00:00.000Z')
  assert.equal(session.date, '2026-10-18')
  assert.equal(session.exercises[0].targetSets, 3)
  assert.equal(session.exercises[0].sets.length, 3)
  assert.deepEqual(session.exercises[0].sets[0], { reps: 10, weightKg: 0, rpe: '', completed: false })
})

test('elapsed time pauses at pause time and subtracts accumulated pauses after resume', () => {
  const session = { id: 'session-1', date: '2026-10-18', startedAt: '2026-10-18T10:00:00.000Z', pausedDurationMs: 10_000, exercises: [] }
  assert.equal(elapsedWorkoutSeconds({ ...session, pausedAt: '2026-10-18T10:01:00.000Z' }, Date.parse('2026-10-18T10:05:00.000Z')), 50)
  assert.equal(elapsedWorkoutSeconds(session, Date.parse('2026-10-18T10:01:40.000Z')), 90)
})
