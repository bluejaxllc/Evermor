/* ── MOCK AUTHENTICATION SYSTEM ────────────────*/
// Using localStorage since Supabase project limit is reached

let currentUser = null;
let currentProfile = null;
const listeners = new Set();

const mockDB = {
  get(key) { return JSON.parse(localStorage.getItem('ever_mock_' + key) || '[]'); },
  set(key, val) { localStorage.setItem('ever_mock_' + key, JSON.stringify(val)); }
};

export function getUser() { return currentUser; }
export function getProfile() { return currentProfile; }
export function isLoggedIn() { return !!currentUser; }

export function onAuthChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() { listeners.forEach(fn => fn(currentUser, currentProfile)); }

export async function signUp(email, password, fullName) {
  await new Promise(r => setTimeout(r, 800));
  const users = mockDB.get('users');
  if (users.find(u => u.email === email)) throw new Error('User already exists');
  
  const user = { id: crypto.randomUUID(), email, created_at: new Date().toISOString() };
  users.push(user);
  mockDB.set('users', users);

  const profiles = mockDB.get('profiles');
  profiles.push({ id: user.id, full_name: fullName, tier: 'architect' });
  mockDB.set('profiles', profiles);

  localStorage.setItem('ever_session', JSON.stringify(user));
  currentUser = user;
  currentProfile = profiles.find(p => p.id === user.id);
  notify();
  return { user };
}

export async function signIn(email, password) {
  await new Promise(r => setTimeout(r, 600));
  const users = mockDB.get('users');
  const user = users.find(u => u.email === email);
  if (!user) throw new Error('Invalid login credentials');
  
  localStorage.setItem('ever_session', JSON.stringify(user));
  currentUser = user;
  
  const profiles = mockDB.get('profiles');
  currentProfile = profiles.find(p => p.id === user.id);
  notify();
  return { user };
}

export async function signOut() {
  await new Promise(r => setTimeout(r, 300));
  localStorage.removeItem('ever_session');
  currentUser = null;
  currentProfile = null;
  notify();
}

export async function fetchProfile(userId) {
  const profiles = mockDB.get('profiles');
  return profiles.find(p => p.id === userId);
}

export async function upsertProfile(profileUpdates) {
  await new Promise(r => setTimeout(r, 400));
  const profiles = mockDB.get('profiles');
  const idx = profiles.findIndex(p => p.id === profileUpdates.id);
  let updated;
  if (idx > -1) {
    updated = { ...profiles[idx], ...profileUpdates };
    profiles[idx] = updated;
  } else {
    updated = profileUpdates;
    profiles.push(updated);
  }
  mockDB.set('profiles', profiles);
  if (currentUser?.id === updated.id) {
    currentProfile = updated;
    notify();
  }
  return updated;
}

export async function initAuth() {
  const session = localStorage.getItem('ever_session');
  if (session) {
    currentUser = JSON.parse(session);
    const profiles = mockDB.get('profiles');
    currentProfile = profiles.find(p => p.id === currentUser.id);
    notify();
  }
}
