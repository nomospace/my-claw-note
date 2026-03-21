import { initDatabase as initDb, getDbSync } from './index';
import { runMigrations, seedDefaultData } from './migrations';

let initialized = false;
let initPromise: Promise<void> | null = null;

export async function ensureDbInitialized() {
  if (initialized) return;
  
  if (!initPromise) {
    initPromise = (async () => {
      await initDb();
      runMigrations();
      seedDefaultData();
      initialized = true;
    })();
  }
  
  return initPromise;
}

// 同步版本，用于已初始化的场景
export function isDbInitialized() {
  return initialized;
}
