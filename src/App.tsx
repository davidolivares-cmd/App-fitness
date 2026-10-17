
import { useState } from 'react'
import {
  Activity,
  Apple,
  ChartNoAxesCombined,
  Dumbbell,
  LayoutDashboard,
  Scale,
  Settings,
  Sparkles,
  UserRound
} from 'lucide-react'

const sections = [
  { id: 'inicio', label: 'Inicio', icon: LayoutDashboard },
  { id: 'entreno', label: 'Entreno', icon: Dumbbell },
  { id: 'comida', label: 'Comida', icon: Apple },
  { id: 'progreso', label: 'Progreso', icon: ChartNoAxesCombined },
  { id: 'perfil', label: 'Perfil', icon: UserRound }
]

function App() {
  const [active, setActive] = useState('inicio')

  const titles: Record<string, string> = {
    inicio: 'Tu espacio personal',
    entreno: 'Entrenamiento',
    comida: 'Nutrición',
    progreso: 'Tu progreso',
    perfil: 'Tu perfil'
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#inicio" onClick={() => setActive('inicio')}>
          <span className="brand-mark"><Activity size={23} /></span>
          <span>
            <strong>forma</strong>
            <small>FITNESS & WELLNESS</small>
          </span>
        </a>

        <p className="nav-heading">MENÚ PRINCIPAL</p>

        <nav className="side-nav">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${active === id ? 'active' : ''}`}
              onClick={() => setActive(id)}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="privacy-note">
            <span className="privacy-icon"><Scale size={19} /></span>
            <strong>Tus datos, tu espacio</strong>
            <p>Diseñada para guardar tu información en tu dispositivo.</p>
          </div>
          <p className="version-label"><Settings size={14} /> Forma · Versión inicial</p>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <div className="mobile-brand">
            <Activity size={21} /> forma
          </div>
          <span className="local-status">
            <span className="status-dot" /> Espacio personal
          </span>
        </header>

        <div className="page-content">
          <div className="welcome">
            <div>
              <p className="eyebrow">TU SALUD, A TU RITMO</p>
              <h1>{titles[active]}</h1>
              <p className="subtitle">
                Entrena, aliméntate y conoce tu evolución.
              </p>
            </div>
            <div className="welcome-icon"><Activity size={28} /></div>
          </div>

          {active === 'inicio' ? (
            <>
              <div className="section-heading">
                <h2>Resumen de hoy</h2>
                <span className="muted">Tus registros diarios</span>
              </div>

              <div className="stats-grid">
                <article className="stat-card">
                  <div className="card-icon green"><Apple size={20} /></div>
                  <p>Alimentación</p>
                  <h3>Por empezar</h3>
                  <span className="muted">Registra tu primera comida</span>
                </article>

                <article className="stat-card">
                  <div className="card-icon lilac"><Dumbbell size={20} /></div>
                  <p>Entrenamiento</p>
                  <h3>Tu próxima sesión</h3>
                  <span className="muted">Planifica tu rutina</span>
                </article>

                <article className="stat-card">
                  <div className="card-icon sand"><Scale size={20} /></div>
                  <p>Último peso</p>
                  <h3>Sin registros</h3>
                  <span className="muted">Añade tu primera medición</span>
                </article>

                <article className="stat-card">
                  <div className="card-icon blue">
                    <ChartNoAxesCombined size={20} />
                  </div>
                  <p>Progreso</p>
                  <h3>Tu historia empieza aquí</h3>
                  <span className="muted">Los gráficos aparecerán con tus datos</span>
                </article>
              </div>

              <section className="assistant-card">
                <div className="assistant-icon"><Sparkles size={22} /></div>
                <div>
                  <h2>Tu asistente personal</h2>
                  <p>
                    Estamos preparando un espacio para ayudarte a registrar
                    comidas y entender tu progreso.
                  </p>
                  <span className="coming-soon">Preparado para una futura integración local de IA</span>
                </div>
              </section>
            </>
          ) : (
            <section className="empty-panel">
              <div className="empty-icon">
                {active === 'entreno' ? <Dumbbell size={28} /> :
                  active === 'comida' ? <Apple size={28} /> :
                  active === 'progreso' ? <ChartNoAxesCombined size={28} /> :
                  <UserRound size={28} />}
              </div>
              <h2>{titles[active]}</h2>
              <p>
                Esta sección forma parte del proyecto. Sus funciones se
                incorporarán paso a paso y se probarán antes de darlas por terminadas.
              </p>
            </section>
          )}
        </div>
      </section>

      <nav className="mobile-nav">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={active === id ? 'mobile-item active' : 'mobile-item'}
            onClick={() => setActive(id)}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </main>
  )
}

export default App
