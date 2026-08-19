import { useEffect, useMemo, useState } from 'react'
import { Bot, BookOpen, Download, Gamepad2, Globe2, Settings2, Users2 } from 'lucide-react'
import GameScreen from './components/GameScreen'
import LocalGameScreen from './components/LocalGameScreen'
import OnlineMatch from './components/OnlineMatch'
import RulesModal from './components/RulesModal'
import SettingsModal from './components/SettingsModal'
import InstallGuide from './components/InstallGuide'
import { loadSettings, saveSettings } from './lib/settings'
import type { Settings } from './lib/types'

type Screen =
  | { kind: 'home' }
  | { kind: 'cpu' }
  | { kind: 'local' }
  | { kind: 'online'; code: string; role: 'host' | 'guest' }

function randomRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
}

function cleanRoom(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5)
}

export default function App() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings())
  const [screen, setScreen] = useState<Screen>({ kind: 'home' })
  const [joinCode, setJoinCode] = useState('')
  const [showRules, setShowRules] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => saveSettings(settings), [settings])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const room = cleanRoom(params.get('room') ?? '')
    if (room.length === 5) {
      setJoinCode(room)
      setScreen({ kind: 'online', code: room, role: 'guest' })
    }
  }, [])

  useEffect(() => {
    if (screen.kind === 'online') {
      const url = new URL(location.href)
      url.searchParams.set('room', screen.code)
      history.replaceState({}, '', url)
    } else {
      const url = new URL(location.href)
      url.searchParams.delete('room')
      history.replaceState({}, '', url)
    }
  }, [screen])

  const home = () => setScreen({ kind: 'home' })
  const canJoin = joinCode.length === 5
  const greeting = useMemo(() => settings.playerName.trim() || 'Spieler 1', [settings.playerName])

  if (screen.kind === 'cpu') return <GameScreen settings={settings} onExit={home} />
  if (screen.kind === 'local') return <LocalGameScreen settings={settings} onExit={home} />
  if (screen.kind === 'online') return <OnlineMatch code={screen.code} role={screen.role} settings={settings} onExit={home} />

  return (
    <main className="home-screen screen-shell">
      <div className="home-grain" aria-hidden="true" />
      <header className="home-topbar">
        <button className="round-action" onClick={() => setShowRules(true)} aria-label="Regeln"><BookOpen /></button>
        <div className="brand-mini">SSK</div>
        <button className="round-action" onClick={() => setShowSettings(true)} aria-label="Einstellungen"><Settings2 /></button>
      </header>

      <section className="hero">
        <span className="eyebrow">DAS SPEZIAL-KNIFFEL</span>
        <h1><span>SCHREIER</span><span>SCHMIDDI</span><em>KNIFFLI.</em></h1>
        <p>19 Runden. 5 Würfel. Maximal 3 Würfe. Kein Gelaber.</p>
        <div className="hero-dice" aria-hidden="true">
          <i className="hero-die d1">⚄</i><i className="hero-die d2">⚂</i><i className="hero-die d3">⚅</i>
        </div>
      </section>

      <section className="mode-stack" aria-label="Spielmodus wählen">
        <button className="mode-card primary-mode" onClick={() => setScreen({ kind: 'cpu' })}>
          <span className="mode-icon"><Bot /></span>
          <span><small>SOFORT SPIELEN</small><strong>Gegen Schmiddi CPU</strong><em>Easy · Normal · Psycho</em></span>
          <Gamepad2 className="mode-arrow" />
        </button>

        <div className="online-card">
          <div className="online-card-head">
            <span className="mode-icon"><Globe2 /></span>
            <span><small>2 iPHONES · LIVE</small><strong>Online gegeneinander</strong></span>
          </div>
          <div className="online-actions">
            <button className="secondary-button" onClick={() => setScreen({ kind: 'online', code: randomRoomCode(), role: 'host' })}><Users2 /> Raum erstellen</button>
            <div className="join-row">
              <input inputMode="text" autoCapitalize="characters" autoCorrect="off" maxLength={5} value={joinCode} onChange={e => setJoinCode(cleanRoom(e.target.value))} placeholder="CODE" aria-label="Raumcode" />
              <button disabled={!canJoin} onClick={() => canJoin && setScreen({ kind: 'online', code: joinCode, role: 'guest' })}>BEITRETEN</button>
            </div>
          </div>
        </div>

        <button className="mode-card compact-mode" onClick={() => setScreen({ kind: 'local' })}>
          <span className="mode-icon"><Users2 /></span>
          <span><small>EIN iPHONE</small><strong>Pass & Play</strong><em>Abwechselnd spielen</em></span>
        </button>
      </section>

      <section className="home-footer-card">
        <div><span className="status-dot done" /><span>Bereit für <b>{greeting}</b></span></div>
        <button onClick={() => setShowInstall(true)}><Download /> Auf iPhone installieren</button>
      </section>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      {showSettings && <SettingsModal settings={settings} onChange={setSettings} onClose={() => setShowSettings(false)} />}
      {showInstall && <InstallGuide onClose={() => setShowInstall(false)} />}
    </main>
  )
}
