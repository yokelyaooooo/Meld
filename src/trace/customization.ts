import type { TraceCustomization, TraceWorkspace } from './types'

export const defaultCustomization: TraceCustomization = {
  version: 1,
  mode: 'read',
  density: 'balanced',
  accent: 'ember',
  lens: 'all',
  sourceSort: 'workspace',
  inspector: true,
  surfaceTitle: 'Deep read',
  rationale: 'Use the default source-focused workspace.',
  guidance: ['Capture one atomic claim at a time.'],
}

const expectedKeys = ['version', 'mode', 'density', 'accent', 'lens', 'sourceSort', 'inspector', 'surfaceTitle', 'rationale', 'guidance'].sort()

export function validateCustomization(value: unknown): value is TraceCustomization {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const candidate = value as Partial<TraceCustomization>
  const keys = Object.keys(value).sort()
  return keys.length === expectedKeys.length
    && keys.every((key, index) => key === expectedKeys[index])
    && candidate.version === 1
    && ['read', 'synthesize', 'brief'].includes(String(candidate.mode))
    && ['compact', 'balanced', 'spacious'].includes(String(candidate.density))
    && ['ember', 'ocean', 'jade', 'violet'].includes(String(candidate.accent))
    && ['all', 'included', 'challenges', 'high-confidence'].includes(String(candidate.lens))
    && ['workspace', 'year-desc', 'year-asc', 'title'].includes(String(candidate.sourceSort))
    && typeof candidate.inspector === 'boolean'
    && isBoundedString(candidate.surfaceTitle, 1, 72)
    && isBoundedString(candidate.rationale, 1, 360)
    && Array.isArray(candidate.guidance)
    && candidate.guidance.length >= 1
    && candidate.guidance.length <= 4
    && candidate.guidance.every((item) => isBoundedString(item, 1, 140))
}

function isBoundedString(value: unknown, minimum: number, maximum: number): value is string {
  return typeof value === 'string' && value.trim().length >= minimum && value.length <= maximum
}

export function shapeWorkspace(workspace: TraceWorkspace, customization: TraceCustomization): TraceWorkspace {
  const sources = [...workspace.sources]
  if (customization.sourceSort === 'year-desc') sources.sort((a, b) => b.year - a.year)
  if (customization.sourceSort === 'year-asc') sources.sort((a, b) => a.year - b.year)
  if (customization.sourceSort === 'title') sources.sort((a, b) => a.title.localeCompare(b.title))

  const evidence = workspace.evidence.filter((item) => {
    if (customization.lens === 'included') return item.included
    if (customization.lens === 'challenges') return item.stance === 'challenges'
    if (customization.lens === 'high-confidence') return item.confidence >= 4
    return true
  })

  return { ...workspace, sources, evidence }
}

export function customizationSummary(customization: TraceCustomization) {
  return [
    customization.mode,
    customization.density,
    `${customization.accent} accent`,
    `${customization.lens} evidence`,
    customization.sourceSort === 'workspace' ? 'original source order' : customization.sourceSort,
  ]
}
