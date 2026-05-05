# S-Tier Web App Plan

## Goal

Build a small, client-side tier-list web application for creating, editing, sharing, and reopening text-only tier lists in the browser.

The application should feel like a standard tier-list maker: dark page background, light text, colorful tier labels, draggable item chips, and a simple sharing flow through the URL.

## Project Scope

### In Scope

- Empty, untitled tier list as the default state.
- Editable tier-list title.
- Default tiers: `S`, `A`, `B`, `C`, and `D`.
- Optional tiers: `E` and `F`, controlled through settings.
- Text-only items.
- Add-item workflow:
  - User clicks `New item`.
  - An input appears or receives focus.
  - User types an item name.
  - User presses `Enter` or clicks `Add`.
  - Item appears in an unranked item pool and can be dragged into a tier row.
- The item-entry row can be collapsed with a `Done` button.
- Drag and drop between:
  - Unranked item pool.
  - Tier rows.
  - Other positions in the same row, if feasible without adding much complexity.
- Delete items.
- Encode all app state in the URL.
- Decode URL state on page load.
- Update URL in real time as the user edits the list.
- `Copy Link` button that copies the current URL to the clipboard.
- `Clear list` button in the toolbar with confirmation before resetting the list.
- Small `What is a tier list?` link to the Wikipedia tier-list article.
- Small footer copyright link with the current year and Bryan Braun's name.
- GitHub Pages friendly static files.

### Out of Scope

- Backend, database, authentication, accounts, or cloud storage.
- Image uploads or item thumbnails.
- Collaborative editing.
- Production-grade validation, linting, test suite, or build tooling.
- Third-party runtime libraries.

## Proposed File Structure

```text
/
  index.html
  styles.css
  src/
    app.js
    state.js
    url-state.js
    dom.js
    drag-drop.js
```

### File Responsibilities

- `index.html`: Static document shell, module script import, and core app markup.
- `styles.css`: Tier-list layout, responsive behavior, colors, controls, drag states, and focus states.
- `src/app.js`: Application startup, event wiring, render orchestration.
- `src/state.js`: State shape, default state, item creation/deletion/movement, tier visibility.
- `src/url-state.js`: Parse URL state into app state and serialize app state back into the URL.
- `src/dom.js`: DOM rendering helpers and event delegation helpers.
- `src/drag-drop.js`: Native browser drag-and-drop behavior.

This keeps the project small while still separating URL logic, state changes, rendering, and drag behavior.

## State Model

The application state can be represented as:

```js
{
  title: "",
  enabledTiers: ["S", "A", "B", "C", "D"],
  tiers: {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    E: [],
    F: []
  },
  unranked: [
    { id: "item-1", name: "Example" }
  ]
}
```

Each item should have an internal stable `id` so duplicate item names can exist without confusing drag/drop or deletion behavior.

## URL State Plan

Use query parameters so links remain readable and GitHub Pages friendly.

Example:

```text
?title=Smash%20Characters&S=Marth,Samus,Bowser&A=Young%20Link,Peach&B=Luigi,Pikachu&C=Donkey%20Kong&D=Mario&E=Kirby&F=Roy,Link&unranked=Mewtwo
```

Proposed rules:

- `title` stores the tier-list title.
- Each tier label stores a comma-separated list of item names.
- `unranked` stores items that have been added but not placed into a tier.
- `show=EF` or similar stores whether optional tiers are visible.
- Values use `URLSearchParams` for encoding and decoding.
- The URL is updated with `history.replaceState()` after state changes so editing does not flood browser history.

### Duplicate Names

Since URL state stores item names rather than internal IDs, duplicate item names can be preserved by reconstructing new IDs on load. For example, two separate `Mario` entries can both exist after loading the URL.

### Empty State

If the URL has no tier-list data, the app starts as:

- Empty title.
- Tiers `S` through `D` visible.
- Tiers `E` and `F` hidden.
- No items.

## Interaction Plan

### Editing the Title

- Show the title as editable text using either:
  - A styled text input, or
  - A `contenteditable` heading.
- Recommended approach: styled input.
- Reason: It is simpler to serialize, easier to validate, and less surprising across browsers.

### Adding Items

- `New item` button reveals/focuses an input in the item pool area.
- Pressing `Enter` or clicking `Add` creates the item.
- Empty or whitespace-only names are ignored.
- After adding, the input clears and remains focused for fast entry.
- Clicking `Done` collapses the item-entry row.

### Deleting Items

- Each item chip gets a compact delete button using a familiar icon-style control.
- The delete button is only visible when the chip is hovered, focused, or otherwise selected.
- Deleting removes the item from its current tier or from the unranked pool.
- URL updates immediately.

### Drag and Drop

- Use native HTML Drag and Drop APIs.
- Dragging an item stores its `id`.
- Dropping onto a row moves the item into that tier.
- Dropping onto the unranked pool moves it out of any tier.
- If positional reordering is simple and stable, support dropping before/after other chips.
- If positional reordering adds too much complexity, start with appending to the destination row.

