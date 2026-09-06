/*** Export helpers shared by the bottom bar and the setup wizard's summary
 * step. JSON semantics are never altered here — just serialized, copied, or
 * downloaded exactly as the current state holds it. ***/

export function safeFilenameFor(universe) {
  const rawName = String(universe?.name ?? "custom-universe").trim();
  return (
    rawName
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60) || "custom-universe"
  );
}

export function downloadJsonFile(universe) {
  const json = JSON.stringify(universe, null, 2);
  const filename = `${safeFilenameFor(universe)}.json`;
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyJsonToClipboard(universe) {
  const json = JSON.stringify(universe, null, 2);
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(json);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = json;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}
