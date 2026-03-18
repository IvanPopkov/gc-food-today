import './App.css'
import { PODIUM_SIZE } from './foods'
import { useRanking } from './useRanking'

function App() {
  const {
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
  } = useRanking()

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
          <div
            className="ranking-list"
            ref={listRef}
            onDragOver={onListDragOver}
            onDragLeave={onListDragLeave}
            onDrop={onListDrop}
          >
            {displayRanking.map((food, i) => (
              <div
                key={food?.id ?? `empty-${i}`}
                data-food-id={food?.id}
                className={`rank-slot${insertPos !== null && insertPos <= i && food ? ' shift-down' : ''}${food ? ' filled' : ''}`}
                onClick={() => onSlotTap(i)}
              >
                <span className="rank-number">
                  {i < PODIUM_SIZE ? i + 1 : ''}
                </span>
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
          <div className="ranking-actions">
            <button className="propose-btn" onClick={randomize}>
              Propose
            </button>
            <button className="reset-btn" onClick={reset}>
              Reset
            </button>
          </div>
        </section>
      </div>
    </>
  )
}

export default App
