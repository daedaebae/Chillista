# Architecture & Implementation

## Core Pattern: The "Monolithic Hook"
Chillista uses a pattern where a central custom hook, `useGame.js`, acts as the **Main Controller**. It aggregates state and logic from specialized sub-hooks.

### Hook Hierarchy
-   **`useGame`** (Root)
    -   `useInventory`: Manages Cash, Items, Upgrades, Shop Logic.
    -   `useCustomers`: Generates customers, tracks patience/stats.
    -   `useTime`: Manages the Day/Night cycle and game ticks.
    -   `useBrewing`: State machine for the brewing station (Step 0-5).
    -   `useAudio`: Wrapper for the Web Audio API system.

### Data Flow
1.  **State**: Each sub-hook manages its own local state (`useState`).
2.  **Sync**: `useGame` combines these states into a single `gameState` object.
    -   *Why?* The UI (`App.jsx`) only needs one object to render the world.
3.  **Persistence**: `useGame` handles `saveGame/loadGame`.
    -   It calls `syncXState` methods exposed by sub-hooks to restore data from `localStorage`.

---

## State Management
We avoid Redux/Context for simplicity, relying on the **Custom Hook Composition** pattern.

### `gameState` Object
Exposed to the UI, it contains:
```javascript
{
    cash: 100,
    inventory: { beans: 50, ... },
    currentCustomer: { name: "Ken", patience: 30, ... },
    minutesElapsed: 480, // Time
    brewingState: { step: 0, temp: 20, ... },
    // ...
}
```

---

## Systems Deep Dive

### 1. Customer Generation (`useCustomers`)
-   **Trigger**: Called every game tick (`advanceTime`).
-   **Chance**: Depends on `Weather`, `Difficulty`, and if a customer is current present.
-   **Attributes**: randomized from pools (Names, Avatars) and weighted logic (Archetypes like Critic/Student).

### 2. Audio System (`logic/AudioSystem.js` + `useAudio`)
-   **Constraint**: Browsers block audio until user interaction.
-   **Solution**: We initialize `AudioContext` in `suspended` state and `resume()` it on the first click (handled in `useGame` or via a modal start button).
-   **Synthesis**: Simple SFX (beeps) are synthesized to avoid loading many files.
-   **Files**: Music and Ambience are loaded from `assets/`.

### 3. Brewing State Machine (`useBrewing`)
Tracks the complex state of the coffee maker.
-   `mode`: 'coffee', 'matcha', 'espresso'.
-   `step`: Integer (0 to 5).
-   `kettle`: { boiling: bool, heat: 0-100 }.
-   **Action Handler**: `handleBrewAction(actionType)` validates transitions (e.g. can't Plunge if step < 4).
