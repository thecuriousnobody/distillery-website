import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { conciergeTransport, getMessageText } from "./conciergeTransport";

function parseChips(text: string): { cleanText: string; chips: string[] } {
  const match = text.match(/<!--\s*CHIPS:\s*(\[.*?\])\s*-->/s);
  if (!match) return { cleanText: text, chips: [] };
  try {
    const chips = JSON.parse(match[1]);
    return { cleanText: text.replace(match[0], "").trim(), chips };
  } catch {
    return { cleanText: text, chips: [] };
  }
}

const QUICK_ACTIONS = [
  "What's happening today?",
  "Is there a room available?",
  "What programs do you offer?",
  "What are your hours?",
  "How do I join the coworking space?",
  "Tell me about gBETA",
];

// Web Speech API types
interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } }; length: number };
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | (new () => SpeechRecognitionInstance)
    | null;
}

export default function ChatPanel() {
  const { messages, sendMessage, setMessages, status, error } = useChat({
    transport: conciergeTransport,
  });
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const transcriptRef = useRef("");

  const isLoading = status === "submitted" || status === "streaming";
  const hasError = status === "error" || !!error;
  const speechAvailable = !!getSpeechRecognition();

  const resetChat = useCallback(() => {
    setMessages([]);
    setInput("");
  }, [setMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const sendQuickAction = (text: string) => {
    if (isLoading) return;
    sendMessage({ text });
  };

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Build transcript from all results
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      // Store in ref for onend to use, and show live in input field
      transcriptRef.current = transcript;
      setInput(transcript);
    };

    recognition.onerror = () => {
      transcriptRef.current = "";
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      // Send exactly once using the ref value
      const finalText = transcriptRef.current.trim();
      transcriptRef.current = "";
      if (finalText) {
        sendMessage({ text: finalText });
        setInput("");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex-none px-6 py-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="font-display text-xl text-brutal-white font-bold tracking-tight">
          WALK-UP CONCIERGE
        </h2>
        {messages.length > 0 && (
          <button
            onClick={resetChat}
            className="font-mono text-xs px-3 py-1.5 border border-gray-600 text-gray-400 hover:border-brutal-white hover:text-brutal-white transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="text-center">
              <h3 className="font-display text-2xl text-brutal-white font-bold mb-1">
                Welcome!
              </h3>
              <p className="font-mono text-sm text-gray-400">
                How can I help you today?
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => sendQuickAction(action)}
                  className="font-mono text-sm px-3 py-2 border border-brutal-accent text-brutal-accent hover:bg-brutal-accent hover:text-brutal-black transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const rawText = getMessageText(message);
              if (!rawText) return null;
              const isLastMessage = index === messages.length - 1;
              const isStreaming = isLastMessage && message.role === "assistant" && (status === "streaming" || status === "submitted");
              const isLastCompleted = isLastMessage && message.role === "assistant" && !isStreaming;
              const { cleanText, chips } = message.role === "assistant" && !isStreaming
                ? parseChips(rawText)
                : { cleanText: rawText, chips: [] };
              return (
                <div key={message.id}>
                  <div
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 font-mono text-sm leading-relaxed ${
                        message.role === "user"
                          ? "bg-brutal-accent text-brutal-black"
                          : "bg-brutal-gray text-brutal-white border border-gray-700"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        isStreaming ? (
                          <div className="whitespace-pre-wrap">{cleanText}</div>
                        ) : (
                          <div className="prose prose-invert prose-sm max-w-none [&_p]:mb-2 [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:mb-1 [&_strong]:text-brutal-accent [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-brutal-accent [&_h1]:mb-2 [&_h1]:mt-3 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-brutal-accent [&_h2]:mb-2 [&_h2]:mt-3 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-brutal-accent [&_h3]:mb-1 [&_h3]:mt-2 [&_table]:w-full [&_table]:border-collapse [&_table]:my-2 [&_th]:text-left [&_th]:border-b [&_th]:border-gray-600 [&_th]:pb-1 [&_th]:pr-3 [&_th]:text-brutal-accent [&_td]:border-b [&_td]:border-gray-700/50 [&_td]:py-1 [&_td]:pr-3 [&_a]:text-brutal-accent [&_a]:underline [&_hr]:border-gray-700 [&_hr]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-brutal-accent [&_blockquote]:pl-3 [&_blockquote]:text-gray-400">
                            <ReactMarkdown>{cleanText}</ReactMarkdown>
                          </div>
                        )
                      ) : (
                        cleanText
                      )}
                    </div>
                  </div>
                  {isLastCompleted && chips.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 ml-0">
                      {chips.map((chip) => (
                        <button
                          key={chip}
                          onClick={() => sendQuickAction(chip)}
                          className="font-mono text-xs px-3 py-1.5 border border-brutal-accent/60 text-brutal-accent hover:bg-brutal-accent hover:text-brutal-black transition-colors"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Error state */}
            {hasError && (
              <div className="flex justify-start">
                <div className="bg-brutal-gray border border-red-500/50 px-4 py-3 max-w-[85%]">
                  <p className="font-mono text-sm text-red-400 mb-2">
                    Sorry, I couldn't connect. Please try again.
                  </p>
                  <button
                    onClick={resetChat}
                    className="font-mono text-xs px-3 py-1 border border-brutal-accent text-brutal-accent hover:bg-brutal-accent hover:text-brutal-black transition-colors"
                  >
                    Start over
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-brutal-gray border border-gray-700 px-4 py-3">
              <div className="flex space-x-2">
                <span className="w-2 h-2 bg-brutal-accent animate-pulse rounded-full" />
                <span className="w-2 h-2 bg-brutal-accent animate-pulse rounded-full [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-brutal-accent animate-pulse rounded-full [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="flex-none px-6 py-4 border-t border-gray-700"
      >
        <div className="flex gap-2">
          {/* Microphone button */}
          {speechAvailable && (
            <button
              type="button"
              onClick={toggleListening}
              disabled={isLoading}
              className={`flex-none w-12 h-12 flex items-center justify-center border-2 transition-colors disabled:opacity-50 ${
                listening
                  ? "border-red-500 bg-red-500/20 text-red-400 animate-pulse"
                  : "border-gray-600 text-gray-400 hover:border-brutal-accent hover:text-brutal-accent"
              }`}
              title={listening ? "Stop listening" : "Speak"}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </button>
          )}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={listening ? "Listening..." : "Ask me anything..."}
            className="flex-1 bg-brutal-gray border border-gray-600 text-brutal-white font-mono text-sm px-4 py-3 focus:outline-none focus:border-brutal-accent placeholder:text-gray-500"
            readOnly={listening}
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || listening}
            className="font-mono text-sm px-6 py-3 bg-brutal-accent text-brutal-black font-bold hover:bg-brutal-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
