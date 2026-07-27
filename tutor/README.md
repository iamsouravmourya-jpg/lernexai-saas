# 🤖 Standalone AI Tutor Module

A plug-and-play AI Tutor module powered by **Groq**. It is designed to be embedded into any LMS, course platform, web app, or website using React, Next.js, Vue, Angular, WordPress, or plain HTML/JS.

---

## 📁 Directory Structure

```text
tutor/
├── README.md                  <- Integration Guide & API Reference
├── package.json               <- Dependencies for standalone server
├── backend/
│   ├── tutor-server.js        <- Standalone Node.js/Express API server
│   ├── tutor-service.ts       <- Exportable TypeScript AI Tutor service
│   └── supabase-edge-function.ts <- Supabase Edge Function example
├── frontend/
│   ├── AITutorWidget.tsx      <- React / Next.js Component (Floating / Inline)
│   └── ai-tutor-embed.js      <- Standalone Vanilla JS Embed
└── example/
    └── index.html             <- Live HTML demo page
```

---

## 🔑 API Key & Security Guide

### 1. API Key Security Architecture
- API key **frontend/browser me kabhi expose nahi hoti**.
- Frontend/website sirf secure backend endpoint ko request bhejta hai.
- API key backend environment me hidden rehti hai:
  - `process.env.GROQ_API_KEY`
  - Supabase Secrets: `GROQ_API_KEY`

---

## ⚡ Quick Start (Backend Server)

### 1. Install Dependencies
```bash
cd tutor
npm install
```

### 2. Set Groq API Key
```bash
export GROQ_API_KEY="your-groq-api-key-here"
```

Optional:
```bash
export GROQ_MODEL="llama-3.1-8b-instant"
```

### 3. Run Standalone Backend Server
```bash
node backend/tutor-server.js
```

The AI Tutor backend will run on `http://localhost:3001`.

---

## 🎨 Frontend Integration Options

### Option A: React / Next.js Component (`AITutorWidget.tsx`)

```tsx
import React from 'react';
import { AITutorWidget } from './tutor/frontend/AITutorWidget';

export function LessonPage() {
  return (
    <div>
      <h1>Lesson 1: Introduction to Formulas</h1>
      <AITutorWidget
        apiUrl="http://localhost:3001/api/tutor/chat"
        courseTitle="Mastering Data Analytics"
        lessonTitle="Excel VLOOKUP & XLOOKUP"
        lessonContext="Learning how to lookup values dynamically across columns using XLOOKUP."
        mode="floating"
      />
    </div>
  );
}
```

---

### Option B: HTML / WordPress / PHP / Any Web Page Embed

```html
<script src="./tutor/frontend/ai-tutor-embed.js"></script>
<script>
  window.AITutor.init({
    apiUrl: "http://localhost:3001/api/tutor/chat",
    courseTitle: "Excel & Data Masterclass",
    lessonTitle: "XLOOKUP Formula Deep Dive",
    lessonContext: "Cell references, exact match, and return arrays",
    botName: "AI Tutor"
  });
</script>
```

---

## 📡 Backend API Reference

### Endpoint: `POST /api/tutor/chat`

#### Request Body
```json
{
  "userMessage": "XLOOKUP kaise kaam karta hai?",
  "courseTitle": "Data Analytics Masterclass",
  "lessonTitle": "XLOOKUP vs VLOOKUP",
  "lessonContext": "Step-by-step lookup matching across rows and columns",
  "messageHistory": []
}
```

#### Response
```json
{
  "success": true,
  "reply": "XLOOKUP Excel ka powerful lookup function hai...",
  "timestamp": "2026-07-25T13:45:00.000Z"
}
```

---

## 🌟 Key Features
- **Bilingual Tutor**: English, Hindi, Hinglish support.
- **Context-Aware**: Course, lesson, and history aware.
- **Groq-powered**: Fast and reliable model responses.
- **Plug-and-Play**: Works with React, Next.js, HTML, WordPress, and PHP.

---

## 🔧 Supabase Edge Function Example

If you want to use Supabase Edge Functions, copy:
`backend/supabase-edge-function.ts` to `supabase/functions/tutor-chat/index.ts`

Then set the secret:
```bash
supabase secrets set GROQ_API_KEY="your-groq-key"
```

Deploy:
```bash
supabase functions deploy tutor-chat
```

---

## Notes
- This folder is a standalone module/example.
- The main LernexAI app should keep using its own integrated tutor path if already wired.
- Update `GROQ_API_KEY` and `GROQ_MODEL` only in backend secrets/env.
