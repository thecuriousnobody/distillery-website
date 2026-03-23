import { useSocialFeed } from "./hooks/useSocialFeed";
import SocialCarousel from "./attract/SocialCarousel";
import IntelFeed from "./attract/IntelFeed";
import TouchPrompt from "./attract/TouchPrompt";
import type { CarouselCard } from "./attract/types";

interface AttractModeProps {
  onDismiss: () => void;
}

export default function AttractMode({ onDismiss }: AttractModeProps) {
  const { socialPosts, signals, events, news, digested } = useSocialFeed();

  // Left panel: only posts WITH images (visually compelling for screensaver)
  const socialCards: CarouselCard[] = socialPosts
    .filter((p) => !!p.imageUrl)
    .map((p) => ({
      type: "social" as const,
      data: p,
    }));

  // Right panel: Innovation Radar — exciting headlines only
  // Filter out Reddit (can be pessimistic), keep news + events + positive signals
  const radarCards: CarouselCard[] = [];

  // News items first (curated by Claude, already positive/relevant)
  for (const n of news) {
    radarCards.push({ type: "news", data: n });
  }

  // Events — always exciting (things happening!)
  for (const e of events) {
    radarCards.push({ type: "event", data: e });
  }

  // Only include signals from non-Reddit sources with decent engagement
  for (const s of signals) {
    const src = (s.source || "").toLowerCase();
    if (src === "reddit") continue; // Skip Reddit
    radarCards.push({ type: "social", data: s });
  }

  return (
    <div
      className="h-full flex cursor-pointer relative overflow-hidden"
      onClick={onDismiss}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onDismiss();
      }}
    >
      {/* Left 1/3 — Social media posts with images */}
      {/* Gentle fade at edge nearest center — keeps text readable */}
      <div
        className="w-1/3 relative z-10"
        style={{
          maskImage: "linear-gradient(to right, black 88%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, black 88%, transparent 100%)",
        }}
      >
        <SocialCarousel cards={socialCards} interval={8000} />
      </div>

      {/* Middle 1/3 — Hourglass branding + touch CTA */}
      <div className="w-1/3 relative z-20">
        <TouchPrompt />
      </div>

      {/* Right 1/3 — Builder Radar: AI-digested insights */}
      <div
        className="w-1/3 relative z-10"
        style={{
          maskImage: "linear-gradient(to left, black 88%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to left, black 88%, transparent 100%)",
        }}
      >
        <IntelFeed cards={radarCards} digested={digested} />
      </div>
    </div>
  );
}
