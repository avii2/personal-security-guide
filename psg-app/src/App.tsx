import { useEffect, useMemo, useState } from "react";
import yaml from "js-yaml";
import { marked } from "marked";
import clsx from "clsx";
import "./index.css";

type ChecklistItem = {
  point: string;
  details?: string;
  priority: string;
};

type Section = {
  title: string;
  slug: string;
  description?: string;
  intro?: string;
  icon?: string;
  checklist: ChecklistItem[];
};

type Theme = "light" | "dark";

const YAML_URL = "/personal-security-checklist.yml";
const STORAGE_KEY = "psg_progress_v1";
const THEME_KEY = "psg_theme";
const REPO_URL = "https://github.com/avii2/personal-security-guide";
const PORTFOLIO_URL = "https://mr_anil.surge.sh/";
const LICENSE_TEXT = "MIT © Anil Kumar 2025";

const priorityLabel = (priority: string) => priority.charAt(0).toUpperCase() + priority.slice(1);
const priorityColors: Record<string, string> = {
  essential: "bg-emerald-500/15 text-emerald-400 border-emerald-400/30",
  optional: "bg-amber-500/15 text-amber-400 border-amber-400/30",
  advanced: "bg-rose-500/15 text-rose-400 border-rose-400/30",
};

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const markdownToHtmlNoLinks = (text?: string) => {
  const html = marked.parse(text || "", { async: false }) as string;
  return html.replace(/<a\b[^>]*>(.*?)<\/a>/gi, "$1");
};

