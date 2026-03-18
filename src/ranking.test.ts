import { describe, it, expect } from 'vitest'
import {
  emptyRanking,
  placeFoodInRanking,
  removeFromRanking,
  compactRanking,
  getPlacedIds,
  filledCount,
} from './ranking'
import type { Food } from './foods'
import { SLOT_COUNT } from './foods'

const pizza: Food = { id: 'pizza', name: 'Pizza', emoji: '🍕' }
const sushi: Food = { id: 'sushi', name: 'Sushi', emoji: '🍣' }
const burger: Food = { id: 'burger', name: 'Burger', emoji: '🍔' }

describe('emptyRanking', () => {
  it('returns an array of SLOT_COUNT nulls', () => {
    const r = emptyRanking()
    expect(r).toHaveLength(SLOT_COUNT)
    expect(r.every((v) => v === null)).toBe(true)
  })
})

describe('placeFoodInRanking', () => {
  it('places a food at the given position', () => {
    const r = placeFoodInRanking(emptyRanking(), pizza, 0)
    expect(r[0]).toEqual(pizza)
    expect(filledCount(r)).toBe(1)
  })

  it('inserts between existing items', () => {
    let r = placeFoodInRanking(emptyRanking(), pizza, 0)
    r = placeFoodInRanking(r, burger, 1)
    r = placeFoodInRanking(r, sushi, 1)
    expect(r[0]).toEqual(pizza)
    expect(r[1]).toEqual(sushi)
    expect(r[2]).toEqual(burger)
  })

  it('moves an already-placed food to a new position', () => {
    let r = placeFoodInRanking(emptyRanking(), pizza, 0)
    r = placeFoodInRanking(r, sushi, 1)
    r = placeFoodInRanking(r, pizza, 2)
    expect(r[0]).toEqual(sushi)
    expect(r[1]).toEqual(pizza)
    expect(filledCount(r)).toBe(2)
  })

  it('clamps insertAt to the end', () => {
    const r = placeFoodInRanking(emptyRanking(), pizza, 100)
    expect(r[0]).toEqual(pizza)
    expect(filledCount(r)).toBe(1)
  })
})

describe('removeFromRanking', () => {
  it('removes the item at the given index and compacts', () => {
    let r = placeFoodInRanking(emptyRanking(), pizza, 0)
    r = placeFoodInRanking(r, sushi, 1)
    r = placeFoodInRanking(r, burger, 2)
    r = removeFromRanking(r, 1)
    expect(r[0]).toEqual(pizza)
    expect(r[1]).toEqual(burger)
    expect(r[2]).toBeNull()
  })

  it('is a no-op for an empty slot', () => {
    const r = removeFromRanking(emptyRanking(), 0)
    expect(filledCount(r)).toBe(0)
  })
})

describe('compactRanking', () => {
  it('removes nulls and packs items to the front', () => {
    const r = emptyRanking()
    r[0] = pizza
    r[3] = sushi
    r[7] = burger
    const c = compactRanking(r)
    expect(c[0]).toEqual(pizza)
    expect(c[1]).toEqual(sushi)
    expect(c[2]).toEqual(burger)
    expect(filledCount(c)).toBe(3)
  })

  it('excludes a specific id when provided', () => {
    const r = emptyRanking()
    r[0] = pizza
    r[1] = sushi
    const c = compactRanking(r, 'pizza')
    expect(c[0]).toEqual(sushi)
    expect(filledCount(c)).toBe(1)
  })
})

describe('getPlacedIds', () => {
  it('returns a set of placed food ids', () => {
    let r = placeFoodInRanking(emptyRanking(), pizza, 0)
    r = placeFoodInRanking(r, sushi, 1)
    const ids = getPlacedIds(r)
    expect(ids).toEqual(new Set(['pizza', 'sushi']))
  })

  it('returns empty set for empty ranking', () => {
    expect(getPlacedIds(emptyRanking())).toEqual(new Set())
  })
})

describe('filledCount', () => {
  it('counts non-null entries', () => {
    let r = placeFoodInRanking(emptyRanking(), pizza, 0)
    r = placeFoodInRanking(r, sushi, 1)
    expect(filledCount(r)).toBe(2)
  })
})
