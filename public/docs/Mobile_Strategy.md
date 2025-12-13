# Mobile Strategy (Phase 2.5)

**Goal**: Optimize the web experience for mobile devices immediately, before the React Native migration.

## 1. UI Adaptation
The current UI is desktop-first. We need to adapt it for small screens.
-   [ ] **Viewport Meta**: Ensure `user-scalable=no` to prevent accidental zooming.
-   [ ] **Media Queries**:
    -   `@media (max-width: 768px)`: Stack layout vertically.
    -   Hide non-essential decorative elements to save space.
-   **Touch Targets**:
    -   Minimum button size: 44px x 44px (Apple guidelines).
    -   Add padding to inputs and inventory items.

## 2. Controls & Gameplay
-   **Brewing**: Manual clicking might be tedious on touch.
    -   *Idea*: Tap-and-hold to pour water / grind?
    -   *Idea*: Swipe gestures for "Plunging"?
-   **Navigation**:
    -   Replace top-right buttons with a **Bottom Navigation Bar** or **Hamburger Menu**.
    -   Ensure modals fill the screen comfortably (avoid tiny popups).

## 3. Testing Plan
-   **Devices**:
    -   iPhone (Safari)
    -   Android (Chrome)
-   **Key Flows**:
    -   Complete a full brew cycle (Coffee/Matcha) without mis-clicks.
    -   Open/Close Shop and buy an item.
    -   Scroll through valid inventory list.

## 4. Known Issues (To Debug)
-   Hover tooltips don't work on mobile (Need tap-to-view or removed).
-   Audio auto-play restrictions may be stricter (User interaction required for *every* sound? No, usually just context start).
