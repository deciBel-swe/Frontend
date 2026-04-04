import { renderHook } from '@testing-library/react';

import { usePopup } from '@/hooks/openPopUp';

describe('usePopup', () => {
  it('opens a centered popup with computed dimensions', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    Object.defineProperty(window, 'screenX', { configurable: true, value: 100 });
    Object.defineProperty(window, 'screenY', { configurable: true, value: 50 });

    const { result } = renderHook(() => usePopup());

    result.current.openPopup('https://decibel.test/oauth', 0.5, 0.5);

    expect(openSpy).toHaveBeenCalledWith(
      'https://decibel.test/oauth',
      'popupWindow',
      'width=600,height=400,left=400,top=250'
    );
  });
});
