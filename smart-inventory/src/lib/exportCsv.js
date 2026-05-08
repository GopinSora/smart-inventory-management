/**
 * Export an array of inventory items to a CSV file download.
 * @param {Array} items  - filtered inventory items
 * @param {Object} roomById - map of roomId → room object
 * @param {string} filename
 */
export function exportInventoryCSV(items, roomById = {}, filename = 'inventory.csv') {
  const headers = [
    'Category', 'Brand', 'Model', 'Specifications',
    'Quantity', 'Condition', 'Room', 'Purchase Date',
  ];

  const rows = items.map((item) => [
    item.category || '',
    item.brand || '',
    item.model || '',
    (item.specifications || '').replace(/[\r\n]+/g, ' '),
    item.quantity ?? '',
    item.condition || 'Unspecified',
    item.roomId && roomById[item.roomId] ? roomById[item.roomId].name : 'Unassigned',
    item.purchaseDate || '',
  ]);

  const escape = (val) => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
