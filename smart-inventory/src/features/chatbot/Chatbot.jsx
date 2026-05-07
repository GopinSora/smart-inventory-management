import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '@/context/InventoryContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { answerQuery, detectAction, suggestedQueries } from './chatbotEngine';
import { cn, initials } from '@/lib/helpers';
import ItemFormModal from '@/features/inventory/ItemFormModal';
import toast from 'react-hot-toast';

export default function Chatbot() {
  const { user } = useAuth();
  const inventoryCtx = useInventory();
  const { items, rooms, seedDemo } = inventoryCtx;
  const { dark, toggle: toggleDark } = useTheme();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'bot',
      text: `Hi${user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}! I'm your inventory assistant.\n\nI can answer questions, navigate the app, add items, and toggle dark mode.\n\nTry: "go to inventory", "add a keyboard", "how many monitors", or type "help".`,
    },
  ]);
  const [thinking, setThinking] = useState(false);
  const [addItemModal, setAddItemModal] = useState(null); // { category? }
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

  const addBotMessage = useCallback((text) => {
    setMessages((m) => [...m, { id: `b-${Date.now()}`, role: 'bot', text }]);
  }, []);

  const send = useCallback((text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setThinking(true);

    setTimeout(() => {
      setThinking(false);

      // First check for action intents
      const action = detectAction(trimmed, { rooms, dark });

      if (action) {
        switch (action.type) {
          case 'navigate': {
            addBotMessage(`Taking you to **${action.payload.label}**…`);
            setTimeout(() => {
              navigate(action.payload.path);
              setOpen(false);
            }, 400);
            break;
          }
          case 'set_dark': {
            const want = action.payload.value;
            if (dark !== want) toggleDark();
            addBotMessage(want ? '🌙 Dark mode is now on.' : '☀️ Light mode is now on.');
            break;
          }
          case 'toggle_dark': {
            toggleDark();
            addBotMessage(dark ? '☀️ Switched to light mode.' : '🌙 Switched to dark mode.');
            break;
          }
          case 'open_add_item': {
            addBotMessage(`Opening the "Add item" form${action.payload.category ? ` for a ${action.payload.category}` : ''}…`);
            setTimeout(() => {
              setAddItemModal({ category: action.payload.category });
              setOpen(false);
            }, 400);
            break;
          }
          case 'navigate_rooms_add': {
            addBotMessage('Heading to Rooms so you can create a new one…');
            setTimeout(() => {
              navigate('/rooms');
              setOpen(false);
            }, 400);
            break;
          }
          case 'seed_demo': {
            if (items.length > 0 || rooms.length > 0) {
              addBotMessage('Your inventory already has data. Demo data is only loaded on an empty inventory.');
            } else {
              addBotMessage('Loading demo data…');
              seedDemo()
                .then(() => addBotMessage('✅ Demo data loaded! You can now explore your inventory.'))
                .catch(() => addBotMessage('❌ Could not load demo data. Please try from the Dashboard.'));
            }
            break;
          }
          default: {
            const reply = answerQuery(trimmed, inventoryCtx);
            addBotMessage(reply);
          }
        }
      } else {
        const reply = answerQuery(trimmed, inventoryCtx);
        addBotMessage(reply);
      }
    }, 380);
  }, [addBotMessage, dark, inventoryCtx, items.length, navigate, rooms, rooms.length, seedDemo, toggleDark]);

  const handleSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  const suggestions = suggestedQueries(items, rooms);

  return (
    <>
      {/* Add item modal opened by chatbot */}
      {addItemModal && (
        <ItemFormModal
          mode="add"
          initial={addItemModal.category ? { category: addItemModal.category } : undefined}
          onClose={() => setAddItemModal(null)}
        />
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 w-14 h-14 rounded-full shadow-lifted flex items-center justify-center transition-all',
          open
            ? 'bg-ink-900 dark:bg-[#1e1d1a] text-cream-50 hover:bg-ink-800 dark:hover:bg-[#252420]'
            : 'bg-accent-700 dark:bg-orange-600 text-cream-50 hover:bg-accent-800 dark:hover:bg-orange-500 hover:scale-105'
        )}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        {!open && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-cream-50 dark:border-[#141412]" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[calc(100vh-7rem)] bg-cream-50 dark:bg-[#1a1916] border border-cream-200 dark:border-[#2a2925] rounded-2xl shadow-lifted flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-cream-200 dark:border-[#2a2925] bg-white dark:bg-[#1e1d1a] flex items-center gap-3">
            <div className="w-9 h-9 bg-accent-700 dark:bg-orange-600 text-cream-50 rounded-lg flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" strokeWidth={2.25} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-base text-ink-900 dark:text-[#f0ede6] leading-tight">
                Inventory Assistant
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-ink-500 dark:text-[#7a7870]">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Online · {items.length} record{items.length === 1 ? '' : 's'} · can take actions
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
                <div className="w-7 h-7 bg-accent-700 dark:bg-orange-600 text-cream-50 rounded-full flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white dark:bg-[#1e1d1a] border border-cream-200 dark:border-[#2a2925] rounded-2xl rounded-tl-sm px-4 py-2.5">
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
                  className="text-xs px-2.5 py-1.5 bg-white dark:bg-[#1e1d1a] border border-cream-200 dark:border-[#2a2925] hover:border-accent-200 dark:hover:border-orange-800/50 hover:bg-accent-50 dark:hover:bg-orange-950/30 hover:text-accent-800 dark:hover:text-orange-300 rounded-full transition-colors text-ink-600 dark:text-[#7a7870]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-cream-200 dark:border-[#2a2925] bg-white dark:bg-[#1e1d1a] px-3 py-3 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Ask or say "add keyboard", "go to rooms"…'
              className="flex-1 bg-cream-50 dark:bg-[#141412] border border-cream-200 dark:border-[#2a2925] rounded-full px-4 py-2 text-sm text-ink-900 dark:text-[#f0ede6] placeholder:text-ink-400 dark:placeholder:text-[#7a7870] focus:border-accent-600 dark:focus:border-orange-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-9 h-9 bg-accent-700 dark:bg-orange-600 hover:bg-accent-800 dark:hover:bg-orange-500 disabled:bg-cream-200 dark:disabled:bg-[#2a2925] disabled:text-ink-400 text-cream-50 rounded-full flex items-center justify-center transition-colors shrink-0"
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
  // Bold markdown: **text**
  const formatted = msg.text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  return (
    <div className={cn('flex items-start gap-2.5', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-medium',
          isUser
            ? 'bg-cream-200 dark:bg-[#2a2925] text-ink-800 dark:text-[#f0ede6]'
            : 'bg-accent-700 dark:bg-orange-600 text-cream-50'
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
            ? 'bg-accent-700 dark:bg-orange-600 text-cream-50 rounded-tr-sm'
            : 'bg-white dark:bg-[#1e1d1a] border border-cream-200 dark:border-[#2a2925] text-ink-800 dark:text-[#f0ede6] rounded-tl-sm'
        )}
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    </div>
  );
}
