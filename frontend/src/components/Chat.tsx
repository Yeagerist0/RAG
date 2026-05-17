import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader } from 'lucide-react';
import { chatWithDocument } from '../utils/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
  confidence?: number;
  isHallucinated?: boolean;
  fallbackUsed?: boolean;
}

interface ChatProps {
  documentUploaded: boolean;
}

export const Chat: React.FC<ChatProps> = ({ documentUploaded }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [useCorrectiveRAG, setUseCorrectiveRAG] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading || !documentUploaded) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const response = await chatWithDocument(query, useCorrectiveRAG);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.data.answer,
        sources: response.data.sources,
        confidence: response.data.confidence,
        isHallucinated: response.data.isHallucinated,
        fallbackUsed: response.data.fallbackUsed,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${error.response?.data?.error || 'Failed to get response'}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl overflow-hidden">
      {/* Settings */}
      <div className="glass m-4 p-3 flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useCorrectiveRAG}
            onChange={(e) => setUseCorrectiveRAG(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">Corrective RAG Mode</span>
        </label>
        <span className="text-xs text-gray-500">
          {documentUploaded ? '✅ Document Ready' : '⚠️ No Document Uploaded'}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">No messages yet</p>
              <p className="text-sm">Upload a document and ask a question to get started</p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'glass text-gray-900 rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>

              {message.role === 'assistant' && message.sources && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                  <p className="text-xs font-semibold text-gray-600">Sources:</p>
                  {message.sources.map((source, idx) => (
                    <div key={idx} className="text-xs bg-white/50 p-2 rounded">
                      <p className="font-medium text-gray-700">{source.source}</p>
                      <p className="text-gray-600 line-clamp-2">{source.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {message.role === 'assistant' && (
                <div className="mt-2 flex gap-2 text-xs">
                  {message.confidence && (
                    <span className="bg-white/50 px-2 py-1 rounded">
                      Confidence: {(message.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                  {message.fallbackUsed && <span className="bg-yellow-200 px-2 py-1 rounded">Fallback Used</span>}
                  {message.isHallucinated && <span className="bg-red-200 px-2 py-1 rounded">⚠️ Hallucination Risk</span>}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="glass px-4 py-3 rounded-lg rounded-bl-none flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm text-gray-600">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="glass m-4 p-3 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={documentUploaded ? 'Ask a question...' : 'Please upload a document first...'}
          disabled={loading || !documentUploaded}
          className="flex-1 bg-transparent outline-none text-sm"
        />
        <button
          type="submit"
          disabled={loading || !documentUploaded || !query.trim()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed p-2"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
