import type { Ranking } from '../ranking'
import { isTelegram } from './detect'
import { createLocalStorage } from './storage.local'
import { createTelegramStorage } from './storage.telegram'

export interface RankingStorage {
  load(): Promise<Ranking>
  save(ranking: Ranking): void
}

export function createStorage(key: string): RankingStorage {
  return isTelegram() ? createTelegramStorage(key) : createLocalStorage(key)
}
