import { useMemo, useState } from 'react'
import { Activity, ArrowLeft, ArrowRight, Check, ChevronDown, Dumbbell, Leaf, ListChecks, Sparkles, Target, Trophy, Utensils, Waves, Zap } from 'lucide-react'

export type OnboardingAnswers = {
  goals: string[]
  obstacles: string[]
  approach: string
  firstHabit: string
  age: number
  heightCm: number
  weightKg: number
  sex: 'hombre' | 'mujer' | 'otro'
  activity: 'sedentario' | 'ligero' | 'moderado' | 'alto'
  trainingPlace: string
  trainingDays: number
  sessionMinutes: number
  foodPreferences: string[]
  mealsPerDay: number
  cooksAtHome: string
  needsTupper: boolean
  budget: string
}

type Props = { onComplete: (answers: OnboardingAnswers) => void; saving?: boolean; error?: string }

const initial: OnboardingAnswers = {
  goals: ['Sentirme mejor en mi día a día'], obstacles: ['Encontrar la motivación'], approach: 'Poco a poco, sin presión',
  firstHabit: 'Beber más agua', age: 27, heightCm: 170, weightKg: 70, sex: 'mujer', activity: 'ligero',
  trainingPlace: 'En casa', trainingDays: 3, sessionMinutes: 30, foodPreferences: ['Sin preferencias'],
  mealsPerDay: 3, cooksAtHome: 'A veces', needsTupper: true, budget: 'Moderado'
}
const steps = [
  { title: 'Tus objetivos', sub: '¿Qué te gustaría conseguir?', formi: '¡Vamos a por ello! Puedes elegir varias metas y marcar la más importante.', icon: Target },
  { title: 'Tus dificultades', sub: 'Todos tenemos cosas que nos cuestan más.', formi: 'No pasa nada. Saber qué se te hace cuesta arriba me ayuda a acompañarte mejor.', icon: Sparkles },
  { title: 'Tu forma de avanzar', sub: 'Elige el enfoque que más encaja contigo.', formi: 'No hay una única manera de conseguirlo. Elegimos un ritmo que puedas mantener.', icon: Leaf },
  { title: 'Tu primer hábito', sub: 'Una pequeña victoria para empezar con buen pie.', formi: '¡Genial! Empezaremos con un hábito pequeño y realista.', icon: Trophy },
  { title: 'Tus datos básicos', sub: 'Con estos datos calculo un punto de partida orientativo.', formi: 'Ahora personalizamos tu plan. Puedes cambiar estos datos más adelante.', icon: Activity },
  { title: 'Tu actividad actual', sub: 'Así ajustamos la intensidad de los planes.', formi: 'Perfecto, adaptaremos las propuestas a tu punto de partida actual.', icon: Zap },
  { title: 'Dónde entrenar', sub: 'Elige el lugar que te resulte más cómodo.', formi: 'Lo importante es que te encaje en tu vida, no tener el gimnasio perfecto.', icon: Dumbbell },
  { title: 'Tu disponibilidad', sub: 'Días y duración para crear un plan realista.', formi: 'Con esto podré proponerte sesiones que sí caben en tu semana.', icon: Activity },
  { title: 'Tu alimentación', sub: 'Cuéntame tus preferencias para adaptar las ideas de comida.', formi: 'Tendré en cuenta tus preferencias. No te propondré una alimentación que no encaje contigo.', icon: Utensils },
  { title: 'Tu rutina diaria', sub: 'Organización de comidas, cocina y presupuesto.', formi: 'Un plan útil tiene que funcionar también en los días ocupados.', icon: ListChecks },
  { title: 'Repasamos tu plan', sub: 'Así queda tu punto de partida.', formi: '¡Ya casi está! Revisa el resumen y empezamos cuando quieras.', icon: Check }
]
const goals = ['Sentirme mejor en mi día a día', 'Crear una rutina de entrenamiento', 'Ganar fuerza y músculo', 'Mejorar mi resistencia', 'Perder grasa', 'Comer de forma equilibrada']
const obstacles = ['Encontrar la motivación', 'Organizar mi semana', 'Saber qué entrenar', 'Comer de forma equilibrada', 'Sacar tiempo para mí', 'Mantener la constancia']
const habits = ['Entrenar 2–3 días por semana', 'Preparar mejor mis comidas', 'Beber más agua', 'Caminar más cada día', 'Dormir mejor', 'Hacer pausas y moverme más']
const foodOptions = ['Sin preferencias', 'Vegetariana', 'Vegana', 'Sin gluten', 'Sin lactosa', 'Alta en proteína', 'Mediterránea', 'Otra']
const multiToggle = (list: string[], item: string, set: (next: string[]) => void) => set(list.includes(item) ? list.filter(x => x !== item) : [...list.filter(x => item === 'Sin preferencias' || x !== 'Sin preferencias'), item])

