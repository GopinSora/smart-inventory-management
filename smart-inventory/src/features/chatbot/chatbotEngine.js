// Inventory Assistant — a rule-based NLU engine that answers questions
// about the user's actual inventory data. No external API needed.
// Works fully offline once the app loads.

import { CATEGORY_IDS } from '@/config/constants';

const CONDITIONS = ['Working', 'Faulty', 'Repair'];
const CATEGORY_ALIASES = {
  Keyboard: ['keyboard', 'keyboards', 'keys', 'kb'],
  Mouse: ['mouse', 'mice', 'mouses'],
  Monitor: ['monitor', 'monitors', 'display', 'displays', 'screen', 'screens'],
  CPU: ['cpu', 'cpus', 'computer', 'computers', 'pc', 'pcs', 'desktop', 'desktops', 'tower', 'towers'],
};

const matchCategory = (text) => {
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
  // partial token match
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

// Turns a list of items into a brief textual summary
const summarizeItems = (items, max = 5) => {
  if (items.length === 0) return null;
  const lines = items.slice(0, max).map(
    (i) => `• ${i.brand} ${i.model} — ${i.quantity} unit${i.quantity === 1 ? '' : 's'}${i.condition ? ` (${i.condition})` : ''}`
  );
  if (items.length > max) lines.push(`…and ${items.length - max} more.`);
  return lines.join('\n');
};

export function answerQuery(rawText, { items, rooms, stats, roomById }) {
  const text = rawText.trim();
  if (!text) return "Ask me something about your inventory.";

  const lower = text.toLowerCase();

  // ─── Greetings ───────────────────────────────────────────────────────
  if (/^(hi|hello|hey|yo|sup|good (morning|afternoon|evening))\b/i.test(text)) {
    return `Hi! I can answer questions about your inventory. Try asking things like:\n• "How many monitors do I have?"\n• "What's in Lab A-201?"\n• "Show me faulty items"\n• "Total inventory"`;
  }

  if (/\b(thanks|thank you|thx|ty)\b/i.test(text)) {
    return "Anytime. Anything else?";
  }

  if (/^(help|what can you do|commands?)\b/i.test(lower)) {
    return `I can answer questions about your hardware inventory. Examples:\n\n📊 Counts\n  "how many keyboards"\n  "total units"\n\n🔍 Filters\n  "show faulty items"\n  "items in repair"\n\n🏢 Rooms\n  "what's in Lab A-201"\n  "how many rooms"\n\n🏷️ Brands\n  "do I have any Logitech"\n  "Dell monitors"\n\nI work on your live data, so answers update as your inventory changes.`;
  }

  // ─── Empty state ──────────────────────────────────────────────────────
  if (items.length === 0) {
    return "Your inventory is empty right now. Add some items from the Inventory tab, or load demo data from the Dashboard, and then ask me anything.";
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
    if (filtered.length === 0) {
      return `Nothing matching that in ${room.name}.`;
    }
    const filterDesc = [
      condition && condition.toLowerCase(),
      brand,
      category && category.toLowerCase(),
    ]
      .filter(Boolean)
      .join(' ');
    return `📍 ${room.name} — ${total} unit${total === 1 ? '' : 's'} ${filterDesc ? `of ${filterDesc} ` : ''}across ${filtered.length} record${filtered.length === 1 ? '' : 's'}:\n\n${summarizeItems(filtered)}`;
  }

  // ─── How many rooms ──────────────────────────────────────────────────
  if (/(how many|number of|count of) rooms?/i.test(text)) {
    if (rooms.length === 0) return 'You have no rooms defined yet.';
    return `🏢 You have ${rooms.length} room${rooms.length === 1 ? '' : 's'}: ${rooms.map((r) => r.name).join(', ')}.`;
  }

  if (/^(rooms?|list rooms?|show rooms?|all rooms?)\b/i.test(text)) {
    if (rooms.length === 0) return 'No rooms defined yet. Add one from the Rooms tab.';
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
  return `I'm not sure what you're asking. Try:\n• "how many monitors"\n• "show me faulty items"\n• "what's in Lab A-201"\n• "total inventory"\n\nOr type "help" for a list of things I can answer.`;
}

export function suggestedQueries(items, rooms) {
  const suggestions = [];
  if (items.length === 0) {
    return ['What can you do?', 'How do I add items?'];
  }
  suggestions.push('Total inventory');
  const cats = CATEGORY_IDS.filter((c) => items.some((i) => i.category === c));
  if (cats.length > 0) {
    suggestions.push(`How many ${cats[0].toLowerCase()}s?`);
  }
  const hasFaulty = items.some((i) => i.condition === 'Faulty');
  if (hasFaulty) suggestions.push('Show faulty items');
  if (rooms.length > 0) suggestions.push(`What's in ${rooms[0].name}?`);
  return suggestions.slice(0, 4);
}
