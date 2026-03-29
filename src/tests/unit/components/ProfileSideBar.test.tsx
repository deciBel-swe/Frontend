import { render, screen } from '@testing-library/react';
import ProfileSideBar from '@/features/prof/components/ProfileSideBar';
import { usePublicUser } from '@/features/prof/hooks/usePublicUser';
import { useUserTracks } from '@/hooks/useUserTracks';
import { useParams } from 'next/navigation';
import { use } from 'react';

// Mock the Layer 3 hooks so we can inject global state directly
jest.mock('@/features/prof/hooks/usePublicUser');
jest.mock('@/hooks/useUserTracks');
jest.mock('next/navigation', () => ({useParams: jest.fn()}));

describe('ProfileSideBar (Stateful Logic Sync)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ username: 'mockartist' });
  });

  it('consumes global useUserTracks state instead of a local fetch', () => {
    // 1. Mock the profile header data
    (usePublicUser as jest.Mock).mockReturnValue({
      data: {
        id: 7,
        stats: { trackCount: 1, followersCount: 0, followingCount: 0 },
        profile: {},
        socialLinks: {},
      },
    });

    // 2. Mock the globally synced tracks
    (useUserTracks as jest.Mock).mockReturnValue({
      tracks: [
        {
          id: 1,
          title: 'Global Synced Track',
          artist: { username: 'mockartist' },
          coverUrl: 'mock-cover.jpg',
        },
      ],
      isLoading: false,
    });

    render(<ProfileSideBar username="mockartist" />);

    // 3. Verify the hook was called with the correct params
    expect(useUserTracks).toHaveBeenCalledWith({
      userId: 7,
      username: 'mockartist',
    });

    // 4. Verify the UI mapped the globally synced track into the "Likes/History" section
    expect(screen.getByText('Global Synced Track')).toBeInTheDocument();
  });
});
