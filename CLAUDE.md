# Distillery Labs Website

## Overview
Modern brutalist website for Distillery Labs startup accelerator in Peoria, Central Illinois. Features Google Auth-gated AI chat assistant with web search capabilities.

**Live URL**: https://distillery-website.vercel.app/
**Repo**: https://github.com/thecuriousnobody/distillery-website

## Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Styling**: Tailwind CSS v3 (brutalist theme)
- **Animations**: Framer Motion
- **Auth**: Firebase (Google Sign-in)
- **AI Chat**: Anthropic Claude Haiku 4.5 with web search
- **Hosting**: Vercel (frontend + serverless API)

## Key Features

### AI Chat Assistant
- Auth-gated with Google Sign-in
- Powered by Claude Haiku 4.5
- Web search enabled (localized to Peoria, IL)
- Markdown rendering for responses
- Sources/citations from web searches

### Website Sections
1. Hero - Brutalist design with mission statement
2. Mission - Four pillars (Connection, Education, Motivation, Inspiration)
3. Programs - gBETA, Winning Wednesday, Fail Club, Coworking
4. Team - Doug, Jeffrey, Jennifer, Rajeev
5. Contact - Location, hours, apply CTA
6. Partners - DPI, GPEDC, ICC, IIN, OSF Healthcare, U of I System

## Project Structure
```
distillery-website/
├── api/
│   └── chat.js              # Vercel serverless - Claude chat with web search
├── public/
│   └── partners/            # Partner logo images
├── src/
│   ├── config/
│   │   └── firebase.ts      # Firebase configuration
│   ├── contexts/
│   │   └── AuthContext.tsx  # Google Auth provider
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point with AuthProvider
│   └── index.css            # Tailwind styles
├── tailwind.config.js       # Brutalist theme config
└── .env.example             # Environment variables template
```

## Environment Variables

### Vercel (Required)
```
# Firebase (frontend)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Anthropic (serverless API)
ANTHROPIC_API_KEY=
```

### Local Development
Copy `.env.example` to `.env` and fill in values.

## Firebase Setup
- Project: `distillery-website`
- Auth: Google Sign-in enabled
- Console: https://console.firebase.google.com/project/distillery-website

## AI Chat Capabilities
The chat assistant knows about:
- All Distillery Labs programs and services
- Team members and contact info
- Location, hours, coworking pricing
- Central Illinois startup ecosystem
- Can search web for current events, funding, market research

Web search is localized to Peoria, IL and costs $10/1000 searches.

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Design System (Brutalist Theme)
```js
colors: {
  'brutal-black': '#0a0a0a',
  'brutal-white': '#f5f5f5',
  'brutal-gray': '#1a1a1a',
  'brutal-accent': '#ff3e00',  // Orange-red
  'brutal-yellow': '#ffcc00',
}
fonts: {
  'mono': ['JetBrains Mono', 'SF Mono', 'monospace'],
  'display': ['Space Grotesk', 'Inter', 'sans-serif'],
}
```

## Future Enhancements (TODO)
- [ ] CrewAI agentic backend (Railway) for deeper research
- [ ] Scrape/index distillerylabs.org for knowledge base
- [ ] Memory/context persistence across sessions
- [ ] More partner integrations

## Related Projects
- `desilo-distillery` - Full CrewAI research platform (Railway backend)
- `distillerylabs.org` - Original Squarespace site
