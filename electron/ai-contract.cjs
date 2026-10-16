'use strict'

const customizationSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['version', 'mode', 'density', 'accent', 'lens', 'sourceSort', 'inspector', 'surfaceTitle', 'rationale', 'guidance'],
  properties: {
    version: { type: 'integer', enum: [1] },
    mode: { type: 'string', enum: ['read', 'synthesize', 'brief'] },
    density: { type: 'string', enum: ['compact', 'balanced', 'spacious'] },
    accent: { type: 'string', enum: ['ember', 'ocean', 'jade', 'violet'] },
    lens: { type: 'string', enum: ['all', 'included', 'challenges', 'high-confidence'] },
    sourceSort: { type: 'string', enum: ['workspace', 'year-desc', 'year-asc', 'title'] },
    inspector: { type: 'boolean' },
    surfaceTitle: { type: 'string' },
    rationale: { type: 'string' },
    guidance: { type: 'array', items: { type: 'string' } },
  },
}

const exactKeys = customizationSchema.required.slice().sort()

function boundedString(value, min, max) {
  return typeof value === 'string' && value.trim().length >= min && value.length <= max
}

function validateCustomization(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const keys = Object.keys(value).sort()
  return keys.length === exactKeys.length
    && keys.every((key, index) => key === exactKeys[index])
    && value.version === 1
    && ['read', 'synthesize', 'brief'].includes(value.mode)
    && ['compact', 'balanced', 'spacious'].includes(value.density)
    && ['ember', 'ocean', 'jade', 'violet'].includes(value.accent)
    && ['all', 'included', 'challenges', 'high-confidence'].includes(value.lens)
    && ['workspace', 'year-desc', 'year-asc', 'title'].includes(value.sourceSort)
    && typeof value.inspector === 'boolean'
    && boundedString(value.surfaceTitle, 1, 72)
    && boundedString(value.rationale, 1, 360)
    && Array.isArray(value.guidance)
    && value.guidance.length >= 1
    && value.guidance.length <= 4
    && value.guidance.every((item) => boundedString(item, 1, 140))
}

module.exports = { customizationSchema, validateCustomization }
