
# Spatial Layout Planner — V1

A mobile-first PWA for planning floor plans, events, gardens, seating, and general spatial schemas. Drag, drop, edit, save, export. Real working prototype, not a shell.

## Tech & setup
- React + TypeScript + Vite, shadcn/ui + Radix, lucide-react, Tailwind for styling
- **DnD Kit** for palette → canvas drag and on-canvas dragging
- **IndexedDB** via `idb-keyval` for layout persistence
- **html-to-image** for PNG export + dashboard thumbnails
- **Vite PWA plugin** with manifest, standalone display, offline caching of static assets
- SW registration guarded against iframes / Lovable preview hosts (works on GH Pages, dormant in editor)
- Vite `base` configurable for GitHub Pages, HashRouter to avoid 404s on static hosting

## Visual direction
Clean light, soft neutrals. Off-white app background, slate text, single subtle accent for selection / primary actions. Generous spacing, large tap targets, rounded cards. Not admin-dashboard-y.

## Screens

### 1. Dashboard (`/`)
- Header with app name + "New layout" primary button
- Grid of saved layout cards: thumbnail (PNG snapshot), name, type badge, "updated X ago", overflow menu (Open, Rename, Duplicate, Delete, Export JSON)
- "Start from template" section with template cards grouped by category (Event, Landscape, Interior/Office)
- Empty state when no layouts exist
- New layout dialog: name + type selector (Floor plan / Event / Garden / Seating / General) → opens editor

### 2. Editor (`/editor/:id`)
**Layout**
- Top bar: back, layout name (inline edit), zoom %, undo/redo, save indicator, overflow menu (Rename, Duplicate, Export PNG, Export JSON, Import JSON, Delete)
- Center: fixed virtual canvas (4000×4000) inside a zoom/pan viewport
- Desktop: left sidebar = Object Library, right sidebar = Inspector (when selection)
- Mobile: bottom toolbar with icon buttons → opens Object Library as bottom sheet, Inspector as bottom sheet on selection

**Canvas behavior**
- Pinch / wheel zoom, two-finger / middle-mouse pan, "reset view" button, fit-to-content
- Toggleable dot grid + snap-to-grid (8px increments)
- Tap/click to select, drag to move, corner handle to resize, top handle to rotate
- Multi-tap empty area to deselect
- Locked items show lock badge and ignore drag/resize
- Z-order: bring forward / send backward from inspector

**Object Library** (categorized tabs)
- Rooms/Zones, Furniture, Event, Landscape, Structural, Labels/Markers
- Each item: icon preview + name, drag onto canvas (desktop) or tap-to-place (mobile, with placement preview)
- Full starter set per your spec (rectangle/square/rounded/open/labeled rooms; round/rect tables, chair, desk, sofa, bench; stage, booth, podium, buffet, registration, dance floor; tree, shrub, garden bed, planter, patio, path, fence, water feature; wall, door, window, divider; text label, numbered marker, icon marker)

**Inspector** (only wired fields shown)
- Label, width, height, X, Y, rotation (slider + numeric)
- Fill color (swatch picker), border style (none/solid/dashed), opacity slider
- Notes (textarea)
- Lock toggle, Bring forward, Send backward, Duplicate, Delete

### 3. Templates
Real pre-populated layouts loaded as starting items, fully editable after open:
- **Event**: wedding reception, classroom seating, boardroom, expo booth
- **Landscape**: backyard garden, patio + walkway, front yard planting
- **Interior/Office**: studio room, living room, office workspace, meeting room

## Persistence & I/O
- All layouts stored in IndexedDB (`layouts` keyed by id)
- Autosave on edit (debounced) + explicit save indicator
- Thumbnail regenerated on save via html-to-image and stored alongside layout
- **Export JSON**: download `.layout.json`
- **Import JSON**: file picker → validates shape → opens as new layout
- **Export PNG**: rasterizes canvas viewport to download

## Data model
```
Layout: { id, name, type, createdAt, updatedAt, canvas: { width, height, grid, snap }, items: LayoutItem[], thumbnail? }
LayoutItem: { id, type, category, x, y, width, height, rotation, zIndex, label, locked, style: { fill, stroke, strokeStyle, opacity }, notes }
```

## PWA + GitHub Pages
- `vite-plugin-pwa` with autoUpdate, manifest (name, icons, standalone, theme color matching design)
- SW registration skipped in iframe / `id-preview--*` / `lovableproject.com` hosts
- HashRouter for deploy compatibility
- README note on setting Vite `base` to repo name for GH Pages

## Out of scope (per your spec)
No backend, no auth, no real measurement units, no 3D, no AI, no multiplayer.
