import { useEffect, useState, type FormEvent } from 'react'
import { createTodo, listTodos, type Todo } from './api'

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listTodos()
      .then(setTodos)
      .catch(() => setError('Could not load todos.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    try {
      const todo = await createTodo(trimmed)
      setTodos((prev) => [...prev, todo])
      setTitle('')
      setError(null)
    } catch {
      setError('Could not add todo.')
    }
  }

  return (
    <main className="app">
      <h1>Todos</h1>

      <form onSubmit={handleSubmit} className="add-form">
        <label htmlFor="new-todo" className="visually-hidden">
          New todo
        </label>
        <input
          id="new-todo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          maxLength={200}
        />
        <button type="submit">Add</button>
      </form>

      {error && <p role="alert">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : todos.length === 0 ? (
        <p className="empty">Nothing to do yet.</p>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id}>{todo.title}</li>
          ))}
        </ul>
      )}
    </main>
  )
}
