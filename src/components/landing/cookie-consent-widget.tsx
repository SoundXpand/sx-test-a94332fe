import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, X, Settings2, ShieldCheck, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "sx_cookie_consent_v1";
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

type Categories = {
  essentials: boolean;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
};

type Stored = {
  choice: "all" | "selected" | "rejected";
  categories: Categories;
  ts: number;
};

const DEFAULTS: Categories = {
  essentials: true,
  preferences: false,
  analytics: false,
  marketing: false,
};

function readStored(): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (Date.now() - parsed.ts > ONE_MONTH_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function getAnonId(): string {
  const key = "sx_anon_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function CookieConsentWidget() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [cats, setCats] = useState<Categories>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (readStored()) return;
    const t = setTimeout(() => setOpen(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const categoryList = useMemo(
    () =>
      [
        {
          key: "essentials" as const,
          title: "Essentials",
          desc: "Required for login, security and core site functions. Always on.",
          locked: true,
        },
        {
          key: "preferences" as const,
          title: "Preferences",
          desc: "Remember your theme, language and layout choices.",
        },
        {
          key: "analytics" as const,
          title: "Analytics",
          desc: "Aggregated usage stats so we can improve the product.",
        },
        {
          key: "marketing" as const,
          title: "Marketing",
          desc: "Personalised offers, campaign attribution and retargeting.",
        },
      ],
    [],
  );

  async function persist(choice: Stored["choice"], categories: Categories) {
    const record: Stored = { choice, categories, ts: Date.now() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {}
    try {
      const { data } = await supabase.auth.getUser();
      await supabase.from("cookie_consent_logs").insert({
        user_id: data.user?.id ?? null,
        anon_id: getAnonId(),
        choice,
        essentials: categories.essentials,
        preferences: categories.preferences,
        analytics: categories.analytics,
        marketing: categories.marketing,
        page_path: window.location.pathname,
        user_agent: navigator.userAgent,
        region: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
      });
    } catch (e) {
      // Non-blocking; consent still stored locally.
      console.warn("[consent] log failed", e);
    }
  }

  async function handle(choice: "all" | "selected" | "rejected") {
    setSaving(true);
    const chosen: Categories =
      choice === "all"
        ? { essentials: true, preferences: true, analytics: true, marketing: true }
        : choice === "rejected"
          ? { ...DEFAULTS }
          : { ...cats, essentials: true };
    await persist(choice, chosen);
    setSaving(false);
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: 40, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 40, y: 20 }}
          transition={{ type: "spring", damping: 22, stiffness: 240 }}
          className="fixed bottom-6 right-4 z-40 w-[min(92vw,380px)] sm:right-6"
          role="dialog"
          aria-label="Cookie preferences"
        >
          <div className="relative overflow-hidden rounded-2xl border border-hairline-strong bg-popover/95 shadow-2xl backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--amber)]/50 to-transparent" />
            <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--amber-glow)_30%,transparent),transparent_65%)] blur-2xl" />

            <div className="relative p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[var(--amber)] to-[var(--amber-deep)] text-[var(--ink)] shadow-[0_0_20px_-4px_var(--amber-glow)]">
                    <Cookie className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-semibold">Your cookie choices</h3>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      DPDP · GDPR · CCPA
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handle("rejected")}
                  aria-label="Dismiss"
                  className="grid h-7 w-7 place-items-center rounded-full border border-hairline text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                We use cookies to run SoundXpand, remember your preferences and understand how
                artists use the platform. Choose what you're comfortable with — you can change
                this anytime.
              </p>

              <AnimatePresence initial={false}>
                {details && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 overflow-hidden"
                  >
                    <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
                      {categoryList.map((c) => {
                        const on = cats[c.key] || c.locked;
                        return (
                          <li
                            key={c.key}
                            className="rounded-xl border border-hairline bg-surface-1/60 p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-[13px] font-semibold text-foreground">
                                  {c.title}
                                  {c.locked && (
                                    <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-hairline px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                                      <ShieldCheck className="h-2.5 w-2.5" /> required
                                    </span>
                                  )}
                                </div>
                                <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">
                                  {c.desc}
                                </p>
                              </div>
                              <button
                                type="button"
                                disabled={c.locked}
                                onClick={() =>
                                  setCats((prev) => ({ ...prev, [c.key]: !prev[c.key] }))
                                }
                                aria-pressed={on}
                                className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors ${
                                  on
                                    ? "border-[var(--amber)]/60 bg-[var(--amber)]/80"
                                    : "border-hairline bg-surface-2"
                                } ${c.locked ? "opacity-70" : ""}`}
                              >
                                <span
                                  className={`absolute top-0.5 grid h-4 w-4 place-items-center rounded-full bg-background text-foreground shadow transition-transform ${
                                    on ? "translate-x-4" : "translate-x-0.5"
                                  }`}
                                >
                                  {on && <Check className="h-2.5 w-2.5" />}
                                </span>
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handle("all")}
                  className="btn-tactile btn-tactile-hover w-full rounded-full py-2 font-display text-[13px] font-semibold"
                >
                  Allow all
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => (details ? handle("selected") : setDetails(true))}
                    className="flex-1 rounded-full border border-hairline bg-surface-1 px-3 py-2 font-display text-[12px] font-medium text-foreground transition-colors hover:border-[var(--amber)]/50"
                  >
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <Settings2 className="h-3.5 w-3.5" />
                      {details ? "Save selection" : "Customise"}
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handle("rejected")}
                    className="flex-1 rounded-full border border-hairline px-3 py-2 font-display text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Reject non-essential
                  </button>
                </div>
                <a
                  href="/legal/privacy"
                  className="mt-1 text-center text-[11px] text-muted-foreground underline-offset-4 hover:underline"
                >
                  Read our privacy & cookie policy
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
