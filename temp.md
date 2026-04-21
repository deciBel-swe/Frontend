You are working on the **frontend (UI layer only)** of a SoundCloud-like music streaming app.

⚠️ Important constraints:

* **DO NOT redesign architecture arbitrarily**
* Fix issues by **correctly wiring existing UI, state, and services**
* You must **identify ALL affected components**, not just a subset

---

# 1. Playlist Editing UX

### Current Issue

* Clicking "Edit Playlist Modal" navigates to the playlist page.

### Required Behavior

* Editing must happen **in-place**:

  * No navigation
  * Preserve scroll and page state

### Additional Fix

* Ensure form is prefilled with:

  * Title
  * Description
  * **Genres**
  * **Tags**

---

# 2. Missing Genres & Tags in Edit Form

### Current Issue

* Genres and tags are not shown in edit mode.

### Required Fix

* Ensure UI correctly:

  * Reads genres/tags from playlist data
  * Displays them in the edit form
  * Keeps them controlled (state-managed inputs)

---

# 3. Playlist Card Interaction (Broken Actions)

### Current Issue

* In Playlist Cards:

  * Like / Repost / Play do not work
* Same actions work correctly in playlist page

### Required Fix

* Ensure Playlist Card:

  * Uses the same logic/hooks as working implementation
  * Correctly binds:

    * onLike
    * onRepost
    * onPlay
* Fix event propagation issues if present (e.g. clicks swallowed by parent)

⚠️ Do NOT duplicate logic — reuse existing working hooks/services

---

# 4. Playlist Image Rendering Bug

### Current Issue

* Playlist image does not update
* Track image is shown instead

### Required Fix

* Fix UI rendering logic:

  * Always prioritize `playlist.image`
  * Only fallback to track image if playlist image is missing
* Ensure component re-renders after image update (state/cache issue likely)

---

# 5. Playlist Card Inconsistency

### Current Issue

* Playlist Card differs between:

  * Search page
  * Playlist listing page

### Required Fix

* Make UI consistent:

  * Same layout
  * Same actions
  * Same behavior
* You may:

  * Reuse a shared component OR
  * Align implementations manually
* Do NOT assume only one component exists — audit all usages

---

# 6. Repost Display Bug (UI Mapping Issue)

### Current Issue

* UI shows original poster as reposter

### Required Fix

* Correct UI mapping:

  * Show **reposter** when rendering repost event
  * Keep original creator separate
* Fix wherever reposts are rendered:

  * Feed
  * Cards
  * Playlist/track pages

---

# 7. Commenter Identity Bug

### Current Issue

* Comments display track owner info instead of commenter

### Required Fix

* Ensure UI uses:

  * Comment author's avatar
  * Comment author's username
* Fix incorrect prop/data binding

---

# 8. Playlist Page Buttons

### Current Issue

* Some buttons are not wired

### Required Fix

* Audit ALL buttons on playlist page:

  * Like
  * Repost
  * Play
  * Share (if exists)
* Ensure:

  * Handlers are attached
  * State updates correctly
  * UI reflects changes

---

# 9. Playlist Sidebar (Likes & Reposts)

### Required Behavior

* Clicking:

  * "Likes" → fetch users who liked playlist
  * "Reposts" → fetch users who reposted playlist

### UI Requirements

* Display users in a grid
* Grid must match **track page user grid exactly**
* Ensure:

  * Pagination works (if implemented)
  * Loading & empty states handled

---

# 10. Feed Page (CRITICAL)

### Current Issue

* Feed only renders: "X posted a track"

### Required Fix

* Feed must support ALL event types returned by API
* Examples (based on typical feed models):

  * Track posted
  * Playlist created
  * Track reposted
  * Playlist reposted
  * Likes (if present)

### Required Work

* Inspect feed response structure
* Render each type correctly
* Fix incorrect assumptions in UI mapping

---

# 11. Discover Page Wiring

### Current Issue

* Discover page is not properly wired

### Required Fix

Use the existing `DiscoveryService`:

* `search(...)`
* `getTrending(...)`
* `getGenreStation(...)`
* `getArtistStation(...)`
* `getLikesStation(...)`

### Requirements

#### A. Data Binding

* Ensure UI calls correct service methods
* Map responses correctly to UI components

#### B. Pagination

* Implement pagination using:

  * `page`
  * `size`

#### C. Navigation

* Side arrow buttons must:

  * Move between pages
  * Trigger new fetch
  * Update UI accordingly

#### D. State Handling

* Handle:

  * Loading states
  * Empty states
  * Errors

---

# 12. General UI Constraints

* Do NOT:

  * Hardcode values
  * Duplicate logic unnecessarily
* DO:

  * Reuse hooks/services already in project
  * Fix incorrect prop drilling
  * Fix stale state issues
  * Ensure consistency across pages

---

# Expected Outcome

* Playlist interactions work everywhere (not just playlist page)
* Feed renders all event types correctly
* Discover page fully functional with pagination
* UI is consistent across all pages
* No navigation bugs or incorrect data bindings remain

---

# Execution Strategy (Important)

1. Identify all affected components (cards, pages, modals, sidebars, feed items)
2. Trace where data is coming from vs how it's rendered
3. Fix:

   * Event handlers
   * State binding
   * Conditional rendering
4. Verify behavior across:

   * Playlist page
   * Search page
   * Feed
   * Discover

Do NOT stop after partial fixes — ensure full UI consistency.



I will choose a subset of files that I believe are the ones that need fixing but I might miss some, you should check that I identified the correct files




You are working on the **frontend (UI layer only)** of a SoundCloud-like music streaming app.

⚠️ Important constraints:

