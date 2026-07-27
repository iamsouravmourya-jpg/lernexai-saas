import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bot, Check, Clipboard, LoaderCircle, LockKeyhole, Send, Sparkles } from "lucide-react";
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

function formatLimit(usage: AITutorUsage) {
  if (usage.limit <= 0) return "Unlimited";
  return `${usage.count}/${usage.limit}`;
}

function isEmptyResponse(value: string) {
  return value.trim().length === 0;
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
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const hasReachedLimit = usage.limit > 0 && usage.count >= usage.limit;

  const suggestions = useMemo(
    () => [
      "Explain this lesson simply",
      "What are the key takeaways?",
      "Give me a practical example",
      "Explain this in Hindi",
      "Give me a quick practice task",
    ],
    [],
  );

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
  }, [lesson.id]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending, loadingHistory]);

  async function copyMessage(content: string, id: string) {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(id);
      window.setTimeout(() => setCopiedMessageId((current) => (current === id ? null : current)), 1500);
    } catch {
      setError("Could not copy the message.");
    }
  }

  async function sendMessage(question: string) {
    const trimmed = question.trim();
    if (isEmptyResponse(trimmed) || hasReachedLimit || loadingHistory || sending) return;

    const optimisticId = crypto.randomUUID();
    setMessages((current) => [...current, { id: optimisticId, role: "user", content: trimmed }]);
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
    <aside className="flex min-h-[32rem] w-full flex-col overflow-hidden border-l border-slate-200 bg-white shadow-sm lg:h-full lg:w-[380px] lg:shrink-0">
      <header className="border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-200">
              <Bot className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">AI Tutor</h2>
              <p className="text-xs text-slate-500">Ask anything about this lesson</p>
            </div>
          </div>

          <div className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700" title={lesson.title}>
            <span className="inline-flex max-w-36 items-center gap-1 truncate align-middle">
              <Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{lesson.title}</span>
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>{usage.isFreePlan ? "Free daily messages" : "Pro daily messages"}</span>
          <span className="font-semibold text-slate-700">{formatLimit(usage)}</span>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4" aria-live="polite">
        {loadingHistory ? (
          <div className="flex h-full min-h-[14rem] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm text-slate-500">
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading chat…
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isUser = message.role === "user";
              const canCopy = !isUser;
              const copied = copiedMessageId === message.id;

              return (
                <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                      isUser
                        ? "rounded-br-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                        : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] opacity-70">
                      <span>{isUser ? "You" : "Tutor"}</span>
                      {canCopy ? (
                        <button
                          type="button"
                          onClick={() => void copyMessage(message.content, message.id)}
                          className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 transition hover:bg-black/5"
                          aria-label="Copy message"
                        >
                          {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Clipboard className="h-3 w-3" />}
                        </button>
                      ) : null}
                    </div>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Thinking…
                </div>
              </div>
            )}

            <div ref={messageEndRef} />
          </>
        )}
      </div>

      <div className="border-t border-slate-200 bg-white p-3">
        <div className="mb-3 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => void sendMessage(suggestion)}
              disabled={loadingHistory || sending || hasReachedLimit}
              className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {error && (
          <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
            {error}
          </p>
        )}

        {hasReachedLimit ? (
          <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            <div className="flex items-center gap-2 font-semibold">
              <LockKeyhole className="h-4 w-4" aria-hidden="true" /> Daily limit reached
            </div>
            <p className="mt-1 text-xs">Your {usage.limit} AI messages reset tomorrow.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <label htmlFor={`ai-question-${lesson.id}`} className="sr-only">
              Ask about this lesson
            </label>
            <input
              id={`ai-question-${lesson.id}`}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={2000}
              disabled={loadingHistory || sending}
              placeholder="Ask in English, Hindi, or Hinglish…"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || loadingHistory || sending}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send message"
            >
              {sending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
            </button>
          </form>
        )}
      </div>
    </aside>
  );
}
