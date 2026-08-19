import type { ScoreCategory } from './types'

export const categoryMeta: Record<ScoreCategory, { title: string; hint?: string; description: string }> = {
  ones: { title: 'Einser', description: 'Summe aller Einser' },
  twos: { title: 'Zweier', description: 'Summe aller Zweier' },
  threes: { title: 'Dreier', description: 'Summe aller Dreier' },
  fours: { title: 'Vierer', description: 'Summe aller Vierer' },
  fives: { title: 'Fünfer', description: 'Summe aller Fünfer' },
  sixes: { title: 'Sechser', description: 'Summe aller Sechser' },
  onePair: { title: '1 Paar', hint: '10', description: 'Mindestens zwei gleiche Würfel' },
  twoPairs: { title: '2 Paare', hint: '20', description: 'Zwei verschiedene Paare' },
  threeOfAKind: { title: 'Drilling', hint: '15', description: 'Mindestens drei gleiche Würfel' },
  fourOfAKind: { title: 'Vierling', hint: '25', description: 'Mindestens vier gleiche Würfel' },
  fullHouse: { title: 'Full House', hint: '30', description: 'Ein Paar plus ein Drilling' },
  smallStraight: { title: 'Kleine Straße', hint: '30', description: 'Vier aufeinanderfolgende Zahlen' },
  largeStraight: { title: 'Große Straße', hint: '40', description: '1–5 oder 2–6' },
  kniffli: { title: 'Kniffli', hint: '50', description: 'Fünf gleiche Würfel' },
  allEven: { title: 'Alle gerade', hint: '20', description: 'Alle fünf Würfel sind 2, 4 oder 6' },
  allOdd: { title: 'Alle ungerade', hint: '20', description: 'Alle fünf Würfel sind 1, 3 oder 5' },
  exact15: { title: 'Exakter Wurf 15', hint: '15', description: 'Augensumme exakt 15' },
  exact20: { title: 'Exakter Wurf 20', hint: '20', description: 'Augensumme exakt 20' },
  chance: { title: 'Chance', hint: 'Σ', description: 'Summe aller Würfel' },
}

export const TOTAL_ROUNDS = 19
export const UPPER_BONUS_THRESHOLD = 63
export const UPPER_BONUS = 35
