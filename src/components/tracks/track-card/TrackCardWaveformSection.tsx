'use client';

import CommentInput from '@/components/comments/CommentInput';
import Waveform from '@/components/waveform/Waveform';
import WaveformTimedComments, {
  type TimedComment,
} from '@/features/tracks/components/WaveformTimedComments';

type TrackCardWaveformSectionProps = {
  waveform: number[];
  isBlocked: boolean;
  waveformCurrentTime: number;
  waveformDurationSeconds: number;
  timedComments: TimedComment[];
  currentUser: {
    name: string;
    avatar: string;
  };
  pendingTimestamp: number | null;
  pendingText: string;
  showCommentInput: boolean;
  waveformTimedCommentsVisible: boolean;
  onWaveformClick: (percent: number) => void;
  onCommentInputFocus: () => void;
  setPendingText: (value: string) => void;
  onSubmitTimedComment: (text: string) => void;
};

export default function TrackCardWaveformSection({
  waveform,
  isBlocked,
  waveformCurrentTime,
  waveformDurationSeconds,
  timedComments,
  currentUser,
  pendingTimestamp,
  pendingText,
  showCommentInput,
  waveformTimedCommentsVisible,
  onWaveformClick,
  onCommentInputFocus,
  setPendingText,
  onSubmitTimedComment,
}: TrackCardWaveformSectionProps) {
  return (
    <>
      <div className="relative w-full">
        <Waveform
          data={waveform}
          barClassName={
            isBlocked
              ? 'bg-text-muted'
              : 'bg-text-muted hover:bg-brand-primary'
          }
          currentTime={waveformCurrentTime}
          durationSeconds={waveformDurationSeconds}
          onWaveformClick={onWaveformClick}
        />

        <WaveformTimedComments
          comments={timedComments}
          durationSeconds={waveformDurationSeconds}
          currentUser={currentUser}
          pendingTimestamp={null}
          pendingText=""
          setPendingText={() => {}}
          showCommentInput={false}
          onSubmit={() => {}}
          showMarkers
        />

        {waveformTimedCommentsVisible ? (
          <WaveformTimedComments
            comments={timedComments}
            durationSeconds={waveformDurationSeconds}
            currentUser={currentUser}
            pendingTimestamp={pendingTimestamp}
            pendingText={pendingText}
            setPendingText={setPendingText}
            showCommentInput
            onSubmit={onSubmitTimedComment}
            showMarkers
          />
        ) : null}
      </div>

      {showCommentInput ? (
        <div className="px-1 sm:px-2">
          <CommentInput
            onFocus={onCommentInputFocus}
            avatarUrl={currentUser.avatar}
            value={pendingText}
            onChange={setPendingText}
            onSubmit={onSubmitTimedComment}
            placeholder="Write a comment..."
          />
        </div>
      ) : null}
    </>
  );
}
