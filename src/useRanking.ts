import { useRef, useMemo, useState, useEffect, type DragEvent } from 'react'
import { FOODS, SLOT_COUNT, type Food } from './foods'
import {
  type Ranking,
  emptyRanking,
  placeFoodInRanking,
  removeFromRanking,
  compactRanking,
  getPlacedIds,
  filledCount,
  randomRanking,
} from './ranking'
import { useFlipAnimation } from './useFlipAnimation'
import {
  type RankingStorage,
  createLocalRankingStorage,
} from './rankingStorage'

const defaultStorage = createLocalRankingStorage('food-today-ranking')

export function useRanking(storage: RankingStorage = defaultStorage) {
  const [ranking, setRanking] = useState<Ranking>(() => storage.load())
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [insertPos, setInsertPos] = useState<number | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { capturePositions } = useFlipAnimation(listRef, ranking)

  useEffect(() => {
    storage.save(ranking)
  }, [ranking, storage])

  const placedIds = getPlacedIds(ranking)
  const availableFoods = FOODS.filter((f) => !placedIds.has(f.id))

  const displayRanking = useMemo(() => {
    if (!draggingId || !placedIds.has(draggingId)) return ranking
    return compactRanking(ranking, draggingId)
  }, [ranking, draggingId, placedIds])

  function updateRanking(updater: (prev: Ranking) => Ranking) {
    capturePositions()
    setRanking(updater)
  }

  function placeFood(foodId: string, insertAt: number) {
    const food = FOODS.find((f) => f.id === foodId)
    if (!food) return
    updateRanking((prev) => placeFoodInRanking(prev, food, insertAt))
  }

  function computeInsertPos(clientY: number): number {
    if (!listRef.current) return 0
    const slots = listRef.current.children
    for (let i = 0; i < slots.length; i++) {
      const rect = slots[i].getBoundingClientRect()
      const midY = rect.top + rect.height / 2
      if (clientY < midY) return i
    }
    return slots.length
  }

  function onDragStart(e: DragEvent, food: Food) {
    e.dataTransfer.setData('text/plain', food.id)
    e.dataTransfer.effectAllowed = 'move'
    capturePositions()
    setDraggingId(food.id)
  }

  function onDragEnd() {
    setDraggingId(null)
    setInsertPos(null)
  }

  function onListDragOver(e: DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setInsertPos(computeInsertPos(e.clientY))
  }

  function onListDragLeave(e: DragEvent) {
    if (!listRef.current?.contains(e.relatedTarget as Node)) {
      setInsertPos(null)
    }
  }

  function onListDrop(e: DragEvent) {
    e.preventDefault()
    const foodId = e.dataTransfer.getData('text/plain')
    if (insertPos !== null) {
      placeFood(foodId, insertPos)
    }
    setInsertPos(null)
    setDraggingId(null)
  }

  function onFoodTap(food: Food) {
    const count = filledCount(ranking)
    if (count < SLOT_COUNT) {
      placeFood(food.id, count)
    }
  }

  function onSlotTap(index: number) {
    if (ranking[index]) {
      removeFromSlot(index)
    }
  }

  function removeFromSlot(index: number) {
    updateRanking((prev) => removeFromRanking(prev, index))
  }

  function randomize() {
    capturePositions()
    setRanking(randomRanking(FOODS))
  }

  function reset() {
    setRanking(emptyRanking())
  }

  return {
    draggingId,
    insertPos,
    listRef,
    displayRanking,
    availableFoods,
    onDragStart,
    onDragEnd,
    onListDragOver,
    onListDragLeave,
    onListDrop,
    onFoodTap,
    onSlotTap,
    removeFromSlot,
    randomize,
    reset,
  }
}
