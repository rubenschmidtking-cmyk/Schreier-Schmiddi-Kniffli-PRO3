import type { PlayerState, ScoreCategory } from '../lib/types'
import { lowerCategories, upperCategories } from '../lib/types'
import { categoryMeta } from '../lib/rules'
import { scoreCategory, scoreTotals } from '../lib/scoring'

interface Props {
  me: PlayerState
  opponent: PlayerState
  myLabel?: string
  opponentLabel?: string
  allowScoring: boolean
  onScore: (category: ScoreCategory) => void
}

export default function ScoreSheet({ me, opponent, myLabel, opponentLabel, allowScoring, onScore }: Props) {
  const diceValues = me.dice.map(d => d.value)
  const myTotals = scoreTotals(me.scoreCard)
  const otherTotals = scoreTotals(opponent.scoreCard)

  const scoreCell = (category: ScoreCategory, player: PlayerState, mine: boolean) => {
    const fixed = player.scoreCard[category]
    if (fixed !== null) return <span className={fixed === 0 ? 'score-zero' : 'score-fixed'}>{fixed}</span>
    if (mine && allowScoring && me.rollsUsed > 0 && !me.submitted) {
      const candidate = scoreCategory(category, diceValues)
      return <button className={`candidate ${candidate === 0 ? 'zero' : ''}`} onClick={() => onScore(category)}>{candidate > 0 ? `+${candidate}` : '0'}</button>
    }
    return <span className="empty-score">—</span>
  }

  const row = (category: ScoreCategory) => (
    <tr key={category}>
      <th scope="row">
        <span>{categoryMeta[category].title}</span>
        {categoryMeta[category].hint && <small>{categoryMeta[category].hint}</small>}
      </th>
      <td className="my-score">{scoreCell(category, me, true)}</td>
      <td>{scoreCell(category, opponent, false)}</td>
    </tr>
  )

  return (
    <section className="score-sheet">
      <div className="paper-title">
        <div><span className="tiny-label">SPEZIAL-SPIELBLOCK</span><h2>Schreier Schmiddi Kniffli</h2></div>
        <div className="mini-die">⚄</div>
      </div>
      <table>
        <thead><tr><th>Kategorie</th><th className="active-col">{myLabel ?? me.name}</th><th>{opponentLabel ?? opponent.name}</th></tr></thead>
        <tbody>
          <tr className="section-row"><th colSpan={3}>OBERER TEIL</th></tr>
          {upperCategories.map(row)}
          <tr className="summary-row"><th>Summe oben</th><td>{myTotals.upperSubtotal}</td><td>{otherTotals.upperSubtotal}</td></tr>
          <tr className="summary-row"><th>Bonus ab 63 <small>+35</small></th><td>{myTotals.bonus}</td><td>{otherTotals.bonus}</td></tr>
          <tr className="summary-row strong"><th>Gesamt oben</th><td>{myTotals.upperTotal}</td><td>{otherTotals.upperTotal}</td></tr>
          <tr className="section-row"><th colSpan={3}>UNTERER TEIL</th></tr>
          {lowerCategories.map(row)}
          <tr className="summary-row strong"><th>Gesamt unten</th><td>{myTotals.lowerTotal}</td><td>{otherTotals.lowerTotal}</td></tr>
          <tr className="grand-total"><th>GESAMTPUNKTE</th><td>{myTotals.total}</td><td>{otherTotals.total}</td></tr>
        </tbody>
      </table>
    </section>
  )
}
