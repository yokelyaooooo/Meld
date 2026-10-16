import { describe, expect, it } from 'vitest'
import { proposePatch, validateRecipe } from './engine'
import { cloneRecipe } from './recipes'

describe('Meld patch engine', () => {
  it('turns a field constraint into a bounded recipe patch', () => {
    const result = proposePatch(cloneRecipe('resident'), 'I am a field volunteer with one hand and patchy signal')
    expect(result.next.context.role).toBe('responder')
    expect(result.next.context.oneHanded).toBe(true)
    expect(result.next.context.connectivity).toBe('offline')
    expect(result.operations.length).toBeGreaterThan(2)
  })

  it('blocks capabilities outside the current role', () => {
    const recipe = cloneRecipe('resident')
    recipe.blocks.push({ id: 'unsafe', type: 'triage-stack', title: 'Dispatch', capability: 'dispatch_team', importance: 10, span: 1 })
    expect(validateRecipe(recipe)).toContain('resident cannot use Dispatch a response team')
  })

  it('never invents a capability for unknown language', () => {
    const result = proposePatch(cloneRecipe('resident'), 'Make this feel more focused')
    expect(result.operations).toHaveLength(1)
    expect(validateRecipe(result.next)).toHaveLength(0)
  })
})