function App() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    if (stored) return stored;
    return "dark";
  });
  const [priorityFilter, setPriorityFilter] = useState<Record<string, boolean>>({
    essential: true,
    optional: true,
    advanced: true,
  });
  const [progress, setProgress] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(YAML_URL);
        const text = await res.text();
        const parsed = yaml.load(text);
        if (Array.isArray(parsed)) {
          setSections(parsed as Section[]);
          setError(null);
        } else {
          setError("Checklist file is not in the expected format.");
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load checklist data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const totalItems = useMemo(
    () => sections.reduce((sum, sec) => sum + (sec.checklist?.length || 0), 0),
    [sections]
  );

  const doneItems = useMemo(
    () =>
      sections.reduce(
        (sum, sec) =>
          sum +
          sec.checklist.filter((item) => {
            const id = `${sec.slug}__${slugify(item.point)}`;
            return progress[id];
          }).length,
        0
      ),
    [sections, progress]
  );

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sections
      .map((section) => {
        const items = section.checklist.filter((item) => {
          const pri = item.priority?.toLowerCase() || "optional";
          if (!priorityFilter[pri]) return false;
          if (!q) return true;
          return (
            section.title.toLowerCase().includes(q) ||
            section.description?.toLowerCase().includes(q) ||
            item.point.toLowerCase().includes(q) ||
            item.details?.toLowerCase().includes(q)
          );
        });
        const matchesSection =
          q &&
          (section.title.toLowerCase().includes(q) ||
            section.description?.toLowerCase().includes(q));
        if (q && !matchesSection && items.length === 0) {
          return null;
        }
        return { ...section, checklist: items };
      })
      .filter(Boolean) as Section[];
  }, [sections, priorityFilter, query]);

  const toggleItem = (sectionSlug: string, item: ChecklistItem) => {
    const id = `${sectionSlug}__${slugify(item.point)}`;
    setProgress((prev) => {
      const next = { ...prev };
      next[id] = !next[id];
      return next;
    });
  };

  const resetProgress = () => {
    if (window.confirm("Reset all progress?")) {
      setProgress({});
    }
  };

  const exportProgress = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "progress.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const printPage = () => window.print();

  const sectionProgress = (section: Section) => {
    const total = section.checklist.length;
    const done = section.checklist.filter((item) => {
      const id = `${section.slug}__${slugify(item.point)}`;
      return progress[id];
    }).length;
    return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
  };

  const priorityCounts = (section: Section) =>
    section.checklist.reduce<Record<string, number>>((acc, item) => {
      const pri = item.priority?.toLowerCase() || "optional";
      acc[pri] = (acc[pri] || 0) + 1;
      return acc;
    }, {});

  const prioritySummary = useMemo(() => {
    const summary: Record<string, { total: number; done: number }> = {
      essential: { total: 0, done: 0 },
      optional: { total: 0, done: 0 },
      advanced: { total: 0, done: 0 },
    };
    sections.forEach((section) => {
      section.checklist.forEach((item) => {
        const pri = (item.priority || "optional").toLowerCase();
        const id = `${section.slug}__${slugify(item.point)}`;
        summary[pri] = summary[pri] || { total: 0, done: 0 };
        summary[pri].total += 1;
        if (progress[id]) summary[pri].done += 1;
      });
    });
    const overallPercent = totalItems ? Math.round((doneItems / totalItems) * 100) : 0;
    return { summary, overallPercent };
  }, [sections, progress, totalItems, doneItems]);

  return (
    <div className={clsx(theme === "dark" ? "dark" : "")}>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eef2ff_0,_#f8fafc_40%,_#ffffff_80%)] dark:bg-[radial-gradient(circle_at_top,_#0f172a_0,_#0b1220_40%,_#0a0f1c_80%)] text-slate-900 dark:text-slate-50">
        <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-8 space-y-6">
          <div className="glass relative overflow-hidden p-6 md:p-8">
            <div className="absolute -top-10 -right-6 h-32 w-32 rounded-full bg-accent/30 blur-3xl" />
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="Personal Security Guide logo" className="h-10 w-10 rounded-lg border border-white/20 shadow-sm" />
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                    Personal Security Guide
                  </p>
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white leading-tight">
                  Secure your digital life with one clear checklist
                </h1>
                <p className="text-slate-600 dark:text-slate-300 max-w-3xl mt-2 text-lg md:text-xl">
                  A compiled checklist of 300+ tips for protecting digital security and privacy in 2025. No
                  accounts, no tracking—everything stays on your device.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-white/15 bg-white/90 dark:bg-white/10 text-sm hover:-translate-y-0.5 transition shadow-sm font-semibold flex-1 lg:flex-none text-center"
                >
                  View on GitHub
                </a>
                <button
                  onClick={printPage}
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-white/15 bg-white/90 dark:bg-white/10 text-sm hover:-translate-y-0.5 transition shadow-sm flex-1 lg:flex-none"
                >
                  Print / PDF
                </button>
                <button
                  onClick={exportProgress}
                  className="px-3 py-2 rounded-lg border border-mint/40 bg-mint/10 text-emerald-900 dark:text-emerald-100 text-sm hover:-translate-y-0.5 transition shadow-sm flex-1 lg:flex-none"
                >
                  Export progress
                </button>
                <button
                  onClick={resetProgress}
                  className="px-3 py-2 rounded-lg border border-rose-400/40 bg-rose-500/10 text-rose-900 dark:text-rose-100 text-sm hover:-translate-y-0.5 transition shadow-sm flex-1 lg:flex-none"
                >
                  Reset
                </button>
                <button
                  onClick={toggleTheme}
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-white/15 bg-white/90 dark:bg-white/10 text-sm shadow-sm flex-1 lg:flex-none"
                >
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <StatCard label="Sections" value={sections.length} />
            <StatCard label="Items done" value={doneItems} helper={`of ${totalItems}`} />
            <StatCard label="Progress" value={`${totalItems ? Math.round((doneItems / totalItems) * 100) : 0}%`} helper="overall completion" />
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 space-y-6">
          <div className="glass p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex-1">
              <label className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Search</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search steps or sections"
                className="w-full mt-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {["essential", "optional", "advanced"].map((pri) => (
                <button
                  key={pri}
                  onClick={() =>
                    setPriorityFilter((prev) => ({ ...prev, [pri]: !prev[pri] }))
                  }
                  className={clsx(
                    "px-3 py-1.5 rounded-full text-xs font-semibold border transition",
                    priorityFilter[pri]
                      ? "bg-accent text-white border-accent"
                      : "bg-white/70 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10"
                  )}
                >
                  {priorityLabel(pri)}
                </button>
              ))}
            </div>
          </div>

          {loading && <p className="text-center text-sm text-slate-500">Loading checklist…</p>}
          {error && (
            <p className="text-center text-sm text-rose-400">
              {error} (check that <code className="font-mono">public/personal-security-checklist.yml</code> exists)
            </p>
          )}

          <div className="space-y-4">
            {filteredSections.map((section) => {
              const prog = sectionProgress(section);
              const counts = priorityCounts(section);
              const isOpen = openSection === section.slug;

              return (
                <div key={section.slug} className="glass p-5">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {section.slug.replace(/-/g, " ")}
                      </p>
                      <h2 className="text-xl md:text-2xl font-display font-semibold flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent/70 to-mint/70 text-white shadow overflow-hidden">
                          <img src="/logo.png" alt="logo" className="h-full w-full object-cover" />
                        </span>
                        {section.title}
                      </h2>
                      {section.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
                          {section.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <div className="w-40">
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>{prog.percent}%</span>
                          <span>
                            {prog.done}/{prog.total}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-accent via-indigo-400 to-mint transition-all"
                            style={{ width: `${prog.percent}%` }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => setOpenSection(isOpen ? null : section.slug)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 text-sm"
                      >
                        {isOpen ? "Hide items" : "View items"}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs mt-3">
                    {Object.entries(counts).map(([pri, count]) => (
                      <span
                        key={pri}
                        className={clsx(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full border",
                          priorityColors[pri] || "bg-slate-100/60 text-slate-700 border-slate-200"
                        )}
                      >
                        {priorityLabel(pri)} • {count}
                      </span>
                    ))}
                  </div>

                  {isOpen && (
                    <div className="mt-4 space-y-3">
                      {section.checklist.length === 0 && (
                        <p className="text-sm text-slate-500">No items match your filters.</p>
                      )}
                      {section.checklist.map((item) => {
                        const pri = item.priority?.toLowerCase() || "optional";
                        const id = `${section.slug}__${slugify(item.point)}`;
                        const done = !!progress[id];
                        return (
                          <div
                            key={id}
                            className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 p-3 flex gap-3 shadow-sm"
                          >
                            <input
                              type="checkbox"
                              checked={done}
                              onChange={() => toggleItem(section.slug, item)}
                              className="mt-1 h-4 w-4 accent-accent"
                              aria-label={`Mark ${item.point} as done`}
                            />
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-slate-900 dark:text-white">
                                  {item.point}
                                </p>
                                <span
                                  className={clsx(
                                    "text-[11px] px-2 py-1 rounded-full border",
                                    priorityColors[pri] || "bg-slate-100 text-slate-700 border-slate-200"
                                  )}
                                >
                                  {priorityLabel(pri)}
                                </span>
                              </div>
                              {item.details && (
                                <div
                                  className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-200 prose-p:my-1 prose-ul:my-1"
                                  dangerouslySetInnerHTML={{ __html: markdownToHtmlNoLinks(item.details) }}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            {!loading && filteredSections.length === 0 && (
              <p className="text-center text-sm text-slate-500">
                No checklist items match your search or filters.
              </p>
            )}
          </div>
        </main>

        <section className="max-w-6xl mx-auto px-4 pb-12 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass p-5 flex flex-col items-center justify-center text-center">
              <div
                className="relative h-28 w-28 rounded-full grid place-items-center"
                style={{
                  background: `conic-gradient(#7c3aed ${prioritySummary.overallPercent}%, #1e293b 0)`,
                }}
              >
                <div
                  className="rounded-full grid place-items-center text-white text-2xl font-bold"
                  style={{ width: "5.5rem", height: "5.5rem", backgroundColor: "#0f172a" }}
                >
                  {prioritySummary.overallPercent}%
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">
                Overall completion
              </p>
            </div>
            {["essential", "optional", "advanced"].map((pri) => {
              const data = prioritySummary.summary[pri] || { total: 0, done: 0 };
              const percent = data.total ? Math.round((data.done / data.total) * 100) : 0;
              return (
                <div key={pri} className="glass p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{priorityLabel(pri)}</p>
                    <span className="text-xs text-slate-500 dark:text-slate-300">
                      {data.done}/{data.total}
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className={clsx(
                        "h-full rounded-full transition-all",
                        pri === "essential" && "bg-emerald-500",
                        pri === "optional" && "bg-amber-400",
                        pri === "advanced" && "bg-rose-500"
                      )}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-300">
                    {percent}% complete
                  </p>
                </div>
              );
            })}
          </div>

          <div className="glass p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Section progress</h3>
              <p className="text-xs text-slate-500 dark:text-slate-300">Tap to open a section</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sections.map((section) => {
                const prog = sectionProgress(section);
                return (
                  <button
                    key={section.slug}
                    onClick={() => setOpenSection(section.slug)}
                    className="text-left rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-4 hover:-translate-y-0.5 transition shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{section.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-300">
                          {prog.done}/{prog.total} complete
                        </p>
                      </div>
                      <span className="text-sm font-semibold">{prog.percent}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent via-indigo-400 to-mint transition-all"
                        style={{ width: `${prog.percent}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-14">
          <div className="glass p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Author</p>
              <h3 className="text-xl font-display font-semibold">Anil Kumar</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Personal Security Guide. {LICENSE_TEXT}
              </p>
              <div className="flex flex-wrap gap-3 mt-2">
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-accent hover:underline"
                >
                  GitHub Repo
                </a>
                <a
                  href={PORTFOLIO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-accent hover:underline"
                >
                  Portfolio
                </a>
                <span className="text-sm text-slate-500 dark:text-slate-300">{LICENSE_TEXT}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-white/15 bg-white/90 dark:bg-white/10 text-sm shadow-sm"
              >
                Source on GitHub
              </a>
              <a
                href={PORTFOLIO_URL}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-lg border border-mint/40 bg-mint/10 text-emerald-900 dark:text-emerald-100 text-sm shadow-sm"
              >
                About Anil
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const StatCard = ({ label, value, helper }: { label: string; value: string | number; helper?: string }) => (
  <div className="glass p-4">
    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    <p className="text-2xl font-display font-semibold text-slate-900 dark:text-white">{value}</p>
    {helper && <p className="text-xs text-slate-500 dark:text-slate-300">{helper}</p>}
  </div>
);

export default App;
