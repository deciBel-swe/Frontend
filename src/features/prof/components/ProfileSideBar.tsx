'use client';

import React, { useEffect, useState } from 'react';
import { SocialList } from './SocialList';
import StatsGroup from './StatsGroup';
import { usePublicUser } from '@/features/prof/hooks/usePublicUser';
import ListOfArtistCards from '@/components/sidebar/ListOfArtistCards';
import ListOfTrackRows from '@/components/sidebar/ListOfTrackRows';
import { MockTrackService } from '@/services/mocks/trackService';

interface ProfileSideBarProps {
  username: string;
}

const trackService = new MockTrackService();

const ProfileSideBar = ({ username }: ProfileSideBarProps) => {
  const { data } = usePublicUser(username);
  const [tracks, setTracks] = useState<any[]>([]);

  useEffect(() => {
    const fetchTracks = async () => {
      if (!data?.id) return;

      const userTracks = await trackService.getUserTracks(data.id);

      const filtered = userTracks.filter(
        (track) => track.artist.username === username
      );

      setTracks(filtered);
    };

    fetchTracks();
  }, [data?.id, username]);

  const historyData = tracks.map((track) => ({
    image: track.coverUrl,
    artist: track.artist.username,
    title: track.title,
    stats: {
      plays: `${Math.floor(Math.random() * 5 + 1)}k`,
      likes: `${Math.floor(Math.random() * 500 + 50)}`,
      reposts: `${Math.floor(Math.random() * 100)}`,
      comments: `${Math.floor(Math.random() * 50)}`,
    },
  }));

  const likes = historyData.length;

  return (
    <div
      className="
        w-full
        flex flex-col
        gap-6
        text-sm
      "
    >
      {/* TOP SECTION */}
      <div
        className="
          flex flex-col
          items-center
          gap-3
          p-4 sm:p-5
          bg-[#121212]
          rounded-lg
        "
      >
        <StatsGroup
          countTracks={data?.stats.trackCount || 0}
          countFollowers={data?.stats.followersCount || 0}
          countFollowing={data?.stats.followingCount || 0}
        />

        {data?.profile.bio && (
          <p className="text-center text-gray-400 text-xs sm:text-sm">
            {data.profile.bio}
          </p>
        )}

        <SocialList items={data?.socialLinks} />
      </div>

      {/* HISTORY */}
      <div
        className="bg-[#121212] rounded-lg p-3 sm:p-4"
      >
        <ListOfTrackRows
          headerUrl={`/${username}/likes`}
          History_header={`${likes} ${likes === 1 ? 'like' : 'likes'}`}
          history={historyData}
        />
      </div>

      {/* ARTISTS */}
      <div
        className="bg-[#121212] rounded-lg p-3 sm:p-4"
      >
        <ListOfArtistCards
          headerUrl='/feed#'
          Artist_header="Fans also like"
          artists={[
            { name: 'mockartist', followers: 1200, tracks: 10 },
            { name: 'guestproducer', followers: 540, tracks: 5 },
          ]}
        />
      </div>
    </div>
  );
};

export default ProfileSideBar;