function Option({ label, selected, onClick, icon }: { label: string; selected: boolean; onClick: () => void; icon?: string }) {
  return <button type="button" className={`first-run-option ${selected ? 'selected' : ''}`} onClick={onClick}>{icon && <span className="first-run-option-icon">{icon}</span>}<span>{label}</span><span className="first-run-check">{selected ? <Check size={15} /> : null}</span></button>
}

function Formi({ step }: { step: number }) {
  const messages = ['¡Hola! Soy Formi. Vamos a preparar tu espacio para que encaje contigo.', '¡Vamos a por ello! Cuéntame qué quieres conseguir.', 'Todos tenemos cosas que nos cuestan más. Aquí no hay respuestas incorrectas.', '¡Me encanta! Iremos paso a paso.', '¡Genial! Empezamos con una pequeña victoria.', 'Ahora vamos a personalizar tu plan con algunos datos básicos.', 'Cada persona parte de un lugar distinto. Lo tendremos en cuenta.', '¿Dónde te sientes más a gusto entrenando?', 'Buscaremos una rutina que quepa en tu semana.', 'Vamos a cuidar también la parte de la alimentación.', 'Con esto ya puedo preparar un plan inicial para ti.']
  return <div className={`first-run-mascot pose-${step % 6}`} aria-label="Formi, tu compañero de Forma"><div className="first-run-spark spark-a">✦</div><div className="first-run-spark spark-b">✧</div><div className="first-run-formi"><span className="formi-leaf" /><span className="formi-cap">F</span><span className="formi-face"><i /><i /><b /></span><span className="formi-arm arm-left" /><span className="formi-arm arm-right" /><span className="formi-foot foot-left" /><span className="formi-foot foot-right" /></div><div className="first-run-speech">{messages[step] ?? messages[10]}</div></div>
}

