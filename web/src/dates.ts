// "today" is passed in (YYYY-MM-DD) so these stay pure and testable.
export function isOverdue(dueDate: string | null, done: boolean, today: string): boolean {
  return dueDate !== null && !done && dueDate < today
}

export function formatDueDate(dueDate: string): string {
  // Parse and format as UTC so the date doesn't shift with the local time zone.
  return new Date(`${dueDate}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function todayISO(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`
}
