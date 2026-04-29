import { useState, useRef, useEffect } from 'react';
import { LogOut, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { initials } from '@/lib/helpers';

export default function UserMenu() {
  const { user, logout } = useAuth();
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
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-cream-200 hover:border-cream-400 bg-white transition-colors"
      >
        <div className="w-7 h-7 bg-accent-700 text-cream-50 rounded-full flex items-center justify-center text-[10px] font-semibold">
          {initials(user.displayName || '', user.email || '')}
        </div>
        <span className="hidden sm:inline text-sm text-ink-800 max-w-[140px] truncate">
          {name}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-ink-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-cream-200 rounded-xl shadow-lifted overflow-hidden animate-fade-up z-50">
          <div className="p-4 border-b border-cream-200">
            <div className="text-sm font-medium text-ink-900 truncate">{name}</div>
            <div className="text-xs text-ink-500 truncate">{user.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-rose-700 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
