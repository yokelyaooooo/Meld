# Meld desktop

The desktop application wraps the same local-first Trace workspace in a hardened Electron shell. It adds an optional AI provider connection without exposing credentials to the web interface.

## Run locally

```bash
npm install
npm run desktop:dev
```

The development command starts Vite, waits for it to become available, and then opens Electron.

## Configure AI reshaping

1. Open the gear button in the top bar.
2. Keep the default OpenAI Responses endpoint or enter a compatible HTTPS `/responses` endpoint.
3. Enter a model name and API key.
4. Save, open **Reshape**, describe the work surface you need, inspect the preview, and apply it.

The full key is write-only from the interface. Electron encrypts it with the operating system credential facility through `safeStorage`. You may alternatively set `OPENAI_API_KEY`; environment configuration takes precedence over a saved key.

AI receives a bounded summary containing the workspace title, question, thesis, source metadata, and evidence metadata. It does not receive source URLs, notes, or full claim text. The returned recipe can only choose existing modes, density, accent, evidence lens, source order, inspector visibility, and short guidance strings.

The public contract is available at [`schemas/trace-customization.v1.json`](../schemas/trace-customization.v1.json), with an example in [`examples/exam-review.customization.json`](../examples/exam-review.customization.json).

## Safety boundaries

- Renderer isolation, sandboxing, and disabled Node integration.
- A four-method preload bridge; no generic IPC or filesystem API.
- HTTPS endpoints only, except explicit localhost development endpoints.
- One request at a time, 30-second timeout, prompt/context/response limits.
- Strict JSON Schema response plus an independent local allowlist validator.
- Preview before apply and one-step interface undo.
- AI changes presentation only; workspace data is neither deleted nor rewritten.

## Build installers

```bash
npm run desktop:package
npm run desktop:make
```

`desktop:package` creates an unpacked application in `out/`. `desktop:make` produces a Windows Squirrel installer on Windows and a ZIP application on macOS. Native distributables must be built on their target operating system; the included GitHub Actions workflow builds both.

Public releases should be code-signed. Configure Electron Forge signing/notarization credentials in CI before distributing outside development. Unsigned local builds remain suitable for testing but will trigger operating-system warnings.
