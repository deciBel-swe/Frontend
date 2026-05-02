import React from "react";
import Image from 'next/image';

interface AvatarImageProps {
  src: string;
  alt: string;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({ src, alt }) => {
  return (
    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-surface-default">
      <Image
        src={src}
        alt={alt}
        width={36}
        height={36}
        className="w-full h-full object-cover"
      />
    </div>
  );
};