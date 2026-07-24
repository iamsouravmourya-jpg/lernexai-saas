import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, LoaderCircle, LockKeyhole, Send, Sparkles } from "lucide-react";
import { askAITutor, fetchAIChatHistory, type AIChatMessage, type AITutorUsage } from "@/lib/aiTutor";
import type { Lesson } from "@/lib/course";

interface AIChatPanelProps {
  lesson: Lesson;
  planType?: string;
}

const FREE_DAILY_LIMIT = 10;
const PRO_DAILY_LIMIT = 100;

function welcomeMessage(lesson: Lesson): AIChatMessage {
  return {
    id: `welcome-${lesson.id}`,
    role: "assistant",
    content: `Hi! I’m ready to help with “${lesson.title}”. You can ask in English, Hindi, or Hinglish.`,
  };
}

export default function AIChatPanel({ lesson, planType = "free" }: AIChatPanelProps) {
  const initialIsFreePlan = planType.toLowerCase() !== "pro";
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AIChatMessage[]>([welcomeMessage(lesson)]);
  const [usage, setUsage] = useState<AITutorUsage>({
    count: 0,
    limit: initialIsFreePlan ? FREE_DAILY_LIMIT : PRO_DAILY_LIMIT,
    isFreePlan: initialIsFreePlan,
  });
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const hasReachedLimit = usage.count >= usage.limit;

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      setLoadingHistory(true);
      setError(null);

      try {
        const result = await fetchAIChatHistory(lesson.id);
        if (!active) return;
        setMessages(result.messages.length > 0 ? result.messages : [welcomeMessage(lesson)]);
        setUsage(result.usage);
      } catch (historyError) {
        if (!active) return;
        setError(historyError instanceof Error ? historyError.message : "Could not load AI tutor history.");
      } finally {
        if (active) setLoadingHistory(false);
      }
    }

    void loadHistory();
    return () => {
      active = false;
    };
  }, [lesson]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const suggestions = [
    "Explain this lesson simply",
    "What are the key takeaways?",
    "Give me a practical example",
    "Explain this in Hindi",
    "Give me a quick practice task",
  ];

  async function sendMessage(question: string) {
    const trimmed = question.trim();
    if (!trimmed || hasReachedLimit || loadingHistory || sending) return;

    const optimisticId = crypto.randomUUID();
    setMessages((current) => [
      ...current,
      { id: optimisticId, role: "user", content: trimmed },
    ]);
    setInput("");
    setError(null);
    setSending(true);

    try {
      const result = await askAITutor(lesson.id, trimmed);
      setMessages((current) => [...current, result.message]);
      setUsage(result.usage);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "The AI tutor could not answer right now.");
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <aside className="flex min-h-[32rem] w-full flex-col border-l border-gray-200 bg-white lg:h-full lg:w-96 lg:shrink-0 lg:overflow-hidden">
      <header className="border-b border-gray-200 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700"><Bot className="h-5 w-5" aria-hidden="true" /></span>
            <div><h2 className="font-bold text-gray-900">AI Learning Assistant</h2><p className="text-xs text-gray-500">Powered by Gemini</p></div>
          </div>
          <span className="inline-flex max-w-36 items-center gap-1 truncate rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700" title={lesson.title}><Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />{lesson.title}</span>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>{usage.isFreePlan ? "Free daily messages" : "Pro daily messages"}</span>
          <span className="font-semibold text-gray-700">{usage.count}/{usage.limit}</span>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
        {loadingHistory ? (
          <div className="flex h-full items-center justify-center gap-2 text-sm text-gray-500">
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading chat…
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "rounded-br-md bg-purple-600 text-white" : "rounded-bl-md bg-gray-100 text-gray-800"}`}>{message.content}</div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3 text-sm text-gray-500">
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Thinking…
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </>
        )}
      </div>

      {messages.length === 1 && !hasReachedLimit && (
        <div className="space-y-2 px-4 pb-3">
          <p className="text-xs font-medium text-gray-400">Suggested questions</p>
          {suggestions.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => void sendMessage(suggestion)} className="block w-full rounded-xl border border-purple-100 px-3 py-2 text-left text-xs text-purple-700 transition hover:bg-purple-50">{suggestion}</button>
          ))}
        </div>
      )}

      <div className="border-t border-gray-200 p-4">
        {error && <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">{error}</p>}
        {hasReachedLimit ? (
          <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800"><div className="flex items-center gap-2 font-semibold"><LockKeyhole className="h-4 w-4" aria-hidden="true" />Daily limit reached</div><p className="mt-1 text-xs">Your {usage.limit} AI messages reset tomorrow.</p></div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <label htmlFor={`ai-question-${lesson.id}`} className="sr-only">Ask about this lesson</label>
            <input id={`ai-question-${lesson.id}`} value={input} onChange={(event) => setInput(event.target.value)} maxLength={2000} disabled={loadingHistory || sending} placeholder="Ask in English, Hindi, or Hinglish…" className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60" />
            <button type="submit" disabled={!input.trim() || loadingHistory || sending} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send message">{sending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}</button>
          </form>
        )}
      </div>
    </aside>
  );
}
