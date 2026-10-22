// All backend calls live here. Components never call fetch directly.

export type Todo = {
  id: string
  title: string
  done: boolean
  due_date: string | null
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
  if (res.status === 204) return undefined as T
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

export function renameTodo(id: string, title: string): Promise<Todo> {
  return request<Todo>(`/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  })
}

export function deleteTodo(id: string): Promise<void> {
  return request<void>(`/todos/${id}`, { method: 'DELETE' })
}

export function createTodo(title: string, dueDate?: string): Promise<Todo> {
  return request<Todo>('/todos', {
    method: 'POST',
    body: JSON.stringify(dueDate ? { title, due_date: dueDate } : { title }),
  })
}