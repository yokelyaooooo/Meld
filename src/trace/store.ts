import { demoWorkspace } from './demo'
import type { EvidenceItem, TraceMode, TraceSource, TraceWorkspace } from './types'

export const TRACE_STORAGE_KEY = 'meld:trace-workspace:v1'

export function cloneDemoWorkspace(): TraceWorkspace {
  return structuredClone(demoWorkspace)
}

export function createEmptyWorkspace(): TraceWorkspace {
  return {
    version: 1,
    title: 'Untitled Evidence Review',
    question: 'What do I need to understand or decide?',
    thesis: '',
    sources: [],
    evidence: [],
    activeSourceId: '',
    updatedAt: new Date().toISOString(),
  }
}

export function loadWorkspace(storage: Pick<Storage, 'getItem'> = localStorage): TraceWorkspace {
  try {
    const raw = storage.getItem(TRACE_STORAGE_KEY)
    if (!raw) return cloneDemoWorkspace()
    const candidate = JSON.parse(raw) as TraceWorkspace
    return validateWorkspace(candidate) ? candidate : cloneDemoWorkspace()
  } catch {
    return cloneDemoWorkspace()
  }
}

export function saveWorkspace(workspace: TraceWorkspace, storage: Pick<Storage, 'setItem'> = localStorage) {
  storage.setItem(TRACE_STORAGE_KEY, JSON.stringify({ ...workspace, updatedAt: new Date().toISOString() }))
}

export function validateWorkspace(value: unknown): value is TraceWorkspace {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<TraceWorkspace>
  if (!(candidate.version === 1
    && typeof candidate.title === 'string'
    && typeof candidate.question === 'string'
    && typeof candidate.thesis === 'string'
    && typeof candidate.activeSourceId === 'string'
    && typeof candidate.updatedAt === 'string'
    && Array.isArray(candidate.sources)
    && Array.isArray(candidate.evidence)
    && candidate.sources.every((source) => typeof source?.id === 'string'
      && typeof source?.title === 'string'
      && typeof source?.authors === 'string'
      && typeof source?.year === 'number'
      && typeof source?.url === 'string'
      && typeof source?.summary === 'string'
      && Array.isArray(source?.tags)
      && source.tags.every((tag) => typeof tag === 'string')
      && typeof source?.notes === 'string'
      && typeof source?.color === 'string')
    && candidate.evidence.every((item) => typeof item?.id === 'string'
      && typeof item?.sourceId === 'string'
      && typeof item?.theme === 'string'
      && typeof item?.claim === 'string'
      && typeof item?.location === 'string'
      && ['supports', 'challenges', 'context'].includes(item?.stance)
      && Number.isInteger(item?.confidence)
      && Number(item.confidence) >= 1
      && Number(item.confidence) <= 5
      && typeof item?.included === 'boolean'))) return false

  const sourceIds = new Set(candidate.sources.map((source) => source.id))
  return (!candidate.activeSourceId || sourceIds.has(candidate.activeSourceId))
    && candidate.evidence.every((item) => sourceIds.has(item.sourceId))
}

export function addSource(workspace: TraceWorkspace, source: TraceSource): TraceWorkspace {
  return { ...workspace, sources: [...workspace.sources, source], activeSourceId: source.id }
}

export function removeSource(workspace: TraceWorkspace, sourceId: string): TraceWorkspace {
  const sources = workspace.sources.filter((source) => source.id !== sourceId)
  return {
    ...workspace,
    sources,
    evidence: workspace.evidence.filter((item) => item.sourceId !== sourceId),
    activeSourceId: workspace.activeSourceId === sourceId ? (sources[0]?.id ?? '') : workspace.activeSourceId,
  }
}

export function addEvidence(workspace: TraceWorkspace, evidence: EvidenceItem): TraceWorkspace {
  return { ...workspace, evidence: [evidence, ...workspace.evidence] }
}

export function proposeTraceMode(prompt: string, current: TraceMode): { mode: TraceMode; reason: string } {
  const value = prompt.toLowerCase()
  if (/exam|remember|recall|understand|learn|精读|理解|考试|记忆/.test(value)) return { mode: 'read', reason: 'Focus on one source and retrieve key ideas from memory.' }
  if (/compare|pattern|gap|contradiction|literature|对比|综述|差异|矛盾|缺口/.test(value)) return { mode: 'synthesize', reason: 'Lay sources against shared themes to expose agreement and gaps.' }
  if (/brief|write|decision|present|argument|report|写作|汇报|决策|报告|论证/.test(value)) return { mode: 'brief', reason: 'Compose a concise argument from selected, traceable evidence.' }
  const next: TraceMode = current === 'read' ? 'synthesize' : current === 'synthesize' ? 'brief' : 'read'
  return { mode: next, reason: 'Move to the next stage of the evidence workflow.' }
}

export function workspaceToMarkdown(workspace: TraceWorkspace): string {
  const included = workspace.evidence.filter((item) => item.included)
  const references = Array.from(new Set(included.map((item) => item.sourceId)))
    .map((id) => workspace.sources.find((source) => source.id === id))
    .filter((source): source is TraceSource => Boolean(source))

  return [
    `# ${workspace.title}`,
    '',
    `**Question:** ${workspace.question}`,
    '',
    '## Working position',
    '',
    workspace.thesis || '_No thesis written yet._',
    '',
    '## Evidence',
    '',
    ...included.flatMap((item, index) => {
      const source = workspace.sources.find((entry) => entry.id === item.sourceId)
      return [`${index + 1}. **${item.theme} — ${item.stance}.** ${item.claim} ([${source?.authors ?? 'Unknown'}, ${source?.year ?? 'n.d.'}](${source?.url ?? '#'}), ${item.location})`, '']
    }),
    '## References',
    '',
    ...references.map((source) => `- ${source.authors} (${source.year}). [${source.title}](${source.url})`),
    '',
    `---`,
    `Exported from Meld / Trace on ${new Date().toLocaleDateString()}.`,
  ].join('\n')
}
