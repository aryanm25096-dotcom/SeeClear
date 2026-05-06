import type { Category } from "@/data/products";

const CATEGORIES: Array<{ key: "all" | Category; label: string }> = [
  { key: "all", label: "All" },
  { key: "lips", label: "Lip Shades" },
];

export default function FilterBar({
  active,
  onChange,
}: {
  active: "all" | Category;
  onChange: (c: "all" | Category) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {CATEGORIES.map((c) => {
        const isActive = active === c.key;
        return (
          <button
            key={c.key}
            type="button"
            onClick={() => onChange(c.key)}
            className={
              "px-4 py-1.5 rounded-full text-[13px] border transition-colors " +
              (isActive
                ? "bg-[#0b0f1a] text-white border-[#0b0f1a]"
                : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300")
            }
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
