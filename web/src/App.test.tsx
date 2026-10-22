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

  it('marks a todo done', async () => {
    vi.mocked(api.listTodos).mockResolvedValue([todo('1', 'Buy milk')])
    vi.mocked(api.setTodoDone).mockResolvedValue({ ...todo('1', 'Buy milk'), done: true })
    render(<App />)

    const box = await screen.findByLabelText('Buy milk')
    await userEvent.click(box)

    expect(api.setTodoDone).toHaveBeenCalledWith('1', true)
    expect(box).toBeChecked()
    expect(screen.getByText('Buy milk').closest('li')).toHaveClass('done')
  })

  it('reverts the checkbox and shows an error when update fails', async () => {
    vi.mocked(api.listTodos).mockResolvedValue([todo('1', 'Buy milk')])
    vi.mocked(api.setTodoDone).mockRejectedValue(new Error('down'))
    render(<App />)

    const box = await screen.findByLabelText('Buy milk')
    await userEvent.click(box)

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not update todo.')
    expect(box).not.toBeChecked()
  })

  it('deletes a todo after the API succeeds', async () => {
    vi.mocked(api.listTodos).mockResolvedValue([todo('1', 'Buy milk')])
    vi.mocked(api.deleteTodo).mockResolvedValue(undefined)
    render(<App />)

    await userEvent.click(await screen.findByRole('button', { name: 'Delete Buy milk' }))

    expect(api.deleteTodo).toHaveBeenCalledWith('1')
    expect(screen.queryByText('Buy milk')).not.toBeInTheDocument()
  })

  it('keeps the todo and shows an error when delete fails', async () => {
    vi.mocked(api.listTodos).mockResolvedValue([todo('1', 'Buy milk')])
    vi.mocked(api.deleteTodo).mockRejectedValue(new Error('down'))
    render(<App />)

    await userEvent.click(await screen.findByRole('button', { name: 'Delete Buy milk' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not delete todo.')
    expect(screen.getByText('Buy milk')).toBeInTheDocument()
  })

  describe('editing', () => {
    async function setup() {
      vi.mocked(api.listTodos).mockResolvedValue([todo('1', 'Buy milk')])
      vi.mocked(api.renameTodo).mockResolvedValue(todo('1', 'Buy oat milk'))
      render(<App />)
      await screen.findByText('Buy milk')
    }
    const input = () => screen.getByLabelText('Edit title of Buy milk')

    it('saves on Enter after clicking Edit', async () => {
      await setup()
      await userEvent.click(screen.getByRole('button', { name: 'Edit Buy milk' }))
      await userEvent.clear(input())
      await userEvent.type(input(), 'Buy oat milk{Enter}')
      expect(api.renameTodo).toHaveBeenCalledTimes(1)
      expect(api.renameTodo).toHaveBeenCalledWith('1', 'Buy oat milk')
      expect(await screen.findByText('Buy oat milk')).toBeInTheDocument()
    })

    it('starts editing on double-click and saves on blur', async () => {
      await setup()
      await userEvent.dblClick(screen.getByText('Buy milk'))
      await userEvent.type(input(), ' x')
      await userEvent.tab()
      expect(api.renameTodo).toHaveBeenCalledWith('1', 'Buy milk x')
    })

    it('cancels on Escape', async () => {
      await setup()
      await userEvent.click(screen.getByRole('button', { name: 'Edit Buy milk' }))
      await userEvent.type(input(), ' x{Escape}')
      expect(api.renameTodo).not.toHaveBeenCalled()
      expect(screen.getByText('Buy milk')).toBeInTheDocument()
    })

    it('cancels when the title is blank', async () => {
      await setup()
      await userEvent.click(screen.getByRole('button', { name: 'Edit Buy milk' }))
      await userEvent.clear(input())
      await userEvent.type(input(), '   {Enter}')
      expect(api.renameTodo).not.toHaveBeenCalled()
      expect(screen.getByText('Buy milk')).toBeInTheDocument()
    })

    it('shows an error when rename fails', async () => {
      await setup()
      vi.mocked(api.renameTodo).mockRejectedValue(new Error('down'))
      await userEvent.click(screen.getByRole('button', { name: 'Edit Buy milk' }))
      await userEvent.type(input(), ' x{Enter}')
      expect(await screen.findByRole('alert')).toHaveTextContent('Could not rename todo.')
      expect(screen.getByText('Buy milk')).toBeInTheDocument()
    })
  })

  describe('filters and count', () => {
    const done = (id: string, title: string) => ({ ...todo(id, title), done: true })
    async function setup() {
      vi.mocked(api.listTodos).mockResolvedValue([todo('1', 'Buy milk'), done('2', 'Walk dog')])
      render(<App />)
      await screen.findByText('Buy milk')
    }

    it('filters by Active and Done and marks the selected button', async () => {
      await setup()
      const all = screen.getByRole('button', { name: 'All' })
      expect(all).toHaveAttribute('aria-pressed', 'true')

      await userEvent.click(screen.getByRole('button', { name: 'Active' }))
      expect(screen.getByRole('button', { name: 'Active' })).toHaveAttribute('aria-pressed', 'true')
      expect(all).toHaveAttribute('aria-pressed', 'false')
      expect(screen.getByText('Buy milk')).toBeInTheDocument()
      expect(screen.queryByText('Walk dog')).not.toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'Done' }))
      expect(screen.queryByText('Buy milk')).not.toBeInTheDocument()
      expect(screen.getByText('Walk dog')).toBeInTheDocument()

      await userEvent.click(all)
      expect(screen.getByText('Buy milk')).toBeInTheDocument()
      expect(screen.getByText('Walk dog')).toBeInTheDocument()
    })

    it('says "3 items left" for several active todos', async () => {
      vi.mocked(api.listTodos).mockResolvedValue([todo('1', 'A'), todo('2', 'B'), todo('3', 'C')])
      render(<App />)
      expect(await screen.findByText('3 items left')).toBeInTheDocument()
    })

    it('says "1 item left" for one active todo', async () => {
      await setup()
      expect(screen.getByText('1 item left')).toBeInTheDocument()
    })

    it('clear done deletes every done todo', async () => {
      await setup()
      vi.mocked(api.deleteTodo).mockResolvedValue(undefined)
      await userEvent.click(screen.getByRole('button', { name: 'Clear done' }))
      expect(api.deleteTodo).toHaveBeenCalledTimes(1)
      expect(api.deleteTodo).toHaveBeenCalledWith('2')
      expect(screen.queryByText('Walk dog')).not.toBeInTheDocument()
      expect(screen.getByText('Buy milk')).toBeInTheDocument()
    })

    it('clear done keeps todos whose delete failed and shows an error', async () => {
      await setup()
      vi.mocked(api.deleteTodo).mockRejectedValue(new Error('down'))
      await userEvent.click(screen.getByRole('button', { name: 'Clear done' }))
      expect(await screen.findByRole('alert')).toHaveTextContent('Could not clear all done todos.')
      expect(screen.getByText('Walk dog')).toBeInTheDocument()
    })
  })

  it('shows an error when loading fails', async () => {
    vi.mocked(api.listTodos).mockRejectedValue(new Error('down'))
    render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load todos.')
  })
})
