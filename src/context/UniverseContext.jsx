import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  setAt,
  deleteAt,
  removeArrayItem,
  insertArrayItem,
  moveArrayItem,
  moveTeamBetweenDivisions,
  safeJsonParse,
  getAt
} from "../lib/jsonUtils.js";
import { validateUniverseDetailed, runValidationSelfTestsOnce } from "../lib/validation.js";
import { buildAssetAudit } from "../lib/assetSummary.js";
import { buildSearchIndex } from "../lib/searchIndex.js";
import { getCachedZip, lookupZip } from "../lib/zipCache.js";

const AUTOSAVE_KEY = "fccd-universe-autosave-v1";
const POOL_AUTOSAVE_KEY = "fccd-team-pool-autosave-v1";

const UniverseContext = createContext(null);

// Provider + hook are colocated deliberately; Fast Refresh still works, it just
// remounts this module's consumers on edit here, which is an acceptable tradeoff.
// eslint-disable-next-line react-refresh/only-export-components
export function useUniverse() {
  const ctx = useContext(UniverseContext);
  if (!ctx) throw new Error("useUniverse must be used within UniverseProvider");
  return ctx;
}

export function UniverseProvider({ children }) {
  const [universe, setUniverseRaw] = useState(null);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [view, setViewState] = useState({ name: "landing", params: {} });
  const [flashTargetId, setFlashTargetId] = useState(null);
  const [toast, setToast] = useState(null);
  const [zipInfoByZip, setZipInfoByZip] = useState({});
  const [hasAutosave, setHasAutosave] = useState(false);
  // Teams waiting to be dragged into a conference/division on the Realignment Board. This is
  // pure in-app scratch state, never part of the exported JSON — the game's format has no
  // "unassigned" concept, so a team only becomes real once it's dropped into an actual division.
  const [teamPool, setTeamPool] = useState([]);
  const selfTestsRanRef = useRef(false);

  if (!selfTestsRanRef.current && typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    selfTestsRanRef.current = true;
    runValidationSelfTestsOnce();
  }

  useEffect(() => {
    try {
      if (localStorage.getItem(AUTOSAVE_KEY)) setHasAutosave(true);
    } catch {
      // localStorage unavailable; recovery banner simply won't show.
    }
  }, []);

  useEffect(() => {
    if (!universe) return;
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(universe));
      localStorage.setItem(POOL_AUTOSAVE_KEY, JSON.stringify(teamPool));
    } catch {
      // Best-effort only; not required for the app to function.
    }
  }, [universe, teamPool]);

  const showToast = useCallback((message, kind = "info") => {
    setToast({ message, kind, id: Date.now() });
  }, []);

  const setUniverse = useCallback((updater) => {
    setUniverseRaw((prev) => (typeof updater === "function" ? updater(prev) : updater));
  }, []);

  const setView = useCallback((name, params = {}) => {
    setViewState({ name, params });
  }, []);

  const scrollToTarget = useCallback((targetId) => {
    if (!targetId) return;
    setFlashTargetId(targetId);
    requestAnimationFrame(() => {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    window.setTimeout(() => setFlashTargetId((prev) => (prev === targetId ? null : prev)), 1400);
  }, []);

  const updateField = useCallback((path, value) => setUniverseRaw((prev) => setAt(prev, path, value)), []);
  const deleteField = useCallback((path) => setUniverseRaw((prev) => deleteAt(prev, path)), []);
  const removeAt = useCallback((pathToArray, idx) => setUniverseRaw((prev) => removeArrayItem(prev, pathToArray, idx)), []);
  const insertAt = useCallback(
    (pathToArray, idx, item) => setUniverseRaw((prev) => insertArrayItem(prev, pathToArray, idx, item)),
    []
  );
  const moveItem = useCallback((pathToArray, from, to) => setUniverseRaw((prev) => moveArrayItem(prev, pathToArray, from, to)), []);
  const moveTeam = useCallback(
    (fromPath, toPath, toIndex) => setUniverseRaw((prev) => moveTeamBetweenDivisions(prev, fromPath, toPath, toIndex)),
    []
  );

  // Team Pool: teams staged for the Realignment Board that are not yet part of any
  // conference/division in the JSON. `team` is passed in explicitly by the caller (read
  // straight from the current render's teamPool/universe) so these two setters never need
  // to reach into each other's state from inside an updater function.
  const movePoolTeamToDivision = useCallback((team, poolIdx, toPath) => {
    setUniverseRaw((prev) => {
      const arr = getAt(prev, toPath) || [];
      return insertArrayItem(prev, toPath, arr.length, team);
    });
    setTeamPool((prev) => prev.filter((_, i) => i !== poolIdx));
  }, []);

  const moveDivisionTeamToPool = useCallback((team, fromPath) => {
    setUniverseRaw((prev) => removeArrayItem(prev, fromPath.slice(0, -1), fromPath[fromPath.length - 1]));
    setTeamPool((prev) => [...prev, team]);
  }, []);

  const importJson = useCallback(
    (text) => {
      const result = safeJsonParse(text);
      if (!result.ok) {
        showToast(`Invalid JSON: ${result.error.readable}`, "error");
        return false;
      }
      setUniverseRaw(result.value);
      setSavedSnapshot(JSON.stringify(result.value));
      setTeamPool([]);
      setView("overview");
      showToast("Universe imported.", "success");
      return true;
    },
    [showToast, setView]
  );

  // Silent sync used by the raw JSON editor: applies valid edits back into shared state
  // without navigating away or touching the dirty/saved snapshot semantics.
  const applyRawJson = useCallback((value) => {
    setUniverseRaw(value);
  }, []);

  const startBlankUniverse = useCallback(
    (blank, pool = []) => {
      setUniverseRaw(blank);
      setSavedSnapshot(null);
      setTeamPool(pool);
      setView("overview");
    },
    [setView]
  );

  const restoreAutosave = useCallback(() => {
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setUniverseRaw(parsed);
      setSavedSnapshot(null);
      try {
        const rawPool = localStorage.getItem(POOL_AUTOSAVE_KEY);
        setTeamPool(rawPool ? JSON.parse(rawPool) : []);
      } catch {
        setTeamPool([]);
      }
      setView("overview");
      showToast("Restored last session from this browser.", "success");
    } catch {
      showToast("Could not restore the saved session.", "error");
    }
  }, [showToast, setView]);

  const markSaved = useCallback(() => {
    setSavedSnapshot(JSON.stringify(universe));
  }, [universe]);

  const validation = useMemo(() => validateUniverseDetailed(universe), [universe]);
  const assetAudit = useMemo(() => buildAssetAudit(universe), [universe]);
  const searchIndex = useMemo(() => buildSearchIndex(universe), [universe]);
  const conferenceNames = useMemo(() => (universe?.conferences || []).map((c) => c?.name).filter(Boolean), [universe]);

  const isDirty = useMemo(() => {
    if (!universe) return false;
    if (savedSnapshot === null) return true;
    return JSON.stringify(universe) !== savedSnapshot;
  }, [universe, savedSnapshot]);

  // Collect and resolve every ZIP code used anywhere in the universe, using the shared cache.
  useEffect(() => {
    if (!universe) return;
    const zips = new Set();
    (universe.bowlGames || []).forEach((b) => {
      const z = String(b?.zipcode ?? "").trim();
      if (/^[0-9]{5}$/.test(z)) zips.add(z);
    });
    (universe.conferences || []).forEach((c) => {
      const z = String(c?.zipcode ?? "").trim();
      if (/^[0-9]{5}$/.test(z)) zips.add(z);
      (c?.divisions || []).forEach((d) =>
        (d?.teams || []).forEach((t) => {
          const tz = String(t?.zipcode ?? "").trim();
          if (/^[0-9]{5}$/.test(tz)) zips.add(tz);
        })
      );
    });

    let cancelled = false;
    zips.forEach((zip) => {
      const cached = getCachedZip(zip);
      if (cached) {
        setZipInfoByZip((prev) => (prev[zip] ? prev : { ...prev, [zip]: cached }));
        return;
      }
      if (zipInfoByZip[zip]) return;
      lookupZip(zip).then((value) => {
        if (!cancelled) setZipInfoByZip((prev) => ({ ...prev, [zip]: value }));
      });
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [universe]);

  const value = {
    universe,
    setUniverse,
    isDirty,
    markSaved,
    importJson,
    applyRawJson,
    startBlankUniverse,
    hasAutosave,
    restoreAutosave,
    view,
    setView,
    flashTargetId,
    scrollToTarget,
    toast,
    showToast,
    dismissToast: () => setToast(null),
    updateField,
    deleteField,
    removeAt,
    insertAt,
    moveItem,
    moveTeam,
    teamPool,
    movePoolTeamToDivision,
    moveDivisionTeamToPool,
    validation,
    assetAudit,
    searchIndex,
    conferenceNames,
    zipInfoByZip
  };

  return <UniverseContext.Provider value={value}>{children}</UniverseContext.Provider>;
}
