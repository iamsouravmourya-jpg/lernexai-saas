/**
 * Standalone AI Tutor Embed Script (Vanilla JS)
 *
 * Usage in HTML / WordPress / PHP:
 * <script src="path/to/ai-tutor-embed.js"></script>
 * <script>
 *   window.AITutor.init({
 *     apiUrl: 'http://localhost:3001/api/tutor/chat',
 *     courseTitle: 'Excel Masterclass',
 *     lessonTitle: 'XLOOKUP Deep Dive',
 *     lessonContext: 'Exact match lookup arrays',
 *     botName: 'AI Tutor Pro'
 *   });
 * </script>
 */

(function () {
  class AITutorEmbed {
    constructor() {
      this.config = {
        apiUrl: '/api/tutor/chat',
        courseTitle: 'Online Course',
        lessonTitle: 'Active Lesson',
        lessonContext: '',
        botName: 'AI Master Tutor',
        themeColor: '#4f46e5',
      };
      this.isOpen = false;
      this.messages = [];
    }

    init(userConfig = {}) {
      this.config = { ...this.config, ...userConfig };
      this.messages = [
        {
          sender: 'bot',
          text: `Hello! I am ${this.config.botName}. Ask me any doubt about "${this.config.lessonTitle}" in English or Hinglish!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];
      this.injectStyles();
      this.renderWidget();
    }

    injectStyles() {
      if (document.getElementById('ai-tutor-styles')) return;
      const style = document.createElement('style');
      style.id = 'ai-tutor-styles';
      style.innerHTML = `
        .ai-tutor-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 999999;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #ffffff;
          border: none;
          padding: 12px 20px;
          border-radius: 50px;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(7f, 70, 229, 0.4);
          display: flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .ai-tutor-fab:hover {
          transform: scale(1.05);
        }
        .ai-tutor-card {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 999999;
          width: 380px;
          max-width: calc(100vw - 32px);
          height: 520px;
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.6);
          display: flex;
          flex-direction: column;
          font-family: system-ui, -apple-system, sans-serif;
          overflow: hidden;
        }
        .ai-tutor-header {
          background: #020617;
          padding: 14px 16px;
          border-bottom: 1px solid #1e293b;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #ffffff;
        }
        .ai-tutor-header h4 {
          margin: 0;
          font-size: 13px;
          font-weight: 700;
        }
        .ai-tutor-header p {
          margin: 0;
          font-size: 10px;
          color: #94a3b8;
        }
        .ai-tutor-close {
          background: #1e293b;
          border: none;
          color: #cbd5e1;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          cursor: pointer;
        }
        .ai-tutor-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #020617;
        }
        .ai-tutor-msg {
          max-width: 85%;
          padding: 10px 14px;
          border-radius: 14px;
          font-size: 12px;
          line-height: 1.5;
          white-space: pre-wrap;
        }
        .ai-tutor-msg.bot {
          background: #0f172a;
          color: #e2e8f0;
          border: 1px solid #1e293b;
          align-self: flex-start;
          border-bottom-left-radius: 2px;
        }
        .ai-tutor-msg.user {
          background: #4f46e5;
          color: #ffffff;
          align-self: flex-end;
          border-bottom-right-radius: 2px;
        }
        .ai-tutor-input-area {
          padding: 12px;
          background: #0f172a;
          border-top: 1px solid #1e293b;
          display: flex;
          gap: 8px;
        }
        .ai-tutor-input {
          flex: 1;
          background: #020617;
          border: 1px solid #1e293b;
          color: #ffffff;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 12px;
          outline: none;
        }
        .ai-tutor-input:focus {
          border-color: #6366f1;
        }
        .ai-tutor-send {
          background: #4f46e5;
          color: #ffffff;
          border: none;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }
      `;
      document.head.appendChild(style);
    }

    renderWidget() {
      let container = document.getElementById('ai-tutor-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'ai-tutor-container';
        document.body.appendChild(container);
      }

      if (!this.isOpen) {
        container.innerHTML = `
          <button class="ai-tutor-fab" id="ai-tutor-open-btn">
            🤖 <span>${this.config.botName}</span>
          </button>
        `;
        document.getElementById('ai-tutor-open-btn').onclick = () => {
          this.isOpen = true;
          this.renderWidget();
        };
        return;
      }

      container.innerHTML = `
        <div class="ai-tutor-card">
          <div class="ai-tutor-header">
            <div>
              <h4>🤖 ${this.config.botName}</h4>
              <p>${this.config.lessonTitle}</p>
            </div>
            <button class="ai-tutor-close" id="ai-tutor-close-btn">✕</button>
          </div>
          <div class="ai-tutor-messages" id="ai-tutor-msg-list">
            ${this.messages
              .map(
                (m) => `
              <div class="ai-tutor-msg ${m.sender}">${m.text}</div>
            `
              )
              .join('')}
          </div>
          <div class="ai-tutor-input-area">
            <input type="text" class="ai-tutor-input" id="ai-tutor-input-field" placeholder="Ask your question (Hinglish/English)..." />
            <button class="ai-tutor-send" id="ai-tutor-send-btn">Send</button>
          </div>
        </div>
      `;

      document.getElementById('ai-tutor-close-btn').onclick = () => {
        this.isOpen = false;
        this.renderWidget();
      };

      const sendBtn = document.getElementById('ai-tutor-send-btn');
      const inputField = document.getElementById('ai-tutor-input-field');

      const handleSend = async () => {
        const text = inputField.value.trim();
        if (!text) return;

        this.messages.push({ sender: 'user', text });
        inputField.value = '';
        this.renderMessages();

        try {
          const res = await fetch(this.config.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userMessage: text,
              courseTitle: this.config.courseTitle,
              lessonTitle: this.config.lessonTitle,
              lessonContext: this.config.lessonContext,
            }),
          });
          const data = await res.json();
          if (data.success && data.reply) {
            this.messages.push({ sender: 'bot', text: data.reply });
          } else {
            this.messages.push({ sender: 'bot', text: '⚠️ Failed to get reply from AI Tutor.' });
          }
        } catch (e) {
          this.messages.push({ sender: 'bot', text: '⚠️ Connection error with AI Tutor backend.' });
        }
        this.renderMessages();
      };

      sendBtn.onclick = handleSend;
      inputField.onkeydown = (e) => {
        if (e.key === 'Enter') handleSend();
      };

      this.scrollToBottom();
    }

    renderMessages() {
      const msgList = document.getElementById('ai-tutor-msg-list');
      if (msgList) {
        msgList.innerHTML = this.messages
          .map(
            (m) => `
          <div class="ai-tutor-msg ${m.sender}">${m.text}</div>
        `
          )
          .join('');
        this.scrollToBottom();
      }
    }

    scrollToBottom() {
      const msgList = document.getElementById('ai-tutor-msg-list');
      if (msgList) msgList.scrollTop = msgList.scrollHeight;
    }
  }

  window.AITutor = new AITutorEmbed();
})();
