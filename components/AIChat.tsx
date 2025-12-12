import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ChatRole } from '../types';
import { INITIAL_CHAT_MESSAGE } from '../constants';
import { sendMessageToGemini } from '../services/geminiService';

export const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: ChatRole.MODEL, text: INITIAL_CHAT_MESSAGE }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: ChatRole.USER, text: userMsg }]);
    setLoading(true);

    const response = await sendMessageToGemini(userMsg);

    setMessages(prev => [...prev, { role: ChatRole.MODEL, text: response }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end pointer-events-auto">
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 transition-all text-white shadow-lg"
      >
        {isOpen ? (
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="mt-4 w-[calc(100vw-2rem)] md:w-96 h-[60vh] md:h-[500px] bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 origin-bottom-right">
          
          {/* Header */}
          <div className="p-3 md:p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
            <h3 className="text-xs md:text-sm font-bold tracking-widest text-gray-200">GHOST_AI // CORE</h3>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 scrollbar-hide">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === ChatRole.USER ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-3 rounded-md text-xs md:text-sm leading-relaxed ${
                  msg.role === ChatRole.USER 
                    ? 'bg-white/10 text-white border border-white/20' 
                    : 'bg-transparent text-gray-300 border-l-2 border-green-500 pl-3'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                 <div className="text-[10px] md:text-xs text-green-500 animate-pulse">PROCESSING DATA STREAM...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 md:p-4 border-t border-white/10 bg-white/5">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Query system specs..."
                className="flex-1 bg-black/50 border border-white/20 rounded-md px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
              />
              <button 
                onClick={handleSend}
                disabled={loading}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md border border-white/20 disabled:opacity-50 transition-colors"
              >
                ➔
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};