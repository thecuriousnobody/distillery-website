import { useRef, useEffect, useState, useMemo } from "react";
import type { CarouselCard, SocialPost, NewsItem, StartupEvent, DigestedSignal } from "./types";
import RADAR_ITEMS from "./radarContent";

interface InsightCard {
  headline: string;
  builderAngle?: string;
  tag: string;
  source?: string;
  url?: string;
}

interface IntelFeedProps {
  cards: CarouselCard[];
  digested?: DigestedSignal[];
}

export default function IntelFeed({ cards, digested = [] }: IntelFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Stable key for memoization — only recompute when actual data changes
  const dataKey = useMemo(() => {
    const parts: string[] = [];
    for (const d of digested) {
      if (d.headline) parts.push(d.headline.slice(0, 20));
    }
    for (const c of cards) {
      if (c.type === "news") parts.push((c.data as NewsItem).headline?.slice(0, 20) || "");
      else if (c.type === "social") parts.push((c.data as SocialPost).title?.slice(0, 20) || "");
      else if (c.type === "event") parts.push((c.data as StartupEvent).name?.slice(0, 20) || "");
    }
    return parts.join("|");
  }, [cards, digested]);

  // Build + shuffle insights — only recompute when actual data content changes
  const displayInsights = useMemo(() => {
    const insights: InsightCard[] = [];

    for (const d of digested) {
      if (d.headline) {
        insights.push({
          headline: d.headline,
          builderAngle: d.builderAngle,
          tag: (d.source || "TECH").toUpperCase(),
          source: d.source,
          url: d.url,
        });
      }
    }

    for (const card of cards) {
      const extracted = extractInsight(card);
      if (extracted.headline) insights.push(extracted);
    }

    // ALWAYS mix curated content with real data — abundance and serendipity
    const items = [...RADAR_ITEMS, ...insights];

    // Deduplicate by headline (case-insensitive)
    const seen = new Set<string>();
    const unique = items.filter((item) => {
      const key = item.headline.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Fisher-Yates shuffle
    for (let i = unique.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unique[i], unique[j]] = [unique[j], unique[i]];
    }
    return unique;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey]);

  const items = displayInsights;

  // Continuous scroll animation
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animId: number;
    let lastTime = 0;
    const speed = 40; // pixels per second

    const animate = (time: number) => {
      if (lastTime === 0) lastTime = time;
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (!isHovered) {
        el.scrollTop += speed * delta;

        // Loop: when we've scrolled past half (the duplicated content), reset
        const halfHeight = el.scrollHeight / 2;
        if (halfHeight > 0 && el.scrollTop >= halfHeight) {
          el.scrollTop -= halfHeight;
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isHovered]);

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex-none px-5 pt-5 pb-3 z-10">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brutal-accent animate-pulse" />
          <span className="font-mono text-[9px] text-brutal-accent tracking-[0.3em] font-bold">
            BUILDER RADAR
          </span>
          <span className="font-mono text-[8px] text-gray-600 ml-auto">
            LIVE
          </span>
        </div>
      </div>

      {/* Top fade */}
      <div className="absolute top-10 left-0 right-0 h-10 bg-gradient-to-b from-brutal-black to-transparent z-10 pointer-events-none" />

      {/* Scrolling marquee */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-hidden px-5"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Render twice for seamless loop */}
        {[0, 1].map((pass) => (
          <div key={pass} className="pb-4">
            {items.map((item, i) => {
              const seed = hashCode(`${item.headline}`) % 100;

              // Dramatic size tiers:
              // ~10% JUMBO  — huge headline, fills the width, unmissable
              // ~15% LARGE  — big and bold with builder angle
              // ~30% MEDIUM — standard readable size
              // ~45% WHISPER — tiny, creates texture and rhythm
              const isJumbo = seed < 10;
              const isLarge = seed >= 10 && seed < 25;
              const isMedium = seed >= 25 && seed < 55;
              // rest is whisper

              if (isJumbo) {
                return (
                  <div
                    key={`${pass}-${i}`}
                    className={`py-6 ${item.url ? "cursor-pointer" : ""}`}
                    onClick={(e) => {
                      if (item.url) { e.stopPropagation(); window.open(item.url, "_blank", "noopener"); }
                    }}
                  >
                    <span className="font-mono text-[10px] font-bold text-brutal-accent tracking-[0.3em] block mb-3">
                      {item.tag}
                    </span>
                    <h2 className="font-display text-4xl font-extrabold leading-[1.05] text-brutal-white mb-3">
                      {item.headline}
                    </h2>
                    {item.builderAngle && (
                      <p className="font-body text-base text-brutal-accent/90 leading-relaxed border-l-2 border-brutal-accent/40 pl-4">
                        {item.builderAngle}
                      </p>
                    )}
                    {item.source && (
                      <span className="font-mono text-[9px] text-gray-500 block mt-3">
                        {item.source}
                      </span>
                    )}
                  </div>
                );
              }

              if (isLarge) {
                return (
                  <div
                    key={`${pass}-${i}`}
                    className={`border-l-2 border-brutal-accent/30 pl-4 py-4 ${item.url ? "cursor-pointer" : ""}`}
                    onClick={(e) => {
                      if (item.url) { e.stopPropagation(); window.open(item.url, "_blank", "noopener"); }
                    }}
                  >
                    <span className="font-mono text-[8px] font-bold text-brutal-accent/50 tracking-[0.2em] block mb-2">
                      {item.tag}
                    </span>
                    <h3 className="font-display text-xl font-extrabold leading-snug text-brutal-white mb-2">
                      {item.headline}
                    </h3>
                    {item.builderAngle && (
                      <p className="font-body text-sm text-brutal-accent/70 leading-relaxed">
                        {item.builderAngle}
                      </p>
                    )}
                  </div>
                );
              }

              if (isMedium) {
                return (
                  <div
                    key={`${pass}-${i}`}
                    className={`border-l border-gray-700 pl-3 py-2.5 ${item.url ? "cursor-pointer" : ""}`}
                    onClick={(e) => {
                      if (item.url) { e.stopPropagation(); window.open(item.url, "_blank", "noopener"); }
                    }}
                  >
                    <span className="font-mono text-[7px] font-bold text-brutal-accent/40 tracking-[0.15em] block mb-1">
                      {item.tag}
                    </span>
                    <h3 className="font-display text-sm font-bold leading-snug text-brutal-white">
                      {item.headline}
                    </h3>
                  </div>
                );
              }

              // Whisper — tiny, atmospheric
              return (
                <div
                  key={`${pass}-${i}`}
                  className={`py-1 pl-2 ${item.url ? "cursor-pointer" : ""}`}
                  onClick={(e) => {
                    if (item.url) { e.stopPropagation(); window.open(item.url, "_blank", "noopener"); }
                  }}
                >
                  <p className="font-mono text-[10px] text-gray-500 leading-snug">
                    <span className="text-brutal-accent/30 mr-1.5">{item.tag}</span>
                    {item.headline}
                  </p>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-brutal-black to-transparent z-10 pointer-events-none" />
    </div>
  );
}

// Deterministic hash so sizing stays consistent per headline
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function extractInsight(card: CarouselCard): InsightCard {
  switch (card.type) {
    case "social": {
      const d = card.data as SocialPost;
      return {
        headline: d.title || d.text || "",
        tag: (d.source || d.platform || "COMMUNITY").toUpperCase(),
        source: d.author,
        url: d.url,
      };
    }
    case "news": {
      const d = card.data as NewsItem;
      return {
        headline: d.headline,
        builderAngle: d.builderAngle,
        tag: d.region?.toUpperCase() || "NEWS",
        source: d.source,
        url: d.url,
      };
    }
    case "event": {
      const d = card.data as StartupEvent;
      return {
        headline: d.name,
        tag: "EVENT",
        source: d.location,
        url: d.url,
      };
    }
    default:
      return { headline: "", tag: "" };
  }
}
