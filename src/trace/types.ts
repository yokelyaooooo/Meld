export type TraceMode = 'read' | 'synthesize' | 'brief'
export type EvidenceStance = 'supports' | 'challenges' | 'context'

export interface TraceSource {
  id: string
  title: string
  authors: string
  year: number
  url: string
  summary: string
  tags: string[]
  notes: string
  color: string
}

export interface EvidenceItem {
  id: string
  sourceId: string
  theme: string
  claim: string
  location: string
  stance: EvidenceStance
  confidence: 1 | 2 | 3 | 4 | 5
  included: boolean
}

export interface TraceWorkspace {
  version: 1
  title: string
  question: string
  thesis: string
  sources: TraceSource[]
  evidence: EvidenceItem[]
  activeSourceId: string
  updatedAt: string
}

export interface TraceRecipe {
  mode: TraceMode
  label: string
  description: string
  density: 'focused' | 'matrix' | 'editorial'
  inspector: 'source' | 'capture' | 'outline'
  visibleTools: string[]
}

export type TraceDensity = 'compact' | 'balanced' | 'spacious'
export type TraceAccent = 'ember' | 'ocean' | 'jade' | 'violet'
export type TraceLens = 'all' | 'included' | 'challenges' | 'high-confidence'
export type TraceSourceSort = 'workspace' | 'year-desc' | 'year-asc' | 'title'

/** A deliberately small, data-only UI language. Models never emit executable UI. */
export interface TraceCustomization {
  version: 1
  mode: TraceMode
  density: TraceDensity
  accent: TraceAccent
  lens: TraceLens
  sourceSort: TraceSourceSort
  inspector: boolean
  surfaceTitle: string
  rationale: string
  guidance: string[]
}
