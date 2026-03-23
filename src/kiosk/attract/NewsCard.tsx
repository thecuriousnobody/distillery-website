import type { NewsItem } from "./types";

export default function NewsCard({ item }: { item: NewsItem }) {
  const handleTap = (e: React.MouseEvent) => {
    if (item.url) {
      e.stopPropagation();
      window.open(item.url, "_blank", "noopener");
    }
  };

  return (
    <div
      className={`bg-brutal-gray border-2 border-gray-700 p-6 h-full flex flex-col ${item.url ? "cursor-pointer" : ""}`}
      onClick={handleTap}
    >
      {/* Header badges */}
      <div className="flex items-center gap-2 mb-5">
        <span className="font-mono text-sm font-bold px-3 py-1.5 bg-brutal-accent text-brutal-black">
          NEWS RADAR
        </span>
        <span className="font-mono text-sm font-bold px-3 py-1.5 border border-brutal-accent text-brutal-accent">
          {item.region.toUpperCase()}
        </span>
      </div>

      {/* Headline */}
      <h3 className="font-display text-3xl text-brutal-white font-bold leading-tight mb-4">
        {item.headline}
      </h3>

      {/* Summary */}
      <p className="font-mono text-lg text-gray-400 leading-relaxed flex-1 line-clamp-4">
        {item.summary}
      </p>

      {/* Source + link hint */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700">
        <span className="font-mono text-sm text-gray-500">{item.source}</span>
        {item.url ? (
          <span className="font-mono text-[10px] text-brutal-accent">
            TAP TO READ &rarr;
          </span>
        ) : (
          <span className="font-mono text-xs text-gray-500">
            {new Date(item.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
    </div>
  );
}
