import { emptyRanking } from '../ranking'
import type { RankingStorage } from './storage'
import { idsToRanking, parseIds, rankingToIds } from './storage.local'

const CLOUD_TIMEOUT_MS = 2000

export function createTelegramStorage(key: string): RankingStorage {
  const cloud = window.Telegram!.WebApp.CloudStorage

  return {
    load(): Promise<Ranking> {
      const fromLocal = () => {
        const ids = parseIds(localStorage.getItem(key))
        return ids ? idsToRanking(ids) : emptyRanking()
      }

      return new Promise<Ranking>((resolve) => {
        const timeout = setTimeout(() => resolve(fromLocal()), CLOUD_TIMEOUT_MS)

        cloud.getItem(key, (error, value) => {
          clearTimeout(timeout)
          if (error || !value) {
            resolve(fromLocal())
            return
          }
          localStorage.setItem(key, value)
          const ids = parseIds(value)
          resolve(ids ? idsToRanking(ids) : emptyRanking())
        })
      })
    },

    save(ranking: Ranking): void {
      const json = JSON.stringify(rankingToIds(ranking))
      localStorage.setItem(key, json)
      cloud.setItem(key, json)
    },
  }
}
