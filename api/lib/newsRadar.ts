import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";

export interface NewsItemRaw {
  headline: string;
  builderAngle: string;
  summary: string;
  source: string;
  url?: string;
  imageUrl?: string;
  date: string;
  region: string;
}

// Wildcard sparks — random seeds injected each run to force unexpected searches
const SPARKS = [
  "most mind-blowing robotics demo this week",
  "new musical instruments invented recently",
  "intersection of biology and computing breakthroughs",
  "startup solving a problem nobody knew existed",
  "artists doing with AI that's genuinely beautiful",
  "breakthroughs making things cheaper to manufacture",
  "coolest thing a teenager built and launched recently",
  "Africa tech scene innovation news",
  "autonomous vehicles drones latest news",
  "community-built open source projects that went viral",
  "quantum computing real applications breakthrough",
  "Kickstarter crowdfunded project actually shipping",
  "brain-computer interface latest development",
  "new programming languages frameworks people excited about",
  "CERN particle physics lab latest news",
  "generative architecture AI design building",
  "creative Raspberry Pi project this month",
  "materials science metamaterials new discovery",
  "farmers using technology AI agriculture innovation",
  "weirdest coolest patent filed recently",
  "underwater exploration ocean technology news",
  "indie game developer doing something technically wild",
  "fusion energy latest breakthrough",
  "tool that lets non-technical people build software",
  "MIT Media Lab Stanford d.school latest project",
  "unexpected creative uses of LLMs AI",
  "Japan tech scene innovation this week",
  "nonprofit using tech solve social problem",
  "food technology lab-grown materials innovation",
  "new satellites launched interesting missions",
  "interesting data visualization published recently",
  "intersection of music and code technology",
  "prosthetics exoskeletons assistive tech breakthrough",
  "battery technology energy storage breakthrough",
  "trending on GitHub not from big company",
  "architect designer doing something with AI",
  "competitive programming math breakthrough",
  "archaeological discoveries made with technology",
  "coolest 3D printed creation this week",
  "city doing something innovative public infrastructure",
  "voice synthesis music AI audio technology",
  "vertical farming indoor agriculture development",
  "mesh networks decentralized internet news",
  "typography font design innovation",
  "electron microscopy nano-fabrication breakthrough",
  "citizen science projects people can contribute to",
  "RISC-V open source chip design news",
  "company pivoted surprising direction succeeded",
  "wearable computing beyond smartwatches",
  "sign language technology accessibility innovation",
];

interface SerperOrganic {
  title: string;
  link: string;
  snippet: string;
  date?: string;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Search Serper.dev for a query — returns top organic results.
 */
async function searchSerper(query: string): Promise<SerperOrganic[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        num: 5,
        tbs: "qdr:w", // last week
      }),
    });

    if (!res.ok) {
      console.error(`Serper search failed (${res.status}):`, await res.text());
      return [];
    }

    const data = (await res.json()) as { organic?: SerperOrganic[] };
    return (data.organic || []).slice(0, 5);
  } catch (err) {
    console.error("Serper search error:", err);
    return [];
  }
}

/**
 * Generate the daily innovation digest using Serper.dev search + Groq LLM.
 *
 * Flow:
 * 1. Pick 8 random curiosity sparks
 * 2. Run Serper.dev searches in parallel (8 searches)
 * 3. Feed all results to Groq Llama 3.3 70B for creative summarization
 * 4. Return 12-15 builder-focused news items
 */
