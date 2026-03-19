import { FOODS, SLOT_COUNT, type Food } from '../foods'
import { type Ranking, emptyRanking } from '../ranking'
import type { RankingStorage } from './storage'

const foodMap = new Map(FOODS.map((f) => [f.id, f]))

export function rankingToIds(ranking: Ranking): string[] {
  return ranking.filter((f): f is Food => f !== null).map((f) => f.id)
}

export function idsToRanking(ids: string[]): Ranking {
  const result: Ranking = Array(SLOT_COUNT).fill(null)
  let pos = 0
  for (const id of ids) {
    const food = foodMap.get(id)
    if (food && pos < SLOT_COUNT) result[pos++] = food
  }
  return result
}

export function parseIds(raw: string | null | undefined): string[] | null {
  try {
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function createLocalStorage(key: string): RankingStorage {
  return {
    load(): Promise<Ranking> {
      const ids = parseIds(localStorage.getItem(key))
      return Promise.resolve(ids ? idsToRanking(ids) : emptyRanking())
    },

    save(ranking: Ranking): void {
      localStorage.setItem(key, JSON.stringify(rankingToIds(ranking)))
    },
  }
}
