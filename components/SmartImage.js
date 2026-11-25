import Image from "next/image";

// next/image for images served from this site (/public). SVGs are served as-is.
// Remote URLs have no configured host yet, so they stay plain <img> rather than risk a runtime error.
export default function SmartImage({ src, alt = "", fill = false, width = 1200, height = 675, sizes, priority = false, className }) {
  if (!src.startsWith("/")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} className={className} />;
  }
  const common = { src, alt, sizes, priority, className, unoptimized: src.endsWith(".svg") };
  return fill ? <Image {...common} fill /> : <Image {...common} width={width} height={height} />;
}