export function FirstRunOnboarding({ onComplete, saving = false, error = '' }: Props) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(initial)
  const update = <K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) => setAnswers(previous => ({ ...previous, [key]: value }))
  const isSummary = step === 10
  const stepInfo = steps[step]
  const estimatedCalories = useMemo(() => {
    const base = 10 * answers.weightKg + 6.25 * answers.heightCm - 5 * answers.age
    const sexAdjustment = answers.sex === 'hombre' ? 5 : answers.sex === 'mujer' ? -161 : -78
    const factor = ({ sedentario: 1.2, ligero: 1.375, moderado: 1.55, alto: 1.725 } as const)[answers.activity]
    const goalAdjustment = answers.goals.includes('Perder grasa') ? -300 : answers.goals.includes('Ganar fuerza y músculo') ? 200 : 0
    return Math.max(1200, Math.round((base + sexAdjustment) * factor / 50) * 50 + goalAdjustment)
  }, [answers])
  const next = () => {
    if (step < 10) setStep(step + 1)
    else onComplete(answers)
  }
  return <main className="first-run-screen"><section className="first-run-card">
    <header className="first-run-header"><div className="first-run-brand"><span className="first-run-brand-mark"><Activity size={22} /></span><strong>forma</strong></div><div className="first-run-progress"><span style={{ width: `${((step + 1) / 11) * 100}%` }} /></div><span className="first-run-step-count">{step + 1}/11</span></header>
    <div className="first-run-layout"><aside className="first-run-aside"><Formi step={step} /><p className="first-run-formi-caption">{stepInfo.formi}</p><div className="first-run-privacy"><span>✓</span> Tus respuestas se guardan en tu perfil privado.</div></aside>
    <section className="first-run-content"><p className="first-run-eyebrow">TU PUNTO DE PARTIDA · PASO {step + 1}</p><h1>{isSummary ? '¡Todo listo!' : stepInfo.title}</h1><p className="first-run-subtitle">{isSummary ? 'Este será tu punto de partida. Podrás ajustar tus datos cuando quieras.' : stepInfo.sub}</p>
      {step === 0 && <><p className="first-run-hint">Puedes elegir varias opciones y marcar tu objetivo principal.</p><div className="first-run-options">{goals.map((x,i)=><Option key={x} label={x} icon={['⭐','🏋️','💪','🏃','🌱','🍎'][i]} selected={answers.goals.includes(x)} onClick={()=>multiToggle(answers.goals,x,v=>update('goals',v))}/>)}</div></>}
      {step === 1 && <div className="first-run-options">{obstacles.map((x,i)=><Option key={x} label={x} icon={['🧠','🗓️','🎯','🍎','◷','🌿'][i]} selected={answers.obstacles.includes(x)} onClick={()=>multiToggle(answers.obstacles,x,v=>update('obstacles',v))}/>)}</div>}
      {step === 2 && <div className="first-run-options">{['Poco a poco, sin presión','Con un plan claro y organizado','Con pequeños retos diarios','Con objetivos semanales','Con recompensas para Formi'].map((x,i)=><Option key={x} label={x} icon={['🌿','☷','⚡','🗓️','🏆'][i]} selected={answers.approach===x} onClick={()=>update('approach',x)}/>)}</div>}
      {step === 3 && <div className="first-run-options">{habits.map((x,i)=><Option key={x} label={x} icon={['🏋️','🍎','💧','👟','🌙','🌱'][i]} selected={answers.firstHabit===x} onClick={()=>update('firstHabit',x)}/>)}</div>}
      {step === 4 && <div className="first-run-fields"><label>¿Cuál es tu edad?<input type="number" min="18" max="100" value={answers.age} onChange={e=>update('age',Number(e.target.value))} /></label><label>Altura (cm)<input type="number" min="120" max="230" value={answers.heightCm} onChange={e=>update('heightCm',Number(e.target.value))}/></label><label>Peso actual (kg)<input type="number" min="35" max="350" step=".1" value={answers.weightKg} onChange={e=>update('weightKg',Number(e.target.value))}/></label><fieldset><legend>Sexo para estimar calorías</legend><div className="first-run-segment">{(['hombre','mujer','otro'] as const).map(x=><button type="button" key={x} className={answers.sex===x?'selected':''} onClick={()=>update('sex',x)}>{x==='hombre'?'Hombre':x==='mujer'?'Mujer':'Otro / prefiero no decirlo'}</button>)}</div></fieldset></div>}
      {step === 5 && <div className="first-run-options">{[{v:'sedentario',t:'Sedentario',d:'Paso gran parte del día sentado/a',i:'🛋️'},{v:'ligero',t:'Ligero',d:'1–3 días de actividad a la semana',i:'🚶'},{v:'moderado',t:'Moderado',d:'3–5 días de actividad a la semana',i:'📊'},{v:'alto',t:'Alto',d:'Actividad intensa o trabajo físico',i:'⚡'}].map(o=><Option key={o.v} label={`${o.t} · ${o.d}`} icon={o.i} selected={answers.activity===o.v} onClick={()=>update('activity',o.v as OnboardingAnswers['activity'])}/>)}</div>}
      {step === 6 && <div className="first-run-options">{['En casa','En el gimnasio','Al aire libre','Combinado'].map((x,i)=><Option key={x} label={x} icon={['🏠','🏋️','🌳','🔀'][i]} selected={answers.trainingPlace===x} onClick={()=>update('trainingPlace',x)}/>)}</div>}
      {step === 7 && <div className="first-run-fields"><div className="first-run-counter"><span>¿Cuántos días puedes entrenar a la semana?</span><div><button type="button" onClick={()=>update('trainingDays',Math.max(1,answers.trainingDays-1))}>−</button><strong>{answers.trainingDays}</strong><button type="button" onClick={()=>update('trainingDays',Math.min(7,answers.trainingDays+1))}>+</button></div></div><label>Tiempo por sesión</label><div className="first-run-chips">{[20,30,45,60].map(n=><button type="button" key={n} className={answers.sessionMinutes===n?'selected':''} onClick={()=>update('sessionMinutes',n)}>{n} min</button>)}</div></div>}
      {step === 8 && <><p className="first-run-hint">Marca las preferencias que quieras tener en cuenta.</p><div className="first-run-food-grid">{foodOptions.map((x,i)=><Option key={x} label={x} icon={['🥗','🌿','🌱','🌾','🧴','🥩','🥣','•••'][i]} selected={answers.foodPreferences.includes(x)} onClick={()=>multiToggle(answers.foodPreferences,x,v=>update('foodPreferences',v))}/>)}</div></>}
      {step === 9 && <div className="first-run-fields"><label>¿Cuántas comidas haces al día?<span className="first-run-select"><select value={answers.mealsPerDay} onChange={e=>update('mealsPerDay',Number(e.target.value))}>{[2,3,4,5,6].map(n=><option key={n} value={n}>{n} comidas</option>)}</select><ChevronDown size={16}/></span></label><fieldset><legend>¿Cocinas en casa?</legend><div className="first-run-segment">{['Sí','A veces','No'].map(x=><button type="button" className={answers.cooksAtHome===x?'selected':''} key={x} onClick={()=>update('cooksAtHome',x)}>{x}</button>)}</div></fieldset><fieldset><legend>¿Necesitas preparar tuppers?</legend><div className="first-run-segment"><button type="button" className={answers.needsTupper?'selected':''} onClick={()=>update('needsTupper',true)}>Sí</button><button type="button" className={!answers.needsTupper?'selected':''} onClick={()=>update('needsTupper',false)}>No</button></div></fieldset><label>Presupuesto aproximado<span className="first-run-select"><select value={answers.budget} onChange={e=>update('budget',e.target.value)}>{['Ajustado','Moderado','Flexible'].map(x=><option key={x}>{x}</option>)}</select><ChevronDown size={16}/></span></label></div>}
      {isSummary && <div className="first-run-summary"><div className="first-run-summary-item"><span>⭐</span><div><b>Objetivo principal</b><small>{answers.goals[0] ?? 'Sentirme mejor en mi día a día'}</small></div></div><div className="first-run-summary-item"><span>💧</span><div><b>Hábito inicial</b><small>{answers.firstHabit}</small></div></div><div className="first-run-summary-item"><span>🏋️</span><div><b>Entrenamiento</b><small>{answers.trainingDays} días · {answers.sessionMinutes} min · {answers.trainingPlace}</small></div></div><div className="first-run-summary-item"><span>🥗</span><div><b>Alimentación</b><small>{answers.foodPreferences.join(', ')} · {answers.mealsPerDay} comidas</small></div></div><div className="first-run-calories"><span>Objetivo calórico inicial orientativo</span><strong>{estimatedCalories.toLocaleString('es-ES')} kcal/día</strong><small>Estimación inicial, no una prescripción médica.</small></div></div>}
      {error && <p className="first-run-error" role="alert">{error}</p>}
      <footer className="first-run-actions">{step>0 && <button type="button" className="first-run-back" disabled={saving} onClick={()=>setStep(step-1)}><ArrowLeft size={16}/> Atrás</button>}<button type="button" className="first-run-next" disabled={saving || (step===0 && answers.goals.length===0) || (step===1 && answers.obstacles.length===0) || (step===4 && (answers.age<18||answers.age>100||answers.heightCm<120||answers.heightCm>230||answers.weightKg<35||answers.weightKg>350))} onClick={next}>{saving ? 'Guardando tu perfil…' : isSummary ? 'Comenzar mi Forma' : 'Continuar'} <ArrowRight size={17}/></button></footer>
    </section></div>
  </section></main>
}
