# Development Guide

## Project Overview
Chillista is a "Coffee Shop Simulator" built with **React** and **Vite**. It focuses on cozy aesthetics, simple mechanics, and manual brewing steps.

## Tech Stack
-   **Framework**: React 18
-   **Build Tool**: Vite
-   **Styling**: Vanilla CSS (Modular approach in `src/styles/modules/`)
-   **State Management**: Custom Hooks Pattern (`useGame` as the central controller).
-   **Audio**: Web Audio API (via `useAudio` hook).

## Directory Structure
```
src/
├── assets/          # Images and Sound files
├── components/      # React UI Components (BrewingStation, ShopModal, etc.)
├── hooks/           # Game Logic (The "Brain")
│   ├── useGame.js       # Main entry point for logic
│   ├── useInventory.js  # Inventory & Shop logic
│   ├── useTime.js       # Time & Day cycle
│   ├── useCustomers.js  # Patron generation
│   └── useBrewing.js    # Brewing step machine
├── logic/           # Pure JS logic helpers (AudioSystem)
├── styles/          # CSS Modules
└── App.jsx          # Root Component
```

## Setup & Run
1.  **Install**: `npm install`
2.  **Run Dev**: `npm run dev` (Localhost:5173)
3.  **Build**: `npm run build`

## Key Patterns
-   **Game State**: The `useGame` hook aggregates state from all sub-hooks (`useTime`, `useInventory`, etc.) and exposes a single `gameState` object to the UI.
-   **Persistence**: `localStorage` is used to save game state automatically (via `saveGame` in `useGame`).
-   **Audio**: Sounds are synthesized or loaded from `src/assets`. Use `audio.playSound('key')`.

## Contribution
-   Keep components small and focused.
-   Prefix CSS classes with the component name to avoid collisions (or use the existing module structure).
-   Update `docs/` when adding new mechanics!
