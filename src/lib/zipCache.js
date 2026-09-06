/*** ZIP -> city/state lookup with an in-memory + localStorage cache so we
 * never re-fetch a ZIP we've already resolved this session or a past one. ***/

const STORAGE_KEY = "fccd-zip-cache-v1";
const memoryCache = new Map();
let loadedFromStorage = false;

function loadStorage() {
  if (loadedFromStorage) return;
  loadedFromStorage = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const obj = JSON.parse(raw);
      Object.entries(obj).forEach(([zip, val]) => memoryCache.set(zip, val));
    }
  } catch {
    // localStorage unavailable or corrupt; ignore, cache stays empty.
  }
}

function persistStorage() {
  try {
    const obj = Object.fromEntries(memoryCache.entries());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {
    // Storage full/unavailable; caching just stays in-memory for this session.
  }
}

export function getCachedZip(zip) {
  loadStorage();
  return memoryCache.has(zip) ? memoryCache.get(zip) : undefined;
}

export async function lookupZip(zip) {
  loadStorage();
  if (memoryCache.has(zip)) return memoryCache.get(zip);

  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!res.ok) throw new Error("not found");
    const data = await res.json();
    const place = data?.places?.[0];
    const city = place?.["place name"]?.trim();
    const state = place?.["state abbreviation"]?.trim();
    const value = city && state ? { city, state } : { error: true };
    memoryCache.set(zip, value);
    persistStorage();
    return value;
  } catch {
    const value = { error: true };
    memoryCache.set(zip, value);
    persistStorage();
    return value;
  }
}
