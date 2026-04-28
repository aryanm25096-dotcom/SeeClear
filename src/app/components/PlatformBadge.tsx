import { platforms, type PlatformKey } from "@/data/platforms";

export default function PlatformBadge({ platform }: { platform: PlatformKey }) {
  const meta = platforms[platform];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium"
      style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
    >
      <span aria-hidden>{meta.logo}</span>
      {meta.label}
    </span>
  );
}
