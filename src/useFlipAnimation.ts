import { useRef, useLayoutEffect, useCallback, type RefObject } from 'react'
import { ANIM_DURATION } from './foods'
import type { Ranking } from './ranking'

export function useFlipAnimation(
  listRef: RefObject<HTMLDivElement | null>,
  ranking: Ranking,
) {
  const positionsRef = useRef<Map<string, DOMRect>>(new Map())

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
  }, [listRef])

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
  }, [ranking, listRef])

  return { capturePositions }
}
