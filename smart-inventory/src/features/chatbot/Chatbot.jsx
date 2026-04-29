import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, User as UserIcon } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { useAuth } from '@/context/AuthContext';
import { answerQuery, suggestedQueries } from './chatbotEngine';
import { cn, initials } from '@/lib/helpers';

export default function Chatbot() {
  const { user } = useAuth();
  const inventoryCtx = useInventory();
  const { items, rooms } = inventoryCtx;

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'bot',
      text: `Hi${user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}! I'm your inventory assistant. Ask me anything about your hardware — counts, conditions, rooms, brands. Type "help" for examples.`,
    },
  ]);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking, open]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const send = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setThinking(true);

    // Small delay for natural feel
    setTimeout(() => {
      const reply = answerQuery(trimmed, inventoryCtx);
      setMessages((m) => [
        ...m,
        { id: `b-${Date.now()}`, role: 'bot', text: reply },
      ]);
      setThinking(false);
    }, 380);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  const suggestions = suggestedQueries(items, rooms);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 w-14 h-14 rounded-full shadow-lifted flex items-center justify-center transition-all',
          open
            ? 'bg-ink-900 text-cream-50 hover:bg-ink-800'
            : 'bg-accent-700 text-cream-50 hover:bg-accent-800 hover:scale-105'
        )}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        {!open && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-cream-50" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-[400px] h-[560px] max-h-[calc(100vh-7rem)] bg-cream-50 border border-cream-200 rounded-2xl shadow-lifted flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-cream-200 bg-white flex items-center gap-3">
            <div className="w-9 h-9 bg-accent-700 text-cream-50 rounded-lg flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" strokeWidth={2.25} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-base text-ink-900 leading-tight">
                Inventory Assistant
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-ink-500">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Online · {items.length} record{items.length === 1 ? '' : 's'} loaded
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg) => (
              <Bubble key={msg.id} msg={msg} user={user} />
            ))}
            {thinking && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 bg-accent-700 text-cream-50 rounded-full flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-cream-200 rounded-2xl rounded-tl-sm px-4 py-2.5">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
                    <span className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && suggestions.length > 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs px-2.5 py-1.5 bg-white border border-cream-200 hover:border-accent-200 hover:bg-accent-50 hover:text-accent-800 rounded-full transition-colors text-ink-600"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-cream-200 bg-white px-3 py-3 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your inventory…"
              className="flex-1 bg-cream-50 border border-cream-200 rounded-full px-4 py-2 text-sm focus:border-accent-600 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-9 h-9 bg-accent-700 hover:bg-accent-800 disabled:bg-cream-200 disabled:text-ink-400 text-cream-50 rounded-full flex items-center justify-center transition-colors shrink-0"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function Bubble({ msg, user }) {
  const isUser = msg.role === 'user';
  return (
    <div className={cn('flex items-start gap-2.5', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-medium',
          isUser
            ? 'bg-cream-200 text-ink-800'
            : 'bg-accent-700 text-cream-50'
        )}
      >
        {isUser ? (
          user?.displayName || user?.email ? (
            initials(user?.displayName || '', user?.email || '')
          ) : (
            <UserIcon className="w-3.5 h-3.5" />
          )
        ) : (
          <Bot className="w-3.5 h-3.5" />
        )}
      </div>
      <div
        className={cn(
          'max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
          isUser
            ? 'bg-accent-700 text-cream-50 rounded-tr-sm'
            : 'bg-white border border-cream-200 text-ink-800 rounded-tl-sm'
        )}
      >
        {msg.text}
      </div>
    </div>
  );
}
