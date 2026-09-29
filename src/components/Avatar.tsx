import { initials } from '../lib/issues';

/** Decorative initials avatar; the name is always rendered as text next to it. */
export function Avatar({ name, className = 'h-7 w-7 text-[11px]' }: { name: string; className?: string }) {
  const hue = [...name].reduce((h, char) => (h * 31 + char.charCodeAt(0)) % 360, 7);
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full font-semibold ${className}`}
      style={{ backgroundColor: `hsl(${hue} 38% 26%)`, color: `hsl(${hue} 75% 86%)` }}
    >
      {initials(name)}
    </span>
  );
}
