export interface Food {
  id: string
  name: string
  emoji: string
}

export const FOODS: Food[] = [
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

export const SLOT_COUNT = 10
export const ANIM_DURATION = 200
