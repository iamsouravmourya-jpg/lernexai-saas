import { useState } from "react";
import { MessageCircle, Sparkles, Send, X, Minimize2, Maximize2, Bot } from "lucide-react";

interface AITutorGuideProps {
  context?: "support" | "learning" | "general";
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AITutorGuide({ context = "general" }: AITutorGuideProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: context === "support"
        ? "Hi! I'm your AI support assistant. I can help you fill out the support form, explain what information to include, or guide you through common issues. What do you need help with?"
        : context === "learning"
        ? "Hello! I'm your AI learning companion. I can help you understand course concepts, find specific lessons, or guide you through the learning platform. How can I assist you today?"
        : "Hi there! I'm your AI guide. I can help you navigate the platform, find courses, understand features, or answer any questions you have. What would you like to know?"
    }
  ]);

  const suggestions = context === "support" ? [
    "How do I fill out the support form?",
    "What information should I include in my message?",
    "How long does it take to get a response?",
    "Can I track my support request status?"
  ] : context === "learning" ? [
    "How do I navigate my courses?",
    "Where can I find my progress?",
    "How do quizzes work?",
    "Can I download course materials?"
  ] : [
    "How do I get started?",
    "Where can I find courses?",
    "How does the certificate system work?",
    "What are the subscription plans?"
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage: Message = { role: "user", content: message };
    setMessages([...messages, userMessage]);
    setMessage("");

    // Demo AI response - no actual API call
    setTimeout(() => {
      let aiResponse = "";
      if (context === "support") {
        if (message.toLowerCase().includes("form") || message.toLowerCase().includes("fill")) {
          aiResponse = "To fill out the support form: 1) Select your issue type from the dropdown, 2) If you choose 'Other', describe your issue briefly, 3) Add a clear subject line, 4) Write a detailed message explaining your problem. The more specific you are, the better we can help!";
        } else if (message.toLowerCase().includes("information") || message.toLowerCase().includes("include")) {
          aiResponse = "Include these details in your message: What you were trying to do, what happened instead, any error messages you saw, steps to reproduce the issue, and your account details. This helps us resolve your issue faster.";
        } else if (message.toLowerCase().includes("response") || message.toLowerCase().includes("time")) {
          aiResponse = "Our team typically responds within 24-48 hours during business days. For urgent issues, you can mention 'URGENT' in your subject line. You'll receive an email notification when we respond.";
        } else {
          aiResponse = "I'd be happy to help! Could you provide more details about what you need assistance with? I can guide you through the support process or answer specific questions about our platform.";
        }
      } else if (context === "learning") {
        if (message.toLowerCase().includes("navigate") || message.toLowerCase().includes("find")) {
          aiResponse = "To navigate your courses: Go to the Learning section from the sidebar, you'll see all your enrolled courses. Click on any course to see its modules and lessons. Use the progress bar to track your completion.";
        } else if (message.toLowerCase().includes("progress")) {
          aiResponse = "Your progress is shown on the course cards in the Learning section. You can also see detailed progress in the Dashboard. Each lesson shows a completion status, and modules show overall progress.";
        } else if (message.toLowerCase().includes("quiz")) {
          aiResponse = "Quizzes appear at the end of modules and lessons. You need to complete all lessons in a module to unlock the module quiz. Quizzes have a passing score requirement and time limit. You can retake quizzes to improve your score.";
        } else {
          aiResponse = "I'm here to help with your learning journey! Ask me about course navigation, progress tracking, quizzes, certificates, or any other learning-related questions.";
        }
      } else {
        if (message.toLowerCase().includes("start") || message.toLowerCase().includes("begin")) {
          aiResponse = "To get started: 1) Browse courses from the catalog, 2) Enroll in a course that interests you, 3) Start learning from the first module, 4) Complete lessons and quizzes to track progress. You can also use the AI course wizard to generate a personalized course!";
        } else if (message.toLowerCase().includes("find") || message.toLowerCase().includes("courses")) {
          aiResponse = "You can find courses in the 'Browse Courses' section. Filter by category, difficulty level, or search for specific topics. Each course shows a preview of what you'll learn. Click on any course to see details and enroll.";
        } else if (message.toLowerCase().includes("certificate")) {
          aiResponse = "Our certificate system works in two ways: 1) Score-based certificates from final exams, 2) Course completion certificates. After completing a course or passing the final exam, you can purchase and download certificates from the Certificates section.";
        } else if (message.toLowerCase().includes("plan") || message.toLowerCase().includes("subscription")) {
          aiResponse = "We offer Free and Pro plans. Free includes basic courses and features. Pro unlocks advanced courses, AI mentors, priority support, and unlimited certificate downloads. You can upgrade anytime from the Upgrade section.";
        } else {
          aiResponse = "I'm your AI guide for the LernexAI platform! I can help you with getting started, finding courses, understanding features, certificates, subscriptions, or any other questions. What would you like to know?";
        }
      }

      setMessages(prev => [...prev, { role: "assistant" as const, content: aiResponse }]);
    }, 1000);
  };

  const handleSuggestion = (suggestion: string) => {
    setMessage(suggestion);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        <Bot className="h-5 w-5" />
        <span>AI Guide</span>
        <Sparkles className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-white" />
          <span className="font-semibold text-white">AI Guide</span>
          <Sparkles className="h-4 w-4 text-white/80" />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-all"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4 text-white" /> : <Minimize2 className="h-4 w-4 text-white" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-all"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-primary to-secondary text-white"
                      : "bg-white border border-border text-textDark"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-textMuted mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestion(suggestion)}
                    className="text-xs px-3 py-1.5 rounded-full bg-accent/20 text-primary hover:bg-accent/40 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 rounded-xl border border-border bg-gray-50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="p-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
