import { render, screen } from '@testing-library/react'
import App from './App'
import { FOODS } from './foods'
import { emptyRanking } from './ranking'
import { createLocalStorage } from './platform/storage.local'

const storage = createLocalStorage('test-ranking')

beforeEach(() => {
  localStorage.clear()
})

describe('App', () => {
  it('renders the heading', () => {
    render(<App initialRanking={emptyRanking()} storage={storage} />)
    expect(screen.getByText('Food Today')).toBeInTheDocument()
  })

  it('renders all food cards', () => {
    render(<App initialRanking={emptyRanking()} storage={storage} />)
    expect(screen.getByText('Pizza')).toBeInTheDocument()
    expect(screen.getByText('Sushi')).toBeInTheDocument()
    expect(screen.getByText('Burger')).toBeInTheDocument()
    expect(screen.getByText('Tacos')).toBeInTheDocument()
    expect(screen.getByText('Pasta')).toBeInTheDocument()
  })

  it('renders ranking slots matching the number of foods', () => {
    render(<App initialRanking={emptyRanking()} storage={storage} />)
    const slots = screen.getAllByText('Empty')
    expect(slots).toHaveLength(FOODS.length)
  })
})
