import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTodo, listTodos, renameTodo, setTodoDone } from './api'

const todo = { id: '1', title: 'Buy milk', done: false, due_date: null, created_at: '2026-10-21T00:00:00Z' }

function mockFetch(status: number, body: unknown) {
  const fn = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

describe('api client', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lists todos', async () => {
    const fetch = mockFetch(200, [todo])
    await expect(listTodos()).resolves.toEqual([todo])
    expect(fetch).toHaveBeenCalledWith('/api/todos', expect.objectContaining({}))
  })

  it('creates a todo with a JSON body', async () => {
    const fetch = mockFetch(201, todo)
    await expect(createTodo('Buy milk')).resolves.toEqual(todo)
    const [url, init] = fetch.mock.calls[0]
    expect(url).toBe('/api/todos')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ title: 'Buy milk' })
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' })
  })

  it('creates a todo with a due date', async () => {
    const fetch = mockFetch(201, { ...todo, due_date: '2026-11-01' })
    await createTodo('Buy milk', '2026-11-01')
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ title: 'Buy milk', due_date: '2026-11-01' })
  })

  it('marks a todo done', async () => {
    const fetch = mockFetch(200, { ...todo, done: true })
    await expect(setTodoDone('1', true)).resolves.toMatchObject({ done: true })
    const [url, init] = fetch.mock.calls[0]
    expect(url).toBe('/api/todos/1')
    expect(init.method).toBe('PATCH')
    expect(JSON.parse(init.body)).toEqual({ done: true })
  })

  it('renames a todo', async () => {
    const fetch = mockFetch(200, { ...todo, title: 'Buy oat milk' })
    await expect(renameTodo('1', 'Buy oat milk')).resolves.toMatchObject({ title: 'Buy oat milk' })
    const [url, init] = fetch.mock.calls[0]
    expect(url).toBe('/api/todos/1')
    expect(init.method).toBe('PATCH')
    expect(JSON.parse(init.body)).toEqual({ title: 'Buy oat milk' })
  })

  it('throws with the status code when the request fails', async () => {
    mockFetch(500, {})
    await expect(listTodos()).rejects.toThrow('Request failed: 500')
  })
})
