import { describe, expect, it } from 'vitest'
import html from '../index.html?raw'

describe('index.html', () => {
  const doc = new DOMParser().parseFromString(html, 'text/html')

  it('has the page title', () => {
    expect(doc.title).toBe('Todos · Get things done')
  })

  it('has an inline SVG favicon', () => {
    expect(doc.querySelector('link[rel="icon"]')?.getAttribute('href')).toMatch(/^data:image\/svg\+xml,/)
  })
})
