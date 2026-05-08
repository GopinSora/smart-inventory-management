// Inventory Assistant — Smart rule-based NLU engine
// Supports: data queries + in-app actions (add item, navigate, dark mode, etc.)

import { CATEGORY_IDS } from '@/config/constants';

const CONDITIONS = ['Working', 'Faulty', 'Repair'];
const CATEGORY_ALIASES = {
  Keyboard: ['keyboard', 'keyboards', 'keys', 'kb'],
  Mouse: ['mouse', 'mice', 'mouses'],
  Monitor: ['monitor', 'monitors', 'display', 'displays', 'screen', 'screens'],
  CPU: ['cpu', 'cpus', 'computer', 'computers', 'pc', 'pcs', 'desktop', 'desktops', 'tower', 'towers'],
};

export const matchCategory = (text) => {
  const lower = text.toLowerCase();
  for (const cat of CATEGORY_IDS) {
    if (CATEGORY_ALIASES[cat].some((a) => new RegExp(`\\b${a}\\b`).test(lower))) {
      return cat;
    }
  }
  return null;
};

const matchCondition = (text) => {
  const lower = text.toLowerCase();
  for (const c of CONDITIONS) {
    if (lower.includes(c.toLowerCase())) return c;
  }
  if (lower.includes('broken') || lower.includes('damaged')) return 'Faulty';
  if (lower.includes('repair') || lower.includes('fixing')) return 'Repair';
  if (lower.includes('working') || lower.includes('functional') || lower.includes('ok')) return 'Working';
  return null;
};

const matchRoom = (text, rooms) => {
  const lower = text.toLowerCase();
  for (const r of rooms) {
    if (r.name && lower.includes(r.name.toLowerCase())) return r;
  }
  for (const r of rooms) {
    const tokens = r.name.toLowerCase().split(/[\s-]+/);
    if (tokens.some((t) => t.length > 2 && lower.includes(t))) return r;
  }
  return null;
};

const matchBrand = (text, items) => {
  const lower = text.toLowerCase();
  const brands = [...new Set(items.map((i) => i.brand).filter(Boolean))];
  for (const b of brands) {
    if (lower.includes(b.toLowerCase())) return b;
  }
  return null;
};

const sumQty = (items) => items.reduce((s, i) => s + Number(i.quantity || 0), 0);

const hasAny = (text, words) => {
  const lower = text.toLowerCase();
  return words.some((w) => new RegExp(`\\b${w}\\b`).test(lower));
};

const summarizeItems = (items, max = 5) => {
  if (items.length === 0) return null;
  const lines = items.slice(0, max).map(
    (i) => `• ${i.brand} ${i.model} — ${i.quantity} unit${i.quantity === 1 ? '' : 's'}${i.condition ? ` (${i.condition})` : ''}`
  );
  if (items.length > max) lines.push(`…and ${items.length - max} more.`);
  return lines.join('\n');
};

// ─── Action intent detection ─────────────────────────────────────────────────
// Returns { type, payload } or null if no action intent

export function detectAction(text, { rooms, dark }) {
  const lower = text.toLowerCase().trim();

  // Navigate: go to / open page
  if (/\b(go to|open|navigate to|take me to|show me|visit)\b/.test(lower)) {
    if (/\b(dashboard|home|overview)\b/.test(lower))
      return { type: 'navigate', payload: { path: '/', label: 'Dashboard' } };
    if (/\b(inventory|items?|hardware)\b/.test(lower))
      return { type: 'navigate', payload: { path: '/inventory', label: 'Inventory' } };
    if (/\b(rooms?|locations?)\b/.test(lower))
      return { type: 'navigate', payload: { path: '/rooms', label: 'Rooms' } };
  }

  // Dark mode toggle
  if (/\b(dark mode|night mode|dark theme)\b/.test(lower)) {
    if (/\b(on|enable|activate|switch to|turn on)\b/.test(lower) || !dark)
      return { type: 'set_dark', payload: { value: true } };
    return { type: 'set_dark', payload: { value: false } };
  }
  if (/\b(light mode|day mode|light theme)\b/.test(lower)) {
    return { type: 'set_dark', payload: { value: false } };
  }
  if (/\b(toggle (dark|light|theme)|switch (dark|light|theme))\b/.test(lower)) {
    return { type: 'toggle_dark' };
  }

  // Add item
  if (/\b(add (an? )?(new )?item|create (an? )?item|new item|add hardware)\b/.test(lower)) {
    // Try to parse a category from the text
    const cat = matchCategory(lower);
    return { type: 'open_add_item', payload: { category: cat } };
  }

  // Add room
  if (/\b(add (an? )?(new )?room|create (a )?room|new room)\b/.test(lower)) {
    return { type: 'navigate_rooms_add', payload: {} };
  }

  // Load demo data
  if (/\b(load demo|demo data|sample data|seed data|populate)\b/.test(lower)) {
    return { type: 'seed_demo' };
  }

  // Low stock check
  if (/\b(low stock|low items?|running low|almost out|short on|shortage)\b/.test(lower)) {
    return { type: 'show_low_stock' };
  }

  // Export
  if (/\b(export|download|csv|spreadsheet)\b/.test(lower)) {
    return { type: 'export_csv' };
  }

  return null;
}

