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
  { id: 'push-up', name: 'Flexiones', muscle: 'Pecho, hombros y tríceps', equipment: 'Peso corporal', focus: 'Full body', sets: 3, reps: 8, detail: 'Mantén el cuerpo alineado y adapta la inclinación a tu nivel.' },
  { id: 'dumbbell-row', name: 'Remo con mancuerna', muscle: 'Espalda', equipment: 'Mancuerna', focus: 'Full body', sets: 3, reps: 10, detail: 'Apoya una mano y lleva el codo hacia la cadera con control.' },
  { id: 'plank', name: 'Plancha', muscle: 'Core', equipment: 'Peso corporal', focus: 'Full body', sets: 3, reps: 30, detail: 'Mantén el abdomen activo y evita hundir la zona lumbar.' },
  { id: 'treadmill', name: 'Caminata en cinta', muscle: 'Cardiovascular', equipment: 'Cinta', focus: 'Cardio', sets: 1, reps: 20, detail: 'Mantén un ritmo que te permita controlar la respiración.' },
  { id: 'bike', name: 'Bicicleta estática', muscle: 'Cardiovascular', equipment: 'Bicicleta', focus: 'Cardio', sets: 1, reps: 20, detail: 'Ajusta el sillín y elige una resistencia que puedas mantener.' }
]

