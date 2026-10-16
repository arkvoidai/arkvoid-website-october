# Arkvoid — Matrix Computing World

This repository is the **world application**, not the Arkvoid marketing website. It is designed to be deployed as a standalone Next.js application at **app.arkvoid.com**.

## Included in this vertical slice

- Real-time 3D cultivation-inspired environment with a sect courtyard, mountain forms, paths, trees, stones and inhabitants.
- Keyboard/mouse movement and touch controls.
- A deterministic world-state boundary: actions are validated before the event journal or player progression changes.
- Named inhabitants with individual dialogue and memory records.
- Discovery and cultivation progression, bounded local save/restore, and responsive HUD.
- Unit tests covering world-action rules and state continuity.

## Local development

Requires Node.js 20.9+ and npm.

```sh
npm install
npm run dev
npm test
npm run typecheck
npm run build
```

## Deploy to app.arkvoid.com

Create a separate Vercel project for this repository. Select the repository root and the **Next.js** framework preset. Use `npm install` for installation and `npm run build` for the build command; let Next.js manage its output directory. Add `app.arkvoid.com` under the Vercel project's Domains settings and follow the DNS instructions displayed there.

Opening this PR does not attach the Vercel project, configure the domain, or edit DNS.

## Engineering scope and limitations

This is an early local-first world prototype, not a shipped Matrix OS, multiplayer service, or hosted persistent civilization. Save data is device-local and cannot be treated as authoritative against a modified client. Dialogue is scripted; no hosted model is called. The inhabitants use prototype meshes rather than final cinematic assets and rigged characters. Server-authoritative shared state, remote persistence, cross-device identity, production telemetry, performance budgets, and licensed optimized art remain future work.

## Runtime organization

- `src/engine/runtime.ts`: deterministic world state and validated action transitions.
- `src/engine/input.ts`: device-neutral movement input.
- `src/components/WorldCanvas.tsx`: rendering and embodied movement.
- `src/components/WorldApp.tsx`: HUD, dialogue, save and action flow.
- `src/app`: Next.js application shell.
