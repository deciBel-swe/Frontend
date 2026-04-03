# Global Player Implementation Specification

This document defines the exact implementation contract for introducing a global audio player system in this repository.

## 1. Scope

Implement a single persistent, queue-aware global audio player using:
- Next.js App Router
- React
- Zustand
- HTML audio element
- TypeScript

This document intentionally provides contract-level guidance only. Runtime implementation is intentionally deferred.

## 2. Existing Codebase Alignment

Use current source-of-truth types and service contracts. Do not invent conflicting DTOs.

Required alignment files:
- src/types/tracks.ts
- src/services/api/trackService.ts
- src/services/api/userService.ts
- src/components/TrackCard.tsx
- src/hooks/useFeedTracks.ts
- src/components/TrackList.tsx
- src/app/layout.tsx
- src/components/waveform/Waveform.tsx

### DTO Rules

- Track IDs are numeric across services and DTOs.
- Track stream field is trackUrl (not url).
- Artist data from service DTOs is nested (artist.username).
- Existing history shape is already defined via userService.getHistory and must not be replaced.

## 3. Contracts Added

Player contracts and placeholders now live in:
- src/features/player/contracts/playerContracts.ts
- src/features/player/components/playerComponent.contracts.ts
- src/features/player/store/playerStore.contract.ts
- src/features/player/services/playbackTrackingService.ts
- src/features/player/index.ts

## 4. Functional Requirements

### 4.1 Single Audio Element

- Exactly one HTMLAudioElement in the whole app.
- Owned by a persistent client component mounted once in layout.
- No additional audio elements in cards, feed lists, or detail pages.

### 4.2 Zustand Responsibility Boundary

Zustand store includes only:
- state
- pure actions that update state

Zustand must not include:
- DOM refs
- imperative audio commands
- service calls
- timer-driven side effects

### 4.3 Required Store State

- currentTrack: PlayerTrack | null
- isPlaying: boolean
- currentTime: number
- duration: number
- volume: number
- queue: PlayerTrack[]
- currentIndex: number

### 4.4 Required Store Actions

Playback controls:
- playTrack(track)
- togglePlay()
- pause()
- seek(time)
- setVolume(volume)

Queue:
- setQueue(tracks, startIndex?, source?)
- addToQueue(track)
- addPlaylistToQueue(tracks)
- nextTrack()
- previousTrack()

Internal updates from audio event handlers:
- setCurrentTime(time)
- setDuration(duration)

## 5. Access Model

Current implementation scope:
- PLAYABLE
- BLOCKED

Rules:
- BLOCKED track must not start playback.
- BLOCKED track must not replace active audio source.
- TrackCard/waveform controls should be disabled or visibly dimmed for BLOCKED.

Preview mode is intentionally out of scope in this phase.

## 6. Service Placeholder Contract

The following functions are intentionally empty and are the only required service placeholders for this phase:
- userPlayedTrack(trackId: number): void
- userCompletedTrack(trackId: number): void
- addToRecentlyPlayed(trackId: number): void
- getListeningHistory(): void

Location:
- src/features/player/services/playbackTrackingService.ts

## 7. Runtime Side Effect Rules (GlobalAudioPlayer)

In the persistent audio component:
- Keep audio ref local with useRef.
- Sync play/pause/source/time/volume with store state.
- On first successful play per track, call userPlayedTrack once.
- When currentTime / duration >= 0.9, call userCompletedTrack once per track.
- Call addToRecentlyPlayed when a new track starts.
- Optional: call nextTrack on ended with empty-queue guard.

Do not persist one-time tracking sets in Zustand. Keep those in component-local refs/sets.

## 8. Queue Integration Rules

Track click behavior from feed/profile/lists:
1. Normalize visible list to PlayerTrack[].
2. Set queue if queue differs from current context.
3. Set currentIndex based on clicked track.
4. Start playback.

Maintain minimal integration deltas in:
- src/components/TrackCard.tsx
- src/hooks/useFeedTracks.ts
- src/components/TrackList.tsx

## 9. UI Contract (Dummy for Validation)

A minimal persistent PlayerUI must expose:
- current track title
- play/pause
- seekable progress
- volume slider

No final styling required in this phase.

## 10. Mounting Contract

GlobalAudioPlayer must be mounted once in:
- src/app/layout.tsx

This guarantees playback persistence across route transitions.

## 11. Test Requirements

Add focused tests for:
- store transitions (play/pause/queue/blocked)
- completion threshold and one-time completion behavior
- TrackCard blocked and play interactions

Follow current Jest + RTL conventions in src/tests/unit.

## 12. Non-Goals For This Phase

- Preview playback mode logic
- backend analytics implementation
- replacing existing track DTO schemas
- redesigning current TrackCard UX flows beyond playback wiring

## 13. Implementation Acceptance Checklist

- One global audio element only.
- No DOM node in Zustand.
- DTO compatibility preserved (numeric id, trackUrl, artist mapping).
- Blocked playback correctly guarded.
- Start and completion tracking hooks called exactly once per intended trigger.
- Queue behavior consistent for feed/profile/list contexts.
- App compiles and tests pass for changed scope.
