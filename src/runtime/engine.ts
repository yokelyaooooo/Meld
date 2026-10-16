import { capabilities } from './manifest'
import { cloneRecipe } from './recipes'
import type { BlockSpec, InterfaceRecipe, PatchOperation, PatchResult, Role } from './types'

const uid = () => Math.random().toString(36).slice(2, 9)

function operation(op: PatchOperation['op'], path: string, before: unknown, after: unknown, reason: string): PatchOperation {
  return { op, path, before, after, reason }
}

function compactForField(recipe: InterfaceRecipe, operations: PatchOperation[]) {
  const before = recipe.context.density
  recipe.context.density = 'compact'
  recipe.context.oneHanded = true
  operations.push(operation('replace', '/context/density', before, 'compact', 'Reduce scanning and reach distance in the field.'))
  operations.push(operation('replace', '/context/oneHanded', false, true, 'Keep primary actions in thumb reach.'))
  recipe.blocks = recipe.blocks.map((block) => ({ ...block, span: block.type === 'quick-report' ? 1 : block.span }))
}

function offlineFirst(recipe: InterfaceRecipe, operations: PatchOperation[]) {
  const before = recipe.context.connectivity
  recipe.context.connectivity = 'offline'
  operations.push(operation('replace', '/context/connectivity', before, 'offline', 'Prefer cached data and queue writes for later sync.'))
}

function prioritizeMedical(recipe: InterfaceRecipe, operations: PatchOperation[]) {
  const triage: BlockSpec = { id: `medical-${uid()}`, type: 'triage-stack', title: 'Medical priority', capability: 'read_incidents', importance: 10, span: 3 }
  recipe.blocks = [triage, ...recipe.blocks.filter((block) => block.type !== 'activity-feed')]
  operations.push(operation('add', '/blocks/0', undefined, triage, 'Put medical needs ahead of informational updates.'))
}

function calmResident(recipe: InterfaceRecipe, operations: PatchOperation[]) {
  const before = recipe.context.density
  recipe.context.density = 'calm'
  recipe.blocks = recipe.blocks.filter((block) => ['safety-hero', 'nearby-shelters', 'personal-checklist'].includes(block.type))
  operations.push(operation('replace', '/context/density', before, 'calm', 'Lower cognitive load during a stressful moment.'))
  operations.push(operation('remove', '/blocks/activity', 'Verified updates', undefined, 'Hide non-essential live detail.'))
}

function highContrast(recipe: InterfaceRecipe, operations: PatchOperation[]) {
  recipe.context.highContrast = true
  operations.push(operation('replace', '/context/highContrast', false, true, 'Increase outdoor readability.'))
}

export function validateRecipe(recipe: InterfaceRecipe): string[] {
  const warnings: string[] = []
  for (const block of recipe.blocks) {
    const capability = capabilities.find((item) => item.id === block.capability)
    if (!capability) warnings.push(`Unknown capability: ${block.capability}`)
    else if (!capability.allowedRoles.includes(recipe.context.role)) {
      warnings.push(`${recipe.context.role} cannot use ${capability.label}`)
    }
  }
  if (!recipe.blocks.length) warnings.push('An interface must keep at least one usable block.')
  return warnings
}

export function proposePatch(current: InterfaceRecipe, prompt: string): PatchResult {
  const normalized = prompt.toLowerCase()
  const operations: PatchOperation[] = []
  let next = structuredClone(current)

  const requestedRole: Role | undefined = normalized.match(/resident|neighbor|family|居民|家庭/) ? 'resident'
    : normalized.match(/responder|volunteer|driver|field|志愿|现场|司机/) ? 'responder'
      : normalized.match(/coordinator|command|manager|协调|指挥/) ? 'coordinator'
        : undefined

  if (requestedRole && requestedRole !== current.context.role) {
    next = cloneRecipe(requestedRole)
    operations.push(operation('replace', '/recipe', current.name, next.name, `Switch to the ${requestedRole} job-to-be-done.`))
  }

  if (normalized.match(/one hand|one-handed|thumb|walking|glove|单手|走路|手套/)) compactForField(next, operations)
  if (normalized.match(/offline|low signal|patchy|fragile|断网|弱网|离线/)) offlineFirst(next, operations)
  if (normalized.match(/medical|injury|medicine|urgent|医疗|受伤|药|紧急/)) prioritizeMedical(next, operations)
  if (normalized.match(/calm|simple|older|elder|stress|简单|老人|冷静/)) calmResident(next, operations)
  if (normalized.match(/sun|contrast|outdoor|bright|阳光|高对比|户外/)) highContrast(next, operations)

  if (!operations.length) {
    const before = next.context.density
    next.context.density = before === 'calm' ? 'compact' : 'calm'
    operations.push(operation('replace', '/context/density', before, next.context.density, 'Make a conservative, reversible density adjustment.'))
  }

  const warnings = validateRecipe(next)
  return {
    id: `patch-${uid()}`,
    prompt,
    status: warnings.length ? 'blocked' : operations.some((item) => item.after === 'offline') ? 'review' : 'safe',
    summary: `${operations.length} bounded change${operations.length === 1 ? '' : 's'} · no new data access`,
    operations,
    next: { ...next, id: `${next.id}-${uid()}`, name: operations.length > 1 ? 'My field variant' : next.name, updatedAt: 'preview' },
    warnings,
  }
}