export async function generateNewsDigest(): Promise<NewsItemRaw[]> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) throw new Error("GROQ_API_KEY not set");

  const serperKey = process.env.SERPER_API_KEY;
  if (!serperKey) throw new Error("SERPER_API_KEY not set");

  // Pick 8 random curiosity sparks
  const sparks = pickRandom(SPARKS, 8);

  // Search all sparks in parallel
  const searchResults = await Promise.all(
    sparks.map(async (spark) => {
      const results = await searchSerper(spark);
      return { spark, results };
    })
  );

  // Build context: all search results formatted for the LLM
  const searchContext = searchResults
    .filter((s) => s.results.length > 0)
    .map((s, i) => {
      const items = s.results
        .map(
          (r) =>
            `  - "${r.title}" (${r.link})\n    ${r.snippet}${r.date ? ` [${r.date}]` : ""}`
        )
        .join("\n");
      return `SEARCH ${i + 1}: "${s.spark}"\n${items}`;
    })
    .join("\n\n");

  if (!searchContext) {
    console.error("All Serper searches returned empty");
    return [];
  }

  const groq = createGroq({ apiKey: groqKey });

  const { text } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    system: `You are a wildly curious innovation scout for Distillery Labs, a startup accelerator and makerspace in Peoria, Illinois.

You have the soul of a maker, the curiosity of a scientist, and the eye of an artist. You read obsessively across every field — AI, biotech, space, music, architecture, farming, ocean exploration, typography, game design, materials science, robotics, food tech, fashion tech, and everything in between.

Your job: from the search results provided, curate the most FASCINATING, SURPRISING, and DIVERSE innovation stories. You're curating a feed that runs on a big screen in a makerspace — it should make people stop in their tracks and say "whoa, I didn't know that was possible."

RULES:
- Pick the most DIVERSE and SURPRISING stories from the search results. Every item should feel like it's from a different world.
- Surprise is everything. Skip obvious tech news everyone already saw.
- GLOBAL scope — innovation is everywhere.
- Mix scales: a teenager's garage project is as interesting as a SpaceX launch.
- Include at least ONE from: arts/creative, science/research, community/social good
- ONLY positive, exciting, opportunity-focused stories
- NEVER layoffs, shutdowns, doom, controversies, corporate drama
- Each item MUST have a builder angle: what could someone at our makerspace DO with this info?

For each item, return:
- "headline": punchy, max 10 words, makes you want to read more
- "builderAngle": 1 sentence starting with a verb — actionable for a maker/builder/entrepreneur
- "summary": 1-2 sentences of context
- "source": publication/website name
- "url": the article URL from the search results
- "date": ISO date (YYYY-MM-DD)
- "region": "GLOBAL" usually, or specific region if local

Return ONLY a valid JSON array of 12-15 items. No markdown, no backticks, no other text.`,
    prompt: `Here are today's search results across wildly different topics. Pick the most fascinating stories and create builder-focused digest items:\n\n${searchContext}`,
    maxTokens: 4096,
    temperature: 0.7,
  });

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error("Failed to parse news digest JSON from Groq:", text.slice(0, 500));
    return [];
  }

  try {
    const items: NewsItemRaw[] = JSON.parse(jsonMatch[0]);
    return items.map((item, i) => ({
      ...item,
      region: item.region || "GLOBAL",
      date: item.date || new Date().toISOString().split("T")[0],
      url: item.url || "",
      headline: item.headline || `Discovery ${i + 1}`,
      builderAngle: item.builderAngle || "",
      summary: item.summary || "",
      source: item.source || "Unknown",
    }));
  } catch (err) {
    console.error("JSON parse error:", err);
    return [];
  }
}

/**
 * Process raw signals (HN, TechCrunch) through Groq to generate builder-focused insights.
 */
export async function digestSignals(
  signals: { title: string; description: string; source: string; url: string }[]
): Promise<{ headline: string; builderAngle: string; source: string; url: string }[]> {
  if (signals.length === 0) return [];

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return [];

  const groq = createGroq({ apiKey: groqKey });

  const signalList = signals
    .slice(0, 10)
    .map((s, i) => `${i + 1}. [${s.source}] ${s.title}\n   ${s.description?.slice(0, 200) || ""}`)
    .join("\n\n");

  try {
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: `You digest tech news for entrepreneurs, builders, and makers at Distillery Labs (Peoria, IL).

For each signal, create:
- "headline": rewritten punchy headline, max 10 words, exciting
- "builderAngle": 1 actionable sentence for entrepreneurs — what to build, apply for, or take advantage of
- "source": original source name
- "url": original URL
- "index": original 1-based index number

SKIP any negative/doom news. Only keep exciting/opportunity items.
Return ONLY a JSON array. No markdown, no backticks, no other text.`,
      prompt: `Digest these signals for builders:\n\n${signalList}`,
      maxTokens: 1536,
      temperature: 0.5,
    });

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const results = JSON.parse(jsonMatch[0]);
    return results.map((r: Record<string, unknown>) => ({
      headline: (r.headline as string) || "",
      builderAngle: (r.builderAngle as string) || "",
      source: (r.source as string) || "",
      url: (r.url as string) || signals[(r.index as number) - 1]?.url || "",
    }));
  } catch (err) {
    console.error("Signal digest failed:", err);
    return [];
  }
}