* **DO NOT modify backend or API contracts**
* **DO NOT redesign architecture arbitrarily**
* Fix issues by **correctly wiring existing UI, state, and services**
* You must **identify ALL affected components**, not just a subset

---

# 1. Playlist Editing UX

### Current Issue

* Clicking "Edit Playlist" navigates to the playlist page.

### Required Behavior

* Editing must happen **in-place**:

  * Open a modal OR inline editable form
  * No navigation
  * Preserve scroll and page state

### Additional Fix

* Ensure form is prefilled with:

  * Title
  * Description
  * **Genres**
  * **Tags**

---

# 2. Missing Genres & Tags in Edit Form

### Current Issue

* Genres and tags are not shown in edit mode.

### Required Fix

* Ensure UI correctly:

  * Reads genres/tags from playlist data
  * Displays them in the edit form
  * Keeps them controlled (state-managed inputs)

---

# 3. Removing Tracks from Playlist (Form Bug)

### Current Issue

* Removing a track from a playlist **fails inside the edit form**.

### Required Fix

* Ensure removing a track:

  * Updates local form state immediately (optimistic UI)
  * Properly removes the track from the list UI
* Ensure the final submission:

  * Sends the updated track list (without removed tracks)
* Check for:

  * Incorrect state immutability handling
  * Stale closures or wrong state references
  * Missing re-renders after removal

---

# 4. Playlist Card Interaction (Broken Actions)

### Current Issue

* In Playlist Cards:

  * Like / Repost / Play do not work
* Same actions work correctly in playlist page

### Required Fix

* Ensure Playlist Card:

  * Uses the same logic/hooks as working implementation
  * Correctly binds:

    * onLike
    * onRepost
    * onPlay
* Fix event propagation issues if present (e.g. clicks swallowed by parent)

⚠️ Do NOT duplicate logic — reuse existing working hooks/services

---

# 5. Playlist Image Rendering Bug

### Current Issue

* Playlist image does not update
* Track image is shown instead

### Required Fix

* Fix UI rendering logic:

  * Always prioritize `playlist.image`
  * Only fallback to track image if playlist image is missing
* Ensure component re-renders after image update (state/cache issue likely)

---

# 6. Playlist Card Inconsistency

### Current Issue

* Playlist Card differs between:

  * Search page
  * Playlist listing page

### Required Fix

* Make UI consistent:

  * Same layout
  * Same actions
  * Same behavior
* You may:

  * Reuse a shared component OR
  * Align implementations manually
* Do NOT assume only one component exists — audit all usages

---

# 7. Repost Display Bug (UI Mapping Issue)

### Current Issue

* UI shows original poster as reposter

### Required Fix

* Correct UI mapping:

  * Show **reposter** when rendering repost event
  * Keep original creator separate
* Fix wherever reposts are rendered:

  * Feed
  * Cards
  * Playlist/track pages

---

# 8. Commenter Identity Bug

### Current Issue

* Comments display track owner info instead of commenter

### Required Fix

* Ensure UI uses:

  * Comment author's avatar
  * Comment author's username
* Fix incorrect prop/data binding

---

# 9. Playlist Page Buttons

### Current Issue

* Some buttons are not wired

### Required Fix

* Audit ALL buttons on playlist page:

  * Like
  * Repost
  * Play
  * Share (if exists)
* Ensure:

  * Handlers are attached
  * State updates correctly
  * UI reflects changes

---

# 10. Playlist Sidebar (Likes & Reposts)

### Required Behavior

* Clicking:

  * "Likes" → fetch users who liked playlist
  * "Reposts" → fetch users who reposted playlist

### UI Requirements

* Display users in a grid
* Grid must match **track page user grid exactly**
* Ensure:

  * Pagination works (if implemented)
  * Loading & empty states handled

---

# 11. Feed Page (CRITICAL)

### Current Issue

* Feed only renders: "X posted a track"

### Required Fix

* Feed must support ALL event types returned by API
* Examples (based on typical feed models):

  * Track posted
  * Playlist created
  * Track reposted
  * Playlist reposted
  * Likes (if present)

### Required Work

* Inspect feed response structure
* Render each type correctly
* Fix incorrect assumptions in UI mapping

---

# 12. Discover Page Wiring

### Current Issue

* Discover page is not properly wired

### Required Fix

Use the existing `DiscoveryService`:

* `search(...)`
* `getTrending(...)`
* `getGenreStation(...)`
* `getArtistStation(...)`
* `getLikesStation(...)`

### Requirements

#### A. Data Binding

* Ensure UI calls correct service methods
* Map responses correctly to UI components

#### B. Pagination

* Implement pagination using:

  * `page`
  * `size`

#### C. Navigation

* Side arrow buttons must:

  * Move between pages
  * Trigger new fetch
  * Update UI accordingly

#### D. State Handling

* Handle:

  * Loading states
  * Empty states
  * Errors

---

# 13. General UI Constraints

* Do NOT:

  * Hardcode values
  * Duplicate logic unnecessarily
* DO:

  * Reuse hooks/services already in project
  * Fix incorrect prop drilling
  * Fix stale state issues
  * Ensure consistency across pages

---

# Expected Outcome

* Playlist interactions work everywhere (not just playlist page)
* Tracks can be removed from playlists correctly in edit form
* Feed renders all event types correctly
* Discover page fully functional with pagination
* UI is consistent across all pages
* No navigation bugs or incorrect data bindings remain

---

# Execution Strategy (Important)

1. Identify all affected components (cards, pages, modals, sidebars, feed items)
2. Trace where data is coming from vs how it's rendered
3. Fix:

   * Event handlers
   * State binding
   * Conditional rendering
4. Verify behavior across:

   * Playlist page
   * Search page
   * Feed
   * Discover

Do NOT stop after partial fixes — ensure full UI consistency.
