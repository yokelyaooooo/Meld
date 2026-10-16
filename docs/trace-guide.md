# Trace user guide

Trace is a local-first workspace for turning sources into a defensible understanding, synthesis, or brief. It is intentionally not a general notes app: every evidence item remains attached to a source.

## Start a real workspace

1. Run `npm run dev` and open `http://localhost:5173`.
2. In the right inspector, choose **New blank workspace**.
3. Choose **Add source** and enter a paper, report, interview, lecture, book, or web source.
4. Use **Deep read** to write a working abstract and margin note.
5. Move to **Synthesize** and capture atomic claims with a theme, source location, stance, and confidence.
6. Click evidence cards in the matrix to include or exclude them from the final argument.
7. Move to **Build brief**, narrow the working position, and export Markdown.

The workspace saves automatically in browser local storage.

## What counts as useful evidence

A good item contains one claim that another reader could check. Prefer:

> Delayed retrieval outperformed repeated study after two days and one week.

over:

> Testing is better.

The first version keeps the comparison, outcome, and time boundary. Use the location field for a page, section, timestamp, table, or interview line.

## Stance

- **Supports** advances the current working position.
- **Challenges** narrows, contradicts, or identifies a cost in that position.
- **Context** explains mechanism, population, method, or boundary without directly deciding the claim.

Stance belongs to the current research question, not permanently to the source. The same result may support one argument and challenge another.

## Backups and portability

Choose **Export backup** to download a `.trace.json` file. It follows [`schemas/trace-workspace.v1.json`](../schemas/trace-workspace.v1.json) and can be imported from the same inspector.

The Markdown export contains only evidence currently selected in the synthesis matrix. It includes source links and evidence locations so the result can be audited after leaving Trace.

## Example workspace provenance

The bundled learning-science workspace paraphrases three published sources:

- [Cepeda et al. (2006), distributed-practice meta-analysis](https://pubmed.ncbi.nlm.nih.gov/16719566/)
- [Roediger & Karpicke (2006), test-enhanced learning experiments](https://pubmed.ncbi.nlm.nih.gov/16507066/)
- [Dunlosky et al. (2013), review of learning techniques](https://doi.org/10.1177/1529100612453266)

The notes are examples, not a substitute for reading the sources. Restore them at any time with **Restore demo**.

## Privacy boundary

Trace currently sends no workspace data over the network. Clicking an external source link naturally opens that source. Browser storage is device- and browser-profile-specific; export backups before clearing site data or changing devices.
