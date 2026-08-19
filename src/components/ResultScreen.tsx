import { Trophy, RotateCcw, Home } from 'lucide-react'
import type { PlayerState } from '../lib/types'
import { scoreTotals } from '../lib/scoring'

export default function ResultScreen({ players, onRematch, onHome }: { players: PlayerState[]; onRematch: () => void; onHome: () => void }) {
  const a = scoreTotals(players[0].scoreCard).total
  const b = scoreTotals(players[1].scoreCard).total
  const winner = a === b ? null : a > b ? players[0] : players[1]
  return <main className="result-screen screen-shell">
    <div className="result-trophy"><Trophy size={42}/></div>
    <span className="eyebrow">GAME OVER</span>
    <h1>{winner ? `${winner.name} gewinnt.` : 'Unentschieden.'}</h1>
    <p className="result-sub">{winner ? 'Schreien erlaubt.' : 'Das schreit nach Revanche.'}</p>
    <div className="result-scores">
      <div className={winner?.id === players[0].id ? 'winner' : ''}><span>{players[0].name}</span><strong>{a}</strong></div>
      <div className={winner?.id === players[1].id ? 'winner' : ''}><span>{players[1].name}</span><strong>{b}</strong></div>
    </div>
    <button className="primary-button" onClick={onRematch}><RotateCcw/> REVANCHE</button>
    <button className="ghost-button" onClick={onHome}><Home/> Startseite</button>
  </main>
}
