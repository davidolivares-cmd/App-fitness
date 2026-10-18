import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Check, Mail, Plus, Send, Share2, Trash2, UsersRound } from 'lucide-react'
import { supabase } from '../lib/supabase'

type Connection = { id: string; requester_id: string; recipient_id: string; status: 'pending' | 'accepted' | 'rejected'; created_at: string; other_email: string }
type SharedItem = { id: string; sender_id: string; recipient_id: string; kind: 'menu' | 'routine'; title: string; payload: Record<string, unknown>; created_at: string; saved_at: string | null }
export type ShareOption = { id: string; name: string; detail: string; kind: 'menu' | 'routine'; payload: Record<string, unknown> }

export type ShareableRoutine = { id: string; name: string; focus: string; exercises: unknown[] }
export type ShareablePlanEntry = { id: string; date: string; type: string; recipeId?: string; recipeSnapshot?: unknown }

export function SocialPanel({ userId, options, onSaveShared }: { userId: string; options: ShareOption[]; onSaveShared: (item: SharedItem) => void | Promise<void> }) {
  const [connections, setConnections] = useState<Connection[]>([])
  const [received, setReceived] = useState<SharedItem[]>([])
  const [sent, setSent] = useState<SharedItem[]>([])
  const [email, setEmail] = useState('')
  const [selectedConnection, setSelectedConnection] = useState('')
  const [selectedOption, setSelectedOption] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const [connectionsResult, receivedResult, sentResult] = await Promise.all([
      supabase.rpc('forma_list_connections'),
      supabase.from('forma_shared_items').select('id,sender_id,recipient_id,kind,title,payload,created_at,saved_at').eq('recipient_id', userId).is('revoked_at', null).order('created_at', { ascending: false }),
      supabase.from('forma_shared_items').select('id,sender_id,recipient_id,kind,title,payload,created_at,saved_at').eq('sender_id', userId).is('revoked_at', null).order('created_at', { ascending: false })
    ])
    const failure = connectionsResult.error ?? receivedResult.error ?? sentResult.error
    if (failure) setError('No se pudo cargar Social. Comprueba que la migración social de Supabase esté aplicada.')
    else { setError(''); setConnections((connectionsResult.data ?? []) as Connection[]); setReceived((receivedResult.data ?? []) as SharedItem[]); setSent((sentResult.data ?? []) as SharedItem[]) }
    setLoading(false)
  }, [userId])

  useEffect(() => { void load() }, [load])
  const contacts = useMemo(() => connections.filter((item) => item.status === 'accepted'), [connections])

  const requestConnection = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage(''); setError('')
    const { error: requestError } = await supabase.rpc('forma_request_connection_by_email', { p_email: email.trim() })
    if (requestError) setError('No se pudo enviar la solicitud. Comprueba que la migración social de Supabase esté aplicada.')
    else { setMessage('Solicitud enviada si esa cuenta de Forma existe.'); setEmail(''); await load() }
    setBusy(false)
  }

  const respond = async (connection: Connection, status: 'accepted' | 'rejected') => {
    setBusy(true); setError('')
    const { error: responseError } = await supabase.from('forma_connections').update({ status, accepted_at: status === 'accepted' ? new Date().toISOString() : null }).eq('id', connection.id)
    if (responseError) setError('No se pudo actualizar la solicitud.')
    else await load()
    setBusy(false)
  }

  const share = async (event: FormEvent) => {
    event.preventDefault(); const option = options.find((item) => item.id === selectedOption)
    if (!option || !selectedConnection) return
    setBusy(true); setMessage(''); setError('')
    const { error: shareError } = await supabase.rpc('forma_send_share', { p_connection_id: selectedConnection, p_kind: option.kind, p_title: option.name, p_payload: option.payload })
    if (shareError) setError('No se pudo compartir. Comprueba tu conexión y que la otra persona siga conectada contigo.')
    else { setMessage(`“${option.name}” se ha enviado.`); await load() }
    setBusy(false)
  }

  const save = async (item: SharedItem) => {
    setBusy(true); setError('')
    try {
      await onSaveShared(item)
      const { error: saveError } = await supabase.from('forma_shared_items').update({ saved_at: new Date().toISOString() }).eq('id', item.id)
      if (saveError) setError('Se añadió a tu cuenta, pero no se pudo actualizar su estado.')
      else { setMessage('Añadido a tu cuenta.'); await load() }
    } catch { setError('No se pudo añadir. Comprueba los datos compartidos e inténtalo otra vez.') }
    setBusy(false)
  }

  const revoke = async (item: SharedItem) => {
    setBusy(true); const { error: revokeError } = await supabase.from('forma_shared_items').update({ revoked_at: new Date().toISOString() }).eq('id', item.id)
    if (revokeError) setError('No se pudo retirar el acceso.')
    else await load()
    setBusy(false)
  }

  return <>
    <div className="page-intro"><div><p className="eyebrow">CONECTA Y COMPARTE</p><h1>Social</h1><p className="subtitle">Comparte menús y rutinas solo con personas que hayan aceptado conectar contigo.</p></div><div className="intro-icon sage"><UsersRound size={24} /></div></div>
    {error && <p className="creator-message social-error" role="alert">{error}</p>}{message && <p className="social-success" role="status">{message}</p>}
    <section className="social-card"><div className="social-card-heading"><span className="settings-icon sage"><Mail size={18} /></span><div><h2>Conectar con alguien</h2><p>Escribe el correo de una persona que ya tenga cuenta en Forma.</p></div></div><form className="social-request-form" onSubmit={requestConnection}><input className="text-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="correo@ejemplo.com" autoComplete="email" required /><button className="primary-button" disabled={busy}><Plus size={15} /> Enviar solicitud</button></form></section>
    <section className="social-card"><div className="social-section-title"><div><p className="eyebrow">TU CÍRCULO</p><h2>Conexiones</h2></div><span>{contacts.length} conectados</span></div>{loading ? <p className="social-empty">Cargando tus conexiones…</p> : <>
      {connections.filter((item) => item.status === 'pending' && item.recipient_id === userId).map((item) => <article className="social-person" key={item.id}><div><strong>{item.other_email}</strong><small>Quiere conectar contigo</small></div><div className="social-actions"><button className="secondary-button" disabled={busy} onClick={() => void respond(item, 'rejected')}>Rechazar</button><button className="primary-button small-primary" disabled={busy} onClick={() => void respond(item, 'accepted')}><Check size={14} /> Aceptar</button></div></article>)}
      {connections.filter((item) => item.status === 'pending' && item.requester_id === userId).map((item) => <article className="social-person" key={item.id}><div><strong>{item.other_email}</strong><small>Solicitud pendiente</small></div><span className="social-status">Pendiente</span></article>)}
      {connections.filter((item) => item.status === 'accepted').map((item) => <article className="social-person" key={item.id}><div><strong>{item.other_email}</strong><small>Conectado/a</small></div><span className="social-status">Conectado</span></article>)}
      {!connections.length && <p className="social-empty">Aún no tienes conexiones. Envía una solicitud para empezar.</p>}
    </>}</section>
    <section className="social-card"><div className="social-section-title"><div><p className="eyebrow">ENVÍA A TU CÍRCULO</p><h2>Compartir un menú o rutina</h2></div><Share2 size={19} /></div>{contacts.length && options.length ? <form className="social-share-form" onSubmit={share}><label className="form-field"><span>Qué quieres compartir</span><select className="text-input" value={selectedOption} onChange={(event) => setSelectedOption(event.target.value)} required><option value="">Elige un menú o una rutina</option>{options.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.detail}</option>)}</select></label><label className="form-field"><span>Con quién</span><select className="text-input" value={selectedConnection} onChange={(event) => setSelectedConnection(event.target.value)} required><option value="">Elige una conexión</option>{contacts.map((item) => <option key={item.id} value={item.id}>{item.other_email}</option>)}</select></label><button className="primary-button" disabled={busy}><Send size={15} /> Compartir</button></form> : <p className="social-empty">{!contacts.length ? 'Primero conecta con alguien para compartir contenido.' : 'No hay menús ni rutinas guardadas para compartir todavía.'}</p>}</section>
    <section className="social-card"><div className="social-section-title"><div><p className="eyebrow">TU BANDEJA</p><h2>Compartido contigo</h2></div><span>{received.filter((item) => !item.saved_at).length} nuevos</span></div>{received.length ? <div className="social-share-list">{received.map((item) => <article className="social-share-item" key={item.id}><div className="social-share-icon"><Share2 size={17} /></div><div className="social-share-copy"><strong>{item.title}</strong><small>{item.kind === 'menu' ? 'Menú semanal' : 'Rutina'} · {new Date(item.created_at).toLocaleDateString('es-ES')}</small></div>{item.saved_at ? <span className="social-status">Añadido</span> : <button className="primary-button small-primary" disabled={busy} onClick={() => void save(item)}>Añadir a mi cuenta</button>}</article>)}</div> : <p className="social-empty">Cuando alguien comparta contigo, lo verás aquí.</p>}</section>
    <section className="social-card"><div className="social-section-title"><div><p className="eyebrow">LO QUE HAS ENVIADO</p><h2>Compartido por ti</h2></div><span>{sent.length} activos</span></div>{sent.length ? <div className="social-share-list">{sent.map((item) => <article className="social-share-item" key={item.id}><div className="social-share-icon"><Share2 size={17} /></div><div className="social-share-copy"><strong>{item.title}</strong><small>{item.kind === 'menu' ? 'Menú semanal' : 'Rutina'} · {new Date(item.created_at).toLocaleDateString('es-ES')}</small></div><button className="tiny-text-button remove-action" disabled={busy} onClick={() => void revoke(item)}><Trash2 size={14} /> Retirar</button></article>)}</div> : <p className="social-empty">Todavía no has compartido ningún menú o rutina.</p>}</section>
    <p className="modal-footnote social-privacy-note">Los registros de comidas, calorías, entrenamientos completados y medidas personales no se comparten. El destinatario puede guardar una copia en su propia cuenta.</p>
  </>
}
