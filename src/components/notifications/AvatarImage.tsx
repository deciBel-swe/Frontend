import React from "react";

interface AvatarImageProps {
  src: string;
  alt: string;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({ src, alt }) => {
  return (
    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-surface-default">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
};