import { describe, expect, it } from 'vitest'
import { cloneDemoWorkspace, createEmptyWorkspace, proposeTraceMode, removeSource, validateWorkspace, workspaceToMarkdown } from './store'

describe('Trace workspace', () => {
  it('removes orphaned evidence with a source', () => {
    const workspace = cloneDemoWorkspace()
    const result = removeSource(workspace, 'cepeda-2006')
    expect(result.sources.some((source) => source.id === 'cepeda-2006')).toBe(false)
    expect(result.evidence.some((item) => item.sourceId === 'cepeda-2006')).toBe(false)
  })

  it('maps work intent to a radically different surface', () => {
    expect(proposeTraceMode('Compare contradictions across the literature', 'read').mode).toBe('synthesize')
    expect(proposeTraceMode('Help me prepare a decision brief', 'read').mode).toBe('brief')
  })

  it('exports only selected evidence with traceable references', () => {
    const markdown = workspaceToMarkdown(cloneDemoWorkspace())
    expect(markdown).toContain('## References')
    expect(markdown).toContain('Cepeda, Pashler, Vul, Wixted & Rohrer')
    expect(markdown).not.toContain('Repeated studying increased learners’ confidence')
  })

  it('rejects malformed imports', () => {
    expect(validateWorkspace({ version: 1, title: 'broken' })).toBe(false)
    const orphaned = cloneDemoWorkspace()
    orphaned.evidence[0].sourceId = 'missing-source'
    expect(validateWorkspace(orphaned)).toBe(false)
  })

  it('creates a usable empty workspace', () => {
    const workspace = createEmptyWorkspace()
    expect(validateWorkspace(workspace)).toBe(true)
    expect(workspace.sources).toHaveLength(0)
  })
})
