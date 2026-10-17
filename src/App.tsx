import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import {
  Activity, Apple, ArrowDown, ArrowLeft, ArrowRight, Bell, CalendarDays, Check, ChefHat,
  ChevronDown, Clock3, Dumbbell, Flame, LayoutDashboard, Leaf, LockKeyhole, LogOut,
  Mail, Plus, Search, Settings2, ShieldCheck, Sparkles, Target, TrendingUp, UserRound,
  X
} from 'lucide-react'
import { supabase } from './lib/supabase'
import { exerciseCatalog, type Exercise, type ExerciseCategory } from './data/exercises'
import { foodCatalog, type Food } from './data/foods'
import './styles.css'

type Section = 'inicio' | 'entreno' | 'comida' | 'progreso' | 'perfil'
type MealType = 'Desayuno' | 'Comida' | 'Cena' | 'Snack'
type Goal = 'perder' | 'mantener' | 'ganar'
type ActivityLevel = 'sedentario' | 'ligero' | 'moderado' | 'alto'
type ReminderFrequency = 'semanal' | 'quincenal' | 'mensual'
type Focus = ExerciseCategory | 'Descanso'
type WorkoutDay = { focus: Focus; exercises: Exercise[] }
type FoodSnapshot = { name: string; grams: number; calories: number; protein: number; carbs: number; fat: number; estimateSource?: 'ia' | 'manual' }
type MealLog = { id: string; date: string; type: MealType; name: string; items: FoodSnapshot[]; calories: number; protein: number; carbs: number; fat: number; photoPath?: string }
type SavedRecipe = { id: string; name: string; type: MealType; servings: number; items: FoodSnapshot[]; calories: number; protein: number; carbs: number; fat: number; photoPath?: string; photoUrl?: string; createdAt: string }
type RecipeIngredient = { foodId?: string; name?: string; grams: number; caloriesPer100g?: number; proteinPer100g?: number; carbsPer100g?: number; fatPer100g?: number; isProvided?: boolean }
type Recipe = { id: string; name: string; type: MealType; time: number; description: string; image: string; ingredients: RecipeIngredient[]; steps: string[]; isAiGenerated?: boolean; imageIsIllustrative?: boolean; matchCount?: number; missing?: string[] }
type Routine = { id: string; name: string; focus: Focus; exercises: Exercise[] }
type ProgressRecord = { id: string; date: string; weightKg: number; waist?: number; chest?: number; hips?: number; arm?: number; thigh?: number }
type UserProfile = { age: number; sex: 'mujer' | 'hombre' | 'manual'; heightCm: number; weightKg: number; activity: ActivityLevel; goal: Goal; targetCalories: number; reminderFrequency: ReminderFrequency; remindersEnabled: boolean; reminderLastSent?: string }
type UserData = { profile: UserProfile | null; workouts: Record<string, WorkoutDay>; completedWorkoutDates: string[]; routines: Routine[]; meals: MealLog[]; savedRecipes: SavedRecipe[]; progress: ProgressRecord[] }
type DialogName = 'exercise' | 'food' | 'random' | 'pantry' | 'custom-recipe' | 'routines' | 'save-routine' | 'measurement' | 'setup'
type DraftFood = { id: string; foodId: string; searchText: string; grams: string; customName: string; calories: string; protein: string; carbs: string; fat: string; estimateSource?: 'ia' | 'manual'; estimateConfidence?: FoodEstimate['confidence']; estimateNote?: string }
type FoodEstimate = { name: string; caloriesPer100g: number; proteinPer100g: number; carbsPer100g: number; fatPer100g: number; confidence: 'low' | 'medium' | 'high'; note: string }
type ProgressMetric = 'weightKg' | 'waist' | 'chest' | 'hips' | 'arm' | 'thigh'
type ProfileDraft = { age: string; sex: UserProfile['sex']; heightCm: string; weightKg: string; activity: ActivityLevel; goal: Goal; manualCalories: string; reminderFrequency: ReminderFrequency }

const sections: Array<{ id: Section; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'inicio', label: 'Inicio', icon: LayoutDashboard }, { id: 'entreno', label: 'Entreno', icon: Dumbbell },
  { id: 'comida', label: 'Comida', icon: Apple }, { id: 'progreso', label: 'Progreso', icon: TrendingUp }, { id: 'perfil', label: 'Perfil', icon: UserRound }
]
const mealTypes: MealType[] = ['Desayuno', 'Comida', 'Cena', 'Snack']
const activityFactors: Record<ActivityLevel, number> = { sedentario: 1.2, ligero: 1.375, moderado: 1.55, alto: 1.725 }
const activityLabels: Record<ActivityLevel, string> = { sedentario: 'Mayormente sentado/a, poca actividad', ligero: 'Algo de movimiento o ejercicio ligero', moderado: 'Actividad moderada varios días por semana', alto: 'Actividad intensa o trabajo físico habitual' }
const goalLabels: Record<Goal, string> = { perder: 'Perder peso', mantener: 'Mantener mi peso', ganar: 'Ganar masa muscular' }
const blankData: UserData = { profile: null, workouts: {}, completedWorkoutDates: [], routines: [], meals: [], savedRecipes: [], progress: [] }
const emptyDraftFood = (): DraftFood => ({ id: crypto.randomUUID(), foodId: '', searchText: '', grams: '100', customName: '', calories: '', protein: '', carbs: '', fat: '' })
const blankProfileDraft: ProfileDraft = { age: '', sex: 'mujer', heightCm: '', weightKg: '', activity: 'sedentario', goal: 'mantener', manualCalories: '', reminderFrequency: 'semanal' }

