import React, { useEffect, useRef, useState } from "react";
import { useUniverse } from "../context/UniverseContext.jsx";
import { searchItems } from "../lib/searchIndex.js";

export default function SearchCommand() {
  const { universe, searchIndex, setView, scrollToTarget } = useUniverse();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [prevOpen, setPrevOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (universe) setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [universe]);

  // Reset the query/selection when the dialog transitions to open. Doing this during
  // render (rather than in an effect) avoids an extra cascading render on open.
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setActiveIdx(0);
    }
  }

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  if (!open) return null;

  const results = searchItems(searchIndex, query);

  function go(item) {
    setOpen(false);
    if (item.view === "team") {
      setView("team", item.params);
    } else if (item.view === "conference") {
      setView("conference", item.params);
      window.setTimeout(() => scrollToTarget(`conf-${item.params.cIdx}`), 60);
    } else if (item.view === "bowls") {
      setView("bowls");
      window.setTimeout(() => scrollToTarget(`bowl-${item.params.bIdx}`), 60);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-24" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-lg rounded-lg border border-slate-700 bg-slate-900 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIdx(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIdx((i) => Math.min(i + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIdx((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" && results[activeIdx]) {
              go(results[activeIdx]);
            }
          }}
          placeholder="Search teams, conferences, bowls, ZIPs, rivals…"
          className="w-full border-b border-slate-700 bg-transparent px-4 py-3 text-sm text-slate-100 outline-none"
        />
        <ul className="max-h-80 overflow-y-auto p-1" role="listbox">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-xs text-slate-500">
              {query.trim() ? "No matches." : "Type to search the entire universe."}
            </li>
          ) : (
            results.map((item, i) => (
              <li key={`${item.type}-${item.label}-${i}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === activeIdx}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => go(item)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm ${
                    i === activeIdx ? "bg-cyan-500/15 text-cyan-200" : "text-slate-300"
                  }`}
                >
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                    {item.type}
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>
                  <span className="truncate text-xs text-slate-500">{item.sublabel}</span>
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="border-t border-slate-800 px-3 py-1.5 text-[10px] text-slate-600">
          ↑↓ to navigate · Enter to open · Esc to close
        </div>
      </div>
    </div>
  );
}
