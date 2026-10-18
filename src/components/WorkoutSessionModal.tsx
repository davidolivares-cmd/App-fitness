import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Pause, Play, X } from 'lucide-react'
import type { WorkoutSessionLog, WorkoutSetLog } from '../lib/workout-session'
import { elapsedWorkoutSeconds } from '../lib/workout-session'
import { ExerciseImage } from './ExerciseImage'

type Props = {
  session: WorkoutSessionLog
  onChange: (session: WorkoutSessionLog) => void
  onFinish: () => void
  onAbandon: () => void
  onClose: () => void
}

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

export function WorkoutSessionModal({ session, onChange, onFinish, onAbandon, onClose }: Props) {
  const [now, setNow] = useState(Date.now())
  const [restSeconds, setRestSeconds] = useState(0)
  const [exerciseIndex, setExerciseIndex] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(() => { setNow(Date.now()); setRestSeconds((value) => Math.max(0, value - 1)) }, 1000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', closeOnEscape) }
  }, [onClose])
  const exercise = session.exercises[exerciseIndex]
  if (!exercise) return null
  const patchSet = (setIndex: number, patch: Partial<WorkoutSetLog>) => onChange({ ...session, exercises: session.exercises.map((item, index) => index === exerciseIndex ? { ...item, sets: item.sets.map((set, current) => current === setIndex ? { ...set, ...patch } : set) } : item) })
  const paused = Boolean(session.pausedAt)
  const elapsed = elapsedWorkoutSeconds(session, now)
  return <div className="modal-backdrop workout-session-backdrop" role="presentation"><section className="modal-panel workout-session-modal" role="dialog" aria-modal="true" aria-label="Modo de entrenamiento"><div className="modal-heading"><div><p className="eyebrow">SESIÓN EN CURSO · {exercise.category.toUpperCase()}</p><h2>{exercise.name}</h2></div><button className="icon-button modal-close" onClick={onClose} aria-label="Cerrar sesión y continuar después"><X size={20} /></button></div><div className="modal-body"><div className="workout-session-timer"><span>TIEMPO DE SESIÓN</span><strong>{formatTime(elapsed)}</strong><button className="secondary-button" onClick={() => { if (paused) onChange({ ...session, pausedAt: undefined, pausedDurationMs: session.pausedDurationMs + Math.max(0, Date.now() - Date.parse(session.pausedAt!)) }); else onChange({ ...session, pausedAt: new Date().toISOString() }) }}>{paused ? <Play size={15} /> : <Pause size={15} />}{paused ? 'Reanudar' : 'Pausar'}</button></div><div className="workout-session-exercise-nav"><button className="icon-button" aria-label="Ejercicio anterior" disabled={exerciseIndex === 0} onClick={() => setExerciseIndex((value) => Math.max(0, value - 1))}><ArrowLeft size={16} /></button><span>Ejercicio {exerciseIndex + 1} de {session.exercises.length}</span><button className="icon-button" aria-label="Siguiente ejercicio" disabled={exerciseIndex === session.exercises.length - 1} onClick={() => setExerciseIndex((value) => Math.min(session.exercises.length - 1, value + 1))}><ArrowRight size={16} /></button></div><div className="workout-session-exercise"><ExerciseImage index={exercise.imageIndex} name={exercise.name} image={exercise.image} /><div><strong>{exercise.muscle}</strong><small>{exercise.equipment}</small><p>{exercise.detail}</p></div></div><div className="workout-set-list">{exercise.sets.map((set, index) => <div className={`workout-set-row ${set.completed ? 'completed' : ''}`} key={`${exercise.id}-${index}`}><strong>Serie {index + 1}</strong><label>Reps<input type="number" min="1" max="300" value={set.reps} onChange={(event) => patchSet(index, { reps: Math.max(1, Math.min(300, Number(event.target.value) || 1)) })} /></label><label>Peso kg<input type="number" min="0" max="1000" step="0.5" value={set.weightKg} onChange={(event) => patchSet(index, { weightKg: Math.max(0, Math.min(1000, Number(event.target.value) || 0)) })} /></label><label>RPE<input type="number" min="1" max="10" value={set.rpe} placeholder="—" onChange={(event) => patchSet(index, { rpe: event.target.value ? Math.max(1, Math.min(10, Number(event.target.value) || 1)) : '' })} /></label><button className={set.completed ? 'secondary-button workout-set-done' : 'secondary-button'} onClick={() => { patchSet(index, { completed: !set.completed }); if (!set.completed) setRestSeconds(90) }} aria-label={`${set.completed ? 'Desmarcar' : 'Completar'} serie ${index + 1}`}><Check size={15} /></button></div>)}</div>{restSeconds > 0 && <div className="workout-rest-timer" role="status">Descanso · {formatTime(restSeconds)}<button className="tiny-text-button" onClick={() => setRestSeconds(0)}>Saltar</button><button className="tiny-text-button" onClick={() => setRestSeconds((value) => value + 30)}>+30 s</button></div>}<div className="workout-rest-presets"><span>Descanso</span>{[60, 90, 120].map((seconds) => <button className="secondary-button" key={seconds} onClick={() => setRestSeconds(seconds)}>{seconds} s</button>)}</div><div className="workout-session-actions"><button className="tiny-text-button remove-action" onClick={onAbandon}>Abandonar sesión</button><button className="primary-button" onClick={onFinish}>Terminar y guardar <Check size={16} /></button></div></div></section></div>
}
