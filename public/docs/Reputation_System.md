# Reputation System (Phase 3.5)

**Goal**: Introduce a long-term progression system where **Reputation** is as valuable as **Cash**.

## 1. Mechanics
-   **Earning Reputation**:
    -   Serving High-Quality drinks (Perfect optimization).
    -   Serving "Critic" customers.
    -   Completing daily challenges (Future).
-   **Losing Reputation**:
    -   Customers leaving due to patience (already implemented: -5 Rep).
    -   Bad orders (Wrong ingredients).

## 2. Milestones (Levels)
Reputation is cumulative. Each level requires a certain amount of Total Reputation.

| Level | Title | Required Rep | Unlock |
| :--- | :--- | :--- | :--- |
| 1 | **Home Brewer** | 0 | Basic Coffee |
| 2 | **Street Cart** | 100 | "Wooden Counter" Skin |
| 3 | **Local Favorite** | 250 | "Matcha Kit" access in Shop |
| 4 | **Rising Star** | 500 | "Fast Grinder" access |
| 5 | **Coffee Artist** | 1000 | "Espresso Machine" access |
| ... | ... | ... | ... |
| 10 | **The Chillista** | 10000 | "Golden Cart" Skin |

## 3. Effects
Higher Reputation attracts better clientele:
-   **Rep < 100**: Mostly "Regulars" and "Students".
-   **Rep > 500**: "Critics" and "Hipsters" start appearing more often (Higher tips, but pickier).
-   **Rep > 1000**: "Tourists" (Big spenders).

## 4. UI Changes
-   **HUD**: Display Reputation Bar alongside Cash.
-   **Level Up Popup**: Celebration modal when reaching a new level.
-   **Shop**: Locked items should show "Requires Level X (Y Reputation)".