const recipes: Recipe[] = [
  { id: 'chicken-rice', name: 'Bowl de pollo y arroz', type: 'Comida', time: 25, calories: 520, protein: 42, carbs: 58, fat: 11, servings: 1, ingredients: ['150 g de pollo', '70 g de arroz en seco', '½ pimiento', '1 tomate pequeño', '1 cucharadita de aceite de oliva'], steps: ['Cuece el arroz siguiendo las indicaciones del paquete.', 'Corta el pollo y el pimiento en tiras. Cocina el pollo en una sartén con el aceite.', 'Añade el pimiento y el tomate troceado; cocina hasta que estén tiernos.', 'Sirve el salteado sobre el arroz y ajusta las especias al gusto.'], description: 'Un plato completo, fácil de preparar y rico en proteína.', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85' },
  { id: 'salmon-potato', name: 'Salmón con patata y verduras', type: 'Cena', time: 30, calories: 570, protein: 38, carbs: 45, fat: 24, servings: 1, ingredients: ['150 g de salmón', '200 g de patata', '150 g de brócoli', 'Limón al gusto', '1 cucharadita de aceite de oliva'], steps: ['Precalienta el horno a 200 °C y corta la patata en dados.', 'Hornea la patata con el aceite durante unos 20 minutos, removiendo a mitad.', 'Añade el salmón y el brócoli; hornea hasta que el salmón esté hecho y se separe fácilmente.', 'Termina con unas gotas de limón y sirve.'], description: 'Una cena equilibrada con verduras y grasas saludables.', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1000&q=85' },
  { id: 'omelette', name: 'Tortilla con espinacas', type: 'Cena', time: 12, calories: 310, protein: 25, carbs: 8, fat: 20, servings: 1, ingredients: ['2 huevos', '60 g de espinacas', '30 g de queso fresco', '1 cucharadita de aceite de oliva'], steps: ['Lava las espinacas y saltéalas brevemente con unas gotas de aceite.', 'Bate los huevos y mézclalos con las espinacas y el queso fresco desmenuzado.', 'Cuaja la mezcla en una sartén antiadherente a fuego medio.', 'Dobla la tortilla cuando esté hecha por la base y termina la cocción al gusto.'], description: 'Una receta rápida y versátil con pocos ingredientes.', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1000&q=85' },
  { id: 'chickpea-salad', name: 'Ensalada de garbanzos', type: 'Comida', time: 15, calories: 430, protein: 19, carbs: 56, fat: 13, servings: 1, ingredients: ['160 g de garbanzos cocidos', '1 tomate', '½ pepino', '½ lata de atún escurrido', '1 cucharadita de aceite de oliva'], steps: ['Escurre y enjuaga los garbanzos cocidos.', 'Corta el tomate y el pepino en dados pequeños.', 'Mezcla las verduras con los garbanzos y el atún escurrido.', 'Aliña con aceite, limón o vinagre y enfría unos minutos antes de servir.'], description: 'Fresca, saciante y práctica para preparar con antelación.', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=85' },
  { id: 'yogurt-bowl', name: 'Yogur con avena y frutos rojos', type: 'Desayuno', time: 5, calories: 340, protein: 24, carbs: 43, fat: 7, servings: 1, ingredients: ['200 g de yogur griego natural', '35 g de avena', '80 g de frutos rojos', '½ plátano'], steps: ['Pon el yogur en un bol.', 'Añade la avena y mezcla suavemente.', 'Cubre con los frutos rojos lavados y el plátano en rodajas.', 'Deja reposar unos minutos si prefieres que la avena quede más blanda.'], description: 'Un desayuno sencillo con proteína y fibra.', image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=1000&q=85' },
  { id: 'pasta-tuna', name: 'Pasta con atún y tomate', type: 'Comida', time: 20, calories: 495, protein: 32, carbs: 66, fat: 10, servings: 1, ingredients: ['75 g de pasta en seco', '1 lata pequeña de atún escurrido', '150 g de tomate triturado', '¼ de cebolla', '1 cucharadita de aceite de oliva'], steps: ['Cuece la pasta en agua siguiendo el tiempo del paquete y reserva un poco de agua de cocción.', 'Pica la cebolla y cocínala con el aceite hasta que se ablande.', 'Añade el tomate y deja que la salsa reduzca unos minutos.', 'Incorpora el atún y la pasta; mezcla y añade un poco del agua reservada si hace falta.'], description: 'Un clásico fácil de ajustar a tus raciones.', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=85' },
  { id: 'tofu-wok', name: 'Salteado de tofu y verduras', type: 'Cena', time: 20, calories: 390, protein: 27, carbs: 28, fat: 18, servings: 1, ingredients: ['180 g de tofu firme', '½ pimiento', '100 g de brócoli', '1 zanahoria pequeña', '1 cucharada de salsa de soja'], steps: ['Seca el tofu y córtalo en dados.', 'Dóralo en una sartén antiadherente y resérvalo.', 'Saltea el pimiento, el brócoli y la zanahoria hasta que queden tiernos pero firmes.', 'Devuelve el tofu a la sartén, añade la salsa de soja y mezcla durante un minuto.'], description: 'Una opción vegetal colorida y fácil de personalizar.', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=85' },
  { id: 'banana-pancakes', name: 'Tortitas de avena y plátano', type: 'Desayuno', time: 15, calories: 365, protein: 21, carbs: 49, fat: 9, servings: 1, ingredients: ['40 g de avena', '1 plátano pequeño', '1 huevo', '30 ml de leche'], steps: ['Tritura o machaca el plátano y mézclalo con el huevo, la avena y la leche.', 'Deja reposar la mezcla dos minutos para que espese ligeramente.', 'Vierte pequeñas porciones en una sartén antiadherente a fuego medio.', 'Dales la vuelta cuando aparezcan burbujas y cocina el otro lado hasta que estén hechas.'], description: 'Una alternativa dulce y sencilla para empezar el día.', image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1000&q=85' }
]

const initialPlan: Record<string, WorkoutDay> = {
  Lun: { focus: 'Tren inferior', exercises: exerciseCatalog.filter((exercise) => ['leg-extension', 'goblet-squat', 'romanian-deadlift'].includes(exercise.id)) },
  Mar: { focus: 'Tren superior', exercises: exerciseCatalog.filter((exercise) => ['chest-press', 'lat-pulldown', 'biceps-curl'].includes(exercise.id)) },
  Mié: { focus: 'Descanso', exercises: [] },
  Jue: { focus: 'Full body', exercises: exerciseCatalog.filter((exercise) => ['bodyweight-squat', 'push-up', 'dumbbell-row', 'plank'].includes(exercise.id)) },
  Vie: { focus: 'Tren inferior', exercises: exerciseCatalog.filter((exercise) => ['leg-curl', 'calf-raise'].includes(exercise.id)) },
  Sáb: { focus: 'Cardio', exercises: exerciseCatalog.filter((exercise) => ['treadmill'].includes(exercise.id)) },
  Dom: { focus: 'Descanso', exercises: [] }
}

function ExerciseIllustration({ variant = 'machine' }: { variant?: string }) {
  return (
    <div className={`exercise-art exercise-art-${variant}`} aria-label="Ilustración orientativa del ejercicio">
      <svg viewBox="0 0 180 120" role="img" aria-hidden="true">
        <ellipse cx="92" cy="103" rx="59" ry="6" fill="#dce7da" />
        <path d="M27 23h126M34 23v72M146 23v72" stroke="#9aafa0" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M34 95h112" stroke="#78947f" strokeWidth="4" strokeLinecap="round" />
        <circle cx="70" cy="36" r="9" fill="#e8bd98" />
        <path d="M69 46l13 22 19 4" stroke="#41694d" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M78 52l-17 12-10 10" stroke="#e8bd98" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M82 68l-5 19-16 7" stroke="#41694d" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M100 72l19 12 12 0" stroke="#e8bd98" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M121 80l7 12" stroke="#41694d" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M47 77h18M48 73v8M64 73v8" stroke="#c18b50" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M51 90v7M57 90v7" stroke="#41694d" strokeWidth="3" strokeLinecap="round" />
        <circle cx="133" cy="92" r="7" fill="#bbd0bd" stroke="#78947f" strokeWidth="2" />
      </svg>
      <span>Ilustración orientativa</span>
    </div>
  )
}

function App() {
  const [active, setActive] = useState<Section>('inicio')
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [signingIn, setSigningIn] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const [selectedDay, setSelectedDay] = useState('Lun')
  const [plan, setPlan] = useState<Record<string, WorkoutDay>>(initialPlan)
  const [exerciseSearch, setExerciseSearch] = useState('')
  const [showExercisePicker, setShowExercisePicker] = useState(false)
  const [exerciseFilter, setExerciseFilter] = useState<Focus>('Tren inferior')
  const [showRoutineMessage, setShowRoutineMessage] = useState(false)

  const [loggedMeals, setLoggedMeals] = useState<LoggedMeal[]>([])
  const [showMealCreator, setShowMealCreator] = useState(false)
  const [mealMode, setMealMode] = useState<'random' | 'ingredients'>('random')
  const [ingredientText, setIngredientText] = useState('pollo, arroz, pimiento')
  const [mealType, setMealType] = useState('Cualquiera')
  const [calorieLimit, setCalorieLimit] = useState('600')
  const [proteinPriority, setProteinPriority] = useState(true)
  const [recipeResults, setRecipeResults] = useState<Recipe[]>([])
  const [recipeMessage, setRecipeMessage] = useState('')
  const [chosenRecipe, setChosenRecipe] = useState<Recipe | null>(null)
  const [randomSeed, setRandomSeed] = useState(0)
  const [favouriteRecipes, setFavouriteRecipes] = useState<string[]>([])
  const [profileCalories, setProfileCalories] = useState('2200')
  const [profileProtein, setProfileProtein] = useState('150')

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) return
      if (sessionError) setError('No se ha podido comprobar la sesión. Recarga la página e inténtalo de nuevo.')
      setSession(data.session)
      setLoading(false)
    }).catch(() => {
      if (mounted) {
        setError('No se ha podido conectar con la autenticación. Comprueba tu conexión.')
        setLoading(false)
      }
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) setSession(newSession)
    })
    return () => {
      mounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const currentDayPlan = plan[selectedDay] ?? { focus: 'Descanso' as Focus, exercises: [] }
  const todayCalories = loggedMeals.reduce((total, meal) => total + meal.recipe.calories, 0)
  const todayProtein = loggedMeals.reduce((total, meal) => total + meal.recipe.protein, 0)
  const dailyCaloriesTarget = Math.max(1, Number(profileCalories) || 2200)
  const dailyProteinTarget = Math.max(1, Number(profileProtein) || 150)
  const filteredExercises = useMemo(() => exerciseCatalog.filter((exercise) => {
    const matchesFocus = exerciseFilter === 'Descanso' || exercise.focus === exerciseFilter || (exerciseFilter === 'Full body' && ['Tren inferior', 'Tren superior'].includes(exercise.focus))
    const query = exerciseSearch.trim().toLowerCase()
    const matchesQuery = !query || `${exercise.name} ${exercise.muscle} ${exercise.equipment}`.toLowerCase().includes(query)
    return matchesFocus && matchesQuery
  }), [exerciseFilter, exerciseSearch])

  const titles: Record<Section, string> = {
    inicio: 'Tu espacio personal',
    entreno: 'Planifica tu entrenamiento',
    comida: 'Tu alimentación',
    progreso: 'Tu evolución',
    perfil: 'Tu perfil'
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSigningIn(true)
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (loginError) throw loginError
      if (!data.session) setError('No se ha podido iniciar la sesión. Inténtalo de nuevo.')
    } catch {
      setError('No se ha podido iniciar sesión. Comprueba el correo y la contraseña.')
    } finally {
      setSigningIn(false)
    }
  }

  const handleLogout = async () => {
    setError('')
    setSigningOut(true)
    const { error: logoutError } = await supabase.auth.signOut()
    if (logoutError) setError('No se ha podido cerrar la sesión. Inténtalo de nuevo.')
    setSigningOut(false)
  }

  const updateFocus = (focus: Focus) => {
    setPlan((previous) => ({ ...previous, [selectedDay]: { focus, exercises: focus === 'Descanso' ? [] : previous[selectedDay]?.focus === focus ? previous[selectedDay].exercises : exerciseCatalog.filter((exercise) => exercise.focus === focus).slice(0, focus === 'Cardio' ? 1 : 3) } }))
    setExerciseFilter(focus === 'Descanso' ? 'Full body' : focus)
  }

  const addExercise = (exercise: Exercise) => {
    setPlan((previous) => {
      const dayPlan = previous[selectedDay] ?? { focus: exercise.focus, exercises: [] }
      if (dayPlan.exercises.some((item) => item.id === exercise.id)) return previous
      return { ...previous, [selectedDay]: { ...dayPlan, focus: dayPlan.focus === 'Descanso' ? exercise.focus : dayPlan.focus, exercises: [...dayPlan.exercises, { ...exercise }] } }
    })
    setShowExercisePicker(false)
  }

  const updateExercise = (exerciseId: string, field: 'sets' | 'reps', value: number) => {
    setPlan((previous) => ({ ...previous, [selectedDay]: { ...previous[selectedDay], exercises: previous[selectedDay].exercises.map((exercise) => exercise.id === exerciseId ? { ...exercise, [field]: Math.max(1, value || 1) } : exercise) } }))
  }

  const moveExercise = (exerciseId: string, direction: -1 | 1) => {
    setPlan((previous) => {
      const exercises = [...previous[selectedDay].exercises]
      const index = exercises.findIndex((exercise) => exercise.id === exerciseId)
      const target = index + direction
      if (index < 0 || target < 0 || target >= exercises.length) return previous
      ;[exercises[index], exercises[target]] = [exercises[target], exercises[index]]
      return { ...previous, [selectedDay]: { ...previous[selectedDay], exercises } }
    })
  }

  const removeExercise = (exerciseId: string) => {
    setPlan((previous) => ({ ...previous, [selectedDay]: { ...previous[selectedDay], exercises: previous[selectedDay].exercises.filter((exercise) => exercise.id !== exerciseId) } }))
  }

  const copyRoutine = () => {
    const source = plan[selectedDay]
    setPlan((previous) => {
      const next = { ...previous }
      days.forEach((day) => {
        if (day.id !== selectedDay) next[day.id] = { focus: source.focus, exercises: source.exercises.map((exercise) => ({ ...exercise })) }
      })
      return next
    })
    setShowRoutineMessage(true)
    window.setTimeout(() => setShowRoutineMessage(false), 2600)
  }

  const findRecipes = () => {
    setRecipeMessage('')
    const limit = calorieLimit.trim() ? Number(calorieLimit) : Infinity
    let candidates = [...recipes]
    if (mealType !== 'Cualquiera') candidates = candidates.filter((recipe) => recipe.type === mealType)
    if (Number.isFinite(limit) && limit > 0) candidates = candidates.filter((recipe) => recipe.calories <= limit)

    if (mealMode === 'ingredients') {
      const ingredients = ingredientText.toLowerCase().split(/[,\n;]+/).map((item) => item.trim()).filter(Boolean)
      if (ingredients.length === 0) {
        setRecipeResults([])
        setRecipeMessage('Añade al menos un ingrediente para buscar recetas.')
        return
      }
      candidates = candidates.map((recipe) => ({ ...recipe, _matchCount: recipe.ingredients.filter((ingredient) => ingredients.some((supplied) => ingredient.includes(supplied) || supplied.includes(ingredient))).length } as Recipe & { _matchCount: number }))
        .filter((recipe) => recipe._matchCount > 0)
        .sort((a, b) => (b as Recipe & { _matchCount: number })._matchCount - (a as Recipe & { _matchCount: number })._matchCount)
    }

    if (proteinPriority) candidates.sort((a, b) => (b.protein / b.calories) - (a.protein / a.calories))
    if (candidates.length === 0) {
      setRecipeResults([])
      setRecipeMessage(mealMode === 'ingredients' ? 'No hemos encontrado una coincidencia en el catálogo para esos ingredientes y filtros. Prueba con pollo, arroz, huevo, tomate, pasta, avena o garbanzos, o amplía el límite de calorías.' : 'No encontramos recetas con esos filtros. Prueba a aumentar el límite de calorías o cambia el tipo de plato.')
      return
    }
    if (mealMode === 'random') {
      const pick = candidates[randomSeed % candidates.length]
      setRandomSeed((seed) => seed + 1)
      setRecipeResults([pick])
    } else {
      setRecipeResults(candidates.slice(0, 4))
      setRecipeMessage(`${candidates.length} receta${candidates.length === 1 ? '' : 's'} compatible${candidates.length === 1 ? '' : 's'} encontrada${candidates.length === 1 ? '' : 's'} en el catálogo.`)
    }
  }

  const addRecipeToDay = (recipe: Recipe) => {
    setLoggedMeals((previous) => [...previous, { id: `${recipe.id}-${Date.now()}`, recipe, loggedAt: Date.now() }])
    setChosenRecipe(null)
    setShowMealCreator(false)
    setRecipeResults([])
    setActive('comida')
  }

  const toggleFavourite = (recipeId: string) => {
    setFavouriteRecipes((previous) => previous.includes(recipeId) ? previous.filter((id) => id !== recipeId) : [...previous, recipeId])
  }

  if (loading) {
    return <main className="auth-screen"><section className="auth-card auth-loading"><div className="brand-mark"><Activity size={24} /></div><h1>forma</h1><p>Preparando tu espacio...</p></section></main>
  }

  if (!session) {
    return (
      <main className="auth-screen">
        <section className="auth-card">
          <div className="auth-brand"><span className="brand-mark"><Activity size={25} /></span><div><strong>forma</strong><small>FITNESS & WELLNESS</small></div></div>
          <p className="eyebrow">TU SALUD, A TU RITMO</p>
          <h1>Bienvenido</h1>
          <p className="auth-description">Inicia sesión para entrar en tu espacio personal.</p>
          <form className="auth-form" onSubmit={handleLogin}>
            <label htmlFor="email">Correo electrónico</label>
            <div className="auth-input-wrap"><Mail size={18} /><input id="email" type="email" autoComplete="email" placeholder="tu@email.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
            <label htmlFor="password">Contraseña</label>
            <div className="auth-input-wrap"><LockKeyhole size={18} /><input id="password" type="password" autoComplete="current-password" placeholder="Tu contraseña" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={signingIn}>{signingIn ? 'Iniciando sesión...' : 'Iniciar sesión'} <ArrowRight size={17} /></button>
          </form>
          <p className="auth-footer"><ShieldCheck size={15} /> Forma es un espacio privado. Las cuentas las gestiona el administrador.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#inicio" onClick={(event) => { event.preventDefault(); setActive('inicio') }}><span className="brand-mark"><Activity size={23} /></span><span><strong>forma</strong><small>FITNESS & WELLNESS</small></span></a>
        <p className="nav-heading">TU ESPACIO</p>
        <nav className="side-nav">{sections.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${active === id ? 'active' : ''}`} onClick={() => setActive(id)}><Icon size={19} /><span>{label}</span></button>)}</nav>
        <div className="sidebar-bottom"><div className="privacy-note"><span className="privacy-icon"><ShieldCheck size={19} /></span><strong>Tu progreso, a tu ritmo</strong><p>Un espacio personal para construir hábitos sostenibles.</p></div><p className="version-label"><Settings2 size={14} /> Forma · Vista de diseño</p></div>
      </aside>

      <section className="main-content">
        <header className="topbar"><div className="mobile-brand"><span className="brand-mark"><Activity size={19} /></span><strong>forma</strong></div><div className="topbar-right"><span className="preview-pill"><span className="status-dot" /> Prototipo interactivo</span><button className="avatar-button" onClick={() => setActive('perfil')} aria-label="Abrir perfil">{(session.user.email ?? 'F').slice(0, 1).toUpperCase()}</button></div></header>

        <div className="page-content">
          {active === 'inicio' && (
            <>
              <section className="hero-panel"><div className="hero-copy"><p className="eyebrow">TU SALUD, A TU RITMO</p><h1>Pequeños pasos.<br /><span>Grandes cambios.</span></h1><p className="hero-description">Organiza tus entrenamientos, descubre nuevas comidas y sigue construyendo tu bienestar.</p><button className="primary-button" onClick={() => setActive('entreno')}>Planificar mi semana <ArrowRight size={17} /></button></div><div className="hero-graphic" aria-hidden="true"><div className="hero-sun" /><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-leaf leaf-one"><Leaf size={38} /></div><div className="hero-leaf leaf-two"><Leaf size={27} /></div><div className="hero-graphic-word">FORMA</div></div></section>
              <div className="section-heading home-section-heading"><div><p className="eyebrow">HOY</p><h2>Tu resumen diario</h2></div><span className="date-chip"><CalendarDays size={15} /> {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date())}</span></div>
              <div className="home-metrics">
                <button className="metric-card nutrition-metric" onClick={() => setActive('comida')}><span className="metric-top"><span className="metric-icon"><Flame size={18} /></span><span className="metric-link">Ver comida <ArrowRight size={14} /></span></span><span className="metric-label">Calorías consumidas</span><span className="metric-number">{todayCalories.toLocaleString('es-ES')} <small>kcal</small></span><span className="progress-track"><span style={{ width: `${Math.min(100, todayCalories / dailyCaloriesTarget * 100)}%` }} /></span><span className="metric-foot">Objetivo de ejemplo: {dailyCaloriesTarget.toLocaleString('es-ES')} kcal</span></button>
                <button className="metric-card protein-metric" onClick={() => setActive('comida')}><span className="metric-top"><span className="metric-icon"><Target size={18} /></span><span className="metric-link">Ver comida <ArrowRight size={14} /></span></span><span className="metric-label">Proteína consumida</span><span className="metric-number">{todayProtein} <small>g</small></span><span className="progress-track"><span style={{ width: `${Math.min(100, todayProtein / dailyProteinTarget * 100)}%` }} /></span><span className="metric-foot">Objetivo de ejemplo: {dailyProteinTarget} g</span></button>
              </div>
              <div className="section-heading"><div><p className="eyebrow">TU PLAN</p><h2>Esta semana</h2></div><button className="text-button" onClick={() => setActive('entreno')}>Ver calendario <ArrowRight size={15} /></button></div>
              <div className="week-strip home-week-strip">{days.map((day) => <button key={day.id} className={`week-day ${selectedDay === day.id ? 'selected' : ''}`} onClick={() => { setSelectedDay(day.id); setActive('entreno') }}><span>{day.id}</span><strong>{day.date}</strong><span className="day-indicator">{plan[day.id]?.focus === 'Descanso' ? 'Libre' : plan[day.id]?.focus === 'Cardio' ? 'Cardio' : 'Fuerza'}</span></button>)}</div>
              <div className="home-bottom-grid"><button className="feature-card recipe-feature" onClick={() => { setActive('comida'); setShowMealCreator(true); setMealMode('random'); setRecipeResults([]); setRecipeMessage('') }}><span className="feature-icon warm"><ChefHat size={21} /></span><span className="feature-content"><small>¿QUÉ COCINAMOS HOY?</small><strong>Descubre tu próxima receta</strong><span>Ideas ricas, sencillas y adaptadas a tus objetivos.</span></span><ArrowRight className="feature-arrow" size={18} /></button><button className="feature-card workout-feature" onClick={() => setActive('entreno')}><span className="feature-icon sage"><Dumbbell size={21} /></span><span className="feature-content"><small>ENTRENA A TU MANERA</small><strong>Diseña tu rutina</strong><span>Elige ejercicios y organiza tu semana.</span></span><ArrowRight className="feature-arrow" size={18} /></button></div>
              <p className="prototype-note"><Sparkles size={14} /> Vista de diseño: la planificación y los registros de esta versión son temporales y aún no se guardan en tu cuenta.</p>
            </>
          )}

          {active === 'entreno' && (
            <>
              <div className="page-intro"><div><p className="eyebrow">TU PLAN, TUS REGLAS</p><h1>Organiza tu semana</h1><p className="subtitle">Selecciona un día, elige qué entrenar y personaliza cada ejercicio.</p></div><div className="intro-icon sage"><CalendarDays size={24} /></div></div>
              <div className="calendar-card"><div className="calendar-card-head"><div><span className="mini-label">CALENDARIO SEMANAL</span><h2>Tu semana de entrenamiento</h2></div><span className="week-range">19 — 25 oct.</span></div><div className="week-strip">{days.map((day) => <button key={day.id} className={`week-day ${selectedDay === day.id ? 'selected' : ''}`} onClick={() => setSelectedDay(day.id)}><span>{day.id}</span><strong>{day.date}</strong><span className="day-indicator">{plan[day.id]?.focus === 'Descanso' ? 'Descanso' : plan[day.id]?.focus === 'Cardio' ? 'Cardio' : 'Entreno'}</span></button>)}</div></div>
              <div className="workout-planner"><div className="planner-title-row"><div><p className="eyebrow">{days.find((day) => day.id === selectedDay)?.name.toUpperCase()}</p><h2>{currentDayPlan.focus === 'Descanso' ? 'Día de recuperación' : currentDayPlan.focus}</h2></div><span className="exercise-count">{currentDayPlan.exercises.length} ejercicios</span></div>
                <div className="focus-options">{(['Tren inferior', 'Tren superior', 'Full body', 'Cardio', 'Descanso'] as Focus[]).map((focus) => <button key={focus} className={currentDayPlan.focus === focus ? 'focus-option selected' : 'focus-option'} onClick={() => updateFocus(focus)}>{focus}</button>)}</div>
                {currentDayPlan.focus === 'Descanso' ? <div className="rest-state"><span className="rest-icon"><Heart size={23} /></span><h3>Recuperar también es progresar</h3><p>Deja este día libre o selecciona otro tipo de sesión para añadir ejercicios.</p><button className="secondary-button" onClick={() => updateFocus('Full body')}>Añadir entrenamiento</button></div> : <>
                  <div className="exercise-list">{currentDayPlan.exercises.map((exercise, index) => <article className="exercise-card" key={exercise.id}><ExerciseIllustration variant={exercise.id === 'leg-extension' ? 'machine' : exercise.id === 'goblet-squat' || exercise.id === 'bodyweight-squat' ? 'squat' : exercise.id === 'push-up' || exercise.id === 'plank' ? 'floor' : 'weights'} /><div className="exercise-main"><div className="exercise-title-line"><span className="exercise-index">{String(index + 1).padStart(2, '0')}</span><h3>{exercise.name}</h3><button className={`icon-button favourite-button ${favouriteRecipes.includes(`exercise-${exercise.id}`) ? 'is-favourite' : ''}`} onClick={() => toggleFavourite(`exercise-${exercise.id}`)} aria-label="Marcar ejercicio favorito"><Heart size={16} fill={favouriteRecipes.includes(`exercise-${exercise.id}`) ? 'currentColor' : 'none'} /></button></div><p className="exercise-meta">{exercise.muscle} <span>·</span> {exercise.equipment}</p><p className="exercise-detail">{exercise.detail}</p><div className="exercise-config"><label>Series <input aria-label={`Series de ${exercise.name}`} type="number" min="1" max="20" value={exercise.sets} onChange={(event) => updateExercise(exercise.id, 'sets', Number(event.target.value))} /></label><span className="config-x">×</span><label>Repeticiones / seg. <input aria-label={`Repeticiones o segundos de ${exercise.name}`} type="number" min="1" max="300" value={exercise.reps} onChange={(event) => updateExercise(exercise.id, 'reps', Number(event.target.value))} /></label></div><div className="exercise-actions"><button className="tiny-text-button" onClick={() => moveExercise(exercise.id, -1)} disabled={index === 0}><ArrowLeft size={13} /> Subir</button><button className="tiny-text-button" onClick={() => moveExercise(exercise.id, 1)} disabled={index === currentDayPlan.exercises.length - 1}><ArrowDown size={13} /> Bajar</button><button className="tiny-text-button remove-action" onClick={() => removeExercise(exercise.id)}><X size={13} /> Quitar</button></div></div></article>)}</div>
                  <button className="add-exercise-button" onClick={() => { setExerciseFilter(currentDayPlan.focus === 'Cardio' ? 'Cardio' : currentDayPlan.focus); setExerciseSearch(''); setShowExercisePicker(true) }}><span><Plus size={18} /></span> Añadir ejercicio <span className="add-exercise-note">Explora la biblioteca</span></button>
                  <div className="planner-footer"><span><Clock3 size={15} /> Duración estimada: {currentDayPlan.exercises.reduce((sum, exercise) => sum + exercise.sets * 2, 0)}–{currentDayPlan.exercises.reduce((sum, exercise) => sum + exercise.sets * 3, 0)} min</span><button className="text-button" onClick={copyRoutine}>Reutilizar rutina <ArrowRight size={15} /></button></div>
                </>}
                {showRoutineMessage && <div className="inline-success"><Check size={16} /> Rutina copiada al resto de días. Es un cambio temporal de este prototipo.</div>}
              </div>
              <p className="prototype-note"><Sparkles size={14} /> Las rutinas se pueden editar en esta vista, pero se reiniciarán al recargar hasta conectar el guardado de datos.</p>
            </>
          )}

          {active === 'comida' && (
            <>
              <div className="page-intro"><div><p className="eyebrow">NUTRICIÓN SIN COMPLICACIONES</p><h1>Come bien, a tu manera</h1><p className="subtitle">Registra lo que comes y encuentra ideas para tu próxima comida.</p></div><div className="intro-icon warm"><Apple size={24} /></div></div>
              <div className="nutrition-summary"><div className="nutrition-summary-head"><div><span className="mini-label">TU DÍA</span><h2>Resumen nutricional</h2></div><span className="example-tag">Objetivos de ejemplo</span></div><div className="nutrition-main-stat"><div className="calorie-ring" style={{ '--progress': `${Math.min(100, todayCalories / dailyCaloriesTarget * 100)}%` } as CSSProperties}><div><Flame size={18} /><strong>{todayCalories.toLocaleString('es-ES')}</strong><span>de {dailyCaloriesTarget}</span><small>kcal</small></div></div><div className="macro-list"><div className="macro-row"><div className="macro-row-title"><span><i className="macro-dot protein-dot" /> Proteínas</span><strong>{todayProtein} / {dailyProteinTarget} g</strong></div><div className="progress-track"><span className="protein-progress" style={{ width: `${Math.min(100, todayProtein / dailyProteinTarget * 100)}%` }} /></div></div><div className="macro-row"><div className="macro-row-title"><span><i className="macro-dot carbs-dot" /> Hidratos</span><strong>{loggedMeals.reduce((sum, meal) => sum + meal.recipe.carbs, 0)} g</strong></div><div className="progress-track"><span className="carbs-progress" style={{ width: `${Math.min(100, loggedMeals.reduce((sum, meal) => sum + meal.recipe.carbs, 0) / 250 * 100)}%` }} /></div></div><div className="macro-row"><div className="macro-row-title"><span><i className="macro-dot fat-dot" /> Grasas</span><strong>{loggedMeals.reduce((sum, meal) => sum + meal.recipe.fat, 0)} g</strong></div><div className="progress-track"><span className="fat-progress" style={{ width: `${Math.min(100, loggedMeals.reduce((sum, meal) => sum + meal.recipe.fat, 0) / 70 * 100)}%` }} /></div></div></div></div></div>
              <div className="section-heading"><div><p className="eyebrow">DIARIO</p><h2>Lo que has comido</h2></div><button className="text-button" onClick={() => { setShowMealCreator(true); setMealMode('random'); setRecipeResults([]); setRecipeMessage('') }}><Plus size={16} /> Añadir comida</button></div>
              <div className="meal-log-card">{(['Desayuno', 'Comida', 'Cena', 'Snack'] as const).map((type) => { const theseMeals = loggedMeals.filter((meal) => meal.recipe.type === type); return <div className="meal-slot" key={type}><div className="meal-slot-icon">{type === 'Desayuno' ? '☀' : type === 'Comida' ? '◷' : type === 'Cena' ? '☾' : '✳'}</div><div className="meal-slot-content"><div className="meal-slot-title"><strong>{type}</strong><span>{theseMeals.reduce((sum, meal) => sum + meal.recipe.calories, 0)} kcal</span></div>{theseMeals.length ? theseMeals.map((meal) => <div className="logged-recipe" key={meal.id}><img src={meal.recipe.image} alt="" /><span>{meal.recipe.name}</span><small>{meal.recipe.protein} g proteína</small></div>) : <span className="empty-meal">Todavía no has añadido nada</span>}</div><button className="small-plus" onClick={() => { setMealType(type); setMealMode('random'); setRecipeResults([]); setRecipeMessage(''); setShowMealCreator(true) }} aria-label={`Añadir ${type.toLowerCase()}`}><Plus size={17} /></button></div> })}</div>
              <div className="section-heading recipe-section-title"><div><p className="eyebrow">INSPIRACIÓN</p><h2>¿Qué te apetece cocinar?</h2></div></div>
              <div className="recipe-entry-grid"><button className="recipe-entry-card random-entry" onClick={() => { setShowMealCreator(true); setMealMode('random'); setRecipeResults([]); setRecipeMessage('') }}><div className="recipe-entry-image"><img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85" alt="Plato saludable con verduras" /><span className="recipe-entry-icon"><Sparkles size={18} /></span></div><div className="recipe-entry-copy"><span className="mini-label">DÉJATE SORPRENDER</span><strong>Receta aleatoria</strong><p>Una idea nueva para tu próxima comida.</p><span className="entry-link">Descubrir receta <ArrowRight size={15} /></span></div></button><button className="recipe-entry-card pantry-entry" onClick={() => { setShowMealCreator(true); setMealMode('ingredients'); setRecipeResults([]); setRecipeMessage('') }}><div className="recipe-entry-image"><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85" alt="Bowl con ingredientes frescos" /><span className="recipe-entry-icon"><ChefHat size={18} /></span></div><div className="recipe-entry-copy"><span className="mini-label">APROVECHA TU DESPENSA</span><strong>Cocina con lo que tienes</strong><p>Introduce ingredientes y encuentra combinaciones.</p><span className="entry-link">Buscar recetas <ArrowRight size={15} /></span></div></button></div>
              <p className="prototype-note"><Sparkles size={14} /> Las recetas pertenecen a un catálogo de muestra. Los valores nutricionales son estimaciones y los registros todavía no se guardan en Supabase.</p>
            </>
          )}

          {active === 'progreso' && (
            <>
              <div className="page-intro"><div><p className="eyebrow">CADA PASO CUENTA</p><h1>Tu evolución</h1><p className="subtitle">Una visión general de tus hábitos y tus próximos objetivos.</p></div><div className="intro-icon blue-bg"><TrendingUp size={24} /></div></div>
              <div className="progress-empty-hero"><div className="progress-empty-art"><div className="chart-column c1" /><div className="chart-column c2" /><div className="chart-column c3" /><div className="chart-column c4" /><div className="chart-column c5" /><TrendingUp size={30} /></div><div><span className="mini-label">TU HISTORIA EMPIEZA AQUÍ</span><h2>Tu progreso, a tu ritmo</h2><p>Cuando registres tus primeras mediciones y sesiones, podrás ver tendencias y comparar tu evolución.</p></div></div>
              <div className="progress-cards"><article><span className="progress-card-icon sand"><Weight size={20} /></span><span className="mini-label">PESO CORPORAL</span><strong>Sin registros</strong><p>Tu historial de peso aparecerá aquí.</p></article><article><span className="progress-card-icon sage"><Dumbbell size={20} /></span><span className="mini-label">ENTRENAMIENTOS</span><strong>{Object.values(plan).filter((day) => day.focus !== 'Descanso' && day.exercises.length > 0).length} días planificados</strong><p>Vista previa de tu planificación semanal.</p></article><article><span className="progress-card-icon warm"><Apple size={20} /></span><span className="mini-label">NUTRICIÓN</span><strong>{loggedMeals.length} comidas de muestra</strong><p>Registra tu alimentación para seguir tus hábitos.</p></article></div><p className="prototype-note"><Sparkles size={14} /> Los datos de progreso reales se incorporarán cuando conectemos los registros a la base de datos.</p>
            </>
          )}

          {active === 'perfil' && (
            <>
              <div className="page-intro"><div><p className="eyebrow">TU ESPACIO PERSONAL</p><h1>Tu perfil</h1><p className="subtitle">Personaliza los objetivos con los que quieres trabajar.</p></div><div className="intro-icon sage"><UserRound size={24} /></div></div>
              <section className="profile-card"><div className="profile-avatar">{(session.user.email ?? 'F').slice(0, 1).toUpperCase()}</div><div className="profile-main"><h2>{session.user.email?.split('@')[0] ?? 'Usuario de Forma'}</h2><p>{session.user.email}</p><span className="account-status"><ShieldCheck size={14} /> Cuenta privada</span></div><button className="icon-button" onClick={() => { setError(''); handleLogout() }} title="Cerrar sesión" disabled={signingOut}><LogOut size={18} /></button></section>
              <section className="settings-card"><div className="settings-card-heading"><span className="settings-icon sage"><Target size={19} /></span><div><h2>Objetivos diarios</h2><p>Valores de ejemplo editables en este prototipo.</p></div></div><label className="settings-field"><span>Objetivo de calorías</span><div><input type="number" min="1" value={profileCalories} onChange={(event) => setProfileCalories(event.target.value)} /><span>kcal/día</span></div></label><label className="settings-field"><span>Objetivo de proteína</span><div><input type="number" min="1" value={profileProtein} onChange={(event) => setProfileProtein(event.target.value)} /><span>g/día</span></div></label></section>
              <section className="settings-card privacy-settings"><div className="settings-card-heading"><span className="settings-icon sage"><ShieldCheck size={19} /></span><div><h2>Privacidad y cuenta</h2><p>El registro público está desactivado.</p></div></div><p className="privacy-copy">El inicio de sesión está conectado a Supabase. Los ejercicios y las recetas de esta vista todavía son datos de demostración y no se comparten con otros usuarios.</p><button className="secondary-button logout-full" onClick={handleLogout} disabled={signingOut}><LogOut size={16} /> {signingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}</button></section>
            </>
          )}
        </div>
      </section>

      <nav className="mobile-nav" aria-label="Navegación principal">{sections.map(({ id, label, icon: Icon }) => <button key={id} className={active === id ? 'mobile-item active' : 'mobile-item'} onClick={() => setActive(id)} aria-current={active === id ? 'page' : undefined}><Icon size={20} /><span>{label}</span></button>)}</nav>

      {showExercisePicker && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowExercisePicker(false) }}><section className="modal-panel exercise-modal" role="dialog" aria-modal="true" aria-labelledby="exercise-modal-title"><div className="modal-heading"><div><p className="eyebrow">BIBLIOTECA DE MOVIMIENTOS</p><h2 id="exercise-modal-title">Añadir ejercicio</h2></div><button className="icon-button" onClick={() => setShowExercisePicker(false)} aria-label="Cerrar"><X size={20} /></button></div><div className="search-field"><Search size={17} /><input value={exerciseSearch} onChange={(event) => setExerciseSearch(event.target.value)} placeholder="Buscar ejercicio o músculo..." /></div><div className="filter-pills">{(['Tren inferior', 'Tren superior', 'Full body', 'Cardio'] as Focus[]).map((focus) => <button key={focus} className={exerciseFilter === focus ? 'filter-pill active' : 'filter-pill'} onClick={() => setExerciseFilter(focus)}>{focus}</button>)}</div><div className="exercise-picker-list">{filteredExercises.map((exercise) => <article className="picker-exercise" key={exercise.id}><ExerciseIllustration variant={exercise.id === 'leg-extension' ? 'machine' : 'weights'} /><div className="picker-exercise-info"><strong>{exercise.name}</strong><span>{exercise.muscle}</span><small>{exercise.equipment}</small></div><button className="add-round-button" onClick={() => addExercise(exercise)} aria-label={`Añadir ${exercise.name}`}><Plus size={18} /></button></article>)}{filteredExercises.length === 0 && <p className="empty-search">No encontramos ejercicios con esa búsqueda.</p>}</div><p className="modal-footnote">Las ilustraciones son orientativas. Adapta la técnica y la carga a tu nivel.</p></section></div>}

      {showMealCreator && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowMealCreator(false) }}><section className="modal-panel recipe-modal" role="dialog" aria-modal="true" aria-labelledby="recipe-modal-title"><div className="modal-heading"><div><p className="eyebrow">TU ASISTENTE DE COCINA</p><h2 id="recipe-modal-title">Crear comida</h2><p className="modal-subtitle">Encuentra una receta que encaje contigo.</p></div><button className="icon-button" onClick={() => setShowMealCreator(false)} aria-label="Cerrar"><X size={20} /></button></div><div className="creator-tabs"><button className={mealMode === 'random' ? 'creator-tab active' : 'creator-tab'} onClick={() => { setMealMode('random'); setRecipeResults([]); setRecipeMessage('') }}><Sparkles size={17} /> Aleatorio</button><button className={mealMode === 'ingredients' ? 'creator-tab active' : 'creator-tab'} onClick={() => { setMealMode('ingredients'); setRecipeResults([]); setRecipeMessage('') }}><ChefHat size={17} /> Tengo ingredientes</button></div>{mealMode === 'ingredients' && <label className="form-field"><span>¿Qué tienes en casa?</span><textarea rows={3} value={ingredientText} onChange={(event) => setIngredientText(event.target.value)} placeholder="Ej.: huevos, tomate, arroz, pollo..." /><small>Separa los ingredientes con comas. Puedes añadir varios.</small></label>}<div className="creator-filter-grid"><label className="form-field"><span>Tipo de plato</span><span className="select-wrap"><select value={mealType} onChange={(event) => setMealType(event.target.value)}><option>Cualquiera</option><option>Desayuno</option><option>Comida</option><option>Cena</option><option>Snack</option></select><ChevronDown size={16} /></span></label><label className="form-field"><span>Máximo de calorías</span><span className="number-wrap"><input type="number" min="100" max="2000" value={calorieLimit} onChange={(event) => setCalorieLimit(event.target.value)} /><small>kcal/ración</small></span></label></div><label className="protein-toggle"><span className="toggle-copy"><span><Target size={17} /> Priorizar proteínas</span><small>Ordena las recetas por proteína en relación con sus calorías.</small></span><input type="checkbox" checked={proteinPriority} onChange={(event) => setProteinPriority(event.target.checked)} /><span className="toggle-ui" /></label><button className="primary-button find-recipe-button" onClick={findRecipes}>{mealMode === 'random' ? 'Sorpréndeme con una receta' : 'Buscar con mis ingredientes'} <ArrowRight size={17} /></button>{recipeMessage && <p className={recipeResults.length ? 'creator-message success-message' : 'creator-message'}>{recipeMessage}</p>}{recipeResults.length > 0 && <div className="recipe-results"><div className="results-heading"><strong>{mealMode === 'random' ? 'Tu receta sorpresa' : 'Recetas para ti'}</strong><span>{recipeResults.length} resultado{recipeResults.length === 1 ? '' : 's'}</span></div>{recipeResults.map((recipe) => <article className="recipe-result-card" key={recipe.id}><button className="recipe-result-image" onClick={() => setChosenRecipe(recipe)} aria-label={`Ver receta ${recipe.name}`}><img src={recipe.image} alt={`Fotografía del plato ${recipe.name}`} /><span>{recipe.time} min</span></button><div className="recipe-result-info"><div className="recipe-type-label">{recipe.type} · {recipe.calories} kcal</div><h3>{recipe.name}</h3><p>{recipe.description}</p><div className="recipe-macros"><span><strong>{recipe.protein} g</strong> proteína</span><span><strong>{recipe.carbs} g</strong> hidratos</span><span><strong>{recipe.fat} g</strong> grasas</span></div><div className="recipe-result-actions"><button className="secondary-button" onClick={() => setChosenRecipe(recipe)}>Ver receta</button><button className="primary-button small-primary" onClick={() => addRecipeToDay(recipe)}><Plus size={15} /> Añadir a mi día</button></div></div></article>)}</div>}<p className="modal-footnote">Catálogo de muestra. Las coincidencias dependen de los ingredientes registrados en este catálogo; todavía no se genera texto nuevo con IA.</p></section></div>}

      {chosenRecipe && <div className="modal-backdrop recipe-detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setChosenRecipe(null) }}><section className="modal-panel recipe-detail-modal" role="dialog" aria-modal="true" aria-labelledby="recipe-detail-title"><button className="detail-close icon-button" onClick={() => setChosenRecipe(null)} aria-label="Cerrar receta"><X size={20} /></button><img className="recipe-detail-photo" src={chosenRecipe.image} alt={`Fotografía del plato ${chosenRecipe.name}`} /><div className="recipe-detail-body"><span className="mini-label">{chosenRecipe.type.toUpperCase()} · {chosenRecipe.time} MIN</span><h2 id="recipe-detail-title">{chosenRecipe.name}</h2><p>{chosenRecipe.description}</p><div className="detail-macro-grid"><span><strong>{chosenRecipe.calories}</strong><small>kcal aprox.</small></span><span><strong>{chosenRecipe.protein} g</strong><small>proteína</small></span><span><strong>{chosenRecipe.carbs} g</strong><small>hidratos</small></span><span><strong>{chosenRecipe.fat} g</strong><small>grasas</small></span></div><h3>Ingredientes</h3><p className="servings-note">Cantidades orientativas para {chosenRecipe.servings} ración.</p><ul className="ingredient-list">{chosenRecipe.ingredients.map((ingredient) => <li key={ingredient}><Check size={15} /> {ingredient}</li>)}</ul><h3>Preparación</h3><ol className="recipe-steps">{chosenRecipe.steps.map((step) => <li key={step}>{step}</li>)}</ol><p className="modal-footnote">Calorías y macronutrientes estimados. Comprueba siempre cantidades, ingredientes y necesidades personales.</p><button className="primary-button detail-add-button" onClick={() => addRecipeToDay(chosenRecipe)}><Plus size={17} /> Añadir a mi día</button></div></section></div>}
    </main>
  )
}

export default App
