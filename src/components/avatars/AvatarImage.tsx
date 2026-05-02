import Image from 'next/image';

interface AvatarImageProps {
  src?: string;
  alt: string;
  size?: number;
  shape?: "circle" | "square";
  className?: string;
}

/**
 * AvatarImage — stateless avatar, circle or square.
 * Falls back to a monogram placeholder when src is absent.
 * All colors reference design tokens — no hardcoded values.
 */
export default function AvatarImage({
  src,
  alt,
  size = 56,
  shape = "circle",
  className = "",
}: AvatarImageProps) {
  const radius = shape === "circle" ? "rounded-full" : "rounded-md";
  const monogram = alt ? alt[0].toUpperCase() : "?";

  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-surface-raised ${radius} ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          width={size}
          height={size}
          unoptimized
        />
      ) : (
        <span
          className="absolute inset-0 flex items-center justify-center font-bold text-text-secondary"
          style={{ fontSize: size * 0.4 }}
          aria-label={alt}
        >
          {monogram}
        </span>
      )}
    </div>
  );
}