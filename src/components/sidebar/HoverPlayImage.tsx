import type { FC } from 'react';
import { Play } from 'lucide-react';
import Image from 'next/image';

interface HoverPlayImageProps {
  image: string;
  alt?: string;
  onClick?: () => void;
}

export const HoverPlayImage: FC<HoverPlayImageProps> = ({
  image,
  alt = 'cover',
  onClick,
}) => {
  return (
    <div
      className="group relative w-full h-full overflow-hidden rounded-md shrink-0 cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <Image
        src={image}
        alt={alt}
        fill
        className="w-full h-full object-cover"
        sizes="(max-width: 768px) 100vw, 320px"
        unoptimized
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-surface-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
        <div className="rounded-full bg-neutral-50 shadow-md flex items-center justify-center w-[70%] h-[70%] active:scale-95 max-w-[28px] max-h-[28px]">
          <Play
            className="text-neutral-1000 w-1/2 h-1/2 hover:opacity-40"
            fill="currentColor"
          />
        </div>
      </div>
    </div>
  );
};
