# Contributing

Thank you for helping make software more adaptable without making it less trustworthy.

## Start here

```bash
npm install
npm run check
npm run dev
```

## High-value contributions

- a new policy rule with adversarial tests;
- an accessible block that works across density and contrast modes;
- a domain manifest and two meaningfully different recipes over it;
- an adapter that returns `PatchResult` without bypassing validation;
- a bug reproduction with a small failing test.

## Design constraints

1. Generated code must not execute in the host application.
2. Every interactive block must declare the capability it uses.
3. A visual variation must preserve permission boundaries.
4. Offline claims must match actual storage and synchronization behavior.
5. Every accepted adaptation must be explainable and reversible.

## Pull requests

Keep changes focused. Include tests for runtime behavior and screenshots for visible changes. Run `npm run check` before opening a pull request.
