import React from "react";
import { useUniverse } from "../context/UniverseContext.jsx";
import Sidebar from "./Sidebar.jsx";
import BottomBar from "./BottomBar.jsx";
import SearchCommand from "./SearchCommand.jsx";
import Toast from "./shared/Toast.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import OverviewPage from "./pages/OverviewPage.jsx";
import TeamsPage from "./pages/TeamsPage.jsx";
import TeamEditorPage from "./pages/TeamEditorPage.jsx";
import ConferencesPage from "./pages/ConferencesPage.jsx";
import ConferenceEditorPage from "./pages/ConferenceEditorPage.jsx";
import DivisionsPage from "./pages/DivisionsPage.jsx";
import BowlsPage from "./pages/BowlsPage.jsx";
import RealignmentBoard from "./pages/RealignmentBoard.jsx";
import AssetsPage from "./pages/AssetsPage.jsx";
import ValidationPage from "./pages/ValidationPage.jsx";
import JsonPage from "./pages/JsonPage.jsx";

const TITLES = {
  overview: "Overview",
  teams: "Teams",
  team: "Team Editor",
  conferences: "Conferences",
  conference: "Conference Editor",
  realignment: "Realignment Board",
  divisions: "Divisions",
  bowls: "Bowl Games",
  assets: "Asset Manager",
  validation: "Validation",
  json: "Raw JSON Editor"
};

function CurrentPage() {
  const { view } = useUniverse();
  switch (view.name) {
    case "overview":
      return <OverviewPage />;
    case "teams":
      return <TeamsPage />;
    case "team":
      return <TeamEditorPage />;
    case "conferences":
      return <ConferencesPage />;
    case "conference":
      return <ConferenceEditorPage />;
    case "realignment":
      return <RealignmentBoard />;
    case "divisions":
      return <DivisionsPage />;
    case "bowls":
      return <BowlsPage />;
    case "assets":
      return <AssetsPage />;
    case "validation":
      return <ValidationPage />;
    case "json":
      return <JsonPage />;
    default:
      return <OverviewPage />;
  }
}

export default function AppShell() {
  const { universe, view, hasAutosave, restoreAutosave } = useUniverse();

  if (!universe) {
    return (
      <>
        <LandingPage />
        {hasAutosave ? (
          <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-lg border border-cyan-500/30 bg-slate-900 px-4 py-2 text-sm text-slate-200 shadow-lg">
            Found a saved session in this browser.{" "}
            <button type="button" className="font-semibold text-cyan-300 underline" onClick={restoreAutosave}>
              Restore it
            </button>
          </div>
        ) : null}
        <Toast />
      </>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 text-slate-100">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-11 shrink-0 items-center gap-3 border-b border-slate-800 px-4">
          <h1 className="text-sm font-semibold text-slate-200">{TITLES[view.name] || "FC:CD Mod Maker"}</h1>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            className="ml-auto flex items-center gap-2 rounded-md border border-slate-700 px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-800"
          >
            Search everything
            <kbd className="rounded border border-slate-600 bg-slate-800 px-1 font-mono text-[10px]">Ctrl K</kbd>
          </button>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto">
          <CurrentPage />
        </main>
        <BottomBar />
      </div>
      <SearchCommand />
      <Toast />
    </div>
  );
}
