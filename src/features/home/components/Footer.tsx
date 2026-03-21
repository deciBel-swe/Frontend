'use client';

import Link from 'next/link';

const links = [
  'Directory',
  'About us',
  'Artist Resources',
  'Newsroom',
  'Topics',
  'Jobs',
  'Developers',
  'Help',
  'Legal',
  'Privacy',
  'Cookie Policy',
  'Cookie Manager',
  'Imprint',
  'Charts',
  'Transparency Reports',
];

export default function Footer() {
  return (
    <footer className="w-full border-t mt-10 py-6 px-6 text-sm">
      {/* Links */}
      <div className="flex flex-wrap gap-2 justify-center text-text-muted">
        {links.map((item) => (
          <Link key={item} href="#" className="hover:text-black transition">
            {item}
          </Link>
        ))}
      </div>

      {/* Language */}
      <div className="mt-6 flex">
        <p className="mr-2">Language:</p>
        <a href="#languages" className="text-status-info hover:underline">
          English (US)
        </a>
      </div>
    </footer>
  );
}
