import { useState } from "react";
import type { SocialPost } from "./types";

const SOURCE_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  linkedin: { label: "LINKEDIN", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30" },
  facebook: { label: "FACEBOOK", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  instagram: { label: "INSTAGRAM", color: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/30" },
  proximity: { label: "PROXIMITY", color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/30" },
  reddit: { label: "REDDIT", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30" },
  techcrunch: { label: "TECHCRUNCH", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/30" },
  hn_rss: { label: "HACKER NEWS", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30" },
};

const DEFAULT_STYLE = { label: "COMMUNITY", color: "text-brutal-accent", bg: "bg-brutal-accent/10", border: "border-brutal-accent/30" };

export default function SocialCard({ post }: { post: SocialPost }) {
  const sourceKey = post.source || post.platform;
  const style = SOURCE_STYLES[sourceKey] || DEFAULT_STYLE;

  const handleTap = (e: React.MouseEvent) => {
    if (post.url) {
      e.stopPropagation();
      window.open(post.url, "_blank", "noopener");
    }
  };

  const [imgFailed, setImgFailed] = useState(false);
  const hasImage = !!post.imageUrl && !imgFailed;

  return (
    <div
      className={`bg-brutal-gray border-2 ${style.border} h-full flex flex-col overflow-hidden ${post.url ? "cursor-pointer" : ""}`}
      onClick={handleTap}
    >
      {/* Image — takes up top half when available */}
      {hasImage && (
        <div className="flex-none h-[45%] relative overflow-hidden">
          <img
            src={post.imageUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={() => {
              console.warn("[SocialCard] Image failed:", post.imageUrl?.slice(0, 80));
              setImgFailed(true);
            }}
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-brutal-gray via-transparent to-transparent" />
          {/* Platform badge overlaid on image */}
          <span className={`absolute top-3 left-3 font-mono text-[10px] font-bold px-2 py-0.5 ${style.color} ${style.bg} backdrop-blur-sm`}>
            {style.label}
          </span>
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 flex flex-col ${hasImage ? "p-4" : "p-5"}`}>
        {/* Platform header — only when no image */}
        {!hasImage && (
          <div className="flex items-center gap-2 mb-3">
            <span className={`font-mono text-[10px] font-bold px-2 py-0.5 ${style.color} ${style.bg}`}>
              {style.label}
            </span>
            <span className="font-mono text-[10px] text-gray-600 ml-auto">
              {formatRelativeDate(post.date)}
            </span>
          </div>
        )}

        {/* Organization name */}
        <p className={`font-mono text-[10px] font-bold ${style.color} mb-2`}>
          {post.source || "@distillery_labs"}
        </p>

        {/* Title — Electrolize display font, bold headline */}
        {post.title && (
          <h3 className={`font-display ${hasImage ? "text-2xl" : "text-4xl"} text-brutal-white leading-snug mb-3 line-clamp-3 tracking-wide font-extrabold`}>
            {post.title}
          </h3>
        )}

        {/* Body text — Sora body font, large and readable */}
        {post.text && post.text !== post.title && (
          <p className={`font-body ${hasImage ? "text-lg" : "text-2xl"} text-gray-300 leading-relaxed line-clamp-5 flex-1`}>
            {post.text}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center gap-3 mt-auto pt-2 border-t border-gray-700/50">
          {post.likes != null && post.likes > 0 && (
            <span className="font-mono text-[10px] text-gray-500">
              {formatCount(post.likes)} likes
            </span>
          )}
          {post.comments != null && post.comments > 0 && (
            <span className="font-mono text-[10px] text-gray-500">
              {formatCount(post.comments)} comments
            </span>
          )}
          {post.url && (
            <span className={`font-mono text-[10px] ${style.color} ml-auto`}>
              TAP TO READ &rarr;
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function formatRelativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}
