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
import type { ListProps, User } from '@/components/messages/types';

const DEFAULT_COVER = '/images/default_song_image.png';

function toTrackCardUser(u: User): { username: string; displayName?: string; avatar: string } {
  return {
    username: u.username,
    displayName: u.displayName,
    avatar: u.avatarUrl || '',
  };
}

export default function MessageList({ type, trackId, playlistId, user, track, playlist }: ListProps) {
  if (type === 'track' && track && trackId) {
    const trackCardTrack = {
      id: track.id,
      artist: track.artist,
      title: track.title,
      cover: track.cover || DEFAULT_COVER,
      duration: track.duration || '0:00',
      plays: track.plays,
      comments: track.comments,
      createdAt: track.createdAt,
      genre: track.genre,
      isLiked: track.isLiked,
      isReposted: track.isReposted,
      likeCount: track.likeCount,
      repostCount: track.repostCount,
    };
    return (
      <div className="w-full my-1">
        <TrackCard
          trackId={trackId}
          track={trackCardTrack}
          user={user ? toTrackCardUser(user) : {
            username: track.artist.toLowerCase().replace(/\s+/g, ''),
            displayName: track.artist,
            avatar: '',
          }}
          waveform={[]}
          showHeader={false}
        />
      </div>
    );
  }

  if (type === 'playlist' && playlist && playlistId) {
    return (
      <div className="w-full my-1">
        <PlaylistCard
          trackId={playlistId}
          track={{
            id: playlist.id,
            title: playlist.title,
            artist: playlist.owner,
            cover: playlist.cover || DEFAULT_COVER,
            duration: '0:00',
            plays: 0,
            comments: 0,
            likeCount: 0,
            repostCount: 0,
            isLiked: false,
            isReposted: false,
          }}
          user={user ? toTrackCardUser(user) : {
            username: playlist.owner.toLowerCase().replace(/\s+/g, ''),
            displayName: playlist.owner,
            avatar: '',
          }}
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
    );
  }

  return null;
}