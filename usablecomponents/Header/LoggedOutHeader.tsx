import React from 'react'
import Image from 'next/image';
import logo from '../../public/images/SoundCloud-logo.png';
import { Home, Layers, Search } from "lucide-react";

const LoggedOutHeader = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gray-900 text-gray-300">
      <div className="flex items-center gap-2">
        <Image
          src={logo}
          alt="Cloud"
          width={170}
          height={20}
        />
      </div>

      <nav className="flex gap-6">
        {["Home", "Feed", "Library"].map((link) => (
          <a
            key={link}
            href="#"
            className="hover:text-white transition duration-200"
          >
            {link}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-2 bg-gray-800 rounded-md px-3 py-3">
        <Search size={20} className="text-gray-400"/>
        <input
          type="text"
          placeholder="Search for artists, bands, tracks, podcasts"
          className="bg-transparent outline-none text-gray-200 placeholder-gray-400 w-32 md:w-64"
        />
      </div>
    </header>
  )
}

export default LoggedOutHeader
