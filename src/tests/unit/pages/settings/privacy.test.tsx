import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import Page from '@/app/settings/privacy/page';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';

jest.mock('@/hooks/usePrivacySettings');

describe('Settings privacy page', () => {
  const mockUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePrivacySettings as jest.Mock).mockReturnValue({
      settings: { isPrivate: false, showHistory: true },
      isLoading: false,
      isError: false,
      isUpdating: false,
      updateSetting: mockUpdate,
    });
  });

  it('renders the two toggles with correct labels', () => {
    render(<Page />);
    expect(
      screen.getByRole('switch', { name: /Receive messages from anyone/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: /Show my activities in social discovery playlists and modules/i })
    ).toBeInTheDocument();
  });

  it('calls updateSetting when a toggle is clicked', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    render(<Page />);

    const firstToggle = screen.getByRole('switch', { name: /Receive messages from anyone/i });
    fireEvent.click(firstToggle);
    expect(mockUpdate).toHaveBeenCalled();

    const secondToggle = screen.getByRole('switch', { name: /Show my activities in social discovery playlists and modules/i });
    fireEvent.click(secondToggle);
    expect(mockUpdate).toHaveBeenCalledTimes(2);
  });

  it('shows a confirmation dialog when disabling messages-from-anyone', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    render(<Page />);

    const firstToggle = screen.getByRole('switch', { name: /Receive messages from anyone/i });
    fireEvent.click(firstToggle);

    expect(confirmSpy).toHaveBeenCalledWith(
      expect.stringContaining('Disabling messages from anyone')
    );
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('proceeds with update when confirmation is accepted', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    render(<Page />);

    const firstToggle = screen.getByRole('switch', { name: /Receive messages from anyone/i });
    fireEvent.click(firstToggle);
    expect(mockUpdate).toHaveBeenCalledWith({ isPrivate: true });
  });
});