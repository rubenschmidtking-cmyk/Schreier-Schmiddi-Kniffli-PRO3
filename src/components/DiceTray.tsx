import { useEffect, useState } from 'react'
import { RotateCcw, LockKeyhole } from 'lucide-react'
import type { Die } from '../lib/types'
import DieFace from './DieFace'

interface Props {
  dice: Die[]
  rollsUsed: number
  submitted: boolean
  sound: boolean
  onRoll: () => void
  onToggle: (id: string) => void
  externalRolling?: boolean
}

export default function DiceTray({ dice, rollsUsed, submitted, onRoll, onToggle, externalRolling = false }: Props) {
  const [rolling, setRolling] = useState(false)
  const [preview, setPreview] = useState(dice.map(d => d.value))

  useEffect(() => { if (!rolling) setPreview(dice.map(d => d.value)) }, [dice, rolling])

  const animateRoll = () => {
    if (submitted || rollsUsed >= 3 || rolling) return
    setRolling(true)
    const timer = window.setInterval(() => setPreview(dice.map(d => d.held ? d.value : Math.floor(Math.random()*6)+1)), 65)
    window.setTimeout(() => {
      clearInterval(timer)
      setRolling(false)
      onRoll()
    }, 560)
  }

  const isRolling = rolling || externalRolling
  const canRoll = !submitted && rollsUsed < 3

  return (
    <section className="dice-tray" aria-label="Würfelbrett">
      <div className="tray-head">
        <span className="eyebrow">DEIN WURF</span>
        <span className="roll-counter">Wurf {Math.min(rollsUsed + (rolling ? 1 : 0), 3)}/3</span>
      </div>
      <div className="dice-row">
        {dice.map((die, i) => (
          <DieFace key={die.id} value={preview[i] ?? die.value} held={die.held} rolling={isRolling && !die.held} index={i} onClick={() => !rolling && onToggle(die.id)} />
        ))}
      </div>
      <div className="tray-hint"><LockKeyhole size={14} /> Würfel antippen zum Halten</div>
      <button className="roll-button" disabled={!canRoll || rolling} onClick={animateRoll}>
        <RotateCcw size={20} className={rolling ? 'spin' : ''} />
        {submitted ? 'EINGETRAGEN' : rollsUsed === 0 ? 'WÜRFELN' : rollsUsed < 3 ? `NOCHMAL WÜRFELN · ${3-rollsUsed}×` : 'KATEGORIE WÄHLEN'}
      </button>
    </section>
  )
}
