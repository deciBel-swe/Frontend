'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playlistService, userService } from '@/services';
import type { PaginationParams } from '@/services/api/userService';
import type {
  CreatePlaylistRequest,
  UpdatePlaylistRequest,
} from '@/types/playlists';

// ============================================================================
// QUERIES (GET)
// ============================================================================

/**
 * Fetch the currently authenticated user's playlists
 */
export const useMePlaylists = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['me', 'playlists', params],
    queryFn: () => userService.getMePlaylists(params),
  });
};

/**
 * Fetch public playlists for a specific user
 */
export const useUserPlaylists = (userId: number, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['users', userId, 'playlists', params],
    queryFn: () => userService.getUserPlaylists(userId, params),
    enabled: !!userId, // Only run if userId is valid
  });
};

/**
 * Fetch a single playlist by ID (includes tracks)
 */
export const usePlaylist = (playlistId: number) => {
  return useQuery({
    queryKey: ['playlists', playlistId],
    queryFn: () => playlistService.getPlaylist(playlistId),
    enabled: !!playlistId,
  });
};

// ============================================================================
// MUTATIONS (POST, PATCH, DELETE, PUT)
// ============================================================================

/**
 * Create a new playlist
 */
export const useCreatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePlaylistRequest) =>
      playlistService.createPlaylist(payload),
    onSuccess: () => {
      // Invalidate 'me' playlists so the new playlist instantly appears in lists/modals
      queryClient.invalidateQueries({ queryKey: ['me', 'playlists'] });
    },
  });
};

/**
 * Update a playlist (title, description, privacy, cover)
 */
export const useUpdatePlaylist = (playlistId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePlaylistRequest) =>
      playlistService.updatePlaylist(playlistId, payload),
    onSuccess: () => {
      // Refresh both the specific playlist page and the user's library lists
      queryClient.invalidateQueries({ queryKey: ['playlists', playlistId] });
      queryClient.invalidateQueries({ queryKey: ['me', 'playlists'] });
    },
  });
};

/**
 * Delete a playlist
 */
export const useDeletePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playlistId: number) =>
      playlistService.deletePlaylist(playlistId),
    onSuccess: (_, playlistId) => {
      queryClient.invalidateQueries({ queryKey: ['playlists', playlistId] });
      queryClient.invalidateQueries({ queryKey: ['me', 'playlists'] });
    },
  });
};

// ============================================================================
// TRACK MANAGEMENT MUTATIONS
// ============================================================================

/**
 * Add a track to an existing playlist
 */
export const useAddTrackToPlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      playlistId,
      trackId,
    }: {
      playlistId: number;
      trackId: number;
    }) => playlistService.addTrackToPlaylist(playlistId, { trackId }),
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: ['playlists', playlistId] });
    },
  });
};

/**
 * Remove a track from a playlist
 */
export const useRemoveTrackFromPlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      playlistId,
      trackId,
    }: {
      playlistId: number;
      trackId: number;
    }) => playlistService.removeTrackFromPlaylist(playlistId, trackId),
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: ['playlists', playlistId] });
    },
  });
};

/**
 * Reorder tracks in a playlist (Drag and Drop save)
 */
export const useReorderPlaylistTracks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      playlistId,
      trackIds,
    }: {
      playlistId: number;
      trackIds: number[];
    }) => playlistService.reorderPlaylistTracks(playlistId, { trackIds }),
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: ['playlists', playlistId] });
    },
  });
};
