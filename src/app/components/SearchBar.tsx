import { Search } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative w-full max-w-xl">
      <Search
        size={16}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search lipstick, sunglasses, brand, or shade…"
        className="w-full bg-white border border-neutral-200 rounded-full pl-10 pr-4 py-3 text-[14px] text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-[#ef4d23]"
      />
    </div>
  );
}
