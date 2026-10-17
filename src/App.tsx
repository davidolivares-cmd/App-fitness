import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import {
  Activity,
  Apple,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChartNoAxesCombined,
  ChefHat,
  ChevronDown,
  Clock3,
  Dumbbell,
  Flame,
  Heart,
  LayoutDashboard,
  Leaf,
  LockKeyhole,
  LogOut,
  Mail,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Weight,
  X
} from 'lucide-react'
import { supabase } from './lib/supabase'

type Section = 'inicio' | 'entreno' | 'comida' | 'progreso' | 'perfil'
type Focus = 'Tren inferior' | 'Tren superior' | 'Full body' | 'Cardio' | 'Descanso'
type Exercise = {
  id: string
  name: string
  muscle: string
  equipment: string
  focus: Exclude<Focus, 'Descanso'>
  sets: number
  reps: number
  detail: string
}
type WorkoutDay = { focus: Focus; exercises: Exercise[] }
type Recipe = {
  id: string
  name: string
  type: 'Comida' | 'Cena' | 'Desayuno' | 'Snack'
  time: number
  calories: number
  protein: number
  carbs: number
  fat: number
  ingredients: string[]
  steps: string[]
  servings: number
  description: string
  image: string
  imagePosition?: string
}
type LoggedMeal = { id: string; recipe: Recipe; loggedAt: number }

const sections: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'inicio', label: 'Inicio', icon: LayoutDashboard },
  { id: 'entreno', label: 'Entreno', icon: Dumbbell },
  { id: 'comida', label: 'Comida', icon: Apple },
  { id: 'progreso', label: 'Progreso', icon: ChartNoAxesCombined },
  { id: 'perfil', label: 'Perfil', icon: UserRound }
]

const days = [
  { id: 'Lun', name: 'Lunes', date: 19 },
  { id: 'Mar', name: 'Martes', date: 20 },
  { id: 'Mié', name: 'Miércoles', date: 21 },
  { id: 'Jue', name: 'Jueves', date: 22 },
  { id: 'Vie', name: 'Viernes', date: 23 },
  { id: 'Sáb', name: 'Sábado', date: 24 },
  { id: 'Dom', name: 'Domingo', date: 25 }
]

const exerciseCatalog: Exercise[] = [
  { id: 'leg-extension', name: 'Extensión de cuádriceps', muscle: 'Cuádriceps', equipment: 'Máquina', focus: 'Tren inferior', sets: 3, reps: 12, detail: 'Extiende las rodillas de forma controlada, sin bloquearlas con fuerza.' },
  { id: 'goblet-squat', name: 'Sentadilla goblet', muscle: 'Piernas y glúteos', equipment: 'Mancuerna', focus: 'Tren inferior', sets: 3, reps: 10, detail: 'Mantén el pecho erguido y baja hasta donde conserves una postura cómoda.' },
  { id: 'romanian-deadlift', name: 'Peso muerto rumano', muscle: 'Isquiotibiales y glúteos', equipment: 'Mancuernas', focus: 'Tren inferior', sets: 3, reps: 10, detail: 'Lleva la cadera atrás con la espalda neutra y las pesas cerca de las piernas.' },
  { id: 'leg-curl', name: 'Curl femoral', muscle: 'Isquiotibiales', equipment: 'Máquina', focus: 'Tren inferior', sets: 3, reps: 12, detail: 'Flexiona las rodillas sin dar impulso y vuelve lentamente.' },
  { id: 'calf-raise', name: 'Elevación de gemelos', muscle: 'Gemelos', equipment: 'Máquina o peso corporal', focus: 'Tren inferior', sets: 3, reps: 15, detail: 'Sube los talones y controla la bajada para completar el recorrido.' },
  { id: 'chest-press', name: 'Press de pecho', muscle: 'Pectoral y tríceps', equipment: 'Máquina o mancuernas', focus: 'Tren superior', sets: 3, reps: 10, detail: 'Mantén los hombros apoyados y controla la bajada.' },
  { id: 'lat-pulldown', name: 'Jalón al pecho', muscle: 'Espalda', equipment: 'Polea', focus: 'Tren superior', sets: 3, reps: 12, detail: 'Lleva la barra hacia la parte alta del pecho evitando balancearte.' },
  { id: 'seated-row', name: 'Remo sentado', muscle: 'Espalda y bíceps', equipment: 'Polea', focus: 'Tren superior', sets: 3, reps: 12, detail: 'Lleva los codos hacia atrás y evita encoger los hombros.' },
  { id: 'lateral-raise', name: 'Elevaciones laterales', muscle: 'Hombros', equipment: 'Mancuernas', focus: 'Tren superior', sets: 3, reps: 12, detail: 'Eleva las mancuernas hasta una altura cómoda sin impulso.' },
  { id: 'biceps-curl', name: 'Curl de bíceps', muscle: 'Bíceps', equipment: 'Mancuernas', focus: 'Tren superior', sets: 3, reps: 12, detail: 'Mantén los codos cerca del cuerpo durante todo el movimiento.' },
  { id: 'bodyweight-squat', name: 'Sentadilla', muscle: 'Piernas y glúteos', equipment: 'Peso corporal', focus: 'Full body', sets: 3, reps: 12, detail: 'Reparte el peso sobre los pies y mantén una postura estable.' },
