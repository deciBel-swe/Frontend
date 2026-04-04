import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Page from '@/app/settings/privacy/page';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';

jest.mock('@/hooks/usePrivacySettings');
jest.mock('@/hooks/useBlockedUsers');

describe('Settings privacy page', () => {
  const mockUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdate.mockResolvedValue(undefined);
    (usePrivacySettings as jest.Mock).mockReturnValue({
      settings: { isPrivate: false, showHistory: true },
      isLoading: false,
      isError: false,
      isUpdating: false,
      updateSetting: mockUpdate,
    });
    (useBlockedUsers as jest.Mock).mockReturnValue({
      users: [],
      isLoading: false,
      isError: false,
      pendingIds: [],
      unblockUser: jest.fn(),
      refresh: jest.fn(),
    });
  });

  it('renders the two toggles with correct labels', () => {
    render(<Page />);
    expect(
      screen.getByRole('switch', { name: /Receive messages from anyone/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('switch', {
        name: /Show my activities in social discovery playlists and modules/i,
      })
    ).toBeInTheDocument();
  });

  it('calls updateSetting when a toggle is clicked', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<Page />);

    const firstToggle = screen.getByRole('switch', {
      name: /Receive messages from anyone/i,
    });
    await user.click(firstToggle);
    await waitFor(() => expect(mockUpdate).toHaveBeenCalled());

    const secondToggle = screen.getByRole('switch', {
      name: /Show my activities in social discovery playlists and modules/i,
    });
    await user.click(secondToggle);
    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(2));
  });

  it('shows a confirmation dialog when disabling messages-from-anyone', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    render(<Page />);

    const firstToggle = screen.getByRole('switch', {
      name: /Receive messages from anyone/i,
    });
    await user.click(firstToggle);

    expect(confirmSpy).toHaveBeenCalledWith(
      expect.stringContaining('Disabling messages from anyone')
    );
    expect(mockUpdate).not.toHaveBeenCalled();
  });

});
