import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are the Distillery Labs AI assistant, helping visitors navigate and learn about Distillery Labs - a startup accelerator in Peoria, Central Illinois.

## About Distillery Labs
Distillery Labs is a startup accelerator that helps entrepreneurs turn ideas into successful businesses. We're based in Peoria, Illinois and focus on supporting the Central Illinois startup ecosystem.

## Programs & Services
1. **Startup Accelerator Program** - 12-week intensive program for early-stage startups
2. **Mentorship Network** - Connect with experienced entrepreneurs and industry experts
3. **Workspace & Resources** - Access to co-working space and startup resources
4. **Pitch Events** - Regular pitch nights and demo days
5. **Community Events** - Networking events, workshops, and educational sessions

## Key Information
- Location: Peoria, Illinois (Central Illinois)
- Focus: Early-stage startups, technology, innovation
- Community: Part of the broader Central Illinois entrepreneurship ecosystem
- Contact: Through the website contact form

## Your Role
- Help visitors understand what Distillery Labs offers
- Guide them to appropriate programs based on their needs
- Answer questions about the startup accelerator
- Provide information about events and community
- Be concise, helpful, and encouraging

Keep responses brief and actionable. Use a professional but friendly tone that matches the brutalist, modern aesthetic of the website.`;

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
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: messages,
    });

    const assistantMessage = response.content[0].text;

    return res.status(200).json({
      message: assistantMessage,
      usage: response.usage
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({
      error: 'Failed to process chat request',
      details: error.message
    });
  }
}
