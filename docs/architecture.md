# Architecture

Meld makes the interface a replaceable projection over stable application capabilities.

```text
                         natural-language intent
                                  │
                                  ▼
┌─────────────┐     ┌──────────────────────────┐
│ user context│────▶│ adapter / intent compiler│
└─────────────┘     └────────────┬─────────────┘
                                 │ proposed recipe patch
                                 ▼
┌─────────────┐     ┌──────────────────────────┐
│ app manifest│────▶│ policy validator         │
└─────────────┘     └────────────┬─────────────┘
                                 │ safe, review, or blocked
                                 ▼
┌─────────────┐     ┌──────────────────────────┐
│ shared state│────▶│ registered block renderer│
└─────────────┘     └────────────┬─────────────┘
                                 │
                         auditable interface
```

## 1. Capability manifest

The manifest is the application's constitutional layer. A capability has a stable identifier, a human-readable label, a risk class, and allowed roles. It can later grow typed inputs, outputs, consent requirements, rate limits, and network constraints.

The interface does not call arbitrary endpoints. Every interactive block binds to one declared capability.

## 2. Interface recipe

A recipe contains context and composition, not executable source code:

```ts
interface InterfaceRecipe {
  id: string
  name: string
  rationale: string
  context: UserContext
  blocks: BlockSpec[]
  navigation: NavigationTarget[]
  updatedAt: string
}
```

This boundary makes recipes portable and testable. A web renderer may map `situation-map` to a React component while a terminal renderer maps the same block to a table.

## 3. Patch proposal

An adapter receives current context plus user intent and returns operations over the recipe. The current prototype includes a deterministic adapter so the demo is inspectable and needs no API key.

An LLM adapter should return the same `PatchResult` structure. Model output must never skip validation.

## 4. Policy validation

`validateRecipe` rejects unknown capabilities and capabilities unavailable to the recipe's role. Future policy packs can add:

- separation-of-duty rules;
- approval gates for critical capabilities;
- protected blocks that may be moved but not removed;
- accessibility budgets;
- data residency and network rules;
- organization-signed recipe requirements.

## 5. Renderer registry

The reference renderer uses an explicit switch over known block types. Generated source and runtime evaluation are intentionally absent. A package version can replace the switch with a registry:

```ts
registerBlock('field-route', FieldRoute, {
  capabilities: ['read_incidents'],
  surfaces: ['web', 'mobile'],
})
```

## 6. Change ledger

Applied patches create an audit entry and retain the previous recipe. The demo persists the active recipe in local storage. A production implementation should use append-only signed events and retain the patch author, manifest version, validator version, and approval receipt.

## Trust boundaries

| Boundary | Trusted | Untrusted until validated |
| --- | --- | --- |
| application | manifest, capability implementation, policy | model proposal |
| organization | signed policy pack, role claims | imported recipe |
| device | local approval and durable ledger | remote sync input |
| renderer | registered components | arbitrary code or markup |

## Production path

The next extraction should split this repository into `@meld/core`, `@meld/react`, and `@meld/adapter-*`. Core must remain dependency-free and runnable in a service worker, server, CLI, or native host.
