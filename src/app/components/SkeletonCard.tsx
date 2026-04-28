export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-neutral-200 animate-pulse">
      <div className="aspect-square bg-neutral-200" />
      <div className="p-3 space-y-2">
        <div className="h-2.5 w-1/3 bg-neutral-200 rounded" />
        <div className="h-3.5 w-4/5 bg-neutral-200 rounded" />
        <div className="h-3.5 w-3/5 bg-neutral-200 rounded" />
        <div className="h-4 w-1/2 bg-neutral-200 rounded mt-2" />
        <div className="grid grid-cols-2 gap-1.5 mt-2">
          <div className="h-7 bg-neutral-200 rounded-full" />
          <div className="h-7 bg-neutral-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}