const recipeCatalog: Recipe[] = [
  { id: 'chicken-rice', name: 'Bowl de pollo y arroz', type: 'Comida', time: 25, description: 'Un plato completo con pollo, arroz y verduras frescas.', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85', ingredients: [{ foodId: 'chicken', grams: 130 }, { foodId: 'rice-dry', grams: 55 }, { foodId: 'pepper', grams: 70 }, { foodId: 'tomato', grams: 80 }, { foodId: 'olive-oil', grams: 4 }], steps: ['Cuece el arroz siguiendo las indicaciones del paquete.', 'Corta el pollo y las verduras. Cocina el pollo en una sartén.', 'Añade las verduras y cocina hasta que estén tiernas.', 'Sirve sobre el arroz y ajusta las especias al gusto.'] },
  { id: 'salmon-potato', name: 'Salmón con patata y verduras', type: 'Cena', time: 30, description: 'Salmón al horno con patata y brócoli.', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1000&q=85', ingredients: [{ foodId: 'salmon', grams: 130 }, { foodId: 'potato', grams: 180 }, { foodId: 'broccoli', grams: 130 }, { foodId: 'olive-oil', grams: 4 }], steps: ['Precalienta el horno a 200 °C y corta la patata.', 'Hornea la patata con un poco de aceite.', 'Añade el salmón y el brócoli y termina de hornear.', 'Sirve con limón al gusto.'] },
  { id: 'omelette', name: 'Tortilla con espinacas', type: 'Cena', time: 12, description: 'Una receta rápida con huevos, espinacas y queso fresco.', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1000&q=85', ingredients: [{ foodId: 'egg', grams: 110 }, { foodId: 'spinach', grams: 60 }, { foodId: 'cheese', grams: 25 }, { foodId: 'olive-oil', grams: 3 }], steps: ['Lava las espinacas y saltéalas brevemente.', 'Bate los huevos y mézclalos con el queso.', 'Cuaja la mezcla a fuego medio en una sartén antiadherente.', 'Dobla la tortilla cuando esté hecha por la base.'] },
  { id: 'chickpea-salad', name: 'Ensalada de garbanzos', type: 'Comida', time: 15, description: 'Ensalada fresca con garbanzos, tomate y pepino.', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=85', ingredients: [{ foodId: 'chickpeas', grams: 130 }, { foodId: 'tomato', grams: 100 }, { foodId: 'cucumber', grams: 70 }, { foodId: 'tuna', grams: 45 }, { foodId: 'olive-oil', grams: 4 }], steps: ['Escurre y enjuaga los garbanzos.', 'Corta el tomate y el pepino.', 'Mezcla con el atún y aliña al gusto.', 'Enfría unos minutos antes de servir.'] },
  { id: 'yogurt-bowl', name: 'Yogur con avena y frutos rojos', type: 'Desayuno', time: 5, description: 'Un desayuno sencillo con yogur, avena y fruta.', image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=1000&q=85', ingredients: [{ foodId: 'yogurt', grams: 170 }, { foodId: 'oats', grams: 30 }, { foodId: 'berries', grams: 70 }, { foodId: 'banana', grams: 40 }], steps: ['Pon el yogur en un bol.', 'Añade la avena y mezcla suavemente.', 'Cubre con frutos rojos y plátano en rodajas.', 'Deja reposar si prefieres una textura más blanda.'] },
  { id: 'pasta-tuna', name: 'Pasta con atún y tomate', type: 'Comida', time: 20, description: 'Un clásico fácil de preparar y ajustar a tu ración.', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=85', ingredients: [{ foodId: 'pasta-dry', grams: 65 }, { foodId: 'tuna', grams: 65 }, { foodId: 'tomato', grams: 120 }, { foodId: 'onion', grams: 25 }, { foodId: 'olive-oil', grams: 4 }], steps: ['Cuece la pasta y reserva un poco de agua de cocción.', 'Cocina la cebolla con una pequeña cantidad de aceite.', 'Añade el tomate y deja que la salsa reduzca.', 'Incorpora el atún y la pasta y mezcla.'] },
  { id: 'tofu-wok', name: 'Salteado de tofu y verduras', type: 'Cena', time: 20, description: 'Tofu dorado con verduras crujientes.', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=85', ingredients: [{ foodId: 'tofu', grams: 130 }, { foodId: 'pepper', grams: 60 }, { foodId: 'broccoli', grams: 80 }, { foodId: 'carrot', grams: 45 }], steps: ['Seca el tofu y córtalo en dados.', 'Dóralo en una sartén antiadherente y resérvalo.', 'Saltea las verduras hasta que queden tiernas pero firmes.', 'Devuelve el tofu a la sartén y mezcla.'] },
  { id: 'banana-pancakes', name: 'Tortitas de avena y plátano', type: 'Desayuno', time: 15, description: 'Tortitas caseras de avena, plátano y huevo.', image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1000&q=85', ingredients: [{ foodId: 'oats', grams: 35 }, { foodId: 'banana', grams: 90 }, { foodId: 'egg', grams: 55 }, { foodId: 'milk', grams: 25 }], steps: ['Machaca el plátano y mézclalo con el huevo, la avena y la leche.', 'Deja reposar dos minutos.', 'Vierte pequeñas porciones en una sartén antiadherente.', 'Dales la vuelta cuando aparezcan burbujas.'] }
]

const recipeImageFor = (description: string) => {
  const text = description.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es')
  const recipe = text.match(/salmon|trucha|merluza|pescado|atun|sardina/) ? recipeCatalog.find((item) => item.id === 'salmon-potato')
    : text.match(/pollo|pavo|ternera|carne|res/) ? recipeCatalog.find((item) => item.id === 'chicken-rice')
      : text.match(/tofu|soja/) ? recipeCatalog.find((item) => item.id === 'tofu-wok')
        : text.match(/garbanzo|lenteja|alubia|judia|ensalada|pepino/) ? recipeCatalog.find((item) => item.id === 'chickpea-salad')
          : text.match(/pasta|espagueti|macarron|fideo|noodle/) ? recipeCatalog.find((item) => item.id === 'pasta-tuna')
            : text.match(/huevo|tortilla|omelet/) ? recipeCatalog.find((item) => item.id === 'omelette')
              : text.match(/avena|yogur|yogurt|platano|fruta|desayuno/) ? recipeCatalog.find((item) => item.id === 'yogurt-bowl')
                : recipeCatalog.find((item) => item.id === 'chickpea-salad')
  return recipe?.image ?? recipeCatalog[0].image
}

const localDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const todayKey = () => localDateKey(new Date())
const displayDate = (key: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) => new Intl.DateTimeFormat('es-ES', options).format(new Date(`${key}T12:00:00`))
const round = (value: number) => Math.round(value * 10) / 10
const asNumber = (value: string) => Number(value.replace(',', '.'))
const macrosFor = (food: Food, grams: number): FoodSnapshot => ({ name: food.name, grams, calories: round(food.calories * grams / 100), protein: round(food.protein * grams / 100), carbs: round(food.carbs * grams / 100), fat: round(food.fat * grams / 100) })
const totalsFor = (items: FoodSnapshot[]) => items.reduce((sum, item) => ({ calories: sum.calories + item.calories, protein: sum.protein + item.protein, carbs: sum.carbs + item.carbs, fat: sum.fat + item.fat }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
const getWeek = (offset: number) => {
  const date = new Date(); date.setDate(date.getDate() - ((date.getDay() + 6) % 7) + offset * 7); date.setHours(12, 0, 0, 0)
  return Array.from({ length: 7 }, (_, index) => { const day = new Date(date); day.setDate(date.getDate() + index); return { date: localDateKey(day), label: new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(day).replace('.', ''), name: new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(day), number: day.getDate() } })
}
const bmiFor = (weight: number, heightCm: number) => weight / ((heightCm / 100) ** 2)
const estimateCalories = (draft: ProfileDraft) => {
  if (draft.sex === 'manual') return asNumber(draft.manualCalories)
  const age = asNumber(draft.age), weight = asNumber(draft.weightKg), height = asNumber(draft.heightCm)
  const resting = 10 * weight + 6.25 * height - 5 * age + (draft.sex === 'hombre' ? 5 : -161)
  const activity = resting * activityFactors[draft.activity]
  const adjustment = draft.goal === 'perder' ? -300 : draft.goal === 'ganar' ? 200 : 0
  return Math.round((activity + adjustment) / 50) * 50
}
const snapshotForDraft = (row: DraftFood): FoodSnapshot | null => {
  const grams = asNumber(row.grams)
  if (!Number.isFinite(grams) || grams <= 0) return null
  if (row.foodId === 'custom') {
    const calories = asNumber(row.calories)
    if (!row.customName.trim() || !row.calories.trim() || !Number.isFinite(calories) || calories < 0) return null
    const custom: Food = { id: 'custom', name: row.customName.trim(), calories, protein: asNumber(row.protein) || 0, carbs: asNumber(row.carbs) || 0, fat: asNumber(row.fat) || 0 }
    return { ...macrosFor(custom, grams), estimateSource: row.estimateSource }
  }
  const food = foodCatalog.find((item) => item.id === row.foodId)
  return food ? macrosFor(food, grams) : null
}
const recipeIngredientSnapshot = (ingredient: RecipeIngredient): FoodSnapshot | null => {
  const grams = Number(ingredient.grams)
  if (!Number.isFinite(grams) || grams <= 0) return null
  const catalogFood = ingredient.foodId ? foodCatalog.find((food) => food.id === ingredient.foodId) : undefined
  if (catalogFood) return macrosFor(catalogFood, grams)
  if (!ingredient.name || ingredient.caloriesPer100g === undefined) return null
  const food: Food = { id: 'ai-recipe-food', name: ingredient.name, calories: ingredient.caloriesPer100g, protein: ingredient.proteinPer100g ?? 0, carbs: ingredient.carbsPer100g ?? 0, fat: ingredient.fatPer100g ?? 0 }
  return macrosFor(food, grams)
}
const normalizeData = (value: unknown): UserData => {
  if (!value || typeof value !== 'object') return blankData
  const input = value as Partial<UserData>
  return { ...blankData, ...input, profile: input.profile ?? null, workouts: input.workouts && typeof input.workouts === 'object' ? input.workouts : {}, completedWorkoutDates: Array.isArray(input.completedWorkoutDates) ? input.completedWorkoutDates.filter((date): date is string => typeof date === 'string') : [], routines: Array.isArray(input.routines) ? input.routines : [], meals: Array.isArray(input.meals) ? input.meals : [], savedRecipes: Array.isArray(input.savedRecipes) ? input.savedRecipes : [], progress: Array.isArray(input.progress) ? input.progress : [] }
}

function Modal({ title, eyebrow, children, onClose, className = '', compact = false }: { title: string; eyebrow?: string; children: ReactNode; onClose: () => void; className?: string; compact?: boolean }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className={`modal-panel ${className}`} role="dialog" aria-modal="true" aria-label={title}><div className="modal-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2></div><button className="icon-button modal-close" onClick={onClose} aria-label="Cerrar ventana"><X size={20} /></button></div><div className={compact ? 'modal-body modal-body-compact' : 'modal-body'}>{children}</div></section></div>
}

function FoodDraftEditor({ rows, onChange, onEstimateFood }: { rows: DraftFood[]; onChange: (rows: DraftFood[]) => void; onEstimateFood: (name: string, grams: number) => Promise<FoodEstimate> }) {
  const [activeSearchId, setActiveSearchId] = useState<string | null>(null)
  const [estimatingId, setEstimatingId] = useState<string | null>(null)
  const [estimateError, setEstimateError] = useState('')
  const patchRow = (id: string, patch: Partial<DraftFood>) => onChange(rows.map((row) => row.id === id ? { ...row, ...patch } : row))
  const searchCatalog = (query: string) => {
    const normalized = query.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es')
    if (!normalized) return []
    return foodCatalog.filter((food) => food.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').includes(normalized)).slice(0, 6)
  }
  const chooseFood = (row: DraftFood, food: Food) => { patchRow(row.id, { foodId: food.id, searchText: food.name, customName: '', calories: '', protein: '', carbs: '', fat: '', estimateSource: undefined, estimateConfidence: undefined, estimateNote: undefined }); setActiveSearchId(null); setEstimateError('') }
  const estimateFood = async (row: DraftFood) => {
    const grams = asNumber(row.grams)
    if (!row.searchText.trim() || !Number.isFinite(grams) || grams <= 0) { setEstimateError('Escribe un alimento y un peso válido para estimarlo.'); return }
    setEstimatingId(row.id); setEstimateError('')
    try {
      const estimate = await onEstimateFood(row.searchText.trim(), grams)
      patchRow(row.id, { foodId: 'custom', searchText: estimate.name, customName: estimate.name, calories: String(estimate.caloriesPer100g), protein: String(estimate.proteinPer100g), carbs: String(estimate.carbsPer100g), fat: String(estimate.fatPer100g), estimateSource: 'ia', estimateConfidence: estimate.confidence, estimateNote: estimate.note })
      setActiveSearchId(null)
    } catch (cause) { setEstimateError(cause instanceof Error ? cause.message : 'No se pudo estimar el alimento con IA.') }
    finally { setEstimatingId(null) }
  }
  return <div className="food-draft-list">{rows.map((row, index) => { const suggestions = searchCatalog(row.searchText); const selectedFood = foodCatalog.find((food) => food.id === row.foodId); const estimate = snapshotForDraft(row); return <div className="food-draft-row" key={row.id}><div className="food-row-heading"><strong>Alimento {index + 1}</strong>{rows.length > 1 && <button type="button" className="tiny-text-button remove-action" onClick={() => onChange(rows.filter((item) => item.id !== row.id))}><X size={13} /> Quitar</button>}</div><label className="form-field food-search-field"><span>Buscar alimento</span><span className="search-field"><Search size={16} /><input type="search" role="combobox" aria-expanded={activeSearchId === row.id && suggestions.length > 0} aria-autocomplete="list" value={row.searchText} onFocus={() => setActiveSearchId(row.id)} onChange={(event) => { const searchText = event.target.value; const exact = foodCatalog.find((food) => food.name.toLocaleLowerCase('es') === searchText.trim().toLocaleLowerCase('es')); patchRow(row.id, { searchText, foodId: exact?.id ?? '', customName: searchText, calories: '', protein: '', carbs: '', fat: '', estimateSource: undefined, estimateConfidence: undefined, estimateNote: undefined }); setActiveSearchId(row.id); setEstimateError('') }} placeholder="Ej.: quinoa, tortilla de patata…" /></span></label>{activeSearchId === row.id && suggestions.length > 0 && <div className="food-search-suggestions" role="listbox" aria-label="Alimentos encontrados">{suggestions.map((food) => <button type="button" role="option" aria-selected={selectedFood?.id === food.id} key={food.id} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseFood(row, food)}><span>{food.name}</span><small>{food.calories} kcal / 100 g</small></button>)}</div>}{!selectedFood && row.searchText.trim() && <div className="food-ai-actions"><button type="button" className="secondary-button" onClick={() => void estimateFood(row)} disabled={estimatingId === row.id}><Sparkles size={15} /> {estimatingId === row.id ? 'Estimando…' : 'Estimar kcal y macros con IA'}</button><button type="button" className="inline-link-button" onClick={() => { patchRow(row.id, { foodId: 'custom', customName: row.searchText.trim(), estimateSource: 'manual', estimateConfidence: undefined, estimateNote: undefined }); setActiveSearchId(null) }}>Introducir valores manualmente</button></div>}{row.foodId === 'custom' && <><label className="form-field"><span>Nombre del alimento</span><input className="text-input" value={row.customName} onChange={(event) => patchRow(row.id, { customName: event.target.value })} placeholder="Ej.: queso curado" /></label><div className="custom-nutrition-grid">{(['calories', 'protein', 'carbs', 'fat'] as const).map((field) => <label className="form-field" key={field}><span>{field === 'calories' ? 'Kcal' : field === 'protein' ? 'Proteína' : field === 'carbs' ? 'Hidratos' : 'Grasas'} / 100 g</span><input className="text-input" type="number" min="0" step="0.1" value={row[field]} onChange={(event) => patchRow(row.id, { [field]: event.target.value, estimateSource: 'manual', estimateConfidence: undefined, estimateNote: undefined })} required={field === 'calories'} /></label>)}</div></>}{!selectedFood && row.foodId !== 'custom' && !row.searchText.trim() && <small className="food-search-hint">Empieza a escribir para buscar en la biblioteca o pedir una estimación a la IA.</small>}<label className="form-field food-weight-field"><span>Peso</span><span className="number-wrap"><input type="number" min="1" step="1" value={row.grams} onChange={(event) => patchRow(row.id, { grams: event.target.value })} /><small>g</small></span></label>{estimate && <small className="food-line-estimate">{Math.round(estimate.calories)} kcal en {Math.round(estimate.grams)} g aprox.{row.estimateSource === 'ia' ? ` · IA por 100 g (${row.estimateConfidence === 'low' ? 'confianza baja' : row.estimateConfidence === 'high' ? 'confianza alta' : 'confianza media'})` : ''}</small>}{row.estimateNote && <small className="food-estimate-note">{row.estimateNote}</small>}</div>})}{estimateError && <p className="creator-message" role="alert">{estimateError}</p>}<p className="food-ai-privacy">Si pides una estimación, se enviará solo el nombre y el peso del alimento al asistente de IA.</p><button type="button" className="secondary-button add-food-line" onClick={() => onChange([...rows, emptyDraftFood()])}><Plus size={16} /> Añadir alimento</button></div>
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
  const [data, setData] = useState<UserData>(blankData)
  const [dataReady, setDataReady] = useState(false)
  const [persistenceAvailable, setPersistenceAvailable] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'loading' | 'saved' | 'saving' | 'error' | 'setup'>('loading')
  const [dataError, setDataError] = useState('')
  const [dialog, setDialog] = useState<DialogName | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | SavedRecipe | null>(null)
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [weekOffset, setWeekOffset] = useState(0)
  const [exerciseSearch, setExerciseSearch] = useState('')
  const [exerciseFilter, setExerciseFilter] = useState<ExerciseCategory>('Tren inferior')
  const [routineName, setRoutineName] = useState('')
  const [mealType, setMealType] = useState<MealType>('Desayuno')
  const [mealName, setMealName] = useState('')
  const [foodDraft, setFoodDraft] = useState<DraftFood[]>([emptyDraftFood()])
  const [recipeName, setRecipeName] = useState('')
  const [recipeServings, setRecipeServings] = useState('1')
  const [recipeDraft, setRecipeDraft] = useState<DraftFood[]>([emptyDraftFood()])
  const [recipePhoto, setRecipePhoto] = useState<File | null>(null)
  const [recipePhotoPreview, setRecipePhotoPreview] = useState('')
  const [recipeBusy, setRecipeBusy] = useState(false)
  const [aiRecipeBusy, setAiRecipeBusy] = useState(false)
  const [recipeError, setRecipeError] = useState('')
  const [recipeResults, setRecipeResults] = useState<Recipe[]>([])
  const [recipeMessage, setRecipeMessage] = useState('')
  const [recipeTypeFilter, setRecipeTypeFilter] = useState<'Cualquiera' | MealType>('Cualquiera')
  const [recipeCalorieLimit, setRecipeCalorieLimit] = useState('700')
  const [ingredientText, setIngredientText] = useState('')
  const [proteinPriority, setProteinPriority] = useState(true)
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>(blankProfileDraft)
  const [measurementDraft, setMeasurementDraft] = useState({ weightKg: '', waist: '', chest: '', hips: '', arm: '', thigh: '' })
  const [measurementError, setMeasurementError] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')

  const week = useMemo(() => getWeek(weekOffset), [weekOffset])
  const selectedWorkout = data.workouts[selectedDate] ?? { focus: 'Descanso' as Focus, exercises: [] }
  const todayMeals = data.meals.filter((meal) => meal.date === todayKey())
  const todayTotals = totalsFor(todayMeals.flatMap((meal) => meal.items))
  const todayCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0)
  const calorieTarget = data.profile?.targetCalories ?? 0
  const filteredExercises = useMemo(() => exerciseCatalog.filter((exercise) => exercise.category === exerciseFilter && `${exercise.name} ${exercise.muscle} ${exercise.equipment}`.toLocaleLowerCase('es').includes(exerciseSearch.trim().toLocaleLowerCase('es'))), [exerciseFilter, exerciseSearch])
  const customRecipeMacros = totalsFor(recipeDraft.map(snapshotForDraft).filter((item): item is FoodSnapshot => item !== null))
  const mealDraftMacros = totalsFor(foodDraft.map(snapshotForDraft).filter((item): item is FoodSnapshot => item !== null))
  const profileBMI = data.profile ? bmiFor(data.progress[data.progress.length - 1]?.weightKg ?? data.profile.weightKg, data.profile.heightCm) : null

  useEffect(() => {
    let mounted = true
    Promise.resolve(supabase.auth.getSession()).then(({ data: authData, error: sessionError }) => {
      if (!mounted) return
      if (sessionError) setError('No se ha podido comprobar la sesión. Recarga la página e inténtalo de nuevo.')
      setSession(authData.session); setLoading(false)
    }).catch(() => { if (mounted) { setError('No se ha podido conectar con la autenticación. Comprueba tu conexión.'); setLoading(false) } })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { if (mounted) setSession(nextSession) })
    return () => { mounted = false; listener.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    if (!session) { setData(blankData); setDataReady(false); setPersistenceAvailable(false); return }
    let cancelled = false
    setDataReady(false); setSaveStatus('loading'); setDataError('')
    Promise.resolve(supabase.from('forma_user_data').select('payload').eq('user_id', session.user.id).maybeSingle()).then(async ({ data: row, error: loadError }) => {
      if (cancelled) return
      if (loadError) {
        const missingTable = loadError.code === '42P01' || loadError.code === 'PGRST205' || loadError.message.toLowerCase().includes('forma_user_data')
        setPersistenceAvailable(false); setSaveStatus(missingTable ? 'setup' : 'error')
        setDataError(missingTable ? 'Para guardar de forma privada en tu cuenta, falta aplicar la migración de Supabase incluida en el repositorio.' : 'No se pudieron cargar tus datos guardados. Comprueba la conexión e inténtalo otra vez.')
        setDataReady(true)
        return
      }
      const loaded = normalizeData(row?.payload)
      const signedRecipes = await Promise.all(loaded.savedRecipes.map(async (recipe) => {
        if (!recipe.photoPath) return recipe
        const { data: signed } = await supabase.storage.from('recipe-photos').createSignedUrl(recipe.photoPath, 60 * 60)
        return { ...recipe, photoUrl: signed?.signedUrl }
      }))
      if (cancelled) return
      setData({ ...loaded, savedRecipes: signedRecipes }); setPersistenceAvailable(true); setSaveStatus('saved'); setDataReady(true)
    }).catch(() => {
      if (!cancelled) { setPersistenceAvailable(false); setSaveStatus('error'); setDataError('No se pudieron cargar tus datos guardados. Comprueba la conexión.'); setDataReady(true) }
    })
    return () => { cancelled = true }
  }, [session?.user.id])

  useEffect(() => {
    if (!session || !dataReady || !persistenceAvailable) return
    setSaveStatus('saving')
    const timer = window.setTimeout(async () => {
      const persistData = { ...data, savedRecipes: data.savedRecipes.map(({ photoUrl: _photoUrl, ...recipe }) => recipe) }
      const { error: saveError } = await supabase.from('forma_user_data').upsert({ user_id: session.user.id, payload: persistData, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      if (saveError) { setSaveStatus('error'); setDataError('No se han podido guardar los cambios. Comprueba que la migración de Supabase está aplicada y vuelve a intentarlo.') }
      else { setSaveStatus('saved'); setDataError('') }
    }, 700)
    return () => window.clearTimeout(timer)
  }, [data, dataReady, persistenceAvailable, session?.user.id])

  useEffect(() => {
    if (!dialog && !selectedRecipe) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { if (selectedRecipe) setSelectedRecipe(null); else setDialog(null) }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', closeOnEscape) }
  }, [dialog, selectedRecipe])

  useEffect(() => {
    if (!recipePhoto) { setRecipePhotoPreview(''); return }
    const url = URL.createObjectURL(recipePhoto); setRecipePhotoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [recipePhoto])

  useEffect(() => {
    const profile = data.profile
    if (!profile?.remindersEnabled || !profileBMI || !data.progress.length || profile.reminderLastSent === todayKey()) return
    const last = new Date(`${data.progress[data.progress.length - 1].date}T12:00:00`)
    const due = new Date(last)
    if (profile.reminderFrequency === 'mensual') {
      const dayOfMonth = due.getDate()
      due.setDate(1); due.setMonth(due.getMonth() + 1)
      due.setDate(Math.min(dayOfMonth, new Date(due.getFullYear(), due.getMonth() + 1, 0).getDate()))
    }
    else due.setDate(due.getDate() + (profile.reminderFrequency === 'semanal' ? 7 : 14))
    if (due > new Date()) return
    const showReminder = async () => {
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          const registration = await navigator.serviceWorker?.getRegistration()
          if (registration) await registration.showNotification('Forma · toca registrar tu progreso', { body: 'Cuando puedas, anota tu peso y medidas de hoy.', icon: `${import.meta.env.BASE_URL}icon.svg` })
          else new Notification('Forma · toca registrar tu progreso', { body: 'Cuando puedas, anota tu peso y medidas de hoy.' })
          setNotificationMessage('Recordatorio enviado.')
        } else setNotificationMessage('Tienes una actualización de progreso pendiente. Activa las notificaciones si quieres recibir un aviso del navegador.')
        setData((previous) => previous.profile ? { ...previous, profile: { ...previous.profile, reminderLastSent: todayKey() } } : previous)
      } catch { setNotificationMessage('Tienes una actualización de progreso pendiente. El navegador no pudo mostrar la notificación.') }
    }
    void showReminder()
  }, [data.profile, data.progress, profileBMI])

  const updateData = (patch: Partial<UserData>) => setData((previous) => ({ ...previous, ...patch }))
  const setWorkout = (date: string, workout: WorkoutDay) => setData((previous) => ({ ...previous, workouts: { ...previous.workouts, [date]: workout } }))
  const toggleWorkoutCompleted = (date: string) => setData((previous) => {
    const completed = previous.completedWorkoutDates.includes(date)
    return { ...previous, completedWorkoutDates: completed ? previous.completedWorkoutDates.filter((item) => item !== date) : [...previous.completedWorkoutDates, date].sort() }
  })
  const changeWeek = (step: number) => { const nextOffset = weekOffset + step; setWeekOffset(nextOffset); setSelectedDate(getWeek(nextOffset)[0].date) }
  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setSigningIn(true)
    try { const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email: email.trim(), password }); if (loginError) throw loginError; if (!loginData.session) setError('No se ha podido iniciar sesión. Inténtalo de nuevo.') }
    catch { setError('No se ha podido iniciar sesión. Comprueba el correo y la contraseña.') }
    finally { setSigningIn(false) }
  }
  const handleLogout = async () => { setError(''); setSigningOut(true); const { error: logoutError } = await supabase.auth.signOut(); if (logoutError) setError('No se ha podido cerrar la sesión. Inténtalo de nuevo.'); setSigningOut(false) }
  const addExercise = (exercise: Exercise) => {
    const current = data.workouts[selectedDate] ?? { focus: exercise.category, exercises: [] }
    if (current.exercises.some((item) => item.id === exercise.id)) return
    setWorkout(selectedDate, { focus: current.focus === 'Descanso' ? exercise.category : current.focus, exercises: [...current.exercises, exercise] })
  }
  const updateExercise = (id: string, field: 'sets' | 'reps', value: number) => setWorkout(selectedDate, { ...selectedWorkout, exercises: selectedWorkout.exercises.map((exercise) => exercise.id === id ? { ...exercise, [field]: Math.max(1, value || 1) } : exercise) })
  const removeExercise = (id: string) => setWorkout(selectedDate, { ...selectedWorkout, exercises: selectedWorkout.exercises.filter((exercise) => exercise.id !== id) })
  const moveExercise = (id: string, direction: -1 | 1) => {
    const list = [...selectedWorkout.exercises], index = list.findIndex((exercise) => exercise.id === id), target = index + direction
    if (index < 0 || target < 0 || target >= list.length) return
    ;[list[index], list[target]] = [list[target], list[index]]
    setWorkout(selectedDate, { ...selectedWorkout, exercises: list })
  }
  const openExercisePicker = (category: ExerciseCategory = selectedWorkout.focus === 'Descanso' ? 'Tren inferior' : selectedWorkout.focus) => { setExerciseFilter(category); setExerciseSearch(''); setDialog('exercise') }
  const saveRoutine = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!routineName.trim() || !selectedWorkout.exercises.length) return
    updateData({ routines: [...data.routines, { id: crypto.randomUUID(), name: routineName.trim(), focus: selectedWorkout.focus, exercises: selectedWorkout.exercises.map((exercise) => ({ ...exercise })) }] })
    setRoutineName(''); setDialog(null)
  }
  const applyRoutine = (routine: Routine) => { setWorkout(selectedDate, { focus: routine.focus, exercises: routine.exercises.map((exercise) => ({ ...exercise })) }); setDialog(null) }

  const addMeal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const items = foodDraft.map(snapshotForDraft).filter((item): item is FoodSnapshot => item !== null)
    if (!items.length) return
    const total = totalsFor(items)
    const log: MealLog = { id: crypto.randomUUID(), date: todayKey(), type: mealType, name: mealName.trim() || items.map((item) => item.name).join(' + '), items, calories: round(total.calories), protein: round(total.protein), carbs: round(total.carbs), fat: round(total.fat) }
    updateData({ meals: [...data.meals, log] }); setDialog(null); setMealName(''); setFoodDraft([emptyDraftFood()])
  }
  const removeMeal = (id: string) => updateData({ meals: data.meals.filter((meal) => meal.id !== id) })
  const estimateFoodWithAI = async (foodName: string, grams: number): Promise<FoodEstimate> => {
    const { data: estimate, error: invokeError } = await supabase.functions.invoke<FoodEstimate>('forma-ai', { body: { action: 'food', foodName, grams } })
    if (invokeError) {
      let detail = ''
      const context = invokeError.context
      if (context && typeof context === 'object' && 'json' in context && typeof context.json === 'function') {
        try { const responseBody = await (context as Response).json() as { error?: string }; detail = responseBody.error ?? '' } catch { /* The response body may already have been consumed. */ }
      }
      throw new Error(detail || 'No se pudo consultar la IA. Comprueba que la función está desplegada y configurada en Supabase.')
    }
    if (!estimate || typeof estimate.name !== 'string' || !estimate.name.trim() || ![estimate.caloriesPer100g, estimate.proteinPer100g, estimate.carbsPer100g, estimate.fatPer100g].every((value) => Number.isFinite(value) && value >= 0) || !['low', 'medium', 'high'].includes(estimate.confidence) || typeof estimate.note !== 'string') throw new Error('La IA devolvió una estimación incompleta. Prueba a concretar el alimento.')
    return estimate
  }
  const recipeFromCatalog = (recipe: Recipe) => {
    const items = recipe.ingredients.map(recipeIngredientSnapshot).filter((item): item is FoodSnapshot => item !== null)
    const macros = totalsFor(items)
    return { recipe, items, macros }
  }
  const addRecipeMeal = (recipe: Recipe | SavedRecipe) => {
    if ('ingredients' in recipe) {
      const { items, macros } = recipeFromCatalog(recipe)
      const meal: MealLog = { id: crypto.randomUUID(), date: todayKey(), type: recipe.type, name: recipe.name, items, calories: round(macros.calories), protein: round(macros.protein), carbs: round(macros.carbs), fat: round(macros.fat) }
      updateData({ meals: [...data.meals, meal] })
    } else {
      const factor = 1 / Math.max(1, recipe.servings)
      const items = recipe.items.map((item) => ({ ...item, grams: round(item.grams * factor), calories: round(item.calories * factor), protein: round(item.protein * factor), carbs: round(item.carbs * factor), fat: round(item.fat * factor) }))
      const macros = totalsFor(items)
      updateData({ meals: [...data.meals, { id: crypto.randomUUID(), date: todayKey(), type: recipe.type, name: recipe.name, items, calories: round(macros.calories), protein: round(macros.protein), carbs: round(macros.carbs), fat: round(macros.fat), photoPath: recipe.photoPath }] })
    }
    setSelectedRecipe(null); setDialog(null)
  }
  const saveCustomRecipe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setRecipeError('')
    const items = recipeDraft.map(snapshotForDraft).filter((item): item is FoodSnapshot => item !== null)
    const servings = Number(recipeServings)
    if (!items.length || servings < 1) { setRecipeError('Añade al menos un ingrediente y una ración.'); return }
    setRecipeBusy(true)
    let photoPath: string | undefined
    try {
      if (recipePhoto) {
        const extension = recipePhoto.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
        photoPath = `${session!.user.id}/${crypto.randomUUID()}.${extension}`
        const { error: uploadError } = await supabase.storage.from('recipe-photos').upload(photoPath, recipePhoto, { contentType: recipePhoto.type, upsert: false })
        if (uploadError) throw new Error('No se pudo guardar la foto. Comprueba que el almacenamiento privado de recetas está configurado en Supabase.')
      }
      const macros = totalsFor(items)
      const photoUrl = photoPath ? (await supabase.storage.from('recipe-photos').createSignedUrl(photoPath, 60 * 60)).data?.signedUrl : undefined
      const saved: SavedRecipe = { id: crypto.randomUUID(), name: recipeName.trim(), type: mealType, servings, items, calories: round(macros.calories / servings), protein: round(macros.protein / servings), carbs: round(macros.carbs / servings), fat: round(macros.fat / servings), photoPath, photoUrl, createdAt: new Date().toISOString() }
      updateData({ savedRecipes: [...data.savedRecipes, saved] }); setRecipeName(''); setRecipeDraft([emptyDraftFood()]); setRecipePhoto(null); setDialog(null)
    } catch (cause) { setRecipeError(cause instanceof Error ? cause.message : 'No se pudo guardar la receta.') }
    finally { setRecipeBusy(false) }
  }
  const deleteSavedRecipe = (id: string) => {
    const target = data.savedRecipes.find((recipe) => recipe.id === id)
    updateData({ savedRecipes: data.savedRecipes.filter((recipe) => recipe.id !== id) })
    if (target?.photoPath) void supabase.storage.from('recipe-photos').remove([target.photoPath])
  }
  const normalizeIngredient = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/^\s*(\d+[.,]?\d*|½|¼|¾)\s*(g|kg|ml|l|cucharadita|cucharada|unidad|unidades)?\s*(de)?\s*/, '').replace(/^(cucharadita|cucharada|unidad|unidades)\s+de\s+/, '').trim().replace(/s$/, '')
  const findRecipes = async (mode: 'random' | 'pantry') => {
    setRecipeMessage(''); setRecipeResults([])
    const enteredLimit = Number(recipeCalorieLimit)
    const limit = Number.isFinite(enteredLimit) && enteredLimit >= 100 && enteredLimit <= 2000 ? enteredLimit : 2000
    if (mode === 'pantry') {
      const supplied = ingredientText.split(/[,;\n]+/).map((item) => item.trim().slice(0, 80)).filter(Boolean).slice(0, 20)
      if (supplied.length < 2) { setRecipeMessage('Escribe al menos dos ingredientes para que la IA pueda proponerte recetas relacionadas.'); return }
      setAiRecipeBusy(true)
      try {
        const { data: result, error: invokeError } = await supabase.functions.invoke<{ recipes: Array<{ name: string; type: MealType; minutes: number; description: string; ingredients: Array<{ name: string; grams: number; caloriesPer100g: number; proteinPer100g: number; carbsPer100g: number; fatPer100g: number }>; steps: string[] }> }>('forma-ai', { body: { action: 'recipes', ingredients: supplied, mealType: recipeTypeFilter, maxCalories: limit, prioritizeProtein: proteinPriority } })
        if (invokeError) throw new Error('No se pudo consultar la IA. Comprueba que la función está desplegada y configurada en Supabase.')
        const candidates = (result?.recipes ?? []).map((candidate, index): Recipe | null => {
          const ingredients = candidate.ingredients.filter((item) => item.name?.trim() && Number.isFinite(item.grams) && item.grams > 0 && [item.caloriesPer100g, item.proteinPer100g, item.carbsPer100g, item.fatPer100g].every((value) => Number.isFinite(value) && value >= 0)).map((item) => ({ ...item, name: item.name.trim() }))
          if (!candidate.name?.trim() || !ingredients.length || !Array.isArray(candidate.steps)) return null
          const normalizedRecipeIngredients = ingredients.map((item) => normalizeIngredient(item.name))
          const matchedInputs = supplied.filter((input) => normalizedRecipeIngredients.some((item) => item.includes(normalizeIngredient(input)) || normalizeIngredient(input).includes(item)))
          const missing = ingredients.filter((item) => !matchedInputs.some((input) => normalizeIngredient(item.name!).includes(normalizeIngredient(input)) || normalizeIngredient(input).includes(normalizeIngredient(item.name!)))).map((item) => item.name!)
          const recipe: Recipe = { id: `ai-${Date.now()}-${index}`, name: candidate.name.trim(), type: candidate.type, time: candidate.minutes, description: candidate.description, image: recipeImageFor(`${candidate.name} ${ingredients.map((item) => item.name).join(' ')}`), ingredients, steps: candidate.steps, isAiGenerated: true, imageIsIllustrative: true, matchCount: matchedInputs.length, missing }
          return recipe
        }).filter((recipe): recipe is Recipe => recipe !== null && recipe.matchCount! >= Math.min(2, supplied.length))
          .filter((recipe) => recipeTypeFilter === 'Cualquiera' || recipe.type === recipeTypeFilter)
          .filter((recipe) => recipeMacros(recipe).calories <= limit)
        if (!candidates.length) { setRecipeMessage('La IA no encontró una propuesta que use al menos dos de tus ingredientes dentro de esos filtros. Prueba a cambiar el tipo de plato o el máximo de calorías.'); return }
        if (proteinPriority) candidates.sort((a, b) => recipeMacros(b).protein / Math.max(1, recipeMacros(b).calories) - recipeMacros(a).protein / Math.max(1, recipeMacros(a).calories))
        setRecipeResults(candidates.slice(0, 3)); setRecipeMessage('Propuestas generadas con IA a partir de tus ingredientes. Revisa cantidades y valores nutricionales; son estimaciones. Las fotos son orientativas.')
      } catch (cause) {
        setRecipeMessage(cause instanceof Error ? cause.message : 'No se pudo generar recetas. Comprueba la conexión y la configuración de IA.')
      } finally { setAiRecipeBusy(false) }
      return
    }
    const candidates = recipeCatalog.filter((recipe) => recipeTypeFilter === 'Cualquiera' || recipe.type === recipeTypeFilter).map((recipe) => {
      const { macros } = recipeFromCatalog(recipe)
      return { ...recipe, calories: Math.round(macros.calories), protein: macros.protein }
    }).filter((recipe) => recipe.calories <= limit)
    if (!candidates.length) { setRecipeMessage(mode === 'pantry' ? 'No hay una coincidencia suficientemente cercana en el catálogo para esos ingredientes. Prueba con 2 o más ingredientes básicos, como pollo, arroz, tomate, huevo o garbanzos.' : 'No encontramos recetas con esos filtros. Prueba a aumentar el límite de calorías o cambia el tipo de plato.'); return }
    if (mode === 'random') {
      if (proteinPriority) candidates.sort((a, b) => b.protein / b.calories - a.protein / a.calories)
      const pool = proteinPriority ? candidates.slice(0, Math.min(3, candidates.length)) : candidates
      const pick = pool[Math.floor(Math.random() * pool.length)]
      setRecipeResults([pick]); setRecipeMessage('Receta del catálogo seleccionada al azar. Los valores nutricionales son aproximados.')
    }
  }

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const age = asNumber(profileDraft.age), height = asNumber(profileDraft.heightCm), weight = asNumber(profileDraft.weightKg), target = estimateCalories(profileDraft)
    if (age < 18 || age > 100 || height < 120 || height > 230 || weight < 35 || weight > 350 || target < 1000 || target > 6000) { setDataError('Revisa edad, altura, peso y el objetivo de calorías. La estimación está diseñada para personas adultas.'); return }
    const profile: UserProfile = { age, sex: profileDraft.sex, heightCm: height, weightKg: weight, activity: profileDraft.activity, goal: profileDraft.goal, targetCalories: target, reminderFrequency: profileDraft.reminderFrequency, remindersEnabled: data.profile?.remindersEnabled ?? false, reminderLastSent: data.profile?.reminderLastSent }
    const isFirst = !data.profile
    const firstProgress: ProgressRecord = { id: crypto.randomUUID(), date: todayKey(), weightKg: weight }
    updateData({ profile, progress: isFirst ? [...data.progress, firstProgress] : data.progress })
    setDataError(''); if (dialog === 'setup') setDialog(null)
  }
  const openProfileEditor = () => {
    const profile = data.profile
    setProfileDraft(profile ? { age: String(profile.age), sex: profile.sex, heightCm: String(profile.heightCm), weightKg: String(profile.weightKg), activity: profile.activity, goal: profile.goal, manualCalories: profile.sex === 'manual' ? String(profile.targetCalories) : '', reminderFrequency: profile.reminderFrequency } : blankProfileDraft)
    setDialog('setup')
  }
  const saveMeasurement = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const weightKg = asNumber(measurementDraft.weightKg)
    if (!Number.isFinite(weightKg) || weightKg < 35 || weightKg > 350) { setMeasurementError('Introduce un peso entre 35 y 350 kg.'); return }
    const record: ProgressRecord = { id: crypto.randomUUID(), date: todayKey(), weightKg, ...(['waist', 'chest', 'hips', 'arm', 'thigh'] as const).reduce((measurements, key) => { const value = asNumber(measurementDraft[key]); return value > 0 ? { ...measurements, [key]: value } : measurements }, {}) }
    updateData({ progress: [...data.progress, record] }); setMeasurementDraft({ weightKg: '', waist: '', chest: '', hips: '', arm: '', thigh: '' }); setMeasurementError(''); setDialog(null)
  }
  const enableNotifications = async () => {
    setNotificationMessage('')
    if (data.profile?.remindersEnabled) { updateData({ profile: { ...data.profile, remindersEnabled: false } }); setNotificationMessage('Los avisos de Forma están desactivados.'); return }
    if (!('Notification' in window)) { setNotificationMessage('Este navegador no permite notificaciones. Puedes ver el recordatorio al abrir la app.'); return }
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setNotificationMessage('El permiso de notificaciones no está activado. Puedes cambiarlo desde los ajustes del navegador.'); return }
      if ('serviceWorker' in navigator) await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
      updateData({ profile: data.profile ? { ...data.profile, remindersEnabled: true } : null })
      setNotificationMessage('Recordatorios del navegador activados. Te avisarán al abrir la app cuando toque registrar el progreso.')
    } catch { setNotificationMessage('No se pudieron activar las notificaciones en este navegador.') }
  }

  if (loading) return <main className="auth-screen"><section className="auth-card auth-loading"><div className="brand-mark"><Activity size={24} /></div><h1>forma</h1><p>Preparando tu espacio...</p></section></main>
  if (!session) return <main className="auth-screen"><section className="auth-card"><div className="auth-brand"><span className="brand-mark"><Activity size={25} /></span><div><strong>forma</strong><small>FITNESS & WELLNESS</small></div></div><p className="eyebrow">TU SALUD, A TU RITMO</p><h1>Bienvenido</h1><p className="auth-description">Inicia sesión para entrar en tu espacio personal.</p><form className="auth-form" onSubmit={handleLogin}><label htmlFor="email">Correo electrónico</label><div className="auth-input-wrap"><Mail size={18} /><input id="email" type="email" autoComplete="email" placeholder="tu@email.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div><label htmlFor="password">Contraseña</label><div className="auth-input-wrap"><LockKeyhole size={18} /><input id="password" type="password" autoComplete="current-password" placeholder="Tu contraseña" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>{error && <p className="auth-error" role="alert">{error}</p>}<button className="auth-submit" type="submit" disabled={signingIn}>{signingIn ? 'Iniciando sesión...' : 'Iniciar sesión'} <ArrowRight size={17} /></button></form><p className="auth-footer"><ShieldCheck size={15} /> Forma es un espacio privado. Las cuentas las gestiona el administrador.</p></section></main>

  const weekRange = week.length ? `${displayDate(week[0].date)} — ${displayDate(week[6].date)}` : ''
  const selectedDayData = week.find((day) => day.date === selectedDate)
  const latestProgress = data.progress[data.progress.length - 1]
  const targetProgress = data.profile ? data.profile.targetCalories : 0
  const macroGoals = { protein: 150, carbs: 250, fat: 70 }
  return <main className="app-shell">
    <aside className="sidebar"><a className="brand" href="#inicio" onClick={(event) => { event.preventDefault(); setActive('inicio') }}><span className="brand-mark"><Activity size={23} /></span><span><strong>forma</strong><small>FITNESS & WELLNESS</small></span></a><p className="nav-heading">TU ESPACIO</p><nav className="side-nav">{sections.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${active === id ? 'active' : ''}`} onClick={() => setActive(id)}><Icon size={19} /><span>{label}</span></button>)}</nav><div className="sidebar-bottom"><div className="privacy-note"><span className="privacy-icon"><ShieldCheck size={19} /></span><strong>Tu progreso, a tu ritmo</strong><p>Un espacio personal para construir hábitos sostenibles.</p></div><p className="version-label"><Settings2 size={14} /> Forma · Tu espacio privado</p></div></aside>
    <section className="main-content"><header className="topbar"><div className="mobile-brand"><span className="brand-mark"><Activity size={19} /></span><strong>forma</strong></div><div className="topbar-right"><span className={`preview-pill save-pill ${saveStatus}`}><span className="status-dot" /> {saveStatus === 'saving' ? 'Guardando…' : saveStatus === 'saved' ? 'Guardado' : saveStatus === 'setup' ? 'Configurar datos' : saveStatus === 'error' ? 'Sin sincronizar' : 'Cargando'}</span><button className="avatar-button" onClick={() => setActive('perfil')} aria-label="Abrir perfil">{(session.user.email ?? 'F').slice(0, 1).toUpperCase()}</button></div></header>
      <div className="page-content">
        {(dataError || saveStatus === 'setup') && <div className={`data-banner ${saveStatus === 'error' ? 'error' : ''}`} role="status"><ShieldCheck size={17} /><span>{dataError || 'Para sincronizar estos datos entre sesiones y dispositivos, aplica la migración de Supabase incluida en el repositorio.'}</span></div>}
        {active === 'inicio' && <>
          <section className="hero-panel"><div className="hero-copy"><p className="eyebrow">TU SALUD, A TU RITMO</p><h1>Pequeños pasos.<br /><span>Grandes cambios.</span></h1><p className="hero-description">Organiza tus entrenamientos, descubre nuevas comidas y sigue construyendo tu bienestar.</p><button className="primary-button" onClick={() => setActive('entreno')}>Planificar mi semana <ArrowRight size={17} /></button></div><div className="hero-graphic" aria-hidden="true"><div className="hero-sun" /><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-leaf leaf-one"><Leaf size={38} /></div><div className="hero-leaf leaf-two"><Leaf size={27} /></div><div className="hero-graphic-word">FORMA</div></div></section>
          <div className="section-heading home-section-heading"><div><p className="eyebrow">HOY</p><h2>Tu resumen diario</h2></div><span className="date-chip"><CalendarDays size={15} /> {displayDate(todayKey(), { day: 'numeric', month: 'short' })}</span></div>
          <div className="home-metrics"><button className="metric-card nutrition-metric" onClick={() => setActive('comida')}><span className="metric-top"><span className="metric-icon"><Flame size={18} /></span><span className="metric-link">Ver comida <ArrowRight size={14} /></span></span><span className="metric-label">Calorías consumidas</span><span className="metric-number">{Math.round(todayCalories).toLocaleString('es-ES')} <small>kcal</small></span><span className="progress-track"><span style={{ width: `${targetProgress ? Math.min(100, todayCalories / targetProgress * 100) : 0}%` }} /></span><span className="metric-foot">{targetProgress ? `Objetivo: ${targetProgress.toLocaleString('es-ES')} kcal` : 'Configura tu objetivo en Progreso'}</span></button><button className="metric-card protein-metric" onClick={() => setActive('comida')}><span className="metric-top"><span className="metric-icon"><Target size={18} /></span><span className="metric-link">Ver comida <ArrowRight size={14} /></span></span><span className="metric-label">Proteína consumida</span><span className="metric-number">{Math.round(todayTotals.protein)} <small>g</small></span><span className="progress-track"><span style={{ width: `${Math.min(100, todayTotals.protein / macroGoals.protein * 100)}%` }} /></span><span className="metric-foot">Referencia de ejemplo: {macroGoals.protein} g</span></button></div>
          <div className="section-heading"><div><p className="eyebrow">TU PLAN</p><h2>Esta semana</h2></div><button className="text-button" onClick={() => setActive('entreno')}>Ver calendario <ArrowRight size={15} /></button></div><div className="week-strip home-week-strip">{week.map((day) => { const workout = data.workouts[day.date]; return <button key={day.date} className={`week-day ${selectedDate === day.date ? 'selected' : ''}`} onClick={() => { setSelectedDate(day.date); setActive('entreno') }}><span>{day.label.slice(0, 3)}</span><strong>{day.number}</strong><span className="day-indicator">{data.completedWorkoutDates.includes(day.date) ? 'Hecho' : workout?.exercises.length ? `${workout.exercises.length} ejercicios` : 'Sin plan'}</span></button> })}</div>
          <div className="home-bottom-grid"><button className="feature-card recipe-feature" onClick={() => { setDialog('random'); setRecipeResults([]); setRecipeMessage('') }}><span className="feature-icon warm"><ChefHat size={21} /></span><span className="feature-content"><small>¿QUÉ COCINAMOS HOY?</small><strong>Descubre tu próxima receta</strong><span>Ideas ricas, sencillas y adaptadas a tus objetivos.</span></span><ArrowRight className="feature-arrow" size={18} /></button><button className="feature-card workout-feature" onClick={() => setActive('entreno')}><span className="feature-icon sage"><Dumbbell size={21} /></span><span className="feature-content"><small>ENTRENA A TU MANERA</small><strong>Diseña tu rutina</strong><span>Elige ejercicios y organiza tu semana.</span></span><ArrowRight className="feature-arrow" size={18} /></button></div>
          {!persistenceAvailable && <p className="prototype-note"><Sparkles size={14} /> Al aplicar la migración de Supabase, tus cambios se guardarán de forma privada en tu cuenta.</p>}
        </>}

        {active === 'entreno' && <>
          <div className="page-intro"><div><p className="eyebrow">TU PLAN, TUS REGLAS</p><h1>Organiza tu semana</h1><p className="subtitle">Selecciona un día, elige ejercicios del glosario y reutiliza tus rutinas guardadas.</p></div><div className="intro-icon sage"><CalendarDays size={24} /></div></div>
          <div className="calendar-card"><div className="calendar-card-head"><div><span className="mini-label">CALENDARIO SEMANAL</span><h2>Tu semana de entrenamiento</h2></div><div className="week-navigation"><button className="icon-button" aria-label="Semana anterior" onClick={() => changeWeek(-1)}><ArrowLeft size={16} /></button><span className="week-range">{weekRange}</span><button className="icon-button" aria-label="Semana siguiente" onClick={() => changeWeek(1)}><ArrowRight size={16} /></button></div></div><div className="week-strip">{week.map((day) => { const workout = data.workouts[day.date]; return <button key={day.date} className={`week-day ${selectedDate === day.date ? 'selected' : ''}`} onClick={() => setSelectedDate(day.date)}><span>{day.label.slice(0, 3)}</span><strong>{day.number}</strong><span className="day-indicator">{data.completedWorkoutDates.includes(day.date) ? 'Hecho' : workout?.exercises.length ? 'Entreno' : 'Libre'}</span></button> })}</div></div>
          <div className="workout-planner"><div className="planner-title-row"><div><p className="eyebrow">{selectedDayData?.name.toLocaleUpperCase('es')}</p><h2>{selectedWorkout.exercises.length ? selectedWorkout.focus : 'Día sin ejercicios'}</h2></div><div className="planner-status-actions"><span className="exercise-count">{selectedWorkout.exercises.length} ejercicios</span>{selectedWorkout.exercises.length > 0 && selectedDate <= todayKey() && <button className={data.completedWorkoutDates.includes(selectedDate) ? 'secondary-button workout-complete-button completed' : 'primary-button workout-complete-button'} onClick={() => toggleWorkoutCompleted(selectedDate)}><Check size={15} /> {data.completedWorkoutDates.includes(selectedDate) ? 'Entreno realizado' : 'Marcar como entrenado'}</button>}</div></div><div className="focus-options">{(['Tren inferior', 'Tren superior', 'Cardio', 'Descanso'] as Focus[]).map((focus) => <button key={focus} className={selectedWorkout.focus === focus ? 'focus-option selected' : 'focus-option'} onClick={() => setWorkout(selectedDate, { focus, exercises: focus === 'Descanso' ? [] : selectedWorkout.exercises.filter((exercise) => exercise.category === focus) })}>{focus}</button>)}</div>
            {selectedWorkout.exercises.length ? <div className="exercise-list">{selectedWorkout.exercises.map((exercise, index) => <article className="exercise-card" key={exercise.id}><ExerciseImage index={exercise.imageIndex} name={exercise.name} /><div className="exercise-main"><div className="exercise-title-line"><span className="exercise-index">{String(index + 1).padStart(2, '0')}</span><h3>{exercise.name}</h3></div><p className="exercise-meta">{exercise.muscle} <span>·</span> {exercise.equipment}</p><p className="exercise-detail">{exercise.detail}</p><div className="exercise-config"><label>Series<input aria-label={`Series de ${exercise.name}`} type="number" min="1" max="20" value={exercise.sets} onChange={(event) => updateExercise(exercise.id, 'sets', Number(event.target.value))} /></label><span className="config-x">×</span><label>{exercise.category === 'Cardio' ? 'Minutos' : 'Repeticiones'}<input aria-label={`${exercise.category === 'Cardio' ? 'Minutos' : 'Repeticiones'} de ${exercise.name}`} type="number" min="1" max="300" value={exercise.reps} onChange={(event) => updateExercise(exercise.id, 'reps', Number(event.target.value))} /></label></div><div className="exercise-actions"><button className="tiny-text-button" disabled={index === 0} onClick={() => moveExercise(exercise.id, -1)}><ArrowLeft size={13} /> Subir</button><button className="tiny-text-button" disabled={index === selectedWorkout.exercises.length - 1} onClick={() => moveExercise(exercise.id, 1)}><ArrowDown size={13} /> Bajar</button><button className="tiny-text-button remove-action" onClick={() => removeExercise(exercise.id)}><X size={13} /> Quitar</button></div></div></article>)}</div> : <div className="workout-empty"><Dumbbell size={22} /><strong>Este día todavía está vacío</strong><span>Añade ejercicios del catálogo o carga una rutina que ya guardaste.</span></div>}
            <button className="add-exercise-button" onClick={() => openExercisePicker()}><span><Plus size={19} /></span>Añadir ejercicio<small className="add-exercise-note">Explora el glosario</small></button><div className="planner-footer"><span><Clock3 size={15} /> Duración estimada: {selectedWorkout.exercises.reduce((sum, exercise) => sum + (exercise.category === 'Cardio' ? exercise.reps : exercise.sets * exercise.reps * .08), 0)} min</span><div className="routine-actions"><button className="text-button" onClick={() => setDialog('routines')}>Reutilizar rutina <ArrowRight size={15} /></button><button className="text-button" disabled={!selectedWorkout.exercises.length} onClick={() => setDialog('save-routine')}>Guardar rutina <Plus size={15} /></button></div></div>
          </div>
        </>}

        {active === 'comida' && <>
          <section className="nutrition-summary"><div className="nutrition-summary-head"><div><span className="mini-label">TU DÍA · {displayDate(todayKey(), { day: 'numeric', month: 'long' })}</span><h2>Resumen nutricional</h2></div><span className="example-tag">{calorieTarget ? `Objetivo ${calorieTarget} kcal` : 'Completa tu perfil'}</span></div><div className="nutrition-main-stat"><div className="calorie-ring" style={{ '--progress': `${calorieTarget ? Math.min(100, todayCalories / calorieTarget * 100) : 0}%` } as CSSProperties}><div><Flame size={18} /><strong>{Math.round(todayCalories)}</strong><span>de {calorieTarget || '—'}</span><small>kcal</small></div></div><div className="macro-list">{([{ label: 'Proteínas', value: todayTotals.protein, goal: macroGoals?.protein, cls: 'protein-dot' }, { label: 'Hidratos', value: todayTotals.carbs, goal: macroGoals?.carbs, cls: 'carbs-dot' }, { label: 'Grasas', value: todayTotals.fat, goal: macroGoals?.fat, cls: 'fat-dot' }] as const).map((macro) => <div className="macro-row" key={macro.label}><div className="macro-row-title"><span><i className={`macro-dot ${macro.cls}`} /> {macro.label}</span><strong>{Math.round(macro.value)} / {macro.goal ?? '—'} g</strong></div><div className="progress-track"><span className={macro.cls.replace('-dot', '-progress')} style={{ width: `${macro.goal ? Math.min(100, macro.value / macro.goal * 100) : 0}%` }} /></div></div>)}</div></div></section>
          <div className="section-heading"><div><p className="eyebrow">DIARIO · {todayMeals.length} registros</p><h2>Lo que has comido</h2></div><button className="text-button" onClick={() => { setMealType('Comida'); setMealName(''); setFoodDraft([emptyDraftFood()]); setDialog('food') }}><Plus size={16} /> Añadir comida</button></div>
          <div className="meal-log-card">{mealTypes.map((type) => { const rows = todayMeals.filter((meal) => meal.type === type); const total = rows.reduce((sum, meal) => sum + meal.calories, 0); return <div className="meal-slot" key={type}><div className="meal-slot-icon">{type === 'Desayuno' ? '☀' : type === 'Comida' ? '◷' : type === 'Cena' ? '☾' : '✳'}</div><div className="meal-slot-content"><div className="meal-slot-title"><strong>{type}</strong><span>{Math.round(total)} kcal</span></div>{rows.length ? rows.map((meal) => <article className="logged-recipe" key={meal.id}><div className="logged-food-icon"><Apple size={16} /></div><div className="logged-food-copy"><span>{meal.name}</span><small>{meal.items.map((item) => `${item.name} ${item.grams} g`).join(' · ') || 'Receta guardada'}</small></div><strong>{Math.round(meal.calories)} kcal</strong><button className="tiny-text-button remove-action" aria-label={`Eliminar ${meal.name}`} onClick={() => removeMeal(meal.id)}><X size={14} /></button></article>) : <span className="empty-meal">Todavía no has añadido nada</span>}</div><button className="small-plus" onClick={() => { setMealType(type); setMealName(''); setFoodDraft([emptyDraftFood()]); setDialog('food') }} aria-label={`Añadir ${type.toLowerCase()}`}><Plus size={17} /></button></div> })}</div>
          <div className="section-heading recipe-section-title"><div><p className="eyebrow">INSPIRACIÓN</p><h2>¿Qué te apetece cocinar?</h2></div></div><div className="recipe-entry-grid"><button className="recipe-entry-card random-entry" onClick={() => { setDialog('random'); setRecipeResults([]); setRecipeMessage('') }}><div className="recipe-entry-image"><img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85" alt="Ensalada de verduras y legumbres" /><span className="recipe-entry-icon"><Sparkles size={18} /></span></div><div className="recipe-entry-copy"><span className="mini-label">DÉJATE SORPRENDER</span><strong>Receta aleatoria</strong><p>Una idea nueva para tu próxima comida.</p><span className="entry-link">Descubrir receta <ArrowRight size={15} /></span></div></button><button className="recipe-entry-card pantry-entry" onClick={() => { setDialog('pantry'); setRecipeResults([]); setRecipeMessage('') }}><div className="recipe-entry-image"><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85" alt="Ingredientes frescos en un bol" /><span className="recipe-entry-icon"><ChefHat size={18} /></span></div><div className="recipe-entry-copy"><span className="mini-label">APROVECHA TU DESPENSA</span><strong>Cocina con lo que tienes</strong><p>Busca recetas con varios ingredientes coincidentes.</p><span className="entry-link">Buscar recetas <ArrowRight size={15} /></span></div></button></div>
          <div className="section-heading recipe-section-title"><div><p className="eyebrow">TUS RECETAS</p><h2>Recetas guardadas</h2></div><button className="text-button" onClick={() => { setRecipeName(''); setRecipeDraft([emptyDraftFood()]); setRecipePhoto(null); setRecipeError(''); setDialog('custom-recipe') }}><Plus size={16} /> Crear receta</button></div>
          {data.savedRecipes.length ? <div className="saved-recipe-grid">{data.savedRecipes.map((recipe) => <article className="saved-recipe-card" key={recipe.id}><button className="saved-recipe-main" onClick={() => setSelectedRecipe(recipe)}>{recipe.photoUrl ? <img src={recipe.photoUrl} alt={`Foto de ${recipe.name}`} /> : <span className="saved-recipe-placeholder"><ChefHat size={25} /></span>}<span><strong>{recipe.name}</strong><small>{recipe.type} · {recipe.calories} kcal/ración · {recipe.items.length} ingredientes</small></span></button><button className="small-plus" onClick={() => addRecipeMeal(recipe)} aria-label={`Añadir ${recipe.name} al día`}><Plus size={17} /></button><button className="tiny-text-button remove-action" onClick={() => deleteSavedRecipe(recipe.id)} aria-label={`Eliminar receta ${recipe.name}`}><X size={14} /></button></article>)}</div> : <p className="empty-saved-recipes">Tus recetas aparecerán aquí para que las reutilices en el diario.</p>}
          <p className="prototype-note"><Sparkles size={14} /> Los valores de la biblioteca nutricional son aproximados por 100 g. Para una precisión mayor, compara con la etiqueta del alimento.</p>
        </>}

        {active === 'progreso' && <>
          <div className="page-intro"><div><p className="eyebrow">CADA PASO CUENTA</p><h1>Tu evolución</h1><p className="subtitle">Calcula tu objetivo inicial y registra cómo cambia tu progreso.</p></div><div className="intro-icon blue-bg"><TrendingUp size={24} /></div></div>
          {!data.profile ? <section className="progress-setup-card"><div className="setup-intro"><span className="mini-label">EMPEZAMOS POR TI</span><h2>Datos para estimar tu objetivo</h2><p>Con tu edad, altura, peso, actividad diaria y objetivo calcularemos un IMC orientativo y una meta calórica inicial.</p></div><ProfileForm draft={profileDraft} setDraft={setProfileDraft} onSubmit={saveProfile} error={dataError} submitLabel="Calcular mi objetivo" /></section> : <>
            <section className="progress-result-card"><div className="progress-result-top"><div><span className="mini-label">TU OBJETIVO ESTIMADO</span><h2>{data.profile.targetCalories.toLocaleString('es-ES')} kcal al día</h2><p>{goalLabels[data.profile.goal]} · {activityLabels[data.profile.activity]}</p></div><button className="secondary-button" onClick={openProfileEditor}><Settings2 size={16} /> Editar datos</button></div><div className="progress-stat-grid"><article><span>IMC orientativo</span><strong>{data.profile.age >= 20 ? profileBMI?.toFixed(1) : '—'}</strong><small>{data.profile.age >= 20 ? bmiCategory(profileBMI ?? 0) : 'Se muestra para personas adultas de 20 años o más'}</small></article><article><span>Peso inicial</span><strong>{data.progress[0]?.weightKg ?? data.profile.weightKg} kg</strong><small>Registro del {displayDate(data.progress[0]?.date ?? todayKey(), { day: 'numeric', month: 'long', year: 'numeric' })}</small></article><article><span>Último peso</span><strong>{latestProgress?.weightKg ?? data.profile.weightKg} kg</strong><small>{latestProgress ? displayDate(latestProgress.date, { day: 'numeric', month: 'long' }) : '—'}</small></article></div><p className="health-note">La ecuación y el IMC dan estimaciones orientativas. El IMC es un indicador de cribado, no un diagnóstico. La meta calórica puede ajustarse manualmente al editar el perfil.</p></section>
            <div className="section-heading"><div><p className="eyebrow">TU HISTORIAL</p><h2>Peso y medidas</h2></div><button className="primary-button" onClick={() => { setMeasurementDraft({ weightKg: String(latestProgress?.weightKg ?? data.profile!.weightKg), waist: '', chest: '', hips: '', arm: '', thigh: '' }); setMeasurementError(''); setDialog('measurement') }}><Plus size={16} /> Registrar seguimiento</button></div>
            {data.progress.length ? <div className="progress-history-card">{[...data.progress].reverse().map((record) => <div className="progress-history-row" key={record.id}><span>{displayDate(record.date, { day: 'numeric', month: 'short', year: 'numeric' })}</span><strong>{record.weightKg} kg</strong><div>{(['waist', 'chest', 'hips', 'arm', 'thigh'] as const).filter((key) => record[key]).map((key) => <small key={key}>{measureLabel(key)} {record[key]} cm</small>)}</div></div>)}</div> : <div className="empty-measurements">Tu registro inicial se guardará al terminar el formulario.</div>}
            <section className="reminder-card"><span className="reminder-icon"><Bell size={20} /></span><div className="reminder-copy"><strong>Recordatorio de seguimiento</strong><p>Elige cada cuánto quieres revisar tu progreso. La notificación aparece cuando vuelves a abrir Forma.</p><label className="reminder-frequency">Frecuencia<select value={data.profile.reminderFrequency} onChange={(event) => updateData({ profile: { ...data.profile!, reminderFrequency: event.target.value as ReminderFrequency } })}><option value="semanal">Cada semana</option><option value="quincenal">Cada dos semanas</option><option value="mensual">Cada mes</option></select></label>{notificationMessage && <small className="notification-message">{notificationMessage}</small>}</div><button className={data.profile.remindersEnabled ? 'secondary-button' : 'primary-button'} onClick={enableNotifications}><Bell size={15} /> {data.profile.remindersEnabled ? 'Desactivar avisos' : 'Activar notificaciones'}</button></section>
            <p className="health-note">Para enviar avisos cuando la app está cerrada hace falta configurar un servicio push y un planificador de servidor; esta versión comprueba el recordatorio al abrir la app.</p>
          </>}
          <ProgressOverview records={data.progress} completedWorkoutDates={data.completedWorkoutDates} />
        </>}

        {active === 'perfil' && <>
          <div className="page-intro"><div><p className="eyebrow">TU ESPACIO PERSONAL</p><h1>Tu perfil</h1><p className="subtitle">Administra tu cuenta y tus objetivos personales.</p></div><div className="intro-icon sage"><UserRound size={24} /></div></div>
          <section className="profile-card"><div className="profile-avatar">{(session.user.email ?? 'F').slice(0, 1).toUpperCase()}</div><div className="profile-main"><h2>{session.user.email?.split('@')[0] ?? 'Usuario de Forma'}</h2><p>{session.user.email}</p><span className="account-status"><ShieldCheck size={14} /> Cuenta privada</span></div><button className="icon-button" onClick={() => { setError(''); void handleLogout() }} aria-label="Cerrar sesión" disabled={signingOut}><LogOut size={18} /></button></section>
          <section className="settings-card"><div className="settings-card-heading"><span className="settings-icon sage"><Target size={19} /></span><div><h2>Objetivos personales</h2><p>{data.profile ? `${data.profile.targetCalories.toLocaleString('es-ES')} kcal al día · ${goalLabels[data.profile.goal]}` : 'Completa tus datos para calcular el objetivo inicial.'}</p></div></div><button className="secondary-button" onClick={() => { setActive('progreso'); if (data.profile) openProfileEditor() }}>{data.profile ? 'Editar objetivos' : 'Completar perfil de progreso'} <ArrowRight size={15} /></button></section>
          <section className="settings-card privacy-settings"><div className="settings-card-heading"><span className="settings-icon sage"><ShieldCheck size={19} /></span><div><h2>Privacidad y cuenta</h2><p>Los registros se guardan bajo tu cuenta privada.</p></div></div><p className="privacy-copy">Solo tú puedes leer tus entrenamientos, comidas, recetas y medidas. Las fotos de recetas se guardan en un espacio privado.</p><button className="secondary-button logout-full" onClick={() => void handleLogout()} disabled={signingOut}><LogOut size={16} /> {signingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}</button></section>
        </>}
      </div>
    </section>
    <nav className="mobile-nav" aria-label="Navegación principal">{sections.map(({ id, label, icon: Icon }) => <button key={id} className={active === id ? 'mobile-item active' : 'mobile-item'} onClick={() => setActive(id)} aria-current={active === id ? 'page' : undefined}><Icon size={20} /><span>{label}</span></button>)}</nav>

    {dialog === 'exercise' && <Modal title="Añadir ejercicio" eyebrow="GLOSARIO VISUAL · 75 MOVIMIENTOS" className="exercise-modal" onClose={() => setDialog(null)}><div className="search-field"><Search size={17} /><input value={exerciseSearch} onChange={(event) => setExerciseSearch(event.target.value)} placeholder="Buscar ejercicio, músculo o equipo…" /></div><div className="filter-pills">{(['Tren inferior', 'Tren superior', 'Cardio'] as ExerciseCategory[]).map((category) => <button key={category} className={exerciseFilter === category ? 'filter-pill active' : 'filter-pill'} onClick={() => setExerciseFilter(category)}>{category}</button>)}</div><div className="exercise-picker-list">{filteredExercises.map((exercise) => <details className="picker-exercise-details" key={exercise.id}><summary className="picker-exercise"><ExerciseImage index={exercise.imageIndex} name={exercise.name} /><span className="picker-exercise-info"><strong>{exercise.name}</strong><span>{exercise.muscle}</span><small>{exercise.equipment}</small></span><span className="picker-action-label">Ver y añadir</span></summary><div className="picker-exercise-detail"><p>{exercise.detail}</p><span>{exercise.sets} series · {exercise.reps} {exercise.category === 'Cardio' ? 'minutos' : 'repeticiones'}</span><button className="primary-button small-primary" disabled={selectedWorkout.exercises.some((item) => item.id === exercise.id)} onClick={() => addExercise(exercise)}><Plus size={15} /> {selectedWorkout.exercises.some((item) => item.id === exercise.id) ? 'Añadido' : 'Añadir al día'}</button></div></details>)}{filteredExercises.length === 0 && <p className="empty-search">No encontramos ejercicios con esa búsqueda.</p>}</div><p className="modal-footnote">Instrucciones e ilustraciones adaptadas del glosario visual que compartiste. Ajusta el esfuerzo a tu nivel.</p></Modal>}

    {dialog === 'food' && <Modal title={`Añadir ${mealType.toLowerCase()}`} eyebrow="DIARIO DE ALIMENTACIÓN" className="food-modal" onClose={() => setDialog(null)}><form onSubmit={addMeal}><label className="form-field"><span>Nombre de la comida (opcional)</span><input className="text-input" value={mealName} onChange={(event) => setMealName(event.target.value)} placeholder="Ej.: tostada con tomate" /></label><label className="form-field"><span>Tipo</span><span className="select-wrap"><select value={mealType} onChange={(event) => setMealType(event.target.value as MealType)}>{mealTypes.map((type) => <option key={type}>{type}</option>)}</select><ChevronDown size={16} /></span></label><FoodDraftEditor rows={foodDraft} onChange={setFoodDraft} onEstimateFood={estimateFoodWithAI} /><div className="nutrition-preview"><strong>Estimación de esta comida</strong><span>{Math.round(mealDraftMacros.calories)} kcal</span><small>{Math.round(mealDraftMacros.protein)} g proteína · {Math.round(mealDraftMacros.carbs)} g hidratos · {Math.round(mealDraftMacros.fat)} g grasas</small></div><button className="primary-button find-recipe-button" type="submit"><Check size={17} /> Guardar en mi diario</button><button className="inline-link-button" type="button" onClick={() => { setRecipeName(mealName); setMealType(mealType); setRecipeDraft(foodDraft.map((row) => ({ ...row, id: crypto.randomUUID() }))); setRecipePhoto(null); setRecipeError(''); setDialog('custom-recipe') }}>Guardar estos ingredientes como receta</button><p className="modal-footnote">Valores aproximados por 100 g. Puedes introducir otro alimento y sus datos nutricionales manualmente.</p></form></Modal>}

    {dialog === 'random' && <Modal title="Crear comida" eyebrow="RECETA ALEATORIA" className="recipe-modal" onClose={() => setDialog(null)}><p className="modal-subtitle">Una idea de nuestro catálogo, filtrada por tus preferencias.</p><div className="creator-filter-grid"><label className="form-field"><span>Tipo de plato</span><span className="select-wrap"><select value={recipeTypeFilter} onChange={(event) => setRecipeTypeFilter(event.target.value as typeof recipeTypeFilter)}><option>Cualquiera</option>{mealTypes.map((type) => <option key={type}>{type}</option>)}</select><ChevronDown size={16} /></span></label><label className="form-field"><span>Máximo de calorías</span><span className="number-wrap"><input type="number" min="100" max="2000" value={recipeCalorieLimit} onChange={(event) => setRecipeCalorieLimit(event.target.value)} /><small>kcal/ración</small></span></label></div><label className="protein-toggle"><span className="toggle-copy"><span><Target size={17} /> Priorizar proteínas</span><small>Ordena por proteína respecto a las calorías.</small></span><input type="checkbox" checked={proteinPriority} onChange={(event) => setProteinPriority(event.target.checked)} /><span className="toggle-ui" /></label><button className="primary-button find-recipe-button" onClick={() => findRecipes('random')}>Sorpréndeme con una receta <ArrowRight size={17} /></button><RecipeResults recipes={recipeResults} message={recipeMessage} onOpen={setSelectedRecipe} onAdd={addRecipeMeal} showMatches={false} /></Modal>}

    {dialog === 'pantry' && <Modal title="Cocina con lo que tienes" eyebrow="RECETAS PERSONALIZADAS CON IA" className="recipe-modal" onClose={() => setDialog(null)}><label className="form-field"><span>¿Qué tienes en casa?</span><textarea rows={3} value={ingredientText} onChange={(event) => setIngredientText(event.target.value)} placeholder="Ej.: pollo, arroz, tomate, pimiento" /><small>Separa los ingredientes por comas. La IA intentará usar al menos dos e indicará qué te falta.</small></label><div className="creator-filter-grid"><label className="form-field"><span>Tipo de plato</span><span className="select-wrap"><select value={recipeTypeFilter} onChange={(event) => setRecipeTypeFilter(event.target.value as typeof recipeTypeFilter)}><option>Cualquiera</option>{mealTypes.map((type) => <option key={type}>{type}</option>)}</select><ChevronDown size={16} /></span></label><label className="form-field"><span>Máximo de calorías</span><span className="number-wrap"><input type="number" min="100" max="2000" value={recipeCalorieLimit} onChange={(event) => setRecipeCalorieLimit(event.target.value)} /><small>kcal/ración</small></span></label></div><label className="protein-toggle"><span className="toggle-copy"><span><Target size={17} /> Priorizar proteínas</span><small>Ordena las recetas generadas por su proteína.</small></span><input type="checkbox" checked={proteinPriority} onChange={(event) => setProteinPriority(event.target.checked)} /><span className="toggle-ui" /></label><button className="primary-button find-recipe-button" disabled={aiRecipeBusy} onClick={() => void findRecipes('pantry')}>{aiRecipeBusy ? 'Generando recetas…' : 'Crear recetas con mis ingredientes'} <ArrowRight size={17} /></button><RecipeResults recipes={recipeResults} message={recipeMessage} onOpen={setSelectedRecipe} onAdd={addRecipeMeal} showMatches busy={aiRecipeBusy} /><p className="modal-footnote">La IA puede equivocarse: revisa alérgenos, preparación y cantidades. Los valores nutricionales y las fotos son orientativos.</p></Modal>}

    {dialog === 'custom-recipe' && <Modal title="Guardar receta" eyebrow="TU LIBRO DE COCINA" className="food-modal" onClose={() => setDialog(null)}><form onSubmit={saveCustomRecipe}><label className="form-field"><span>Nombre de la receta</span><input className="text-input" value={recipeName} onChange={(event) => setRecipeName(event.target.value)} placeholder="Ej.: ensalada de garbanzos" required /></label><label className="form-field"><span>Tipo</span><span className="select-wrap"><select value={mealType} onChange={(event) => setMealType(event.target.value as MealType)}>{mealTypes.map((type) => <option key={type}>{type}</option>)}</select><ChevronDown size={16} /></span></label><label className="form-field"><span>Foto de la receta</span><input className="photo-input" type="file" accept="image/*" capture="environment" onChange={(event) => { const file = event.target.files?.[0] ?? null; if (file && file.size > 10 * 1024 * 1024) { setRecipeError('La foto debe pesar menos de 10 MB.'); setRecipePhoto(null) } else { setRecipeError(''); setRecipePhoto(file) } }} /><small>En móvil puedes hacer una foto con la cámara. La foto se guarda de forma privada (máximo 10 MB).</small></label>{recipePhotoPreview && <img className="recipe-photo-preview" src={recipePhotoPreview} alt="Vista previa de la foto de tu receta" />}<FoodDraftEditor rows={recipeDraft} onChange={setRecipeDraft} onEstimateFood={estimateFoodWithAI} /><label className="form-field"><span>Raciones que salen</span><span className="number-wrap"><input type="number" min="1" max="30" value={recipeServings} onChange={(event) => setRecipeServings(event.target.value)} /><small>raciones</small></span></label><div className="nutrition-preview"><strong>Por ración · estimación</strong><span>{Math.round(customRecipeMacros.calories / Math.max(1, Number(recipeServings) || 1))} kcal</span><small>{Math.round(customRecipeMacros.protein / Math.max(1, Number(recipeServings) || 1))} g proteína · {Math.round(customRecipeMacros.carbs / Math.max(1, Number(recipeServings) || 1))} g hidratos · {Math.round(customRecipeMacros.fat / Math.max(1, Number(recipeServings) || 1))} g grasas</small></div>{recipeError && <p className="creator-message" role="alert">{recipeError}</p>}<button className="primary-button find-recipe-button" type="submit" disabled={recipeBusy}><Check size={17} /> {recipeBusy ? 'Guardando receta…' : 'Guardar receta'}</button></form></Modal>}

    {dialog === 'routines' && <Modal title="Reutilizar rutina" eyebrow="TUS RUTINAS GUARDADAS" className="routine-modal" onClose={() => setDialog(null)}>{data.routines.length ? <div className="saved-routine-list">{data.routines.map((routine) => <article className="saved-routine" key={routine.id}><div><strong>{routine.name}</strong><span>{routine.focus} · {routine.exercises.length} ejercicios</span></div><button className="primary-button small-primary" onClick={() => applyRoutine(routine)}>Usar este día <ArrowRight size={14} /></button></article>)}</div> : <p className="empty-search">Todavía no tienes rutinas guardadas. Añade ejercicios y elige “Guardar rutina”.</p>}</Modal>}

    {dialog === 'save-routine' && <Modal title="Guardar rutina" eyebrow="TU PLAN DE ENTRENAMIENTO" className="routine-modal" onClose={() => setDialog(null)}><form onSubmit={saveRoutine}><label className="form-field"><span>Nombre de la rutina</span><input className="text-input" value={routineName} onChange={(event) => setRoutineName(event.target.value)} placeholder="Ej.: Tren superior A" required /></label><p className="modal-footnote">Se guardarán los {selectedWorkout.exercises.length} ejercicios y sus series y repeticiones para reutilizarlos cualquier día.</p><button className="primary-button find-recipe-button" type="submit">Guardar rutina</button></form></Modal>}

    {dialog === 'measurement' && <Modal title="Registrar seguimiento" eyebrow="NUEVA MEDICIÓN" className="routine-modal" onClose={() => setDialog(null)}><form onSubmit={saveMeasurement}><label className="form-field"><span>Peso corporal</span><span className="number-wrap"><input type="number" min="35" max="350" step="0.1" value={measurementDraft.weightKg} onChange={(event) => setMeasurementDraft({ ...measurementDraft, weightKg: event.target.value })} required /><small>kg</small></span></label><p className="form-section-label">Medidas opcionales</p><div className="measurement-grid">{(['waist', 'chest', 'hips', 'arm', 'thigh'] as const).map((key) => <label className="form-field" key={key}><span>{measureLabel(key)}</span><span className="number-wrap"><input type="number" min="1" step="0.1" value={measurementDraft[key]} onChange={(event) => setMeasurementDraft({ ...measurementDraft, [key]: event.target.value })} /><small>cm</small></span></label>)}</div>{measurementError && <p className="creator-message" role="alert">{measurementError}</p>}<button className="primary-button find-recipe-button" type="submit">Guardar mediciones</button></form></Modal>}

    {dialog === 'setup' && <Modal title={data.profile ? 'Editar tus datos' : 'Completar perfil'} eyebrow="OBJETIVO PERSONAL" className="profile-modal" onClose={() => setDialog(null)}><ProfileForm draft={profileDraft} setDraft={setProfileDraft} onSubmit={saveProfile} error={dataError} submitLabel="Guardar y calcular objetivo" /></Modal>}

    {selectedRecipe && <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} onAdd={addRecipeMeal} />}
  </main>
}

const progressMetricOptions: Array<{ key: ProgressMetric; label: string; unit: string }> = [
  { key: 'weightKg', label: 'Peso', unit: 'kg' }, { key: 'waist', label: 'Cintura', unit: 'cm' }, { key: 'chest', label: 'Pecho', unit: 'cm' },
  { key: 'hips', label: 'Cadera', unit: 'cm' }, { key: 'arm', label: 'Brazo', unit: 'cm' }, { key: 'thigh', label: 'Muslo', unit: 'cm' }
]

function ProgressOverview({ records, completedWorkoutDates }: { records: ProgressRecord[]; completedWorkoutDates: string[] }) {
  const [metric, setMetric] = useState<ProgressMetric>('weightKg')
  const [visibleMonth, setVisibleMonth] = useState(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1) })
  const metricInfo = progressMetricOptions.find((item) => item.key === metric) ?? progressMetricOptions[0]
  const chartRecords = records.filter((record) => Number.isFinite(record[metric])).sort((a, b) => a.date.localeCompare(b.date))
  const chartValues = chartRecords.map((record) => Number(record[metric]))
  const rawMin = chartValues.length ? Math.min(...chartValues) : 0
  const rawMax = chartValues.length ? Math.max(...chartValues) : 0
  const padding = rawMax === rawMin ? Math.max(Math.abs(rawMax) * 0.05, 0.5) : (rawMax - rawMin) * 0.14
  const min = rawMin - padding, max = rawMax + padding
  const chart = { left: 76, right: 744, top: 18, bottom: 196 }
  const points = chartRecords.map((record, index) => {
    const value = Number(record[metric])
    const x = chartRecords.length === 1 ? (chart.left + chart.right) / 2 : chart.left + index / (chartRecords.length - 1) * (chart.right - chart.left)
    const y = chart.bottom - (value - min) / (max - min || 1) * (chart.bottom - chart.top)
    return { x, y, value, date: record.date }
  })
  const monthLabel = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(visibleMonth)
  const year = visibleMonth.getFullYear(), monthIndex = visibleMonth.getMonth()
  const monthPrefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const leadingDays = (new Date(year, monthIndex, 1).getDay() + 6) % 7
  const completedInMonth = completedWorkoutDates.filter((date) => date.startsWith(`${monthPrefix}-`)).length
  const completedSet = new Set(completedWorkoutDates)
  const change = chartValues.length > 1 ? chartValues[chartValues.length - 1] - chartValues[0] : 0
  const changeText = `${change > 0 ? '+' : ''}${change.toLocaleString('es-ES', { maximumFractionDigits: 1 })} ${metricInfo.unit}`

  return <section className="progress-overview" aria-labelledby="progress-overview-title">
    <div className="section-heading"><div><p className="eyebrow">TU HISTORIA</p><h2 id="progress-overview-title">Ver mi progreso</h2></div></div>
    <div className="progress-overview-grid">
      <section className="progress-visual-card progress-chart-card"><div className="progress-visual-heading"><div><span className="mini-label">EVOLUCIÓN PERSONAL</span><h3>{metricInfo.label}</h3></div><label className="progress-metric-select"><span className="sr-only">Métrica del gráfico</span><select value={metric} onChange={(event) => setMetric(event.target.value as ProgressMetric)}>{progressMetricOptions.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label></div>
        {points.length ? <><div className="progress-chart-scroll"><svg className="progress-line-chart" viewBox="0 0 760 250" role="img" aria-label={`Gráfico de evolución de ${metricInfo.label.toLowerCase()} en ${metricInfo.unit}`}>
          {[0, 1, 2, 3, 4].map((step) => { const y = chart.top + step / 4 * (chart.bottom - chart.top); const tickValue = max - step / 4 * (max - min); return <g key={step}><line x1={chart.left} x2={chart.right} y1={y} y2={y} className="chart-grid-line" /><text x="8" y={y + 4} className="chart-axis-label">{tickValue.toLocaleString('es-ES', { maximumFractionDigits: 1 })}</text></g> })}
          {points.length > 1 && <polyline points={points.map((point) => `${point.x},${point.y}`).join(' ')} className="chart-series-line" />}
          {points.map((point) => <g key={`${point.date}-${point.value}`}><circle cx={point.x} cy={point.y} r="5" className="chart-series-point"><title>{displayDate(point.date, { day: 'numeric', month: 'long', year: 'numeric' })}: {point.value} {metricInfo.unit}</title></circle></g>)}
          {[0, Math.floor((points.length - 1) / 2), points.length - 1].filter((value, index, all) => all.indexOf(value) === index).map((index) => <text key={points[index].date} x={points[index].x} y="230" textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'} className="chart-date-label">{displayDate(points[index].date, { day: 'numeric', month: 'short' })}</text>)}
        </svg></div><p className="chart-summary">{chartRecords.length} registro{chartRecords.length === 1 ? '' : 's'} · {chartRecords.length > 1 ? `Cambio desde el primero: ${changeText}` : 'Añade otro registro para ver el cambio en el tiempo.'}</p></> : <div className="progress-chart-empty"><TrendingUp size={23} /><span>Aún no hay registros de {metricInfo.label.toLowerCase()}.</span><small>Registra una medida para empezar a ver la evolución.</small></div>}
      </section>
      <section className="progress-visual-card training-calendar-card"><div className="progress-visual-heading calendar-heading"><div><span className="mini-label">ACTIVIDAD MENSUAL</span><h3>Días entrenados</h3></div><div className="calendar-month-controls"><button className="icon-button" aria-label="Mes anterior" onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}><ArrowLeft size={15} /></button><span>{monthLabel}</span><button className="icon-button" aria-label="Mes siguiente" onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}><ArrowRight size={15} /></button></div></div><div className="training-calendar-grid" aria-label={`Calendario de ${monthLabel}`}><div className="calendar-weekdays">{['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div><div className="calendar-month-days">{Array.from({ length: leadingDays }, (_, index) => <span className="calendar-day-empty" key={`blank-${index}`} />)}{Array.from({ length: daysInMonth }, (_, index) => { const date = `${monthPrefix}-${String(index + 1).padStart(2, '0')}`; const done = completedSet.has(date); const today = date === todayKey(); return <span key={date} className={`calendar-month-day ${done ? 'trained' : ''} ${today ? 'today' : ''}`} aria-label={`${index + 1}: ${done ? 'entreno completado' : 'sin entreno registrado'}`} title={`${index + 1}: ${done ? 'entreno completado' : 'sin entreno registrado'}`}><span>{index + 1}</span>{done && <i />}</span> })}</div></div><div className="calendar-legend"><span><i className="legend-completed" /> Entreno completado</span><span><i className="legend-today" /> Hoy</span></div><div className="calendar-month-summary"><strong>{completedInMonth}</strong><span>entrenamiento{completedInMonth === 1 ? '' : 's'} completado{completedInMonth === 1 ? '' : 's'} este mes</span></div><p className="calendar-help-text">Marca un día como entrenado desde tu calendario semanal después de completar la sesión.</p></section>
    </div>
  </section>
}

function ExerciseImage({ index, name }: { index: number; name: string }) {
  const col = index % 5, row = Math.floor(index / 5)
  return <div className="exercise-art exercise-photo" role="img" aria-label={`Ilustración de ${name}`} style={{ backgroundImage: `url("${import.meta.env.BASE_URL}exercises/exercise-sprite-v2.webp")`, backgroundPosition: `${col / 4 * 100}% ${row / 14 * 100}%` }} />
}

function RecipeResults({ recipes, message, onOpen, onAdd, showMatches, busy = false }: { recipes: Recipe[]; message: string; onOpen: (recipe: Recipe) => void; onAdd: (recipe: Recipe) => void; showMatches: boolean; busy?: boolean }) {
  return <>{message && <p className={recipes.length ? 'creator-message success-message' : 'creator-message'} role="status">{message}</p>}{busy && <p className="ai-recipe-loading" role="status"><Sparkles size={16} /> Preparando propuestas personalizadas…</p>}{recipes.length > 0 && <div className="recipe-results"><div className="results-heading"><strong>{showMatches ? 'Recetas sugeridas por IA' : 'Tu receta sorpresa'}</strong><span>{recipes.length} resultado{recipes.length === 1 ? '' : 's'}</span></div>{recipes.map((recipe) => { const macros = recipeMacros(recipe); return <article className="recipe-result-card" key={recipe.id}><button className="recipe-result-image" onClick={() => onOpen(recipe)} aria-label={`Ver receta ${recipe.name}`}><img src={recipe.image} alt={recipe.imageIsIllustrative ? `Fotografía orientativa de ${recipe.name}` : `Fotografía de ${recipe.name}`} /><span>{recipe.time} min</span>{recipe.imageIsIllustrative && <small>Foto orientativa</small>}</button><div className="recipe-result-info"><div className="recipe-type-label">{recipe.type} · {macros.calories} kcal{recipe.isAiGenerated && ' · IA'}</div><h3>{recipe.name}</h3><p>{recipe.description}</p>{showMatches && <p className="match-copy"><Check size={13} /> {recipe.matchCount} ingredientes coinciden{recipe.missing?.length ? ` · faltan ${recipe.missing.slice(0, 3).join(', ')}` : ''}</p>}<div className="recipe-macros"><span><strong>{macros.protein} g</strong> proteína</span><span><strong>{macros.carbs} g</strong> hidratos</span><span><strong>{macros.fat} g</strong> grasas</span></div><div className="recipe-result-actions"><button className="secondary-button" onClick={() => onOpen(recipe)}>Ver receta</button><button className="primary-button small-primary" onClick={() => onAdd(recipe)}><Plus size={15} /> Añadir a mi día</button></div></div></article>})}</div>}</>
}

function recipeMacros(recipe: Recipe) { const items = recipe.ingredients.map(recipeIngredientSnapshot).filter((item): item is FoodSnapshot => item !== null); const totals = totalsFor(items); return { calories: Math.round(totals.calories), protein: Math.round(totals.protein), carbs: Math.round(totals.carbs), fat: Math.round(totals.fat) } }

function RecipeDetail({ recipe, onClose, onAdd }: { recipe: Recipe | SavedRecipe; onClose: () => void; onAdd: (recipe: Recipe | SavedRecipe) => void }) {
  const isStatic = 'ingredients' in recipe
  const macros = isStatic ? recipeMacros(recipe) : recipe
  const image = isStatic ? recipe.image : recipe.photoUrl
  const ingredientLabels = isStatic ? recipe.ingredients.map((ingredient) => `${ingredient.grams} g de ${(ingredient.name ?? foodCatalog.find((food) => food.id === ingredient.foodId)?.name ?? 'alimento').toLowerCase()}`) : recipe.items.map((item) => `${item.grams} g de ${item.name}`)
  return <div className="modal-backdrop recipe-detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal-panel recipe-detail-modal" role="dialog" aria-modal="true" aria-label={`Receta ${recipe.name}`}><button className="detail-close icon-button" onClick={onClose} aria-label="Cerrar receta"><X size={20} /></button>{image ? <img className="recipe-detail-photo" src={image} alt={isStatic && recipe.imageIsIllustrative ? `Fotografía orientativa de ${recipe.name}` : `Fotografía de ${recipe.name}`} /> : <div className="recipe-detail-photo recipe-detail-placeholder"><ChefHat size={40} /></div>}<div className="recipe-detail-body"><span className="mini-label">{recipe.type.toUpperCase()} · {isStatic ? `${recipe.time} MIN${recipe.isAiGenerated ? ' · IA' : ''}` : 'RECETA GUARDADA'}{isStatic && recipe.imageIsIllustrative ? ' · FOTO ORIENTATIVA' : ''}</span><h2>{recipe.name}</h2><div className="detail-macro-grid"><span><strong>{Math.round(macros.calories)}</strong><small>kcal/ración aprox.</small></span><span><strong>{Math.round(macros.protein)} g</strong><small>proteína</small></span><span><strong>{Math.round(macros.carbs)} g</strong><small>hidratos</small></span><span><strong>{Math.round(macros.fat)} g</strong><small>grasas</small></span></div><h3>Ingredientes</h3>{!isStatic && <p className="servings-note">Cantidades para {recipe.servings} ración{recipe.servings === 1 ? '' : 'es'}.</p>}<ul className="ingredient-list">{ingredientLabels.map((item) => <li key={item}><Check size={15} /> {item}</li>)}</ul>{isStatic && <><h3>Preparación</h3><ol className="recipe-steps">{recipe.steps.map((step) => <li key={step}>{step}</li>)}</ol></>}<p className="modal-footnote">{isStatic && recipe.isAiGenerated ? 'La receta y sus valores nutricionales son propuestas orientativas generadas con IA. Revisa ingredientes, cantidades y cocción antes de prepararla.' : 'Valores nutricionales estimados según los ingredientes y cantidades registradas.'}</p><button className="primary-button detail-add-button" onClick={() => onAdd(recipe)}><Plus size={17} /> Añadir una ración a mi día</button></div></section></div>
}

function ProfileForm({ draft, setDraft, onSubmit, error, submitLabel }: { draft: ProfileDraft; setDraft: (draft: ProfileDraft) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; error: string; submitLabel: string }) {
  const estimated = draft.sex === 'manual' ? asNumber(draft.manualCalories) : estimateCalories(draft)
  return <form className="profile-input-form" onSubmit={onSubmit}><div className="profile-input-grid"><label className="form-field"><span>Edad</span><span className="number-wrap"><input type="number" min="18" max="100" value={draft.age} onChange={(event) => setDraft({ ...draft, age: event.target.value })} required /><small>años</small></span></label><label className="form-field"><span>Sexo biológico para la ecuación</span><span className="select-wrap"><select value={draft.sex} onChange={(event) => setDraft({ ...draft, sex: event.target.value as UserProfile['sex'] })}><option value="mujer">Mujer</option><option value="hombre">Hombre</option><option value="manual">Prefiero introducir las kcal</option></select><ChevronDown size={16} /></span></label><label className="form-field"><span>Altura</span><span className="number-wrap"><input type="number" min="120" max="230" step="0.1" value={draft.heightCm} onChange={(event) => setDraft({ ...draft, heightCm: event.target.value })} required /><small>cm</small></span></label><label className="form-field"><span>Peso actual</span><span className="number-wrap"><input type="number" min="35" max="350" step="0.1" value={draft.weightKg} onChange={(event) => setDraft({ ...draft, weightKg: event.target.value })} required /><small>kg</small></span></label><label className="form-field"><span>Actividad diaria</span><span className="select-wrap"><select value={draft.activity} onChange={(event) => setDraft({ ...draft, activity: event.target.value as ActivityLevel })}>{Object.entries(activityLabels).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select><ChevronDown size={16} /></span></label><label className="form-field"><span>Objetivo</span><span className="select-wrap"><select value={draft.goal} onChange={(event) => setDraft({ ...draft, goal: event.target.value as Goal })}>{Object.entries(goalLabels).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select><ChevronDown size={16} /></span></label>{draft.sex === 'manual' && <label className="form-field"><span>Objetivo calórico diario</span><span className="number-wrap"><input type="number" min="1000" max="6000" value={draft.manualCalories} onChange={(event) => setDraft({ ...draft, manualCalories: event.target.value })} required /><small>kcal</small></span></label>}<label className="form-field"><span>Recordatorio de progreso</span><span className="select-wrap"><select value={draft.reminderFrequency} onChange={(event) => setDraft({ ...draft, reminderFrequency: event.target.value as ReminderFrequency })}><option value="semanal">Cada semana</option><option value="quincenal">Cada dos semanas</option><option value="mensual">Cada mes</option></select><ChevronDown size={16} /></span></label></div>{estimated > 0 && <div className="calorie-estimate-box"><Target size={18} /><span>Objetivo estimado</span><strong>{estimated.toLocaleString('es-ES')} kcal/día</strong><small>{draft.sex === 'manual' ? 'Valor introducido por ti' : `Estimación según actividad y objetivo de ${goalLabels[draft.goal].toLowerCase()}`}</small></div>}<p className="health-note">El cálculo usa una ecuación orientativa para personas adultas. No sustituye la valoración de un profesional. Si no quieres indicar el sexo para la ecuación, introduce tu objetivo calórico manualmente.</p>{error && <p className="creator-message" role="alert">{error}</p>}<button className="primary-button find-recipe-button" type="submit">{submitLabel} <ArrowRight size={17} /></button></form>
}

function bmiCategory(bmi: number) { if (bmi < 18.5) return 'Por debajo del rango de referencia'; if (bmi < 25) return 'En el rango de referencia'; if (bmi < 30) return 'Por encima del rango de referencia'; return 'Rango alto · consulta con un profesional' }
function measureLabel(key: 'waist' | 'chest' | 'hips' | 'arm' | 'thigh') { return ({ waist: 'Cintura', chest: 'Pecho', hips: 'Cadera', arm: 'Brazo', thigh: 'Muslo' })[key] }

export default App