// ─── Text answers ─────────────────────────────────────────────────────────────

export function answerQuery(rawText, ctx) {
  const { items, rooms, stats, roomById } = ctx;
  const text = rawText.trim();
  if (!text) return "Ask me something about your inventory.";

  const lower = text.toLowerCase();

  // ─── Greetings ───────────────────────────────────────────────────────
  if (/^(hi|hello|hey|yo|sup|good (morning|afternoon|evening))\b/i.test(text)) {
    return `Hi! I'm your inventory assistant. I can:\n\n📊 Answer questions about your data\n🧭 Navigate the app for you\n➕ Open the "Add item" form\n🌙 Toggle dark / light mode\n\nTry: "open inventory", "add a keyboard", "how many monitors", "dark mode on"`;
  }

  if (/\b(thanks|thank you|thx|ty)\b/i.test(text)) {
    return "Anytime! Anything else?";
  }

  if (/^(help|what can you do|commands?)\b/i.test(lower)) {
    return `Here's what I can do:\n\n🧭 Navigation\n  "go to inventory"\n  "open rooms"\n  "take me to dashboard"\n\n➕ Actions\n  "add a new keyboard"\n  "add a room"\n  "load demo data"\n\n📤 Data\n  "export inventory" — download CSV\n  "show low stock" — items ≤ 3 units\n\n🌙 Theme\n  "dark mode on"\n  "switch to light mode"\n\n📊 Queries\n  "how many monitors"\n  "show faulty items"\n  "what's in Lab A-201"\n  "total inventory"\n  "show recent items"`;
  }

  // ─── Empty state ──────────────────────────────────────────────────────
  if (items.length === 0) {
    return "Your inventory is empty. Say \"load demo data\" to populate it, or say \"add a new item\" to open the form.";
  }

  const category = matchCategory(text);
  const condition = matchCondition(text);
  const room = matchRoom(text, rooms);
  const brand = matchBrand(text, items);

  // ─── Total / overview ────────────────────────────────────────────────
  if (
    hasAny(lower, ['total', 'overall', 'overview', 'summary', 'inventory']) &&
    !category && !condition && !room
  ) {
    const lines = [
      `📊 You have ${stats.total} units across ${stats.lineCount} record${stats.lineCount === 1 ? '' : 's'}.`,
    ];
    const cats = CATEGORY_IDS.filter((c) => stats.byCat[c] > 0);
    if (cats.length) {
      lines.push('\nBy category:');
      cats.forEach((c) => lines.push(`  • ${c}: ${stats.byCat[c]}`));
    }
    if (rooms.length) lines.push(`\nDistributed across ${rooms.length} room${rooms.length === 1 ? '' : 's'}.`);
    return lines.join('\n');
  }

  // ─── Room queries ────────────────────────────────────────────────────
  if (room) {
    const inRoom = items.filter((i) => i.roomId === room.id);
    const filtered = inRoom.filter((i) => {
      if (category && i.category !== category) return false;
      if (condition && (i.condition || 'Unspecified') !== condition) return false;
      if (brand && i.brand !== brand) return false;
      return true;
    });
    const total = sumQty(filtered);
    if (filtered.length === 0) return `Nothing matching that in ${room.name}.`;
    const filterDesc = [condition && condition.toLowerCase(), brand, category && category.toLowerCase()]
      .filter(Boolean).join(' ');
    return `📍 ${room.name} — ${total} unit${total === 1 ? '' : 's'} ${filterDesc ? `of ${filterDesc} ` : ''}across ${filtered.length} record${filtered.length === 1 ? '' : 's'}:\n\n${summarizeItems(filtered)}`;
  }

  // ─── How many rooms ──────────────────────────────────────────────────
  if (/(how many|number of|count of) rooms?/i.test(text)) {
    if (rooms.length === 0) return 'You have no rooms defined yet. Say "add a room" to create one.';
    return `🏢 You have ${rooms.length} room${rooms.length === 1 ? '' : 's'}: ${rooms.map((r) => r.name).join(', ')}.`;
  }

  if (/^(rooms?|list rooms?|show rooms?|all rooms?)\b/i.test(text)) {
    if (rooms.length === 0) return 'No rooms yet. Say "add a room" and I\'ll take you there.';
    const lines = rooms.map((r) => {
      const c = sumQty(items.filter((i) => i.roomId === r.id));
      return `  • ${r.name} — ${c} unit${c === 1 ? '' : 's'}`;
    });
    return `🏢 Your rooms:\n${lines.join('\n')}`;
  }

  // ─── Condition queries ───────────────────────────────────────────────
  if (condition && !category && !brand) {
    const matched = items.filter((i) => (i.condition || 'Unspecified') === condition);
    const total = sumQty(matched);
    if (matched.length === 0) return `Nothing currently marked as ${condition}.`;
    return `${condition === 'Working' ? '✅' : condition === 'Faulty' ? '⚠️' : '🔧'} ${total} unit${total === 1 ? '' : 's'} marked ${condition} (${matched.length} record${matched.length === 1 ? '' : 's'}):\n\n${summarizeItems(matched)}`;
  }

  // ─── Category queries ────────────────────────────────────────────────
  if (category) {
    const filtered = items.filter((i) => {
      if (i.category !== category) return false;
      if (condition && (i.condition || 'Unspecified') !== condition) return false;
      if (brand && i.brand !== brand) return false;
      return true;
    });
    const total = sumQty(filtered);
    if (filtered.length === 0) {
      const desc = [condition && condition.toLowerCase(), brand].filter(Boolean).join(' ');
      return `No ${desc ? desc + ' ' : ''}${category.toLowerCase()}s found.`;
    }
    if (/(how many|count|number)/i.test(text)) {
      const desc = [condition, brand].filter(Boolean).join(' ');
      return `📊 You have ${total} ${desc ? desc + ' ' : ''}${category.toLowerCase()}${total === 1 ? '' : 's'} across ${filtered.length} record${filtered.length === 1 ? '' : 's'}.`;
    }
    return `📦 ${total} ${category.toLowerCase()}${total === 1 ? '' : 's'} in ${filtered.length} record${filtered.length === 1 ? '' : 's'}:\n\n${summarizeItems(filtered)}`;
  }

  // ─── Brand queries ───────────────────────────────────────────────────
  if (brand) {
    const filtered = items.filter((i) => i.brand === brand);
    const total = sumQty(filtered);
    return `🏷️ ${brand} — ${total} unit${total === 1 ? '' : 's'} across ${filtered.length} record${filtered.length === 1 ? '' : 's'}:\n\n${summarizeItems(filtered)}`;
  }

  // ─── Search by model ─────────────────────────────────────────────────
  if (/^(find|search|show|where is|where's|locate)/i.test(text)) {
    const query = text.replace(/^(find|search|show|where is|where's|locate|me|the|all)\s+/gi, '').trim();
    if (query.length >= 2) {
      const q = query.toLowerCase();
      const matches = items.filter((i) =>
        [i.brand, i.model, i.specifications].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
      );
      if (matches.length === 0) return `Couldn't find anything matching "${query}".`;
      const total = sumQty(matches);
      return `🔍 ${matches.length} match${matches.length === 1 ? '' : 'es'} (${total} unit${total === 1 ? '' : 's'}) for "${query}":\n\n${summarizeItems(matches)}`;
    }
  }

  // ─── Recent / latest ─────────────────────────────────────────────────
  if (/(recent|latest|new|newly added|just added)/i.test(text)) {
    const recent = [...items]
      .sort((a, b) => {
        const aT = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bT = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bT - aT;
      })
      .slice(0, 5);
    return `🆕 Most recent additions:\n\n${summarizeItems(recent)}`;
  }

  // ─── Fallback ────────────────────────────────────────────────────────
  return `I'm not sure what you mean. Try:\n• "how many monitors"\n• "show me faulty items"\n• "go to inventory"\n• "add a new keyboard"\n• "dark mode on"\n\nOr type "help" for all commands.`;
}

export function suggestedQueries(items, rooms) {
  if (items.length === 0) {
    return ['Load demo data', 'Add a new item', 'What can you do?'];
  }
  const suggestions = [];
  suggestions.push('Show low stock');
  const cats = CATEGORY_IDS.filter((c) => items.some((i) => i.category === c));
  if (cats.length > 0) suggestions.push(`How many ${cats[0].toLowerCase()}s?`);
  const hasFaulty = items.some((i) => i.condition === 'Faulty');
  if (hasFaulty) suggestions.push('Show faulty items');
  if (rooms.length > 0) suggestions.push(`What's in ${rooms[0].name}?`);
  suggestions.push('Export inventory');
  return suggestions.slice(0, 4);
}
