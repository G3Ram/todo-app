// All backend calls live here. Components never call fetch directly.

export type Todo = {
  id: string
  title: string
  done: boolean
  created_at: string
}

// Local dev uses the Vite proxy (/api). Deployed builds set VITE_API_URL to the Cloud Run URL.
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function listTodos(): Promise<Todo[]> {
  return request<Todo[]>('/todos')
}

export function setTodoDone(id: string, done: boolean): Promise<Todo> {
  return request<Todo>(`/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ done }),
  })
}

export function createTodo(title: string): Promise<Todo> {
  return request<Todo>('/todos', {
    method: 'POST',
    body: JSON.stringify({ title }),
  })
}
