import { fmtDate } from './helpers';

const CONDITION_COLORS = {
  Working:     { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  Faulty:      { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  Repair:      { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  Unspecified: { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' },
};

function condStyle(condition) {
  const c = CONDITION_COLORS[condition] || CONDITION_COLORS.Unspecified;
  return `background:${c.bg};color:${c.text};border:1px solid ${c.border};`;
}

const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Manrope',sans-serif;color:#1c1917;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  @media print{
    body{margin:0}
    .no-print{display:none!important}
    @page{margin:15mm 12mm;size:A4}
  }
  .page{max-width:900px;margin:0 auto;padding:32px 28px}
  .header{display:flex;align-items:flex-start;justify-content:space-between;padding-bottom:24px;border-bottom:2px solid #1c1917;margin-bottom:28px}
  .logo-row{display:flex;align-items:center;gap:12px}
  .logo-box{width:40px;height:40px;background:#b45309;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .logo-box svg{width:20px;height:20px;fill:none;stroke:#fff;stroke-width:2.25;stroke-linecap:round;stroke-linejoin:round}
  .logo-text .sub{font-family:'JetBrains Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.2em;color:#78716c;margin-bottom:2px}
  .logo-text .name{font-family:'DM Serif Display',serif;font-size:18px;color:#1c1917}
  .header-meta{text-align:right;font-family:'JetBrains Mono',monospace;font-size:10px;color:#78716c;line-height:1.8}
  .title-section{margin-bottom:24px}
  .kicker{font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.2em;color:#78716c;margin-bottom:6px}
  .doc-title{font-family:'DM Serif Display',serif;font-size:36px;color:#1c1917;line-height:1.05;margin-bottom:4px}
  .doc-sub{font-size:13px;color:#78716c;margin-bottom:20px}
  .stats-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px}
  .stat-card{background:#fafaf9;border:1px solid #e7e5e4;border-radius:10px;padding:12px 14px}
  .stat-val{font-family:'DM Serif Display',serif;font-size:28px;color:#b45309;line-height:1}
  .stat-lbl{font-family:'JetBrains Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.15em;color:#78716c;margin-top:4px}
  table{width:100%;border-collapse:collapse;font-size:12px}
  thead{background:#1c1917;color:#fff}
  thead th{padding:10px 12px;text-align:left;font-family:'JetBrains Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.15em;font-weight:500;white-space:nowrap}
  tbody tr:nth-child(even){background:#fafaf9}
  tbody tr{border-bottom:1px solid #f5f5f4}
  tbody td{padding:9px 12px;vertical-align:middle;color:#292524}
  .badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:999px;font-family:'JetBrains Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.1em;white-space:nowrap}
  .low-badge{background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;font-family:'JetBrains Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:.1em;padding:1px 5px;border-radius:4px;margin-left:4px}
  .qty-cell{font-family:'JetBrains Mono',monospace;font-weight:600;font-size:13px;color:#1c1917}
  .qty-low{color:#dc2626}
  .specs-cell{font-size:11px;color:#78716c;max-width:200px}
  .section-title{font-family:'DM Serif Display',serif;font-size:22px;color:#1c1917;margin:28px 0 14px}
  .footer{margin-top:36px;padding-top:16px;border-top:1px solid #e7e5e4;display:flex;justify-content:space-between;font-family:'JetBrains Mono',monospace;font-size:9px;color:#a8a29e;text-transform:uppercase;letter-spacing:.15em}
  /* Item detail page */
  .detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:24px}
  .detail-field{background:#fafaf9;border:1px solid #e7e5e4;border-radius:8px;padding:12px 14px}
  .detail-label{font-family:'JetBrains Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.18em;color:#78716c;margin-bottom:4px}
  .detail-value{font-size:14px;color:#1c1917;font-weight:500}
  .detail-full{grid-column:1/-1}
  .item-hero{background:linear-gradient(135deg,#fef3c7 0%,#fafaf9 100%);border:1px solid #fcd34d;border-radius:14px;padding:24px;margin-bottom:24px;display:flex;align-items:center;gap:18px}
  .item-icon-box{width:56px;height:56px;background:#b45309;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .item-icon-box svg{width:28px;height:28px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
  .item-hero-name{font-family:'DM Serif Display',serif;font-size:30px;color:#1c1917;line-height:1.1}
  .item-hero-cat{font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.2em;color:#78716c;margin-top:4px}
  .print-btn{position:fixed;top:20px;right:20px;background:#b45309;color:#fff;border:none;border-radius:8px;padding:10px 20px;font-family:'Manrope',sans-serif;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;z-index:999;box-shadow:0 4px 12px rgba(0,0,0,.2)}
  .print-btn:hover{background:#92400e}
`;

const PACKAGE_SVG = `<svg viewBox="0 0 24 24"><polyline points="21 16 21 8 12 3 3 8 3 16 12 21 21 16"/><line x1="3.27" y1="6.96" x2="12" y2="12.01"/><line x1="12" y1="22.08" x2="12" y2="12"/><polyline points="6.5 9.5 12 12.51 17.5 9.5"/></svg>`;

function logoHTML() {
  return `<div class="logo-row">
    <div class="logo-box">${PACKAGE_SVG}</div>
    <div class="logo-text">
      <div class="sub">Asset Register</div>
      <div class="name">Smart Inventory</div>
    </div>
  </div>`;
}

function footerHTML(extra = '') {
  const now = new Date().toLocaleString('en-GB', { day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit' });
  return `<div class="footer">
    <span>Smart Inventory · v1.0 · Gopin Sora · MCA AI &amp; Deep Learning · ADTU</span>
    <span>${extra ? extra + ' · ' : ''}Generated ${now}</span>
  </div>`;
}

function openPrintWindow(html) {
  const w = window.open('', '_blank');
  if (!w) { alert('Please allow popups to open the PDF preview.'); return; }
  w.document.write(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Smart Inventory — PDF</title><style>${BASE_CSS}</style></head><body>${html}</body></html>`);
  w.document.close();
}

// ── FULL INVENTORY PDF ────────────────────────────────────────────────────────

export function exportInventoryPDF(items, roomById = {}, filters = {}) {
  const LOW = 3;
  const total = items.reduce((s, i) => s + Number(i.quantity || 0), 0);
  const faulty = items.filter(i => i.condition === 'Faulty').reduce((s, i) => s + Number(i.quantity || 0), 0);
  const repair = items.filter(i => i.condition === 'Repair').reduce((s, i) => s + Number(i.quantity || 0), 0);
  const lowCount = items.filter(i => Number(i.quantity || 0) <= LOW).length;
  const date = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' });

  // Group by category for section splits
  const categories = [...new Set(items.map(i => i.category))];

  const filterDesc = Object.entries(filters)
    .filter(([, v]) => v && v !== 'All')
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ');

  const tableRows = items.map(item => {
    const qty = Number(item.quantity || 0);
    const cond = item.condition || 'Unspecified';
    const room = item.roomId && roomById[item.roomId] ? roomById[item.roomId].name : '—';
    const cs = condStyle(cond);
    return `<tr>
      <td style="font-weight:600;max-width:100px">${item.category}</td>
      <td style="font-weight:600">${item.brand}</td>
      <td>${item.model}</td>
      <td class="specs-cell">${item.specifications || '—'}</td>
      <td class="qty-cell ${qty <= LOW ? 'qty-low' : ''}">${qty}${qty <= LOW ? '<span class="low-badge">LOW</span>' : ''}</td>
      <td><span class="badge" style="${cs}">${cond}</span></td>
      <td style="font-size:11px;color:#78716c">${room}</td>
      <td style="font-family:monospace;font-size:10px;color:#78716c">${fmtDate(item.purchaseDate)}</td>
    </tr>`;
  }).join('');

  const html = `
  <button class="print-btn no-print" onclick="window.print()">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
    Save as PDF
  </button>
  <div class="page">
    <div class="header">
      ${logoHTML()}
      <div class="header-meta">
        <div><strong>Report date</strong> ${date}</div>
        <div><strong>Records</strong> ${items.length}</div>
        ${filterDesc ? `<div><strong>Filters</strong> ${filterDesc}</div>` : ''}
      </div>
    </div>

    <div class="title-section">
      <div class="kicker">Inventory Report · Full Export</div>
      <div class="doc-title">Hardware Register</div>
      <div class="doc-sub">Complete inventory listing — ${items.length} record${items.length !== 1 ? 's' : ''} · ${total} unit${total !== 1 ? 's' : ''}</div>
    </div>

    <div class="stats-bar">
      <div class="stat-card"><div class="stat-val">${total}</div><div class="stat-lbl">Total Units</div></div>
      <div class="stat-card"><div class="stat-val">${items.length}</div><div class="stat-lbl">Records</div></div>
      <div class="stat-card"><div class="stat-val" style="color:#dc2626">${faulty}</div><div class="stat-lbl">Faulty Units</div></div>
      <div class="stat-card"><div class="stat-val" style="color:#d97706">${repair}</div><div class="stat-lbl">In Repair</div></div>
    </div>

    ${lowCount > 0 ? `<div style="background:#fff1f2;border:1px solid #fecaca;border-radius:8px;padding:10px 14px;margin-bottom:20px;font-size:12px;color:#991b1b;font-weight:600;">
      ⚠ ${lowCount} item${lowCount !== 1 ? 's' : ''} with low stock (≤ ${LOW} units) — highlighted in red below.
    </div>` : ''}

    <table>
      <thead>
        <tr>
          <th>Category</th><th>Brand</th><th>Model</th>
          <th>Specifications</th><th>Qty</th>
          <th>Condition</th><th>Room</th><th>Purchased</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>

    ${footerHTML(`${items.length} records · ${total} units`)}
  </div>`;

  openPrintWindow(html);
}

// ── SINGLE ITEM PDF ───────────────────────────────────────────────────────────

export function exportItemPDF(item, roomName = 'Unassigned') {
  const qty = Number(item.quantity || 0);
  const cond = item.condition || 'Unspecified';
  const cs = condStyle(cond);
  const date = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' });
  const LOW = 3;

  // Category SVG icons (simple strokes)
  const ICONS = {
    Keyboard: `<svg viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="10" x2="6" y2="10"/><line x1="10" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="14" y2="10"/><line x1="18" y1="10" x2="18" y2="10"/><line x1="6" y1="14" x2="6" y2="14"/><line x1="18" y1="14" x2="18" y2="14"/><line x1="10" y1="14" x2="14" y2="14"/></svg>`,
    Mouse: `<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 1 1-14 0V9a7 7 0 0 1 7-7z"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="5" y1="9" x2="19" y2="9"/></svg>`,
    Monitor: `<svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    CPU: `<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
  };
  const iconSVG = ICONS[item.category] || PACKAGE_SVG;

  const fields = [
    { label: 'Category',     value: item.category,       full: false },
    { label: 'Brand',        value: item.brand,           full: false },
    { label: 'Model',        value: item.model,           full: false },
    { label: 'Quantity',     value: qty + (qty <= LOW ? ' ⚠ LOW STOCK' : ''), full: false },
    { label: 'Condition',    value: cond,                 full: false, badge: true },
    { label: 'Assigned Room',value: roomName,             full: false },
    { label: 'Purchase Date',value: fmtDate(item.purchaseDate), full: false },
    { label: 'Specifications', value: item.specifications || '—', full: true },
  ];

  const html = `
  <button class="print-btn no-print" onclick="window.print()">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
    Save as PDF
  </button>
  <div class="page">
    <div class="header">
      ${logoHTML()}
      <div class="header-meta">
        <div><strong>Item Report</strong></div>
        <div><strong>Date</strong> ${date}</div>
        <div><strong>ID</strong> ${item.id?.slice(0, 12) || 'N/A'}</div>
      </div>
    </div>

    <div class="item-hero">
      <div class="item-icon-box">${iconSVG}</div>
      <div>
        <div class="item-hero-name">${item.brand} ${item.model}</div>
        <div class="item-hero-cat">${item.category} · ${roomName}</div>
        <div style="margin-top:10px;display:flex;align-items:center;gap:8px">
          <span class="badge" style="${cs}">${cond}</span>
          ${qty <= LOW ? '<span class="low-badge">⚠ Low stock</span>' : ''}
        </div>
      </div>
    </div>

    <div class="kicker" style="margin-bottom:14px">Item Details</div>
    <div class="detail-grid">
      ${fields.map(f => `
        <div class="detail-field${f.full ? ' detail-full' : ''}">
          <div class="detail-label">${f.label}</div>
          <div class="detail-value"${f.label === 'Quantity' && qty <= LOW ? ' style="color:#dc2626"' : ''}>${
            f.badge
              ? `<span class="badge" style="${cs}">${f.value}</span>`
              : f.value || '—'
          }</div>
        </div>`).join('')}
    </div>

    ${footerHTML(`Item Record`)}
  </div>`;

  openPrintWindow(html);
}
