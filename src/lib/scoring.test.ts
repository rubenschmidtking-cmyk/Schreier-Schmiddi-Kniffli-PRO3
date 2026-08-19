import { describe, expect, it } from 'vitest'
import { emptyScoreCard, scoreCategory, scoreTotals } from './scoring'

describe('Schreier Schmiddi Kniffli rules', () => {
  it('scores Kniffli as 50', () => expect(scoreCategory('kniffli', [5,5,5,5,5])).toBe(50))
  it('scores small straight as 30', () => expect(scoreCategory('smallStraight', [1,2,3,4,6])).toBe(30))
  it('scores large straight as 40', () => expect(scoreCategory('largeStraight', [2,3,4,5,6])).toBe(40))
  it('scores all even and all odd', () => {
    expect(scoreCategory('allEven', [2,4,6,2,4])).toBe(20)
    expect(scoreCategory('allOdd', [1,3,5,1,5])).toBe(20)
  })
  it('scores exact 15 and exact 20 by dice sum', () => {
    expect(scoreCategory('exact15', [1,2,3,4,5])).toBe(15)
    expect(scoreCategory('exact20', [2,3,4,5,6])).toBe(20)
  })
  it('adds upper bonus at 63', () => {
    const card = emptyScoreCard()
    Object.assign(card, { ones:3, twos:6, threes:9, fours:12, fives:15, sixes:18 })
    expect(scoreTotals(card).upperSubtotal).toBe(63)
    expect(scoreTotals(card).bonus).toBe(35)
  })
})
