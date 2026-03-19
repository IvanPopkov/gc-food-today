import { describe, it, expect, beforeEach } from 'vitest'
import { createLocalStorage } from './platform/storage.local'
import { emptyRanking, filledCount } from './ranking'

const STORAGE_KEY = 'test-ranking'

beforeEach(() => {
  localStorage.clear()
})

describe('createLocalStorage', () => {
  describe('load', () => {
    it('returns empty ranking when nothing is stored', async () => {
      const storage = createLocalStorage(STORAGE_KEY)
      const ranking = await storage.load()
      expect(filledCount(ranking)).toBe(0)
    })

    it('restores a previously saved ranking', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['pizza', 'sushi']))
      const storage = createLocalStorage(STORAGE_KEY)
      const ranking = await storage.load()
      expect(ranking[0]?.id).toBe('pizza')
      expect(ranking[1]?.id).toBe('sushi')
      expect(filledCount(ranking)).toBe(2)
    })

    it('skips ids that no longer exist in FOODS', async () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(['pizza', 'nonexistent', 'sushi']),
      )
      const storage = createLocalStorage(STORAGE_KEY)
      const ranking = await storage.load()
      expect(ranking[0]?.id).toBe('pizza')
      expect(ranking[1]?.id).toBe('sushi')
      expect(filledCount(ranking)).toBe(2)
    })

    it('returns empty ranking for invalid JSON', async () => {
      localStorage.setItem(STORAGE_KEY, 'not-json!!!')
      const storage = createLocalStorage(STORAGE_KEY)
      const ranking = await storage.load()
      expect(filledCount(ranking)).toBe(0)
    })

    it('returns empty ranking for non-array JSON', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: 'bar' }))
      const storage = createLocalStorage(STORAGE_KEY)
      const ranking = await storage.load()
      expect(filledCount(ranking)).toBe(0)
    })
  })

  describe('save', () => {
    it('persists ranking ids to localStorage', () => {
      const storage = createLocalStorage(STORAGE_KEY)
      const ranking = emptyRanking()
      ranking[0] = { id: 'pizza', name: 'Pizza', emoji: '🍕' }
      ranking[1] = { id: 'sushi', name: 'Sushi', emoji: '🍣' }
      storage.save(ranking)

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
      expect(stored).toEqual(['pizza', 'sushi'])
    })

    it('saves empty array for empty ranking', () => {
      const storage = createLocalStorage(STORAGE_KEY)
      storage.save(emptyRanking())

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
      expect(stored).toEqual([])
    })
  })

  describe('round-trip', () => {
    it('save then load preserves ranking order', async () => {
      const storage = createLocalStorage(STORAGE_KEY)
      const ranking = emptyRanking()
      ranking[0] = { id: 'burger', name: 'Burger', emoji: '🍔' }
      ranking[1] = { id: 'pizza', name: 'Pizza', emoji: '🍕' }
      ranking[2] = { id: 'tacos', name: 'Tacos', emoji: '🌮' }
      storage.save(ranking)

      const loaded = await storage.load()
      expect(loaded[0]?.id).toBe('burger')
      expect(loaded[1]?.id).toBe('pizza')
      expect(loaded[2]?.id).toBe('tacos')
      expect(filledCount(loaded)).toBe(3)
    })
  })
})
