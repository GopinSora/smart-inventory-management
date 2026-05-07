import { useState, useRef, useEffect } from 'react';
import { LogOut, ChevronDown, Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { initials } from '@/lib/helpers';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out');
    } catch {
      toast.error('Could not sign out');
    }
  };

  const name = user.displayName || user.email?.split('@')[0] || 'User';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-cream-200 dark:border-[#2a2925] hover:border-cream-400 dark:hover:border-[#6b6655] bg-white dark:bg-[#1e1d1a] transition-colors"
      >
        <div className="w-7 h-7 bg-accent-700 dark:bg-orange-600 text-cream-50 rounded-full flex items-center justify-center text-[10px] font-semibold">
          {initials(user.displayName || '', user.email || '')}
        </div>
        <span className="hidden sm:inline text-sm text-ink-800 dark:text-[#f0ede6] max-w-[140px] truncate">
          {name}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-ink-400 dark:text-[#7a7870]" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#1e1d1a] border border-cream-200 dark:border-[#2a2925] rounded-xl shadow-lifted overflow-hidden animate-fade-up z-50">
          <div className="p-4 border-b border-cream-200 dark:border-[#2a2925]">
            <div className="text-sm font-medium text-ink-900 dark:text-[#f0ede6] truncate">{name}</div>
            <div className="text-xs text-ink-500 dark:text-[#7a7870] truncate">{user.email}</div>
          </div>
          <button
            onClick={() => { toggle(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-ink-700 dark:text-[#b5b0a5] hover:bg-cream-50 dark:hover:bg-[#2a2925] transition-colors"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {dark ? 'Switch to light mode' : 'Switch to dark mode'}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors border-t border-cream-200 dark:border-[#2a2925]"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
