'use client';

/**
 * List — Generic component that renders either a TrackCard or a PlaylistCard
 * based on the `type` prop. Used in the messaging system to render embedded
 * media content inside messages.
 *
 * @example
 * <List type="track" trackId="summer-Vibes" track={trackData} />
 * <List type="playlist" playlistId="mix" playlist={playlistData} />
 **/

import TrackCard from '@/components/tracks/track-card/TrackCard';
import PlaylistCard from '@/components/playlist/playlist-card/PlaylistCard';
import type { TrackCardUser } from '@/components/tracks/track-card/types';
import type { ListProps, User } from '@/components/messages/types';
import { playerTrackMappers } from '@/features/player/utils/playerTrackMappers';

const DEFAULT_COVER = '/images/default_song_image_1.png';

// Maps the messaging User shape to TrackCardUser — the two differ only in
// avatarUrl (messages) vs avatar (TrackCard).
function toTrackCardUser(u: User): TrackCardUser {
  return {
    username: u.username,
    displayName: u.displayName,
    avatar: u.avatarUrl || '',
  };
}

export default function MessageList({
  type,
  user,
  track,
  playlist,
}: ListProps) {
  if (type === 'track' && track) {
    const trackArtistDisplayName =
      track.artist.displayName || track.artist.username;

    const cardUser: TrackCardUser = user
      ? toTrackCardUser(user)
      : {
          username: track.artist.username,
          displayName: trackArtistDisplayName,
          avatar: track.artist.avatar,
        };

    const playback = track.trackUrl
      ? playerTrackMappers.fromAdapterInput(
          {
            id: track.id,
            title: track.title,
            trackUrl: track.trackUrl,
            artist: track.artist,
            durationSeconds: track.durationSeconds,
            coverUrl: track.coverUrl || track.cover,
            waveformData: track.waveformData,
          },
          {
            access: track.access === 'BLOCKED' ? 'BLOCKED' : 'PLAYABLE',
          }
        )
      : undefined;

    return (
      <div className="w-full overflow-x-auto rounded-lg">
        <div className="min-w-95">
          <TrackCard
            trackId={String(track.id)}
            track={{
              ...track,
              cover: track.cover || DEFAULT_COVER,
              waveformUrl: track.waveformUrl,
            }}
            user={cardUser}
            playback={playback}
            queueTracks={playback ? [playback] : undefined}
            queueSource="unknown"
            waveform={[]}
            showHeader={false}
          />
        </div>
      </div>
    );
  }

  if (type === 'playlist' && playlist) {
    const playlistOwnerUsername = playlist.owner
      .toLowerCase()
      .replace(/\s+/g, '');

    const cardUser: TrackCardUser = user
      ? toTrackCardUser(user)
      : {
          username: playlistOwnerUsername,
          displayName: playlist.owner,
          avatar: '',
        };

    return (
      <div className="w-full overflow-x-auto rounded-lg">
        <div className="min-w-95">
          <PlaylistCard
            trackId={String(playlist.id)}
            track={{
              id: playlist.id,
              title: playlist.title,
              artist: {
                username: playlistOwnerUsername,
                displayName: playlist.owner,
                avatar: cardUser.avatar || DEFAULT_COVER,
              },
              cover: playlist.cover || DEFAULT_COVER,
              duration: '0:00',
              waveformUrl: playlist.tracks?.[0]?.waveformUrl,
              plays: 0,
              comments: undefined,
              likeCount: 0,
              repostCount: 0,
              isLiked: false,
              isReposted: false,
            }}
            user={cardUser}
            relatedTracks={playlist.tracks?.map((t) => ({
              id: t.id,
              trackSlug: t.trackSlug,
              artistUsername: t.artist.username,
              title: t.title,
              artist: t.artist.displayName || t.artist.username,
              coverUrl: t.cover || DEFAULT_COVER,
              plays: String(t.plays ?? 0),
              isLiked: t.isLiked,
              isReposted: t.isReposted,
            }))}
            waveform={[]}
            showHeader={false}
          />
        </div>
      </div>
    );
  }

  return null;
}
