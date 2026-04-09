/* ── MOCK SUPABASE SYSTEM ──────────────────────*/
// Using localStorage since Supabase project limit is reached

const mockDB = {
  get(key) { return JSON.parse(localStorage.getItem('ever_mock_' + key) || '[]'); },
  set(key, val) { localStorage.setItem('ever_mock_' + key, JSON.stringify(val)); }
};

export const supabase = { auth: {} };

export async function uploadFile(bucket, path, file) {
  await new Promise(r => setTimeout(r, 600));
  const url = URL.createObjectURL(file);
  // Store blob reference in memory only, mock doesn't persist actual files well
  const files = mockDB.get('files');
  files.push({ bucket, path, url, type: file.type });
  mockDB.set('files', files);
  return { path };
}

export function getPublicUrl(bucket, path) {
  const files = mockDB.get('files');
  const file = files.find(f => f.bucket === bucket && f.path === path);
  if (file) return file.url;
  
  // Return placeholder if not found (e.g., uploaded before refresh)
  if (bucket === 'avatars') return 'https://ui-avatars.com/api/?name=User&background=00E5FF&color=0A0F12&size=128';
  return 'https://placehold.co/800x600/0A0F12/00E5FF?text=Mock+Image';
}

export async function deleteFile(bucket, path) {
  await new Promise(r => setTimeout(r, 300));
  let files = mockDB.get('files');
  files = files.filter(f => !(f.bucket === bucket && f.path === path));
  mockDB.set('files', files);
}

export async function fetchRows(table, { userId, orderBy = 'created_at', ascending = false, limit } = {}) {
  await new Promise(r => setTimeout(r, 300));
  let rows = mockDB.get(table);
  if (userId) rows = rows.filter(r => r.user_id === userId);
  
  rows.sort((a, b) => {
    const vA = a[orderBy] || 0;
    const vB = b[orderBy] || 0;
    if (vA < vB) return ascending ? -1 : 1;
    if (vA > vB) return ascending ? 1 : -1;
    return 0;
  });
  
  if (limit) rows = rows.slice(0, limit);
  return rows;
}

export async function insertRow(table, row) {
  await new Promise(r => setTimeout(r, 300));
  const rows = mockDB.get(table);
  const newRow = { ...row, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  rows.push(newRow);
  mockDB.set(table, rows);
  return newRow;
}

export async function updateRow(table, id, updates) {
  await new Promise(r => setTimeout(r, 300));
  const rows = mockDB.get(table);
  const idx = rows.findIndex(r => r.id === id);
  if (idx === -1) throw new Error('Not found');
  
  rows[idx] = { ...rows[idx], ...updates, updated_at: new Date().toISOString() };
  mockDB.set(table, rows);
  return rows[idx];
}

export async function deleteRow(table, id) {
  await new Promise(r => setTimeout(r, 300));
  let rows = mockDB.get(table);
  rows = rows.filter(r => r.id !== id);
  mockDB.set(table, rows);
}
