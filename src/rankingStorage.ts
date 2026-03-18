import { FOODS, SLOT_COUNT, type Food } from './foods'
import { type Ranking, emptyRanking } from './ranking'

export interface RankingStorage {
  load(): Ranking
  save(ranking: Ranking): void
}

export function createLocalRankingStorage(key: string): RankingStorage {
  const foodMap = new Map(FOODS.map((f) => [f.id, f]))

  return {
    load(): Ranking {
      try {
        const stored = localStorage.getItem(key)
        if (!stored) return emptyRanking()
        const ids: string[] = JSON.parse(stored)
        if (!Array.isArray(ids)) return emptyRanking()
        const result: Ranking = Array(SLOT_COUNT).fill(null)
        let pos = 0
        for (const id of ids) {
          const food = foodMap.get(id)
          if (food && pos < SLOT_COUNT) result[pos++] = food
        }
        return result
      } catch {
        return emptyRanking()
      }
    },

    save(ranking: Ranking): void {
      const ids = ranking.filter((f): f is Food => f !== null).map((f) => f.id)
      localStorage.setItem(key, JSON.stringify(ids))
    },
  }
}
