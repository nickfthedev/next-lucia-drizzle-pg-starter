const blacklistedDomains: string[] = ["example.com", "another-bad-domain.com"];

interface LoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function customImageLoader({ src, width, quality }: LoaderProps): string {
  const url = new URL(src);
  if (blacklistedDomains.includes(url.hostname)) {
    throw new Error(`Domain ${url.hostname} is blacklisted`);
  }
  return `${src}?w=${width}&q=${quality || 75}`;
}