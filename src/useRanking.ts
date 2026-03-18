import {
  useRef,
  useMemo,
  useState,
  useLayoutEffect,
  useCallback,
  type DragEvent,
} from 'react'
import { FOODS, SLOT_COUNT, ANIM_DURATION, type Food } from './foods'
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

export function useRanking() {
  const [ranking, setRanking] = useState<Ranking>(emptyRanking)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [insertPos, setInsertPos] = useState<number | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const positionsRef = useRef<Map<string, DOMRect>>(new Map())
  const flipCounterRef = useRef(0)

  const placedIds = getPlacedIds(ranking)
  const availableFoods = FOODS.filter((f) => !placedIds.has(f.id))

  const displayRanking = useMemo(() => {
    if (!draggingId || !placedIds.has(draggingId)) return ranking
    return compactRanking(ranking, draggingId)
  }, [ranking, draggingId, placedIds])

  const capturePositions = useCallback(() => {
    if (!listRef.current) return
    const map = new Map<string, DOMRect>()
    const slots = listRef.current.children
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i] as HTMLElement
      const foodId = slot.dataset.foodId
      if (foodId) {
        map.set(foodId, slot.getBoundingClientRect())
      }
    }
    positionsRef.current = map
    flipCounterRef.current++
  }, [])

  useLayoutEffect(() => {
    if (!listRef.current) return
    const oldPositions = positionsRef.current
    if (oldPositions.size === 0) return

    const slots = listRef.current.children
    const animations: { el: HTMLElement; deltaY: number }[] = []

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i] as HTMLElement
      const foodId = slot.dataset.foodId
      if (!foodId) continue

      const oldRect = oldPositions.get(foodId)
      if (!oldRect) continue

      const newRect = slot.getBoundingClientRect()
      const deltaY = oldRect.top - newRect.top

      if (Math.abs(deltaY) > 1) {
        animations.push({ el: slot, deltaY })
      }
    }

    if (animations.length === 0) return

    for (const { el, deltaY } of animations) {
      el.style.transform = `translateY(${deltaY}px)`
      el.style.transition = 'none'
    }

    requestAnimationFrame(() => {
      for (const { el } of animations) {
        el.style.transition = `transform ${ANIM_DURATION}ms ease`
        el.style.transform = ''
      }
    })
  }, [ranking])

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
    ranking,
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
