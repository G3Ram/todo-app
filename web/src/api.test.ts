import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTodo, listTodos, setTodoDone } from './api'

const todo = { id: '1', title: 'Buy milk', done: false, created_at: '2026-10-21T00:00:00Z' }

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

  it('marks a todo done', async () => {
    const fetch = mockFetch(200, { ...todo, done: true })
    await expect(setTodoDone('1', true)).resolves.toMatchObject({ done: true })
    const [url, init] = fetch.mock.calls[0]
    expect(url).toBe('/api/todos/1')
    expect(init.method).toBe('PATCH')
    expect(JSON.parse(init.body)).toEqual({ done: true })
  })

  it('throws with the status code when the request fails', async () => {
    mockFetch(500, {})
    await expect(listTodos()).rejects.toThrow('Request failed: 500')
  })
})
