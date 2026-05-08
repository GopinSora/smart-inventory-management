import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, Boxes, DoorOpen, Plus, Package, Moon, Sun } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { useTheme } from '@/context/ThemeContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import Button from '@/components/ui/Button';
import UserMenu from '@/components/ui/UserMenu';
import ItemFormModal from '@/features/inventory/ItemFormModal';
import { cn } from '@/lib/helpers';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/rooms', label: 'Rooms', icon: DoorOpen },
];

export default function AppShell() {
  const { stats, rooms } = useInventory();
  const { dark, toggle } = useTheme();
  const [showAdd, setShowAdd] = useState(false);

  useKeyboardShortcuts([
    { key: 'n', action: () => setShowAdd(true), description: 'Add new item' },
  ]);

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-[#141412] text-ink-900 dark:text-[#f0ede6] font-sans transition-colors duration-300">
      <div className="fixed inset-0 grid-paper pointer-events-none opacity-50" />
      <div className="fixed inset-0 warm-glow pointer-events-none" />

      <div className="relative">
        <header className="border-b border-cream-200 dark:border-[#2a2925] bg-cream-50/85 dark:bg-[#141412]/85 backdrop-blur sticky top-0 z-30 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center gap-3 md:gap-6">
            <NavLink to="/" className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 bg-accent-700 dark:bg-orange-600 text-cream-50 flex items-center justify-center rounded-lg shadow-soft">
                <Package className="w-4.5 h-4.5" strokeWidth={2.25} />
              </div>
              <div className="hidden sm:block">
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-ink-500 dark:text-[#7a7870]">
                  Asset Register
                </div>
                <div className="font-display text-base text-ink-900 dark:text-[#f0ede6] leading-tight">
                  Smart Inventory
                </div>
              </div>
            </NavLink>

            <nav className="flex items-center gap-1 overflow-x-auto md:ml-4">
              {NAV.map((n) => {
                const Ico = n.icon;
                return (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    end={n.end}
                    className={({ isActive }) =>
                      cn(
                        'relative px-3 md:px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 shrink-0',
                        isActive
                          ? 'text-ink-900 dark:text-[#f0ede6] bg-cream-100 dark:bg-[#2a2925]'
                          : 'text-ink-500 dark:text-[#7a7870] hover:text-ink-800 dark:hover:text-[#f0ede6] hover:bg-cream-100 dark:hover:bg-[#2a2925]'
                      )
                    }
                  >
                    <Ico className="w-4 h-4" />
                    <span className="hidden sm:inline">{n.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="ml-auto flex items-center gap-2 md:gap-3">
              {/* Dark mode toggle */}
              <button
                onClick={toggle}
                className="w-9 h-9 rounded-lg border border-cream-200 dark:border-[#2a2925] bg-white dark:bg-[#1e1d1a] hover:bg-cream-100 dark:hover:bg-[#2a2925] flex items-center justify-center text-ink-500 dark:text-[#b5b0a5] transition-colors"
                aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                title={dark ? 'Light mode' : 'Dark mode'}
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <Button icon={Plus} onClick={() => setShowAdd(true)} className="hidden sm:inline-flex">
                Add item
              </Button>
              <button
                onClick={() => setShowAdd(true)}
                className="sm:hidden w-9 h-9 bg-accent-700 hover:bg-accent-800 text-cream-50 rounded-lg flex items-center justify-center"
                aria-label="Add item"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
              </button>
              <UserMenu />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <Outlet />
        </main>

        <footer className="border-t border-cream-200 dark:border-[#2a2925] mt-16 py-7 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="font-mono text-[11px] text-ink-500 dark:text-[#7a7870] uppercase tracking-wider">
              v1.0 · Built by Gopin Sora · MCA AI &amp; Deep Learning · ADTU
            </div>
            <div className="font-mono text-[11px] text-ink-400 dark:text-[#7a7870] num-tab">
              {stats.lineCount} records · {stats.total} units · {rooms.length} rooms
            </div>
          </div>
        </footer>
      </div>

      {showAdd && <ItemFormModal mode="add" onClose={() => setShowAdd(false)} />}
    </div>
  );
}
