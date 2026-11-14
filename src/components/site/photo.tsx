import Image from "next/image";

type Props = { src: string; alt: string; width?: number; height?: number; sizes?: string; className?: string; priority?: boolean; blurDataURL?: string };

/**
 * Image wrapper. Cloudinary and local files go through next/image (sizes, AVIF/WebP, blur);
 * local SVG placeholders are served as they are; any other host falls back to a plain lazy <img>.
 */
export function Photo({ src, alt, width = 1200, height = 900, sizes = "100vw", className, priority, blurDataURL }: Props) {
  const local = src.startsWith("/");
  const optimisable = local || src.startsWith("https://res.cloudinary.com/");
  if (!optimisable) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} width={width} height={height} loading={priority ? "eager" : "lazy"} decoding="async" className={className} />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      unoptimized={src.endsWith(".svg")}
      placeholder={blurDataURL ? "blur" : "empty"}
      blurDataURL={blurDataURL}
      className={className}
    />
  );
}

export const PLACEHOLDER_FRAME = "/placeholders/frame.svg";
