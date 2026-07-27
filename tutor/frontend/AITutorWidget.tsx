import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Sparkles, X, Maximize2, Minimize2, Copy, Check } from 'lucide-react';

export interface ChatMessage {
  id?: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp?: string;
}

export interface AITutorWidgetProps {
  /** Backend API endpoint URL (Default: "/api/tutor/chat" or "http://localhost:3001/api/tutor/chat") */
  apiUrl?: string;
  /** Course Name Context */
  courseTitle?: string;
  /** Active Lesson Title Context */
  lessonTitle?: string;
  /** Active Lesson Summary/Context */
  lessonContext?: string;
  /** Display mode: "floating" drawer or "inline" panel (Default: "inline") */
  mode?: 'inline' | 'floating';
  /** Custom Initial Welcome Message */
  welcomeMessage?: string;
  /** Custom AI Tutor Name */
  botName?: string;
}

export const AITutorWidget: React.FC<AITutorWidgetProps> = ({
  apiUrl = '/api/tutor/chat',
  courseTitle = 'Masterclass Course',
  lessonTitle = 'Current Lesson',
  lessonContext = '',
  mode = 'inline',
  welcomeMessage = 'Hello! I am your AI Tutor Assistant. Ask me any doubt or question about this lesson in English or Hinglish!',
  botName = 'AI Master Tutor',
}) => {
  const [isOpen, setIsOpen] = useState(mode === 'inline');
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: welcomeMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: query,
          courseTitle,
          lessonTitle,
          lessonContext,
          messageHistory: messages.map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await res.json();

      if (data.success && data.reply) {
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: `⚠️ Error: ${err.message || 'Could not connect to AI Tutor server. Please check your backend connection.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const quickPrompts = [
    '💡 Is concept ko simple Hinglish me samjha do',
    '💼 Give a real-world practical example',
    '⌨️ Show keyboard shortcuts & pro formulas',
    '🎯 Give me 3 practice interview questions',
  ];

  const contentUI = (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl transition-all ${
        isExpanded ? 'h-[700px]' : 'h-[520px]'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md">
            <Bot className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              {botName}
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </h3>
            <p className="text-[10px] text-slate-400 line-clamp-1">
              Active: {lessonTitle || 'Lesson Tutor'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title={isExpanded ? 'Minimize' : 'Maximize'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          {mode === 'floating' && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/60">
        {messages.map((msg, idx) => (
          <div
            key={msg.id || idx}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>

            <div
              className={`group relative max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>

              <div className="flex items-center justify-between gap-4 mt-2 text-[10px] text-slate-400 border-t border-slate-800/60 pt-1.5">
                <span>{msg.timestamp || 'Just now'}</span>

                <button
                  onClick={() => handleCopy(msg.text, idx)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white flex items-center gap-1"
                  title="Copy text"
                >
                  {copiedIdx === idx ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-amber-300 bg-slate-900 border border-slate-800 p-3 rounded-2xl max-w-xs animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
            <span>AI Tutor is thinking & crafting your explanation...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2 bg-slate-950 border-t border-slate-800/80 overflow-x-auto flex items-center gap-2">
        {quickPrompts.map((prompt, pIdx) => (
          <button
            key={pIdx}
            disabled={isLoading}
            onClick={() => handleSendMessage(prompt.slice(3))}
            className="text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-xl whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask your question or doubt (English / Hinglish)..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !input.trim()}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl shadow-md transition-transform active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  if (mode === 'inline') {
    return contentUI;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-[360px] sm:w-[420px]">{contentUI}</div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white p-4 rounded-full shadow-2xl flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95 border border-indigo-400/40"
        >
          <Bot className="w-6 h-6 text-amber-300 animate-bounce" />
          <span className="text-xs font-bold pr-1">Ask AI Tutor</span>
        </button>
      )}
    </div>
  );
};
