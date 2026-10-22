import { describe, expect, it } from 'vitest'
import { formatDueDate, isOverdue, todayISO } from './dates'

describe('isOverdue', () => {
  it('is overdue when past due and not done', () => {
    expect(isOverdue('2026-10-20', false, '2026-10-21')).toBe(true)
  })
  it('is not overdue on the due day or later', () => {
    expect(isOverdue('2026-10-21', false, '2026-10-21')).toBe(false)
    expect(isOverdue('2026-10-22', false, '2026-10-21')).toBe(false)
  })
  it('is not overdue when done or without a due date', () => {
    expect(isOverdue('2026-10-20', true, '2026-10-21')).toBe(false)
    expect(isOverdue(null, false, '2026-10-21')).toBe(false)
  })
})

describe('formatDueDate', () => {
  it('formats short and readable', () => {
    expect(formatDueDate('2026-10-05')).toBe('Oct 5, 2026')
  })
})

describe('todayISO', () => {
  it('formats the local date', () => {
    expect(todayISO(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})
