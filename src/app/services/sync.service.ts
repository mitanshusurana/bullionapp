import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";

export type OutboxMethod = "POST" | "PUT" | "DELETE";

export interface OutboxItem {
  id: string; // unique id for queue item
  method: OutboxMethod;
  url: string;
  body?: any;
  headers?: Record<string, string>;
  attempts: number;
  nextAttempt: number; // epoch ms
  createdAt: string; // ISO
}

const OUTBOX_KEY = "gold-pos:outbox";
const TEN_MIN = 10 * 60 * 1000;

/** Return a UTC ISO string that equals the current India (Asia/Kolkata) wall-clock time.
 *
 * This shifts the current instant by +5.5 hours and returns an ISO string with Z.
 * Example: if local India time is 2025-11-05T14:48:03+05:30, this returns
 * "2025-11-05T09:18:03.000Z" (UTC) which numerically equals adding 5.5 hours to now.
 */
function nowIndiaIso(): string {
  const offsetMs = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes
  return new Date(Date.now() + offsetMs).toISOString();
}

@Injectable({ providedIn: "root" })
export class SyncService {
  private readonly http = inject(HttpClient);
  private timer: any;

  constructor() {
    this.start();
  }

  private start() {
    // Try immediately on app start
    this.flushDue();
    // Retry every minute (only sends those due)
    this.timer = setInterval(() => this.flushDue(), 60 * 1000);
    // On network regain
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.flushDue());
    }
  }

  enqueue(
    method: OutboxMethod,
    url: string,
    body?: any,
    headers?: Record<string, string>,
  ) {
    const item: OutboxItem = {
      id: crypto?.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      method,
      url,
      body,
      headers,
      attempts: 0,
      nextAttempt: Date.now(),
  createdAt: nowIndiaIso(),
    };
    const box = this.load();
    box.push(item);
    this.persist(box);
  }

  private flushDue() {
    const box = this.load();
    const now = Date.now();
    const due = box.filter((i) => i.nextAttempt <= now);
    if (!due.length) return;

    for (const item of due) {
      const req = this.http.request(item.method, item.url, {
        body: item.body,
        headers: item.headers,
      });
      req.subscribe({
        next: () => {
          this.remove(item.id);
        },
        error: () => {
          // reschedule after 10 minutes
          const all = this.load();
          const idx = all.findIndex((x) => x.id === item.id);
          if (idx !== -1) {
            const updated = { ...all[idx] } as OutboxItem;
            updated.attempts += 1;
            updated.nextAttempt = Date.now() + TEN_MIN;
            all[idx] = updated;
            this.persist(all);
          }
        },
      });
    }
  }

  private remove(id: string) {
    const box = this.load().filter((i) => i.id !== id);
    this.persist(box);
  }

  private load(): OutboxItem[] {
    try {
      const raw = localStorage.getItem(OUTBOX_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as OutboxItem[];
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  private persist(list: OutboxItem[]) {
    try {
      localStorage.setItem(OUTBOX_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }
}
