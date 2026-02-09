import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import {
  Menu, X, ArrowRight, Terminal, Zap, Users,
  Calendar, MapPin, ExternalLink, MessageSquare,
  Send, Sparkles, LogOut
} from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import './index.css'

// Google icon component
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

// Agentic Chat Component with Auth
function AgentChat({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, signInWithGoogle, signOut } = useAuth()
  const [messages, setMessages] = useState<{ role: 'user' | 'agent'; content: string }[]>([
    { role: 'agent', content: 'I\'m the Distillery AI. Ask me anything about our programs, resources, or how we can help your startup.' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(1) // Skip the initial greeting
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'agent', content: data.message }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'agent',
        content: 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-24 right-6 w-96 h-[500px] bg-brutal-gray border-2 border-brutal-accent z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b-2 border-brutal-white">
            <div className="flex items-center gap-2">
              <Sparkles className="text-brutal-accent" size={20} />
              <span className="font-bold uppercase text-sm">Distillery AI</span>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <button
                  onClick={signOut}
                  className="hover:text-brutal-accent"
                  title="Sign out"
                >
                  <LogOut size={18} />
                </button>
              )}
              <button onClick={onClose} className="hover:text-brutal-accent">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Auth Gate */}
          {!user ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <Sparkles className="text-brutal-accent mb-4" size={48} />
              <h3 className="text-xl font-bold mb-2">Sign in to chat</h3>
              <p className="text-brutal-white/60 text-sm mb-6">
                Connect with Google to access the Distillery AI assistant
              </p>
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-3 px-6 py-3 bg-white text-brutal-black font-bold hover:bg-brutal-white/90 transition-colors"
              >
                <GoogleIcon />
                Sign in with Google
              </button>
            </div>
          ) : (
            <>
              {/* User info bar */}
              <div className="px-4 py-2 bg-brutal-black/50 border-b border-brutal-white/20 flex items-center gap-2">
                {user.photoURL && (
                  <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />
                )}
                <span className="text-xs text-brutal-white/60 truncate">
                  {user.displayName || user.email}
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`${msg.role === 'user' ? 'ml-8 bg-brutal-accent text-brutal-black' : 'mr-8 bg-brutal-black border border-brutal-white'} p-3`}
                  >
                    {msg.role === 'user' ? (
                      <p className="text-sm">{msg.content}</p>
                    ) : (
                      <div className="text-sm prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:text-brutal-accent prose-a:text-brutal-accent prose-strong:text-brutal-white">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mr-8 bg-brutal-black border border-brutal-white p-3"
                  >
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-brutal-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-brutal-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-brutal-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t-2 border-brutal-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={isLoading ? "Thinking..." : "Ask me anything..."}
                    disabled={isLoading}
                    className="flex-1 bg-brutal-black border-2 border-brutal-white px-3 py-2 text-sm focus:border-brutal-accent outline-none disabled:opacity-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading}
                    className="brutal-button p-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-[18px] h-[18px] border-2 border-brutal-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  const programs = [
    {
      title: 'gBETA',
      desc: '6-week accelerator for early-stage startups. Free. Intensive.',
      deadline: 'Applications due March 8, 2026'
    },
    {
      title: 'Winning Wednesday',
      desc: 'Weekly workshops. Pitch practice. Real feedback.',
      deadline: 'Every Wednesday'
    },
    {
      title: 'Fail Club',
      desc: 'Learn from failure. Share stories. Build resilience.',
      deadline: 'Monthly meetups'
    },
    {
      title: 'Coworking',
      desc: 'Desk space from $100/mo. 24/7 access for members.',
      deadline: 'Join anytime'
    },
  ]

  const team = [
    { name: 'Doug Cruitt', role: 'Executive Director' },
    { name: 'Jeffrey Inman', role: 'Director of Programs' },
    { name: 'Jennifer Rosa', role: 'Events Producer' },
    { name: 'Rajeev Kumar', role: 'MakerSpace Manager' },
  ]

  return (
    <div className="min-h-screen bg-brutal-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-brutal-black/90 backdrop-blur border-b-2 border-brutal-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.a
            href="#"
            whileHover={{ scale: 1.05 }}
            className="text-xl font-bold tracking-tighter"
          >
            DISTILLERY<span className="text-brutal-accent">_</span>
          </motion.a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {['Mission', 'Programs', 'Team', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm uppercase tracking-wider hover:text-brutal-accent transition-colors"
              >
                {item}
              </a>
            ))}
            <a href="#apply" className="brutal-button text-sm">
              Apply Now
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t-2 border-brutal-white overflow-hidden"
            >
              <div className="p-6 space-y-4">
                {['Mission', 'Programs', 'Team', 'Contact', 'Apply'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="block text-lg uppercase tracking-wider hover:text-brutal-accent"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-brutal-accent font-mono text-sm mb-4 tracking-wider">
              // STARTUP ACCELERATOR — PEORIA, IL
            </p>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-none mb-8 font-display">
              REMOVE THE<br />
              <span className="text-brutal-accent">EGO</span>.<br />
              REDUCE THE<br />
              <span className="text-brutal-accent">FRICTION</span>.<br />
              FOCUS ON THE<br />
              <span className="text-brutal-accent">FOUNDER</span>.
            </h1>

            <p className="text-lg md:text-xl text-brutal-white/70 max-w-2xl mb-12 font-mono">
              Building Central Illinois' entrepreneurial ecosystem without gatekeeping.
              Connection. Education. Motivation. Inspiration.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="#programs" className="brutal-button inline-flex items-center gap-2">
                Explore Programs <ArrowRight size={18} />
              </a>
              <a href="#contact" className="brutal-button-outline inline-flex items-center gap-2">
                Get In Touch
              </a>
            </div>
          </motion.div>
        </div>

        {/* Floating terminal */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 w-80"
        >
          <div className="bg-brutal-gray border-2 border-brutal-white p-4">
            <div className="flex gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-brutal-accent" />
              <span className="w-3 h-3 rounded-full bg-brutal-yellow" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="font-mono text-sm space-y-2">
              <p><span className="text-brutal-accent">$</span> distillery --init</p>
              <p className="text-brutal-white/60">Loading ecosystem...</p>
              <p className="text-green-400">Ready to build.</p>
              <p className="terminal-cursor"><span className="text-brutal-accent">$</span> </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-24 border-t-2 border-brutal-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-brutal-accent font-mono text-sm mb-4">// 001 — MISSION</p>
            <h2 className="text-4xl md:text-6xl font-bold mb-12 font-display">
              WHY WE <span className="text-brutal-accent">EXIST</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <p className="text-xl text-brutal-white/80">
                  The Illinois Startup Manifesto envisions a more connected, porous ecosystem
                  across Illinois. We're building it in Central Illinois.
                </p>
                <p className="text-brutal-white/60">
                  From first-time founders drafting business plans to seasoned entrepreneurs
                  preparing for Series A — we meet you where you are.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {['Connection', 'Education', 'Motivation', 'Inspiration'].map((pillar, i) => (
                  <motion.div
                    key={pillar}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="brutal-card"
                  >
                    <Zap className="text-brutal-accent mb-3" size={24} />
                    <p className="font-bold uppercase">{pillar}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-24 border-t-2 border-brutal-white bg-brutal-gray">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-brutal-accent font-mono text-sm mb-4">// 002 — PROGRAMS</p>
            <h2 className="text-4xl md:text-6xl font-bold mb-12 font-display">
              WHAT WE <span className="text-brutal-accent">OFFER</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {programs.map((program, i) => (
                <motion.div
                  key={program.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="brutal-card group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold group-hover:text-brutal-accent transition-colors">
                      {program.title}
                    </h3>
                    <ArrowRight className="text-brutal-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-brutal-white/70 mb-4">{program.desc}</p>
                  <p className="text-brutal-accent text-sm font-mono">{program.deadline}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-24 border-t-2 border-brutal-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-brutal-accent font-mono text-sm mb-4">// 003 — TEAM</p>
            <h2 className="text-4xl md:text-6xl font-bold mb-12 font-display">
              WHO WE <span className="text-brutal-accent">ARE</span>
            </h2>

            <div className="grid md:grid-cols-4 gap-6">
              {team.map((member, i) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 mx-auto mb-4 bg-brutal-gray border-2 border-brutal-white flex items-center justify-center">
                    <Users className="text-brutal-accent" size={32} />
                  </div>
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-brutal-white/60 text-sm">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 border-t-2 border-brutal-white bg-brutal-gray">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-brutal-accent font-mono text-sm mb-4">// 004 — CONTACT</p>
            <h2 className="text-4xl md:text-6xl font-bold mb-12 font-display">
              LET'S <span className="text-brutal-accent">CONNECT</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <MapPin className="text-brutal-accent flex-shrink-0" size={24} />
                  <div>
                    <p className="font-bold mb-1">Location</p>
                    <p className="text-brutal-white/70">201 Southwest Adams Street</p>
                    <p className="text-brutal-white/70">Peoria, IL 61602</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Calendar className="text-brutal-accent flex-shrink-0" size={24} />
                  <div>
                    <p className="font-bold mb-1">Hours</p>
                    <p className="text-brutal-white/70">Monday – Friday: 8:00 AM – 5:00 PM</p>
                    <p className="text-brutal-white/70">Weekends: Closed</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Terminal className="text-brutal-accent flex-shrink-0" size={24} />
                  <div>
                    <p className="font-bold mb-1">Online</p>
                    <a href="https://distillerylabs.org" className="text-brutal-accent hover:text-brutal-yellow transition-colors flex items-center gap-2">
                      distillerylabs.org <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>

              <div id="apply" className="bg-brutal-black border-2 border-brutal-white p-8">
                <h3 className="text-2xl font-bold mb-6">Ready to start?</h3>
                <p className="text-brutal-white/70 mb-6">
                  Whether you're exploring an idea or scaling your startup, we're here to help.
                </p>
                <a
                  href="https://www.gbetastartups.com/distillery-labs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brutal-button inline-flex items-center gap-2 w-full justify-center"
                >
                  Apply to gBETA <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t-2 border-brutal-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-brutal-white/60 text-sm">
            &copy; {new Date().getFullYear()} Distillery Labs. All rights reserved.
          </p>
          <p className="text-brutal-accent font-mono text-sm">
            Building the future of Central Illinois_
          </p>
        </div>
      </footer>

      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setChatOpen(!chatOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-brutal-accent text-brutal-black flex items-center justify-center border-2 border-brutal-accent hover:bg-brutal-black hover:text-brutal-accent transition-colors z-50"
      >
        {chatOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>

      {/* Agent Chat Panel */}
      <AgentChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  )
}

export default App
