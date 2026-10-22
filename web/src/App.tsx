import { useEffect, useRef, useState, type FormEvent } from 'react'
import { formatDueDate, isOverdue, todayISO } from './dates'
import { createTodo, deleteTodo, listTodos, renameTodo, setTodoDone, type Todo } from './api'

const FILTERS = ['All', 'Active', 'Done'] as const
type Filter = (typeof FILTERS)[number]

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('All')
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null)
  const editDone = useRef(false) // Enter/Escape unmount the input, which can still fire a blur

  function startEdit(todo: Todo) {
    editDone.current = false
    setEditing({ id: todo.id, text: todo.title })
  }

  async function finishEdit(todo: Todo, save: boolean) {
    if (editDone.current || !editing) return
    editDone.current = true
    const text = editing.text.trim()
    setEditing(null)
    if (!save || !text || text === todo.title) return
    try {
      const updated = await renameTodo(todo.id, text)
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)))
      setError(null)
    } catch {
      setError('Could not rename todo.')
    }
  }

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
      const todo = await createTodo(trimmed, dueDate || undefined)
      setTodos((prev) => [...prev, todo])
      setTitle('')
      setDueDate('')
      setError(null)
    } catch {
      setError('Could not add todo.')
    }
  }

  async function handleToggle(id: string, done: boolean) {
    const setDone = (value: boolean) =>
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: value } : t)))
    setDone(done)
    try {
      await setTodoDone(id, done)
      setError(null)
    } catch {
      setDone(!done)
      setError('Could not update todo.')
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTodo(id)
      setTodos((prev) => prev.filter((t) => t.id !== id))
      setError(null)
    } catch {
      setError('Could not delete todo.')
    }
  }

  const today = todayISO()

  async function handleClearDone() {
    const done = todos.filter((t) => t.done)
    const results = await Promise.allSettled(done.map((t) => deleteTodo(t.id)))
    const removed = new Set(done.filter((_, i) => results[i].status === 'fulfilled').map((t) => t.id))
    setTodos((prev) => prev.filter((t) => !removed.has(t.id)))
    setError(removed.size < done.length ? 'Could not clear all done todos.' : null)
  }

  const left = todos.filter((t) => !t.done).length
  const visible = todos.filter((t) => filter === 'All' || t.done === (filter === 'Done'))

  return (
    <main className="app">
      <header className="header">
        <h1>Todos</h1>
        {!loading && todos.length > 0 && (
          <p className="count">
            {left} {left === 1 ? 'item' : 'items'} left
          </p>
        )}
      </header>

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
        <label htmlFor="new-due" className="visually-hidden">
          Due date
        </label>
        <input id="new-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <button type="submit">Add</button>
      </form>

      {error && <p role="alert">{error}</p>}

      {loading ? (
        <p className="loading">Loading...</p>
      ) : todos.length === 0 ? (
        <p className="empty">Nothing to do yet.</p>
      ) : (
        <>
        <div className="filters">
          {FILTERS.map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <ul className="todo-list">
          {visible.map((todo) => (
            <li key={todo.id} className={todo.done ? 'done' : undefined}>
              {editing?.id === todo.id ? (
                <input
                  className="edit-input"
                  aria-label={`Edit title of ${todo.title}`}
                  value={editing.text}
                  maxLength={200}
                  autoFocus
                  onChange={(e) => setEditing({ id: todo.id, text: e.target.value })}
                  onBlur={() => finishEdit(todo, true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') finishEdit(todo, true)
                    if (e.key === 'Escape') finishEdit(todo, false)
                  }}
                />
              ) : (
                <label>
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={(e) => handleToggle(todo.id, e.target.checked)}
                  />
                  <span onDoubleClick={() => startEdit(todo)}>{todo.title}</span>
                </label>
              )}
              {todo.due_date && (
                <span className={isOverdue(todo.due_date, todo.done, today) ? 'due overdue' : 'due'}>
                  {isOverdue(todo.due_date, todo.done, today) && 'Overdue: '}
                  {formatDueDate(todo.due_date)}
                </span>
              )}
              <button type="button" className="row-action" aria-label={`Edit ${todo.title}`} onClick={() => startEdit(todo)}>
                Edit
              </button>
              <button type="button" className="row-action delete" aria-label={`Delete ${todo.title}`} onClick={() => handleDelete(todo.id)}>
                ×
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="clear-done" onClick={handleClearDone} disabled={left === todos.length}>
          Clear done
        </button>
        </>
      )}
    </main>
  )
}
