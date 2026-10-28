import type { ActivityHistoryItem, AppSettings } from '@/types';

const HISTORY_KEY = 'directai_history';
const SETTINGS_KEY = 'directai_settings';

export function loadHistory(): ActivityHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ActivityHistoryItem[];
  } catch {
    return [];
  }
}

export function saveHistory(items: ActivityHistoryItem[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  } catch {
    // storage might be full or unavailable
  }
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function loadSettings(): AppSettings {
  const defaults: AppSettings = {
    autoAnalyze: true,
    saveHistory: true,
    maxImageSizeMB: 10,
    theme: 'dark',
  };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) as Partial<AppSettings> };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}
