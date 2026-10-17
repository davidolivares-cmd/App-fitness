
import { useEffect, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import {
  Activity,
  Apple,
  ChartNoAxesCombined,
  Dumbbell,
  LayoutDashboard,
  Scale,
  Settings,
  Sparkles,
  UserRound,
  LogOut,
  LockKeyhole,
  Mail
} from 'lucide-react'
import { supabase } from './lib/supabase'

const sections = [
  { id: 'inicio', label: 'Inicio', icon: LayoutDashboard },
  { id: 'entreno', label: 'Entreno', icon: Dumbbell },
  { id: 'comida', label: 'Comida', icon: Apple },
  { id: 'progreso', label: 'Progreso', icon: ChartNoAxesCombined },
  { id: 'perfil', label: 'Perfil', icon: UserRound }
]

function App() {
  const [active, setActive] = useState('inicio')
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [signingIn, setSigningIn] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return

      if (error) setError('No se ha podido comprobar la sesión.')
      setSession(data.session)
      setLoading(false)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (mounted) setSession(newSession)
      }
    )

    return () => {
      mounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSigningIn(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) throw error

      if (!data.session) {
        setError('No se ha podido iniciar la sesión.')
      }
    } catch {
      setError('No se ha podido iniciar sesión. Comprueba el correo y la contraseña.')
    } finally {
      setSigningIn(false)
    }
  }

  const handleLogout = async () => {
    setError('')
    setSigningOut(true)

    const { error } = await supabase.auth.signOut()

    if (error) {
      setError('No se ha podido cerrar la sesión. Inténtalo de nuevo.')
    }

    setSigningOut(false)
  }

  const titles: Record<string, string> = {
    inicio: 'Tu espacio personal',
    entreno: 'Entrenamiento',
    comida: 'Nutrición',
    progreso: 'Tu progreso',
    perfil: 'Tu perfil'
  }

  if (loading) {
    return (
      <main className="auth-screen">
        <section className="auth-card">
          <Activity size={32} />
          <h1>forma</h1>
          <p>Comprobando tu sesión...</p>
        </section>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="auth-screen">
        <section className="auth-card">
          <div className="auth-brand">
            <span className="brand-mark"><Activity size={25} /></span>
            <div>
              <strong>forma</strong>
              <small>FITNESS & WELLNESS</small>
            </div>
          </div>

          <p className="eyebrow">TU SALUD, A TU RITMO</p>
          <h1>Bienvenido</h1>
          <p className="auth-description">
            Inicia sesión para entrar en tu espacio personal.
          </p>

          <form className="auth-form" onSubmit={handleLogin}>
            <label htmlFor="email">Correo electrónico</label>
            <div className="auth-input-wrap">
              <Mail size={18} />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <label htmlFor="password">Contraseña</label>
            <div className="auth-input-wrap">
              <LockKeyhole size={18} />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error && <p className="auth-error" role="alert">{error}</p>}

            <button className="auth-submit" type="submit" disabled={signingIn}>
              {signingIn ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="auth-footer">
            Forma es un espacio privado. Las cuentas las gestiona el administrador.
          </p>
        </section>
      </main>
    )
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
            <strong>Tu espacio personal</strong>
            <p>Sesión privada con tu cuenta.</p>
          </div>
          <p className="version-label"><Settings size={14} /> Forma · Versión inicial</p>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <div className="mobile-brand">
            <Activity size={21} /> forma
          </div>
          <div className="account-area">
            <span className="local-status">
              <span className="status-dot" /> {session.user.email}
            </span>
            <button
              className="logout-button"
              onClick={handleLogout}
              disabled={signingOut}
              title="Cerrar sesión"
            >
              <LogOut size={17} />
              <span>{signingOut ? 'Saliendo...' : 'Salir'}</span>
            </button>
          </div>
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

          {error && <p className="auth-error" role="alert">{error}</p>}

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
                  <span className="coming-soon">
                    Preparado para una futura integración de IA
                  </span>
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
              {active === 'perfil' && (
                <button
                  className="logout-button"
                  onClick={handleLogout}
                  disabled={signingOut}
                >
                  <LogOut size={17} />
                  {signingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
                </button>
              )}
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
