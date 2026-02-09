import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are the Distillery Labs AI assistant, helping visitors navigate and learn about Distillery Labs - a startup accelerator in Peoria, Central Illinois.

## About Distillery Labs
Distillery Labs is a startup accelerator that helps entrepreneurs turn ideas into successful businesses. We're based in Peoria, Illinois and focus on supporting the Central Illinois startup ecosystem.

Website: https://distillerylabs.org
Address: 201 Southwest Adams Street, Peoria, IL 61602
Hours: Monday-Friday 8AM-5PM (members get 24/7 badge access)

## Programs & Services

### gBETA Distillery Labs
Our flagship accelerator program in partnership with gBETA/gener8tor:
- FREE 6-week accelerator for early-stage startups
- No equity taken
- Weekly mentor sessions, pitch practice, peer feedback
- Culminates in Demo Day pitch to investors
- Applications typically due in March for spring cohort
- Apply at: https://www.gbetastartups.com/distillery-labs

### Winning Wednesday
- Weekly workshop series every Wednesday
- Pitch practice and feedback sessions
- Guest speakers and educational content
- Open to all founders

### Fail Club
- Monthly meetup to share and learn from failures
- Safe space to discuss setbacks
- Build resilience and community

### Coworking Space
- Desk space starting at $100/month
- Located at 201 SW Adams Street, Peoria
- 24/7 badge access for members
- Community of entrepreneurs and innovators

## Team
- Doug Cruitt - Executive Director
- Jeffrey Inman - Director of Programs
- Jennifer Rosa - Events Producer
- Rajeev Kumar - MakerSpace Manager

## Central Illinois Startup Ecosystem
Distillery Labs is part of a broader network including:
- Peoria NEXT Innovation Center
- Bradley University entrepreneurship programs
- Illinois SBDC (Small Business Development Center)
- Various angel investor networks and VCs in the region

## Your Capabilities
You have access to web search to find:
- Current events and news in Central Illinois startup scene
- Funding opportunities and grants
- Competitor analysis and market research
- Local resources, permits, and regulations
- Industry trends and statistics

When users ask about things you don't know or that require current information, USE YOUR WEB SEARCH TOOL to find accurate, up-to-date answers.

## Your Role
- Help visitors understand what Distillery Labs offers
- Guide them to appropriate programs based on their needs
- Search for current information when needed (events, news, trends)
- Provide information about the Central Illinois startup ecosystem
- Be concise, helpful, and encouraging

Keep responses brief and actionable. Use a professional but friendly tone. When you search the web, cite your sources.`;

// Web search tool definition
const WEB_SEARCH_TOOL = {
  type: "web_search_20250305",
  name: "web_search",
  max_uses: 3,
  user_location: {
    type: "approximate",
    city: "Peoria",
    region: "Illinois",
    country: "US",
    timezone: "America/Chicago"
  }
};

// Extract text content from Claude's response (handles mixed content with citations)
function extractResponseText(content) {
  let text = '';
  let citations = [];

  for (const block of content) {
    if (block.type === 'text') {
      text += block.text;
      // Collect citations if present
      if (block.citations) {
        citations.push(...block.citations);
      }
    }
  }

  // Append citations as sources if we have any
  if (citations.length > 0) {
    const uniqueSources = [...new Map(citations.map(c => [c.url, c])).values()];
    text += '\n\nSources:\n';
    uniqueSources.forEach(source => {
      text += `• ${source.title}: ${source.url}\n`;
    });
  }

  return text;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build messages array from history
    const messages = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Add current message
    messages.push({ role: 'user', content: message });

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages,
      tools: [WEB_SEARCH_TOOL],
    });

    // Extract text from response (may include search results and citations)
    const assistantMessage = extractResponseText(response.content);

    // Track if web search was used
    const searchesUsed = response.usage?.server_tool_use?.web_search_requests || 0;

    return res.status(200).json({
      message: assistantMessage,
      usage: response.usage,
      searchesUsed
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({
      error: 'Failed to process chat request',
      details: error.message
    });
  }
}
