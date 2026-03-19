import { useRef, useState, useEffect, type DragEvent } from 'react'
import { FOODS, SLOT_COUNT, ANIM_DURATION, type Food } from './foods'
import {
  type Ranking,
  emptyRanking,
  placeFoodInRanking,
  removeFromRanking,
  getPlacedIds,
  filledCount,
  randomRanking,
} from './ranking'
import { useFlipAnimation } from './useFlipAnimation'
import type { RankingStorage } from './platform/storage'

interface UseRankingOptions {
  initialRanking: Ranking
  storage: RankingStorage
}

// 1x1 transparent image to hide the native drag ghost.
const TRANSPARENT_IMG = (() => {
  const img = document.createElement('img')
  img.src =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
  return img
})()

export function useRanking({ initialRanking, storage }: UseRankingOptions) {
  const [ranking, setRanking] = useState<Ranking>(initialRanking)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [insertPos, setInsertPos] = useState<number | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const droppedInRankingRef = useRef(false)
  const floatingRef = useRef<HTMLDivElement | null>(null)

  const { capturePositions } = useFlipAnimation(listRef, ranking)

  useEffect(() => {
    storage.save(ranking)
  }, [ranking, storage])

  const placedIds = getPlacedIds(ranking)
  const availableFoods = FOODS.filter((f) => !placedIds.has(f.id))

  const displayRanking = ranking

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

  function createFloating(food: Food, x: number, y: number) {
    const el = document.createElement('div')
    el.className = 'food-card'
    el.innerHTML = `<span class="emoji">${food.emoji}</span>${food.name}`
    Object.assign(el.style, {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      transform: 'translate(-50%, -50%)',
      zIndex: '9999',
      pointerEvents: 'none',
    })
    document.body.appendChild(el)
    floatingRef.current = el
  }

  function moveFloating(x: number, y: number) {
    if (floatingRef.current) {
      floatingRef.current.style.left = `${x}px`
      floatingRef.current.style.top = `${y}px`
    }
  }

  function animateFloatingTo(
    targetX: number,
    targetY: number,
    onDone: () => void,
  ) {
    const el = floatingRef.current
    if (!el) {
      onDone()
      return
    }
    Object.assign(el.style, {
      transition: `all ${ANIM_DURATION * 1.5}ms ease`,
    })
    requestAnimationFrame(() => {
      el.style.left = `${targetX}px`
      el.style.top = `${targetY}px`
      el.style.opacity = '0.5'
    })
    setTimeout(() => {
      removeFloating()
      onDone()
    }, ANIM_DURATION * 1.5)
  }

  function removeFloating() {
    if (floatingRef.current) {
      floatingRef.current.remove()
      floatingRef.current = null
    }
  }

  function onDragStart(e: DragEvent, food: Food) {
    e.dataTransfer.setData('text/plain', food.id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setDragImage(TRANSPARENT_IMG, 0, 0)

    setDraggingId(food.id)
    createFloating(food, e.clientX, e.clientY)

    // If dragging from the ranking, remove it after the browser
    // has registered the drag operation.
    const idx = ranking.findIndex((f) => f?.id === food.id)
    if (idx !== -1) {
      requestAnimationFrame(() => {
        updateRanking((prev) => removeFromRanking(prev, idx))
      })
    }

    // Document-level dragover: tracks cursor AND makes areas outside
    // the ranking a valid drop target so the drop event always fires.
    // Uses bubble phase so the ranking list's own dragover fires first.
    const handleDragOver = (de: globalThis.DragEvent) => {
      de.preventDefault()
      moveFloating(de.clientX, de.clientY)
    }

    // Document-level drop: catches drops anywhere on the page.
    // For ranking drops, onListDrop fires first (via bubbling) and
    // sets droppedInRankingRef. Then this handler cleans up.
    const handleDrop = (de: globalThis.DragEvent) => {
      de.preventDefault()
      cleanup()

      if (droppedInRankingRef.current) {
        droppedInRankingRef.current = false
        removeFloating()
        setDraggingId(null)
        setInsertPos(null)
        return
      }

      // Animate floating element to the pool card.
      requestAnimationFrame(() => {
        const poolCard = document.querySelector(
          `[data-pool-food-id="${food.id}"]`,
        ) as HTMLElement | null

        if (!poolCard) {
          removeFloating()
          setDraggingId(null)
          setInsertPos(null)
          return
        }

        const rect = poolCard.getBoundingClientRect()
        animateFloatingTo(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          () => {
            setDraggingId(null)
            setInsertPos(null)
          },
        )
      })
    }

    const cleanup = () => {
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('drop', handleDrop)
    }

    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('drop', handleDrop)
  }

  function onDragEnd() {
    // Handled by the document-level dragend listener above.
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
    droppedInRankingRef.current = true
    const foodId = e.dataTransfer.getData('text/plain')
    if (insertPos !== null) {
      placeFood(foodId, insertPos)
    }
    setInsertPos(null)
    setDraggingId(null)
    removeFloating()
  }

  function onFoodTap(food: Food) {
    const count = filledCount(ranking)
    if (count < SLOT_COUNT) {
      placeFood(food.id, count)
    }
  }

  function onSlotTap(index: number) {
    if (draggingId) return
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
