import { trpc } from "@/lib/trpc";
import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, ChevronDown } from "lucide-react";
import { Streamdown } from "streamdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content: "Hello, I'm **Oma** — your personal scent advisor at OmaLuxe. ✦\n\nI'd love to help you discover your perfect candle. Could you tell me a little about the mood or atmosphere you're hoping to create? For example, are you looking for something romantic and warm, calm and meditative, or perhaps bright and energising?",
};

export default function ScentAdvisor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const recommend = trpc.ai.recommend.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
      setIsTyping(false);
    },
    onError: () => {
      setMessages((prev) => [...prev, { role: "assistant", content: "I'm sorry, I'm having a moment. Please try again." }]);
      setIsTyping(false);
    },
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);
    recommend.mutate({ messages: newMessages });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "I want something romantic",
    "Help me relax and unwind",
    "I need an energising scent",
    "Something mysterious and dark",
  ];

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[oklch(0.38_0.07_55)] text-white shadow-lg hover:bg-[oklch(0.28_0.05_55)] transition-all duration-300 flex items-center justify-center group"
        aria-label="Open scent advisor"
      >
        {isOpen ? (
          <ChevronDown size={22} strokeWidth={1.5} />
        ) : (
          <Sparkles size={22} strokeWidth={1.5} />
        )}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[oklch(0.72_0.12_75)] text-white text-[9px] flex items-center justify-center font-sans">
            ✦
          </span>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] bg-white border border-[oklch(0.88_0.015_75)] shadow-2xl flex flex-col"
          style={{ height: "480px" }}>
          {/* Header */}
          <div className="bg-[oklch(0.18_0.015_60)] px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[oklch(0.72_0.12_75/0.2)] flex items-center justify-center">
                <Sparkles size={15} strokeWidth={1.5} className="text-[oklch(0.72_0.12_75)]" />
              </div>
              <div>
                <p className="font-serif text-sm font-medium text-white">Oma</p>
                <p className="font-sans text-[9px] tracking-[0.15em] uppercase text-[oklch(0.72_0.12_75)]">Scent Advisor</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-[oklch(0.72_0.12_75/0.15)] flex items-center justify-center shrink-0 mr-2 mt-1">
                    <Sparkles size={11} strokeWidth={1.5} className="text-[oklch(0.62_0.12_70)]" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[oklch(0.38_0.07_55)] text-white font-sans"
                      : "bg-[oklch(0.96_0.012_80)] text-[oklch(0.18_0.015_60)]"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="font-sans text-xs leading-relaxed">
                      <Streamdown>{msg.content}</Streamdown>
                      {/* Render shop link if recommendation mentions products */}
                      {msg.content.toLowerCase().includes("recommend") || msg.content.toLowerCase().includes("perfect for") ? (
                        <a
                          href="/shop"
                          className="inline-block mt-2 font-sans text-[10px] tracking-[0.12em] uppercase text-[oklch(0.62_0.12_70)] border-b border-[oklch(0.62_0.12_70/0.4)] hover:border-[oklch(0.62_0.12_70)] transition-colors"
                        >
                          Browse our collection →
                        </a>
                      ) : null}
                    </div>
                  ) : (
                    <span className="font-sans text-xs">{msg.content}</span>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-[oklch(0.72_0.12_75/0.15)] flex items-center justify-center shrink-0 mr-2 mt-1">
                  <Sparkles size={11} strokeWidth={1.5} className="text-[oklch(0.62_0.12_70)]" />
                </div>
                <div className="bg-[oklch(0.96_0.012_80)] px-4 py-3 flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[oklch(0.62_0.12_70)]"
                      style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts (only show at start) */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInput(prompt);
                    setTimeout(() => {
                      const userMessage: Message = { role: "user", content: prompt };
                      const newMessages = [...messages, userMessage];
                      setMessages(newMessages);
                      setInput("");
                      setIsTyping(true);
                      recommend.mutate({ messages: newMessages });
                    }, 50);
                  }}
                  className="font-sans text-[10px] px-3 py-1.5 border border-[oklch(0.88_0.015_75)] text-[oklch(0.52_0.02_60)] hover:border-[oklch(0.62_0.12_70)] hover:text-[oklch(0.38_0.07_55)] transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-[oklch(0.88_0.015_75)] p-3 flex items-center gap-2 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your mood or preference..."
              className="flex-1 font-sans text-xs text-[oklch(0.18_0.015_60)] placeholder:text-[oklch(0.62_0.02_60)] focus:outline-none bg-transparent"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-8 h-8 rounded-full bg-[oklch(0.38_0.07_55)] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[oklch(0.28_0.05_55)] transition-colors"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}
