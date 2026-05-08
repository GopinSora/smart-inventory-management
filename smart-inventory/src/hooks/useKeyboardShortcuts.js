import { useEffect } from 'react';

/**
 * Register global keyboard shortcuts.
 * Each shortcut: { key, ctrl?, shift?, action, description }
 * Fires only when focus is NOT inside an input/textarea/select.
 */
export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isEditable =
        tag === 'input' || tag === 'textarea' || tag === 'select' ||
        document.activeElement?.isContentEditable;

      for (const s of shortcuts) {
        const keyMatch = e.key.toLowerCase() === s.key.toLowerCase();
        const ctrlMatch = s.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = s.shift ? e.shiftKey : true;

        if (keyMatch && ctrlMatch && shiftMatch) {
          // Allow Escape even inside inputs
          if (isEditable && s.key !== 'Escape') continue;
          e.preventDefault();
          s.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
