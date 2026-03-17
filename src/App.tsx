import { useState, type DragEvent } from 'react'
import './App.css'

interface Food {
  id: string
  name: string
  emoji: string
}

const FOODS: Food[] = [
  { id: 'pizza', name: 'Pizza', emoji: '🍕' },
  { id: 'sushi', name: 'Sushi', emoji: '🍣' },
  { id: 'burger', name: 'Burger', emoji: '🍔' },
  { id: 'tacos', name: 'Tacos', emoji: '🌮' },
  { id: 'pasta', name: 'Pasta', emoji: '🍝' },
  { id: 'sandwich', name: 'Sandwich libanais', emoji: '🥙' },
  { id: 'assiette', name: 'Assiette', emoji: '🍽️' },
  { id: 'ramen', name: 'Ramen', emoji: '🍜' },
  { id: 'viet', name: 'Viet', emoji: '🇻🇳' },
  { id: 'bowl', name: 'Helios bowl', emoji: '🥗' },
  { id: 'focaccia', name: 'Focaccia', emoji: '🫓' },
  { id: 'ravioli', name: 'Ravioli', emoji: '🥟' },
  { id: 'empanadas', name: 'Empanadas', emoji: '🥟' },
  { id: 'otacos', name: "O'Tacos", emoji: '🌯' },
  { id: 'pokebowl', name: 'Pokebowl', emoji: '🐟' },
]

const SLOT_COUNT = 10

function App() {
  const [ranking, setRanking] = useState<(Food | null)[]>(
    Array(SLOT_COUNT).fill(null),
  )
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null)
  const placedIds = new Set(
    ranking.filter((f): f is Food => f !== null).map((f) => f.id),
  )

  const availableFoods = FOODS.filter((f) => !placedIds.has(f.id))

  function onDragStart(e: DragEvent, food: Food) {
    e.dataTransfer.setData('text/plain', food.id)
    e.dataTransfer.effectAllowed = 'move'
    setDraggingId(food.id)
  }

  function onDragEnd() {
    setDraggingId(null)
    setDragOverSlot(null)
  }

  function onSlotDragOver(e: DragEvent, index: number) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverSlot(index)
  }

  function onSlotDragLeave(_e: DragEvent, index: number) {
    if (dragOverSlot === index) setDragOverSlot(null)
  }

  function onSlotDrop(e: DragEvent, targetIndex: number) {
    e.preventDefault()
    setDragOverSlot(null)

    const foodId = e.dataTransfer.getData('text/plain')
    placeFood(foodId, targetIndex)
  }

  function placeFood(foodId: string, targetIndex: number) {
    const food = FOODS.find((f) => f.id === foodId)
    if (!food) return

    setRanking((prev) => {
      const items = prev.filter((f): f is Food => f !== null && f.id !== foodId)

      let insertAt = 0
      for (let i = 0; i < targetIndex; i++) {
        if (prev[i] !== null && prev[i]!.id !== foodId) insertAt++
      }

      items.splice(insertAt, 0, food)

      const next: (Food | null)[] = Array(SLOT_COUNT).fill(null)
      for (let i = 0; i < Math.min(items.length, SLOT_COUNT); i++) {
        next[i] = items[i]
      }

      return next
    })
  }

  function onFoodTap(food: Food) {
    const firstEmpty = ranking.findIndex((f) => f === null)
    if (firstEmpty !== -1) {
      placeFood(food.id, firstEmpty)
    }
  }

  function onSlotTap(index: number) {
    if (ranking[index]) {
      removeFromSlot(index)
    }
  }

  function removeFromSlot(index: number) {
    setRanking((prev) => {
      const next = [...prev]
      next[index] = null
      return next
    })
  }

  function reset() {
    setRanking(Array(SLOT_COUNT).fill(null))
  }

  return (
    <>
      <header className="app-header">
        <h1>Food Today</h1>
        <p>
          <span className="hint-desktop">Drag your picks into the ranking</span>
          <span className="hint-mobile">Tap to add, drag to reorder</span>
        </p>
      </header>

      <div className="layout">
        <section className="pool">
          <h2>Pick your food</h2>
          <div className="pool-cards">
            {availableFoods.map((food) => (
              <div
                key={food.id}
                className={`food-card${draggingId === food.id ? ' dragging' : ''}`}
                draggable
                onDragStart={(e) => onDragStart(e, food)}
                onDragEnd={onDragEnd}
                onClick={() => onFoodTap(food)}
              >
                <span className="emoji">{food.emoji}</span>
                {food.name}
              </div>
            ))}
            {availableFoods.length === 0 && <p>All foods ranked!</p>}
          </div>
        </section>

        <section className="ranking">
          <h2>Your ranking</h2>
          <div className="ranking-list">
            {ranking.map((food, i) => (
              <div
                key={i}
                className={`rank-slot${dragOverSlot === i ? ' drag-over' : ''}${food ? ' filled' : ''}`}
                onDragOver={(e) => onSlotDragOver(e, i)}
                onDragLeave={(e) => onSlotDragLeave(e, i)}
                onDrop={(e) => onSlotDrop(e, i)}
                onClick={() => onSlotTap(i)}
              >
                <span className="rank-number">{i + 1}</span>
                {food ? (
                  <div
                    className="food-card"
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation()
                      onDragStart(e, food)
                    }}
                    onDragEnd={onDragEnd}
                  >
                    <span className="emoji">{food.emoji}</span>
                    <span className="food-name">{food.name}</span>
                    <button
                      className="remove-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFromSlot(i)
                      }}
                      aria-label={`Remove ${food.name}`}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <span className="rank-placeholder">Empty</span>
                )}
              </div>
            ))}
          </div>
          <button className="reset-btn" onClick={reset}>
            Reset
          </button>
        </section>
      </div>
    </>
  )
}

export default App
