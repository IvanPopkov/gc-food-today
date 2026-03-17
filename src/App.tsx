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
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)

  const placedIds = new Set(
    ranking.filter((f): f is Food => f !== null).map((f) => f.id),
  )

  const availableFoods = FOODS.filter((f) => !placedIds.has(f.id))

  // ---- Desktop drag-and-drop ----

  function onDragStart(e: DragEvent, food: Food) {
    e.dataTransfer.setData('text/plain', food.id)
    e.dataTransfer.effectAllowed = 'move'
    setDraggingId(food.id)
    setSelectedFood(null)
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

  // ---- Shared placement logic ----

  function placeFood(foodId: string, targetIndex: number) {
    const food = FOODS.find((f) => f.id === foodId)
    if (!food) return

    setRanking((prev) => {
      const next = [...prev]
      const existingIndex = next.findIndex((f) => f?.id === foodId)
      if (existingIndex !== -1) next[existingIndex] = null

      const displaced = next[targetIndex]
      next[targetIndex] = food
      if (displaced && existingIndex !== -1) {
        next[existingIndex] = displaced
      }

      return next
    })
  }

  // ---- Tap-to-place (mobile) ----

  function onFoodTap(food: Food) {
    setSelectedFood((prev) => (prev?.id === food.id ? null : food))
  }

  function onSlotTap(index: number) {
    if (selectedFood) {
      placeFood(selectedFood.id, index)
      setSelectedFood(null)
    } else if (ranking[index]) {
      // Tap a filled slot to select it for moving
      setSelectedFood(ranking[index])
    }
  }

  function removeFromSlot(index: number) {
    setRanking((prev) => {
      const next = [...prev]
      next[index] = null
      return next
    })
    setSelectedFood(null)
  }

  function reset() {
    setRanking(Array(SLOT_COUNT).fill(null))
    setSelectedFood(null)
  }

  return (
    <>
      <header className="app-header">
        <h1>Food Today</h1>
        <p>
          <span className="hint-desktop">Drag your picks into the ranking</span>
          <span className="hint-mobile">
            Tap a food, then tap a slot to place it
          </span>
        </p>
      </header>

      <div className="layout">
        <section className="pool">
          <h2>Pick your food</h2>
          <div className="pool-cards">
            {availableFoods.map((food) => (
              <div
                key={food.id}
                className={`food-card${draggingId === food.id ? ' dragging' : ''}${selectedFood?.id === food.id ? ' selected' : ''}`}
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
                className={`rank-slot${dragOverSlot === i ? ' drag-over' : ''}${food ? ' filled' : ''}${selectedFood && !food ? ' awaiting' : ''}`}
                onDragOver={(e) => onSlotDragOver(e, i)}
                onDragLeave={(e) => onSlotDragLeave(e, i)}
                onDrop={(e) => onSlotDrop(e, i)}
                onClick={() => onSlotTap(i)}
              >
                <span className="rank-number">{i + 1}</span>
                {food ? (
                  <div
                    className={`food-card${selectedFood?.id === food.id ? ' selected' : ''}`}
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
                  <span className="rank-placeholder">
                    {selectedFood ? 'Tap to place' : 'Empty'}
                  </span>
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
