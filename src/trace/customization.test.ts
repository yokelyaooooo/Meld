import { describe, expect, it } from 'vitest'
import { cloneDemoWorkspace } from './store'
import { defaultCustomization, shapeWorkspace, validateCustomization } from './customization'

describe('bounded interface customization', () => {
  it('accepts the complete data-only recipe', () => {
    expect(validateCustomization(defaultCustomization)).toBe(true)
  })

  it('rejects executable or unknown fields', () => {
    expect(validateCustomization({ ...defaultCustomization, script: 'alert(1)' })).toBe(false)
    expect(validateCustomization({ ...defaultCustomization, mode: 'terminal' })).toBe(false)
  })

  it('filters and sorts a view without mutating source data', () => {
    const workspace = cloneDemoWorkspace()
    const shaped = shapeWorkspace(workspace, { ...defaultCustomization, lens: 'challenges', sourceSort: 'year-desc' })
    expect(shaped.evidence.every((item) => item.stance === 'challenges')).toBe(true)
    expect(workspace.evidence.length).toBeGreaterThan(shaped.evidence.length)
    expect(workspace.sources[0]).toEqual(cloneDemoWorkspace().sources[0])
  })
})
