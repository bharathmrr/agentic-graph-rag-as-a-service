import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText(/Agentic Graph RAG/i)).toBeInTheDocument()
  })

  it('has the correct title', () => {
    render(<App />)
    const titleElement = screen.getByText(/Agentic Graph RAG/i)
    expect(titleElement).toBeInTheDocument()
  })
})
