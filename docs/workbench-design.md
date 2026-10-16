# Agent workbench design

Trace uses a quiet, native-feeling desktop shell around a more expressive editorial workspace. The shell is deliberately stable while the center surface can change with the user's job.

## Spatial model

```text
┌──────────────────────── native window bar ────────────────────────┐
│ project rail │ task surface / generated view │ context inspector │
│              │                               │                   │
│              │       agent composer          │                   │
└───────────────────────────────────────────────────────────────────┘
```

- **44 px window bar** gives the packaged app native drag behavior and keeps workspace identity visible.
- **276 px project rail** owns modes, sources, and project-level actions. It collapses to a compact rail before disappearing on mobile.
- **Flexible task surface** is the only region reshaped by a recipe. Reading remains editorial; synthesis becomes analytical; brief building becomes document-like.
- **330 px inspector** holds capture, health, and workspace controls without interrupting the current task.
- **Persistent agent composer** makes customization a first-class action instead of hiding it in settings.

## Visual system

The application uses semantic surfaces rather than component-specific colors:

| Token role | Purpose |
| --- | --- |
| canvas | cool neutral desktop background |
| panel | navigation and inspector surfaces |
| raised | inputs, cards, and transient controls |
| paper | focused reading and writing artifacts |
| accent | selection, active state, and agent intent |
| positive / caution | provenance and evidence semantics |

Hierarchy comes from half-pixel separators, restrained shadows, and surface contrast. Manrope is used for the application chrome; Newsreader is reserved for source material and authored arguments. This keeps the controls compact while making long-form work comfortable.

## Extension contract

Custom surfaces do not receive arbitrary HTML or script. They compose registered views and capabilities through a validated recipe. A new component should:

1. declare a stable identifier and supported surface sizes;
2. bind actions only to capabilities already present in the manifest;
3. use semantic visual tokens so light, dark, and high-contrast themes remain possible;
4. provide empty, loading, error, and offline states;
5. remain usable without an AI provider;
6. preserve source provenance and destructive-action confirmations.

The visual architecture takes inspiration from the public DeepSeek Harness desktop conventions—composable plugins, a three-column shell, semantic tokens, hairline dividers, and elevated surfaces—while retaining an independent Meld identity and a stricter data-only recipe boundary.

## Responsive behavior

- At medium widths the rail becomes icon-first and the inspector remains available.
- At tablet widths the inspector becomes an overlay.
- On narrow screens the task surface becomes a single column, source cards become a horizontal strip, and the agent composer remains reachable above the safe area.
- Reduced-motion preferences disable view and composer animation.
