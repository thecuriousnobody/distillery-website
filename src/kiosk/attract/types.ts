export interface SocialPost {
  id: string;
  platform: string;
  title?: string;
  text: string;
  imageUrl?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  date: string;
  url?: string;
  signalType?: string;
  source?: string;
  author?: string;
  industry?: string;
}

export interface StartupEvent {
  id: string;
  name: string;
  platform?: string;
  date?: string;
  location?: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  category?: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  builderAngle?: string;
  summary: string;
  source: string;
  url?: string;
  imageUrl?: string;
  date: string;
  region: string;
}

export interface DigestedSignal {
  headline: string;
  builderAngle: string;
  source: string;
  url: string;
}

export type CarouselCard =
  | { type: "social"; data: SocialPost }
  | { type: "news"; data: NewsItem }
  | { type: "event"; data: StartupEvent }
  | { type: "fallback"; data: { title: string; description: string; icon: string } };

export interface SocialFeedResponse {
  socialPosts: SocialPost[];
  signals: SocialPost[];
  events: StartupEvent[];
  news: NewsItem[];
  digested: DigestedSignal[];
  lastUpdated: string | null;
}
