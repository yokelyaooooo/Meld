# Product thesis: interfaces as user-owned branches

Personalization today mostly chooses content inside a fixed frame. Dynamic software should let the frame itself change while preserving the application's truth and authority.

The tempting implementation is to let a model generate React code. That proves visual flexibility but creates three adoption problems: generated code is hard to trust, upgrades diverge, and every personalized client becomes a private fork.

Meld proposes a narrower but deployable contract:

- developers ship stable domain capabilities and renderer primitives;
- organizations ship policy and default recipes;
- users own small recipe branches;
- agents propose patches to those branches;
- the runtime continually rebases safe personal changes over application upgrades.

This is analogous to CSS over HTML, views over a database, or window managers over applications: a new layer of user agency that does not require ownership of every lower layer.

## Why disaster response is a useful test

Emergency coordination stresses nearly every assumption behind a fixed interface:

- roles change quickly;
- connectivity degrades;
- users operate while moving, wearing gloves, or under stress;
- the same fact has different decision value for a resident and a coordinator;
- unsafe authority escalation has real consequences;
- accessibility is situational, not merely a permanent profile.

If an adaptive runtime can remain legible, bounded, and reversible here, it has a plausible path into logistics, public benefits, field research, healthcare operations, education, and industrial maintenance.

## What could earn community adoption

The star-worthy part is not the Relief dashboard. It is a small protocol developers can add to an existing app without rewriting it:

1. describe capabilities once;
2. register existing components as blocks;
3. accept recipe patches from any agent;
4. validate them with local policy;
5. keep user variations across upstream releases.

The project should earn attention through working adapters and integrations rather than a broad specification first. Relief is the executable argument.
