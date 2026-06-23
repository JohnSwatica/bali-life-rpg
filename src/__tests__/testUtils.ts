import { beforeEach, vi } from "vitest";

export const SAVE_KEY = "bali-life-rpg.berawa-finns.save.v1";

class MemoryLocalStorage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

export function installMemoryLocalStorage(): void {
  beforeEach(() => {
    vi.stubGlobal("localStorage", new MemoryLocalStorage());
  });
}

export function writeRawSave(payload: unknown): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
}
