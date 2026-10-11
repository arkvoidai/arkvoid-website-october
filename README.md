# Arkvoid â€” Static website source

A responsive, no-build, no-dependency landing page for Arkvoid. The visual language uses mineral ivory, charcoal, moss and oxidised copper. All artwork is original local SVG; there are no external fonts, analytics, UI libraries, icon packs or animation packages.

## Files

- `index.html` â€” page structure and editorial copy
- `styles.css` â€” responsive layout, design system and large ambient animations
- `script.js` â€” mobile navigation and low-cost scroll reveals
- `assets/arkvoid-symbol.svg` â€” vector symbol / favicon
- `assets/persistent-world.svg` â€” illustrated, animated world scene

## Preview

Open `index.html` in any modern browser. No build command or package installation is required.

## Upload to GitHub

1. Create a new branch or make a backup of the current website files before replacing anything.
2. Upload `index.html`, `styles.css`, `script.js`, and the complete `assets/` folder to the intended repository/root.
3. Keep the folder structure intact so the relative asset paths continue to work.
4. Open `index.html` in a browser or use the repository's existing preview/deployment flow to review desktop and mobile layouts before connecting the domain.

This project is a standalone static site. If the existing Arkvoid repository is a Next.js monorepo, do not overwrite its root or its configuration blindly: place the page in the relevant app's route or use this folder as a separate static app first.

## Performance and accessibility

- Zero runtime dependencies and no external network requests for the page assets.
- Vector artwork rather than heavyweight raster hero imagery.
- Local CSS animations, plus `prefers-reduced-motion` handling.
- Responsive layout, semantic sections, keyboard focus states, skip link and an accessible mobile menu.
- Research metrics are explicitly marked as proposed exit targets, not achieved results.

## Content boundaries

The positioning and research targets are based on the Arkvoid strategy dossier with a research cutoff of 11 October 2026. Market values are cited to the sources listed in that dossier and are labelled as adjacent-market context, not Arkvoid TAM. The site does not claim that the proposed runtime or benchmarks are already shipped.
