'use client';

import { useState } from 'react';
import TrackHero from '@/components/TrackHero';
import TrackActionBar from '@/components/TrackActionBar';
import CommentInput from '@/components/comments/CommentInput';
import CommentList from '@/components/comments/CommentList';
import TrackFansPanel from '@/components/TrackFansPanel';
import type { Comment } from '@/components/comments/CommentItem';
import type { Fan } from '@/components/TrackFansPanel';

// ─── Shape of the track data this view needs ────────────────────────────────
export type TrackViewData = {
  id: number;
  title: string;
  artistName: string;
  artistSlug: string;
  coverUrl: string;
  timeAgo: string;
  tags: string[];
  waveformUrl: string; 
  duration: string;
  plays: number;
  likes: number;
  reposts: number;
  description: string;
  comments: Comment[];
  fans: Fan[];
};
 
type TrackPageViewProps = {
  track: TrackViewData;
  currentUserAvatar?: string;
};
 
export default function TrackPageView({ track, currentUserAvatar }: TrackPageViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [likeCount, setLikeCount] = useState(track.likes);
  const [repostCount, setRepostCount] = useState(track.reposts);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>(track.comments);
 
  const handleLike = () => {
    setIsLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };
 
  const handleRepost = () => {
    setIsReposted((prev) => {
      setRepostCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };
 
  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    setComments((prev) => [
      {
        id: Date.now(),
        authorName: 'You',
        authorSlug: 'me',
        authorAvatar: currentUserAvatar ?? '',
        body: commentText.trim(),
        timeAgo: 'just now',
      },
      ...prev,
    ]);
    setCommentText('');
  };
 
return (
    <div className="w-full flex flex-col gap-0 mt-4">
      {/* 1. TOP SECTION: Full Width Hero & Action Bar */}
      <div className="w-full">
        <TrackHero
          title={track.title}
          artistName={track.artistName}
          artistSlug={track.artistSlug}
          coverUrl={track.coverUrl}
          timeAgo={track.timeAgo}
          tags={track.tags}
          waveformUrl={track.waveformUrl}
          duration={track.duration}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying((p) => !p)}
        />
 
        <TrackActionBar
          plays={track.plays}
          likes={likeCount}
          reposts={repostCount}
          isLiked={isLiked}
          isReposted={isReposted}
          onLike={handleLike}
          onRepost={handleRepost}
        />
      </div>

      {/* 2. BOTTOM SECTION: Grid for Comments + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-8 mt-6">
        {/* Left Side: Comments Area */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <CommentInput
            avatarUrl={currentUserAvatar}
            value={commentText}
            onChange={setCommentText}
            onSubmit={handleCommentSubmit}
          />
          <CommentList
            comments={comments}
            onLikeComment={(id) =>
              setComments((prev) =>
                prev.map((c) => (c.id === id ? { ...c, likes: (c.likes ?? 0) + 1 } : c))
              )
            }
          />
        </div>
 
        {/* Right Side: Sidebar (Fans, etc.) */}
        <aside className="w-full lg:w-[300px] flex-shrink-0">
          <TrackFansPanel fans={track.fans} />
        </aside>
      </div>
    </div>
  );
}