# Security policy

Meld is currently a research prototype and should not be used to coordinate a real emergency.

Please report vulnerabilities privately to the repository maintainers instead of opening a public issue. Until a dedicated security address is published, use GitHub private vulnerability reporting on the repository.

Security-sensitive areas include capability authorization, recipe import, patch validation, persistence, model adapters, and any future synchronization layer.

## Desktop credential boundary

Meld never places API keys in renderer state, browser storage, workspace files, logs, or AI prompts. The Electron main process encrypts saved keys with `safeStorage`; the preload script exposes only narrow settings and customization methods under context isolation and sandboxing.

AI customization is a presentation-only operation. Responses must match the checked-in allowlist contract, pass a second local validator, and are previewed before application. Generated code, markup, styles, URLs, tools, and arbitrary application capabilities are not accepted.

If a key may have been exposed, revoke it with the provider, clear it in Trace settings, and review provider usage immediately.
