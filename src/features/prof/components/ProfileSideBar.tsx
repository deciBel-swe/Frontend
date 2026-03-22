'use client';
import React, { useEffect, useState } from 'react';
import { SocialList } from './SocialList';
import StatsGroup from './StatsGroup';
import { usePublicUser } from '@/features/prof/hooks/usePublicUser';
import Sidebar from '@/components/sidebar/Sidebar';
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
      try {
        // If your API gives user id → use it directly
        if (!data?.id) return;

        const userTracks = await trackService.getUserTracks(data.id);

        // fallback safety if usernames mismatch
        const filtered = userTracks.filter(
          (track) => track.artist.username === username
        );

        setTracks(filtered);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTracks();
  }, [data?.id, username]);
  // Map tracks → HISTORY format
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
    <>
      <div className="flex flex-col gap-2 p-5">
        <StatsGroup
          countTracks={data?.stats.trackCount || 0}
          countFollowers={data?.stats.followersCount || 0}
          countFollowing={data?.stats.followingCount || 0}
        />

        <p>{data?.profile.bio}</p>

        <SocialList items={data?.socialLinks} />
      </div>

      <div className="gap-6">
        {/* HISTORY */}
        <div className="mb-4">
          <ListOfTrackRows
          headerUrl='/[username]]likes'
            History_header={`${likes} ${likes === 1 ? 'like' : 'likes'}`}
            history={historyData}
          />
        </div>

        {/* ARTISTS */}
        <div>
          <ListOfArtistCards
            headerUrl=''
            Artist_header="Fans also like"
            artists={[
              { name: 'mockartist', followers: 1200, tracks: 10 },
              { name: 'guestproducer', followers: 540, tracks: 5 },
            ]}
          />
        </div>
      </div>
    </>
  );
};

export default ProfileSideBar;