### Settings

- Provide a settings button near the toolbar.
- Clicking it opens a compact settings panel or popover.
- The setting contains one toggle: `Show E/F tiers`.
- Turning the toggle on shows `E` and `F`.
- Turning it off hides `E` and `F`.

Recommended behavior when hiding E/F:

- Move items currently in `E` and `F` back to the unranked pool.
- This avoids invisible ranked items and keeps the URL understandable.

### First-Iteration Settings Recommendation

Keep the first version to a single setting: `Show E/F tiers`.

The first version should also include a toolbar-level `Clear list` action with confirmation, but this is a command rather than a persistent setting.

### Copy Link

- `Copy Link` button calls `navigator.clipboard.writeText(window.location.href)`.
- Show a short success state, such as changing button text to `Copied` briefly.
- If clipboard access fails, fall back to selecting/copying from a temporary text field or show a simple failure message.

### Clear List

- `Clear list` resets the app to the default empty state.
- The app asks for confirmation before clearing.
- Clearing also updates the URL back to the default clean URL.

## Visual Design Plan

Use the familiar tier-list visual language:

- Page background: dark charcoal or near-black.
- Main text: white or light gray.
- Tier rows: dark row containers with subtle separators.
- Tier labels:
  - `S`: red/coral.
  - `A`: orange.
  - `B`: yellow.
  - `C`: green.
  - `D`: blue.
  - `E`: purple.
  - `F`: muted gray or deep violet.
- Tier label text: black, uppercase, bold.
- Items: dark chips with light text and visible borders.
- Drag state: outline or slight highlight on active drop target.
- Controls: compact, clear, keyboard focus-visible.

The first screen should be the working tier-list interface, not a landing page.

## Accessibility and Usability

- Use real buttons and form inputs.
- Ensure keyboard focus states are visible.
- Allow title and item entry by keyboard.
- Provide useful `aria-label` text for icon-style buttons.
- Make controls large enough to click comfortably.
- Keep layout usable on narrow screens by letting item chips wrap.

Native drag and drop is not fully keyboard-friendly. For this personal project, that tradeoff is acceptable unless keyboard reordering becomes a requirement.

## Responsive Layout

- Desktop:
  - Centered app content with a comfortable max width.
  - Full-width tier rows.
  - Toolbar above the list.
- Mobile:
  - Same core interface.
  - Controls wrap cleanly.
  - Tier labels remain fixed-width and readable.
  - Item chips wrap inside rows.

## Implementation Phases

### Phase 1: Static App Shell

- Create `index.html`, `styles.css`, and module entry point.
- Build the visible tier-list layout.
- Add title input, toolbar, unranked item pool, and tier rows.

### Phase 2: State and Rendering

- Define the state model.
- Render state into the DOM.
- Add title editing.
- Add item creation.
- Add item deletion.
- Add optional E/F tier visibility.

### Phase 3: URL Encoding and Sharing

- Parse URL query parameters on load.
- Serialize state into query parameters.
- Update URL after each state change.
- Add `Copy Link` behavior and copied/error feedback.

### Phase 4: Drag and Drop

- Add native drag behavior for item chips.
- Add drop behavior for tiers and unranked pool.
- Add visual drag/drop states.
- Preserve or append ordering depending on implementation complexity.

### Phase 5: Polish

- Improve spacing, colors, responsive behavior, and focus states.
- Verify manually in the browser.
- Confirm GitHub Pages compatibility.
- Add a short `README.md` with usage and hosting notes.

## Manual Verification Checklist

- Opening the app with no query string shows an empty untitled tier list.
- Title edits update the URL.
- Adding an item creates a draggable chip and updates the URL.
- Deleting an item removes it and updates the URL.
- Clear list asks for confirmation, resets the app, and clears tier-list URL state.
- Dragging an item into each visible tier works.
- Dragging an item back to unranked works.
- Enabling E/F shows rows and updates the URL.
- Hiding E/F handles existing E/F items according to the approved behavior.
- Reloading the page restores state from the URL.
- Opening a copied link restores the same list.
- Empty names are ignored.
- Names with spaces work.
- Duplicate names remain usable.
- Mobile viewport remains readable and functional.

## Approved Decisions

1. Duplicate item names are allowed.

   This keeps the app simple and avoids surprising users who intentionally add variants with the same label.

2. When E/F tiers are hidden, items currently in those tiers move back to the unranked pool.

   This avoids invisible ranked items.

3. Drag-and-drop should support precise reordering within a row if it stays simple.

   If precise reordering adds too much complexity, appending to the destination row is acceptable for the first version.

4. The URL does not need to preserve empty visible tiers explicitly.

   Empty tiers can be inferred from defaults and the `show` setting.

5. The title field should show `Untitled tier list` as placeholder text.

   The actual stored title remains empty until the user edits it.
