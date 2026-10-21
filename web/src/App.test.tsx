import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import * as api from './api'

vi.mock('./api')

const todo = (id: string, title: string): api.Todo => ({
  id,
  title,
  done: false,
  created_at: '2026-10-21T00:00:00Z',
})

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows todos from the API', async () => {
    vi.mocked(api.listTodos).mockResolvedValue([todo('1', 'Buy milk')])
    render(<App />)
    expect(await screen.findByText('Buy milk')).toBeInTheDocument()
  })

  it('shows an empty state', async () => {
    vi.mocked(api.listTodos).mockResolvedValue([])
    render(<App />)
    expect(await screen.findByText('Nothing to do yet.')).toBeInTheDocument()
  })

  it('adds a todo', async () => {
    vi.mocked(api.listTodos).mockResolvedValue([])
    vi.mocked(api.createTodo).mockResolvedValue(todo('2', 'Walk dog'))
    render(<App />)

    await userEvent.type(await screen.findByLabelText('New todo'), 'Walk dog')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    expect(api.createTodo).toHaveBeenCalledWith('Walk dog')
    expect(await screen.findByText('Walk dog')).toBeInTheDocument()
    expect(screen.getByLabelText('New todo')).toHaveValue('')
  })

  it('ignores blank input', async () => {
    vi.mocked(api.listTodos).mockResolvedValue([])
    render(<App />)
    await userEvent.type(await screen.findByLabelText('New todo'), '   ')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(api.createTodo).not.toHaveBeenCalled()
  })

  it('shows an error when loading fails', async () => {
    vi.mocked(api.listTodos).mockRejectedValue(new Error('down'))
    render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load todos.')
  })
})
