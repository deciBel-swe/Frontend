/**
 * Home Page *
 * Landing page for the DeciBel application.
 * This is a placeholder that will be replaced with actual content.
 */

import HeroSection from '@/features/home/components/HeroSection';
import SearchSection from '@/features/home/components/SearchSection';
import TrendingSection from '@/features/home/components/TrendingSection';
import InfoSection from '@/features/home/components/InfoSection';
import SignupSection from '@/features/home/components/SignupSection';
import Footer from '@/features/home/components/Footer';

export default function Page() {
  return (
    <>
      <HeroSection />
      <SearchSection />
      <TrendingSection />
      <InfoSection />
      <SignupSection />
      <Footer />
    </>
  );
}
