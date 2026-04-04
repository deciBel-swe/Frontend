import { render, screen, act } from '@testing-library/react';

import Footer from '@/features/home/components/Footer';
import HeroSection from '@/features/home/components/HeroSection';
import InfoSection from '@/features/home/components/InfoSection';
import SearchSection from '@/features/home/components/SearchSection';
import SignupSection from '@/features/home/components/SignupSection';
import TrendingSection from '@/features/home/components/TrendingSection';

jest.mock('@/components/buttons/Button', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

jest.mock('@/components/PlaylistCard', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <div>{title}</div>,
}));

jest.mock('@/components/nav/SearchBar', () => ({
  SearchBar: () => <div>SearchBar</div>,
}));

describe('home feature components', () => {
  it('renders footer links and language selector', () => {
    render(<Footer />);

    expect(screen.getByText('Directory')).toBeInTheDocument();
    expect(screen.getByText('Language:')).toBeInTheDocument();
    expect(screen.getByText('English (US)')).toBeInTheDocument();
  });

  it('renders and rotates hero slides', () => {
    jest.useFakeTimers();

    const { container } = render(<HeroSection />);

    expect(screen.getByText('Discover. Get Discovered.')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    const slider = container.querySelector('.flex.h-full.transition-transform');
    expect(slider).toHaveStyle({ transform: 'translateX(-100%)' });

    jest.useRealTimers();
  });

  it('renders trending, search, signup, and info sections', () => {
    render(
      <>
        <TrendingSection />
        <SearchSection />
        <SignupSection />
        <InfoSection />
      </>
    );

    expect(screen.getByText('A Flower')).toBeInTheDocument();
    expect(screen.getByText('SearchBar')).toBeInTheDocument();
    expect(screen.getByText('Create account')).toBeInTheDocument();
    expect(screen.getByText('Calling all creators')).toBeInTheDocument();
  });
});
