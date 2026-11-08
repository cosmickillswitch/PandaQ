# PandQ (test build)

Propositional logic: build arguments, check them with truth tables, step through Fitch proofs, and learn the terms.

## Files

- `index.html` + `core.js`, `workbench.js` — Build: the argument builder, truth table and proof (from Logic Workbench).
- `prove.html` + `fitch-core.js`, `fitch.js` — Prove: the Fitch stepper. `prove.html?seq=P → Q, P ⊢ Q` opens a sequent directly.
- `diagrams.html` + `diagrams.js` — Diagrams: one formula drawn eight ways. `diagrams.html?f=P → Q&v=venn` opens a formula and view directly.
- `learn.html` + `learn.js` — Learn: glossary, fallacies, ambiguity, well-formedness.
- `learn-content.js` — the Learn page's entries. Edit this to add or correct entries.
- `theme.css` — PandQ's colours and header. Change the brand here.
- `icon.svg`, `icon-*.png`, `maskable-512.png`, `apple-touch-icon.png` — the logo.
- `manifest.webmanifest`, `sw.js` — make it installable and work offline. Bump `VERSION` in `sw.js` after any change.

## Put it on GitHub Pages

1. Create a repo called `pandq` and upload everything in this folder (there are no folders, so you can select them all at once).
2. Settings → Pages → Deploy from branch → `main` / root.
3. Open `https://cosmickillswitch.github.io/pandq/` and install from Chrome's menu (⋮ → Install app).

There's no build step. Files load directly, so it needs to be served (GitHub Pages, or `python3 -m http.server` locally) rather than opened as a file.
