import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { ChevronLeft, Copy, Share2, Users, Wifi, WifiOff } from 'lucide-react'
import { supabase, realtimeConfigured } from '../lib/supabase'
import type { PlayerState, RemotePlayerSnapshot, ScoreCard, ScoreCategory, Settings } from '../lib/types'
import { createPlayer, freshDice, resetRound, rollDice, submitCategory, toggleDie } from '../lib/game'
import { emptyScoreCard, scoreCategory, scoreTotals } from '../lib/scoring'
import { playRollSound, playScoreTone, softVibrate } from '../lib/feedback'
import { TOTAL_ROUNDS } from '../lib/rules'
import DiceTray from './DiceTray'
import ScoreSheet from './ScoreSheet'
import ResultScreen from './ResultScreen'
import Confetti from './Confetti'

interface Props { code: string; role: 'host'|'guest'; settings: Settings; onExit: () => void }

type GameMessage =
  | { type:'start'; sender:string }
  | { type:'state'; sender:string; round:number; player:RemotePlayerSnapshot }
  | { type:'sync_request'; sender:string }
  | { type:'rematch'; sender:string }

function uid() { return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) }
function remoteAsPlayer(remote: RemotePlayerSnapshot): PlayerState {
  return { ...remote, dice: freshDice().map(d => ({...d, held:false})), submitted: remote.submitted }
}

