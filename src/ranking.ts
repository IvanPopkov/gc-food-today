import { SLOT_COUNT, type Food } from './foods'

export type Ranking = (Food | null)[]

export function emptyRanking(): Ranking {
  return Array(SLOT_COUNT).fill(null)
}

export function placeFoodInRanking(
  ranking: Ranking,
  food: Food,
  insertAt: number,
): Ranking {
  const items = ranking.filter((f): f is Food => f !== null && f.id !== food.id)
  items.splice(Math.min(insertAt, items.length), 0, food)
  const next: Ranking = Array(SLOT_COUNT).fill(null)
  for (let i = 0; i < Math.min(items.length, SLOT_COUNT); i++) {
    next[i] = items[i]
  }
  return next
}

export function removeFromRanking(ranking: Ranking, index: number): Ranking {
  const items = ranking.filter((f, i) => f !== null && i !== index)
  const next: Ranking = Array(SLOT_COUNT).fill(null)
  items.forEach((f, i) => (next[i] = f))
  return next
}

export function compactRanking(ranking: Ranking, excludeId?: string): Ranking {
  const items = ranking.filter(
    (f): f is Food => f !== null && (!excludeId || f.id !== excludeId),
  )
  const result: Ranking = Array(SLOT_COUNT).fill(null)
  items.forEach((f, i) => (result[i] = f))
  return result
}

export function getPlacedIds(ranking: Ranking): Set<string> {
  return new Set(ranking.filter((f): f is Food => f !== null).map((f) => f.id))
}

export function filledCount(ranking: Ranking): number {
  return ranking.filter((f) => f !== null).length
}
