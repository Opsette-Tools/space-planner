# Space Planner

A spatial layout planner for floor plans, events, gardens, and seating arrangements. Part of the Opsette tools family.

Drag-and-drop objects onto a canvas, arrange them into rooms and zones, and export as PNG or JSON. Layouts are stored locally in IndexedDB; when embedded inside the Opsette parent app, data syncs through a postMessage bridge.

## Development

```sh
npm install
npm run dev      # start Vite on :8080
npm run build    # production build
npm run test     # vitest
npm run lint     # eslint
```

## Stack

- React 18 + TypeScript + Vite
- Ant Design for application chrome (matches other Opsette tools)
- Plain SVG/DOM for the canvas surface
- `@dnd-kit` for drag-and-drop interactions
- `idb-keyval` for IndexedDB storage
- `vite-plugin-pwa` for offline standalone use
