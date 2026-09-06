/*** [FOOTBALL COACH: COLLEGE DYNASTY] - CUSTOM UNIVERSE / MOD MAKER
 * Root component: wires the shared universe state provider to the
 * application shell (sidebar navigation, bottom action bar, and the
 * per-section pages under src/components/pages/). ***/

import React from "react";
import { UniverseProvider } from "./context/UniverseContext.jsx";
import AppShell from "./components/AppShell.jsx";

export default function UniverseEditor() {
  return (
    <UniverseProvider>
      <AppShell />
    </UniverseProvider>
  );
}
