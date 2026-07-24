import { useState } from "react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AITutorProps {
  courseId?: string;
  lessonId?: string;
}

export default function AITutor({ courseId, lessonId }: AITutorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI Tutor. I'm here to help you with any questions about this course. Ask me anything! 🤖"
    }
  ]);
  const [input, setInput] = useState("");

  const suggestedQuestions = [
    "Can you explain this concept in simpler terms?",
    "What are the key takeaways from this lesson?",
    "Can you give me a practical example?",
    "How does this relate to the previous lesson?",
  ];

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages([...messages, { role: 'user', content: input }]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "That's a great question! Let me help you with that. Based on the current lesson content, here's what you need to know..."
        }
      ]);
    }, 1000);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="w-80 border-l border-gray-200 bg-white flex flex-col shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">AI Tutor</h3>
        <p className="text-xs text-gray-500">Ask me anything about this course!</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-400 mb-2">Suggested questions:</p>
          <div className="space-y-1">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="w-full text-left text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-2 rounded-lg transition-all"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask a question..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={sendMessage}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center hover:shadow-lg transition-all"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
