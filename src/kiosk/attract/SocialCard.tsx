import { useState } from "react";
import type { SocialPost } from "./types";

const SOURCE_LABELS: Record<string, string> = {
  linkedin: "LINKEDIN",
  facebook: "FACEBOOK",
  instagram: "INSTAGRAM",
  proximity: "PROXIMITY",
  reddit: "REDDIT",
  techcrunch: "TECHCRUNCH",
  hn_rss: "HACKER NEWS",
};

export default function SocialCard({ post }: { post: SocialPost }) {
  const label = SOURCE_LABELS[post.platform] || "COMMUNITY";

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
      className={`bg-brutal-gray border-2 border-brutal-accent/30 h-full flex flex-col overflow-hidden ${post.url ? "cursor-pointer" : ""}`}
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
          <span className="absolute top-3 left-3 font-mono text-[10px] font-bold px-2 py-0.5 text-brutal-accent bg-brutal-accent/10 backdrop-blur-sm">
            {label}
          </span>
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 flex flex-col ${hasImage ? "p-4" : "p-6 justify-center"}`}>
        {/* Platform + org header */}
        <div className={`flex items-center gap-2 ${hasImage ? "" : "mb-4"}`}>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 text-brutal-accent bg-brutal-accent/10">
            {label}
          </span>
          <span className="font-mono text-[10px] font-bold text-brutal-accent">
            {post.source || "@distillery_labs"}
          </span>
          {!hasImage && (
            <span className="font-mono text-[10px] text-gray-600 ml-auto">
              {formatRelativeDate(post.date)}
            </span>
          )}
        </div>

        {/* Accent bar for text-only cards */}
        {!hasImage && (
          <div className="w-12 h-1 bg-brutal-accent/20 mb-4" />
        )}

        {/* Title */}
        {post.title && (
          <h3 className={`font-display ${hasImage ? "text-2xl" : "text-3xl"} text-brutal-white leading-snug mb-3 ${hasImage ? "line-clamp-3" : "line-clamp-4"} tracking-wide font-extrabold`}>
            {post.title}
          </h3>
        )}

        {/* Body text */}
        {post.text && post.text !== post.title && (
          <p className={`font-body ${hasImage ? "text-lg line-clamp-3" : "text-xl line-clamp-6"} text-gray-300 leading-relaxed flex-1`}>
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
            <span className="font-mono text-[10px] text-brutal-accent ml-auto">
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
