import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CarouselCard } from "./types";
import SocialCard from "./SocialCard";
import NewsCard from "./NewsCard";
import EventCard from "./EventCard";

const FALLBACK_CARDS: CarouselCard[] = [
  {
    type: "fallback",
    data: {
      title: "Connection",
      description:
        "Building bridges between entrepreneurs, mentors, investors, and the community to create a thriving startup ecosystem in Central Illinois.",
      icon: "CONNECT",
    },
  },
  {
    type: "fallback",
    data: {
      title: "Education",
      description:
        "Workshops, accelerator programs, and hands-on learning to give founders the skills they need to build successful companies.",
      icon: "LEARN",
    },
  },
  {
    type: "fallback",
    data: {
      title: "gBETA Accelerator",
      description:
        "A FREE 6-week accelerator for early-stage startups. No equity taken. Weekly mentor sessions, pitch practice, and Demo Day.",
      icon: "LAUNCH",
    },
  },
  {
    type: "fallback",
    data: {
      title: "Motivation",
      description:
        "Fail Club, Winning Wednesday, and a community that celebrates both wins and lessons learned along the entrepreneurial journey.",
      icon: "GROW",
    },
  },
  {
    type: "fallback",
    data: {
      title: "Coworking Space",
      description:
        "Desks starting at $100/month with 24/7 badge access. Join a community of innovators at 921 NE Jefferson Ave, Peoria.",
      icon: "SPACE",
    },
  },
  {
    type: "fallback",
    data: {
      title: "Inspiration",
      description:
        "Fueling the entrepreneurial spirit through stories, events, and a culture that believes great things can happen in Peoria.",
      icon: "SPARK",
    },
  },
];

interface SocialCarouselProps {
  cards: CarouselCard[];
  interval?: number;
}

export default function SocialCarousel({
  cards,
  interval = 9000,
}: SocialCarouselProps) {
  const displayCards = cards.length > 0 ? cards : FALLBACK_CARDS;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % displayCards.length);
    }, interval);
    return () => clearInterval(timer);
  }, [displayCards.length, interval]);

  const card = displayCards[current];

  return (
    <div className="h-full flex flex-col">
      {/* Card area */}
      <div className="flex-1 relative overflow-hidden p-6 flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-x-6 top-1/2 -translate-y-1/2"
            style={{ maxHeight: "calc(100% - 48px)" }}
          >
            {card.type === "social" && <SocialCard post={card.data} />}
            {card.type === "news" && <NewsCard item={card.data} />}
            {card.type === "event" && <EventCard event={card.data} />}
            {card.type === "fallback" && <FallbackCard data={card.data} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex-none flex justify-center gap-2 pb-4">
        {displayCards.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 transition-all ${
              i === current
                ? "bg-brutal-accent w-6"
                : "bg-gray-600 hover:bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function FallbackCard({
  data,
}: {
  data: { title: string; description: string; icon: string };
}) {
  return (
    <div className="bg-brutal-gray border-2 border-brutal-accent p-8 h-full flex flex-col justify-center">
      <span className="font-mono text-sm font-bold text-brutal-accent mb-4 tracking-widest">
        {data.icon}
      </span>
      <h3 className="font-display text-5xl text-brutal-white tracking-wide mb-5">
        {data.title}
      </h3>
      <p className="font-body text-xl text-gray-400 leading-relaxed">
        {data.description}
      </p>
    </div>
  );
}
