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

const DEFAULT_COVER = '/images/default_song_image.png';

// Maps the messaging User shape to TrackCardUser — the two differ only in
// avatarUrl (messages) vs avatar (TrackCard).
function toTrackCardUser(u: User): TrackCardUser {
  return {
    username: u.username,
    displayName: u.displayName,
    avatar: u.avatarUrl || '',
  };
}

export default function MessageList({ type, user, track, playlist }: ListProps) {
  if (type === 'track' && track) {
    const cardUser: TrackCardUser = user
      ? toTrackCardUser(user)
      : {
          username: track.artist.toLowerCase().replace(/\s+/g, ''),
          displayName: track.artist,
          avatar: '',
        };

    return (
      <div className="w-full overflow-x-auto rounded-lg">
        <div className="min-w-[380px]">
          <TrackCard
            trackId={String(track.id)}
            track={{
              ...track,
              cover: track.cover || DEFAULT_COVER,
              waveformUrl: track.waveformUrl,
            }}
            user={cardUser}
            waveform={[]}
            showHeader={false}
          />
        </div>
      </div>
    );
  }

  if (type === 'playlist' && playlist) {
    const cardUser: TrackCardUser = user
      ? toTrackCardUser(user)
      : {
          username: playlist.owner.toLowerCase().replace(/\s+/g, ''),
          displayName: playlist.owner,
          avatar: '',
        };

    return (
      <div className="w-full overflow-x-auto rounded-lg">
        <div className="min-w-[380px]">
          <PlaylistCard
            trackId={String(playlist.id)}
            track={{
              id: playlist.id,
              title: playlist.title,
              artist: playlist.owner,
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
              title: t.title,
              artist: t.artist,
              coverUrl: t.cover || DEFAULT_COVER,
              plays: String(t.plays ?? 0),
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