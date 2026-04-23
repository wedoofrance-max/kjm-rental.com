'use client';

import { useState, useEffect, useRef } from 'react';
import { Icon } from '../ui/Icon';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title?: string;
  category: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export default function AIAdvisor({ isDark }: { isDark: boolean }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'business_strategy', label: 'Business Strategy', icon: 'ph:briefcase-bold' },
    { id: 'social_media', label: 'Social Media', icon: 'ph:share-network-bold' },
    { id: 'marketing', label: 'Marketing', icon: 'ph:megaphone-bold' },
    { id: 'operations', label: 'Operations', icon: 'ph:gear-bold' },
    { id: 'general', label: 'General', icon: 'ph:chat-dots-bold' },
  ];

  const greetingMessages: Record<string, string> = {
    business_strategy:
      "Hello! I'm your business strategy advisor. I can help you with pricing strategies, scaling your business, customer retention, and competitive positioning. What would you like to discuss today?",
    social_media:
      "Hi! I'm your social media expert. I can help you create content calendars, develop strategies for Instagram, TikTok, Facebook, and more. How can I assist with your social media presence?",
    marketing:
      "Welcome! I'm your marketing strategist. I can help with customer acquisition, website optimization, campaigns, and brand positioning. What marketing challenges can I help you solve?",
    operations:
      "Hello! I'm your operations consultant. I can help with fleet management, maintenance scheduling, customer service improvement, and booking optimization. What operational improvements are you looking for?",
    general:
      "Hi Po! I'm your business advisor. I can help you with any aspect of running KJM Motors - marketing, operations, finance, customer service, or growth strategies. What can I help you with today?",
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentConversation?.messages.length]);

  const fetchConversations = async () => {
    setLoadingConversations(true);
    try {
      const res = await fetch('/api/admin/ai-advisor/conversations');
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setLoading(true);
    setApiError(null);

    try {
      // If conversation is temporary (new), don't include temp ID
      const convId =
        currentConversation?.id && !currentConversation.id.startsWith('temp-')
          ? currentConversation.id
          : undefined;

      const res = await fetch('/api/admin/ai-advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: convId,
          message: inputMessage,
          category: currentConversation?.category || selectedCategory,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || 'Failed to get AI response';
        setApiError(errorMessage);
        console.error('API Error:', errorMessage);
        return;
      }

      const data = await res.json();
      if (data.conversation) {
        setCurrentConversation(data.conversation);
        setInputMessage('');
        await fetchConversations();
      } else {
        setApiError('Invalid response from server');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      console.error('Error sending message:', error);
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = (category: string) => {
    setSelectedCategory(category);
    setApiError(null);
    setInputMessage('');

    // Create new conversation with greeting - no async needed
    const greeting =
      greetingMessages[category as keyof typeof greetingMessages] ||
      "Hi Po! What can I help you with today?";

    // Create temporary conversation with greeting
    const tempConversation: Conversation = {
      id: 'temp-' + Date.now(),
      title: 'New Conversation',
      category,
      messages: [
        {
          id: 'greeting-' + Date.now(),
          role: 'assistant',
          content: greeting,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentConversation(tempConversation);
  };

  const deleteConversation = async (id: string) => {
    if (!confirm('Delete this conversation?')) return;

    try {
      await fetch(`/api/admin/ai-advisor/conversations?id=${id}`, { method: 'DELETE' });
      setConversations(conversations.filter((c) => c.id !== id));
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  return (
    <div className={`flex h-screen ${isDark ? 'bg-neutral-900' : 'bg-neutral-50'}`}>
      {/* Sidebar - Conversations */}
      <div className={`w-64 border-r ${isDark ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-200 bg-white'} flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className={`p-4 border-b ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
          <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            Conversations
          </h2>
        </div>

        {/* Quick Start Categories */}
        <div className="p-4 space-y-2 flex-shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => startNewConversation(cat.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors text-left ${
                selectedCategory === cat.id && !currentConversation
                  ? isDark
                    ? 'bg-primary-600 text-white'
                    : 'bg-primary-500 text-white'
                  : isDark
                  ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {/* @ts-ignore */}
              <Icon icon={cat.icon} width={16} height={16} />
              <span className="truncate">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Previous Conversations */}
        <div className={`flex-1 overflow-y-auto border-t ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
          {loadingConversations ? (
            <p className={`p-4 text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
              Loading...
            </p>
          ) : conversations.length === 0 ? (
            <p className={`p-4 text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
              No conversations yet
            </p>
          ) : (
            <div className="space-y-2 p-3">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setCurrentConversation(conv)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentConversation?.id === conv.id
                      ? isDark
                        ? 'bg-primary-600 text-white'
                        : 'bg-primary-500 text-white'
                      : isDark
                      ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <p className="font-bold text-xs truncate">{conv.title || 'Untitled'}</p>
                  <p className="text-xs opacity-75 truncate">
                    {new Date(conv.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${isDark ? 'bg-neutral-800' : 'bg-white'}`}>
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className={`p-4 border-b ${isDark ? 'border-neutral-700' : 'border-neutral-200'} flex items-center justify-between`}>
              <div className="flex-1">
                <p className={`font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  {currentConversation.title || 'New Conversation'}
                </p>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  {categories.find((c) => c.id === currentConversation.category)?.label}
                </p>
              </div>
              {!currentConversation.id.startsWith('temp-') && (
                <button
                  onClick={() => deleteConversation(currentConversation.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark
                      ? 'hover:bg-neutral-700 text-neutral-400'
                      : 'hover:bg-neutral-100 text-neutral-600'
                  }`}
                  title="Delete conversation"
                >
                  {/* @ts-ignore */}
                  <Icon icon="ph:trash-simple-bold" width={18} height={18} />
                </button>
              )}
            </div>

            {/* Error Message */}
            {apiError && (
              <div className={`p-4 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-100 border-red-200'} border-b text-sm`}>
                <p className={isDark ? 'text-red-300' : 'text-red-700'}>
                  Error: {apiError}
                </p>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentConversation.messages && currentConversation.messages.length > 0 ? (
                currentConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-3 rounded-lg shadow-sm ${
                        msg.role === 'user'
                          ? isDark
                            ? 'bg-primary-600 text-white'
                            : 'bg-primary-500 text-white'
                          : isDark
                          ? 'bg-neutral-600 text-neutral-50 border border-neutral-500'
                          : 'bg-neutral-100 text-neutral-900'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-xs mt-1 opacity-70`}>
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className={isDark ? 'text-neutral-500' : 'text-neutral-600'}>No messages yet</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSendMessage}
              className={`p-4 border-t ${isDark ? 'border-neutral-700' : 'border-neutral-200'} flex gap-2`}
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !loading) {
                    handleSendMessage(e as any);
                  }
                }}
                placeholder="Ask for advice..."
                disabled={loading}
                className={`flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  isDark
                    ? 'bg-neutral-700 text-white placeholder-neutral-500 disabled:bg-neutral-800'
                    : 'bg-neutral-50 text-neutral-900 placeholder-neutral-600 disabled:bg-neutral-100'
                }`}
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className={`px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 ${
                  loading || !inputMessage.trim()
                    ? isDark
                      ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                      : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                    : isDark
                    ? 'bg-primary-600 hover:bg-primary-500 text-white'
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
              >
                {/* @ts-ignore */}
                <Icon
                  icon={loading ? 'ph:spinner-bold' : 'ph:arrow-up-bold'}
                  width={18}
                  height={18}
                  className={loading ? 'animate-spin' : ''}
                />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-6xl mb-4 ${isDark ? 'text-neutral-700' : 'text-neutral-200'}`}>
                {/* @ts-ignore */}
                <Icon icon="ph:sparkles-bold" width={64} height={64} />
              </div>
              <p className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                AI Business Advisor
              </p>
              <p className={`text-sm mb-6 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Choose a category above to start a new conversation
              </p>
              <div className="text-xs space-y-2">
                <p className={isDark ? 'text-neutral-500' : 'text-neutral-600'}>
                  Get expert advice on:
                </p>
                <ul className={`${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
                  <li>Business strategy and scaling</li>
                  <li>Social media marketing</li>
                  <li>Marketing campaigns</li>
                  <li>Operational efficiency</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