export default function OnlineMatch({ code, role, settings, onExit }: Props) {
  const clientId = useRef(uid()).current
  const channelRef = useRef<RealtimeChannel | null>(null)
  const [connected, setConnected] = useState(false)
  const [peers, setPeers] = useState<Array<{clientId:string; name:string; role:string}>>([])
  const [started, setStarted] = useState(false)
  const [round, setRound] = useState(1)
  const roundRef = useRef(1)
  const [me, setMe] = useState(() => createPlayer(settings.playerName.trim() || (role === 'host' ? 'Host' : 'Gast')))
  const [opponent, setOpponent] = useState<PlayerState>(() => createPlayer('Gegner'))
  const [advancing, setAdvancing] = useState(false)
  const [finished, setFinished] = useState(false)
  const [confetti, setConfetti] = useState(false)

  useEffect(() => { roundRef.current = round }, [round])

  const send = useCallback(async (message: GameMessage) => {
    await channelRef.current?.send({ type:'broadcast', event:'game', payload: message })
  }, [])

  const sendState = useCallback((player: PlayerState, atRound = roundRef.current) => {
    const snap: RemotePlayerSnapshot = { id: player.id, name: player.name, scoreCard: player.scoreCard, rollsUsed: player.rollsUsed, submitted: player.submitted }
    void send({ type:'state', sender:clientId, round:atRound, player:snap })
  }, [clientId, send])

  useEffect(() => {
    if (!realtimeConfigured || !supabase) return
    const channel = supabase.channel(`kniffli:${code.toUpperCase()}`, { config: { presence: { key: clientId }, broadcast: { self: false } } })
    channelRef.current = channel
    channel
      .on('presence', { event:'sync' }, () => {
        const state = channel.presenceState() as Record<string, Array<Record<string, unknown>>>
        const list = Object.values(state).flat().map(p => ({ clientId:String(p.clientId ?? ''), name:String(p.name ?? 'Spieler'), role:String(p.role ?? '') }))
        setPeers(list)
      })
      .on('broadcast', { event:'game' }, ({ payload }) => {
        const msg = payload as GameMessage
        if (!msg || msg.sender === clientId) return
        if (msg.type === 'start') { setStarted(true); void send({ type:'sync_request', sender:clientId }) }
        if (msg.type === 'sync_request') sendState(me)
        if (msg.type === 'rematch') {
          setMe(createPlayer(settings.playerName.trim() || 'Spieler 1')); setOpponent(createPlayer('Gegner')); setRound(1); setFinished(false); setAdvancing(false); setStarted(true)
        }
        if (msg.type === 'state') {
          setOpponent(remoteAsPlayer(msg.player))
          if (msg.round > roundRef.current) {
            setRound(msg.round)
            setMe(p => p.submitted ? resetRound(p) : p)
          }
        }
      })
      .subscribe(async status => {
        const ok = status === 'SUBSCRIBED'
        setConnected(ok)
        if (ok) {
          await channel.track({ clientId, name: settings.playerName.trim() || 'Spieler', role, joinedAt: Date.now() })
          await channel.send({ type:'broadcast', event:'game', payload:{ type:'sync_request', sender:clientId } satisfies GameMessage })
        }
      })

    const visibility = () => { if (document.visibilityState === 'visible') void send({type:'sync_request', sender:clientId}) }
    document.addEventListener('visibilitychange', visibility)
    return () => { document.removeEventListener('visibilitychange', visibility); void supabase.removeChannel(channel); channelRef.current = null }
  }, [code, role, clientId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (started) sendState(me) }, [me.rollsUsed, me.submitted, round, started]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!started || !me.submitted || !opponent.submitted || advancing || finished) return
    setAdvancing(true)
    const timer = window.setTimeout(() => {
      if (round >= TOTAL_ROUNDS) setFinished(true)
      else {
        setMe(p => resetRound(p)); setOpponent(p => resetRound(p)); setRound(r => r + 1)
      }
      setAdvancing(false)
    }, 1100)
    return () => clearTimeout(timer)
  }, [started, me.submitted, opponent.submitted, advancing, finished, round])

  const otherPeers = peers.filter(p => p.clientId !== clientId)
  const playerCount = peers.length
  const shareUrl = `${location.origin}${location.pathname}?room=${encodeURIComponent(code.toUpperCase())}`

  const copyCode = async () => { try { await navigator.clipboard.writeText(code.toUpperCase()); softVibrate(10) } catch {} }
  const shareRoom = async () => {
    const data = { title:'Schreier Schmiddi Kniffli', text:`Komm in mein Kniffli-Spiel. Raum: ${code.toUpperCase()}`, url:shareUrl }
    try { if (navigator.share) await navigator.share(data); else await navigator.clipboard.writeText(shareUrl) } catch {}
  }
  const start = async () => { setStarted(true); await send({type:'start', sender:clientId}); sendState(me) }

  const roll = () => {
    if (me.submitted || me.rollsUsed >= 3) return
    playRollSound(settings.sound); softVibrate(12)
    setMe(p => rollDice(p))
  }
  const score = (category: ScoreCategory) => {
    const points = scoreCategory(category, me.dice.map(d=>d.value))
    if (points === 0 && !window.confirm('Dieses Feld mit 0 Punkten streichen?')) return
    const result = submitCategory(me, category)
    setMe(result.player)
    playScoreTone(settings.sound, category === 'kniffli' && result.points === 50)
    if (category === 'kniffli' && result.points === 50) { setConfetti(true); window.setTimeout(()=>setConfetti(false),1800) }
  }

  const rematch = () => { setMe(createPlayer(settings.playerName.trim() || 'Spieler 1')); setOpponent(createPlayer('Gegner')); setRound(1); setFinished(false); setAdvancing(false); void send({type:'rematch',sender:clientId}) }

  if (!realtimeConfigured) return <main className="screen-shell setup-error"><button className="icon-button" onClick={onExit}><ChevronLeft/></button><h1>Online-Modus noch nicht verbunden.</h1><p>Trage in Netlify die beiden Supabase-Variablen aus <code>.env.example</code> ein. Die Anleitung liegt im Repo unter <strong>SUPABASE_SETUP.md</strong>.</p></main>

  if (!started) return <main className="online-lobby screen-shell">
    <header className="simple-header"><button className="icon-button" onClick={onExit}><ChevronLeft/></button><span className="connection">{connected ? <><Wifi size={15}/> verbunden</> : <><WifiOff size={15}/> verbindet …</>}</span></header>
    <span className="eyebrow">ONLINE · 2 iPHONES</span><h1>{role === 'host' ? 'Dein Spielraum.' : 'Fast drin.'}</h1>
    <p>{role === 'host' ? 'Schick den Code oder Link an Spieler 2.' : 'Warte, bis der Host das Match startet.'}</p>
    <div className="room-code-card"><small>RAUMCODE</small><strong>{code.toUpperCase()}</strong><div><button onClick={copyCode}><Copy/>Code</button><button onClick={shareRoom}><Share2/>Teilen</button></div></div>
    <div className="players-lobby"><div><Users/><span>{playerCount}/2 verbunden</span></div>{otherPeers[0] && <b>{otherPeers[0].name} ist da ✓</b>}</div>
    {role === 'host' ? <button className="primary-button" disabled={!connected || otherPeers.length < 1} onClick={start}>MATCH STARTEN</button> : <div className="waiting-pulse"><i/><span>Warte auf Host …</span></div>}
    <p className="micro-copy">Tipp: Beide sollten die App während einer Runde geöffnet lassen. Wenn Safari/iOS die Verbindung im Hintergrund pausiert, synchronisiert Kniffli beim Zurückkehren erneut.</p>
  </main>

  if (finished) return <ResultScreen players={[me, opponent]} onRematch={rematch} onHome={onExit}/>

  const otherName = opponent.name === 'Gegner' ? (otherPeers[0]?.name ?? 'Gegner') : opponent.name
  return <main className="game-screen screen-shell">
    <Confetti active={confetti}/>
    <header className="game-header">
      <button className="icon-button" onClick={onExit}><ChevronLeft/></button>
      <div className="round-badge"><small>RUNDE</small><strong>{round}<span>/{TOTAL_ROUNDS}</span></strong></div>
      <div className="top-score"><small>{me.name}</small><strong>{scoreTotals(me.scoreCard).total}</strong></div>
      <div className="top-score opponent"><small>{otherName}</small><strong>{scoreTotals(opponent.scoreCard).total}</strong></div>
    </header>
    <div className="cpu-strip online-strip"><span className={connected ? 'status-dot done' : 'status-dot'}/><span><b>{otherName}</b> {opponent.submitted ? 'ist fertig ✓' : opponent.rollsUsed ? `würfelt · ${opponent.rollsUsed}/3` : 'ist dran'}</span><span className="room-mini">#{code.toUpperCase()}</span></div>
    <DiceTray dice={me.dice} rollsUsed={me.rollsUsed} submitted={me.submitted} sound={settings.sound} onRoll={roll} onToggle={id => setMe(p => toggleDie(p,id))}/>
    {me.submitted && !opponent.submitted && <div className="waiting-banner">Dein Feld steht · warte auf {otherName}</div>}
    {advancing && <div className="waiting-banner success">Beide fertig · nächste Runde ✓</div>}
    <ScoreSheet me={me} opponent={opponent} myLabel="DU" opponentLabel={otherName.slice(0,8).toUpperCase()} allowScoring={!advancing} onScore={score}/>
  </main>
}
