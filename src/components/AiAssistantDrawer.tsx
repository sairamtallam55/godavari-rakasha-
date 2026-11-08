import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, AlertTriangle, ShieldCheck, Sparkles, User, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Language } from '../utils/translations';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isFallback?: boolean;
}

export const AiAssistantDrawer: React.FC = () => {
  const { aiAssistantOpen, setAiAssistantOpen, language } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: 'Namaste! I am the Godavari Raksha Multilingual AI Safety Guide for Godavari Pushkaralu 2027. I can guide you on emergency reporting, finding nearby medical and police help posts, river bathing precautions, and tracking lost relatives. How can I help you right now?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>(language);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: 'Nearest First-Aid Post', query: 'Where is the nearest medical first aid camp at Pushkar Ghat?' },
    { label: 'Lost Child Procedure', query: 'How do I report a lost child separated at Kotilingala Ghat?' },
    { label: 'River Bathing Rules', query: 'What are the essential river bathing safety rules for pilgrims?' },
    { label: 'Emergency Numbers', query: 'What are the official emergency telephone helplines for Pushkaralu?' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!aiAssistantOpen) return null;

  const handleSend = async (messageText: string) => {
    const textToSend = messageText.trim();
    if (!textToSend || isSending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          preferredLanguage: selectedLang,
          history,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: `m-${Date.now()}`,
            role: 'model',
            text: data.reply,
            isFallback: data.isFallback,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `m-err-${Date.now()}`,
            role: 'model',
            text: 'I am currently operating in offline mode. For urgent assistance, please contact the nearest police help desk or call 112 / 108 immediately.',
            isFallback: true,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `m-err-${Date.now()}`,
          role: 'model',
          text: 'Unable to reach AI service. Please dial 112 for Police or 108 for Medical assistance.',
          isFallback: true,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 text-slate-100 h-full shadow-2xl flex flex-col border-l border-slate-800">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">AI Multilingual Safety Guide</h3>
                <span className="text-[10px] bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 px-1.5 py-0.2 rounded font-semibold">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-xs text-slate-400">Pushkaralu 2027 Public Safety Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value as Language)}
              className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded px-2 py-1 focus:outline-none"
              aria-label="Assistant Language"
            >
              <option value="English">English</option>
              <option value="Telugu">తెలుగు</option>
              <option value="Hindi">हिंदी</option>
            </select>
            <button
              onClick={() => setAiAssistantOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="bg-amber-950/40 border-b border-amber-800/40 px-3.5 py-2 text-xs text-amber-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Disclaimer:</strong> This AI assistant provides informational guidance only and cannot autonomously dispatch emergency units. For life threats, call <strong>112</strong> or <strong>108</strong> directly.
          </span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'model' && (
                <div className="w-7 h-7 rounded-full bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-indigo-300 shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-slate-800 border border-slate-700/80 text-slate-200 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                {m.isFallback && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-700 text-[10px] text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Deterministic safety guidance fallback</span>
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-blue-900 border border-blue-600 flex items-center justify-center text-blue-200 shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {isSending && (
            <div className="flex gap-2.5 items-center text-xs text-slate-400">
              <div className="w-7 h-7 rounded-full bg-indigo-950 flex items-center justify-center text-indigo-300">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span>Gemini AI is analyzing Pushkaralu safety guidelines...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt chips */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/40">
          <p className="text-[11px] font-semibold text-slate-400 mb-1.5">Suggested Questions:</p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.query)}
                disabled={isSending}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-full border border-slate-700 transition cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask in ${selectedLang} (e.g. nearest ambulance, lost child)...`}
            className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white p-2 rounded-lg transition disabled:text-slate-500 cursor-pointer"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
