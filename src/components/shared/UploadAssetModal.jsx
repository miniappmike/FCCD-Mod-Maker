import React, { useState } from "react";

/**
 * This is a client-only, backend-less app: it cannot write a file into the
 * repository's Images/ folder for you. What it CAN do is take a file you
 * pick, preview it against the expected name, and hand back a correctly
 * renamed copy to download — ready to drop into the right Images subfolder
 * of the mod project.
 */
export default function UploadAssetModal({ expectedFilename, expectedPath, onClose }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  function handleFile(f) {
    setFile(f);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  }

  function downloadRenamed() {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = expectedFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">Upload &amp; Rename Asset</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200" aria-label="Close">
            ✕
          </button>
        </div>

        <p className="mb-3 text-xs text-slate-400">
          This tool runs entirely in your browser and can't write directly into the repository's Images folder. Pick an
          image below and it will be renamed and downloaded as <span className="font-mono text-cyan-300">{expectedFilename}</span> —
          drop that file into <span className="font-mono text-cyan-300">{expectedPath}</span> in your mod project.
        </p>

        <input
          type="file"
          accept="image/*"
          className="block w-full text-sm text-slate-300 file:mr-3 file:rounded file:border-0 file:bg-slate-700 file:px-3 file:py-1.5 file:text-slate-100 hover:file:bg-slate-600"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />

        {previewUrl ? (
          <div className="mt-3 flex items-center gap-3 rounded border border-slate-700 bg-slate-950 p-2">
            <img src={previewUrl} alt="" className="h-16 w-16 rounded object-contain" />
            <div className="text-xs text-slate-400">
              Will download as <br />
              <span className="font-mono text-slate-100">{expectedFilename}</span>
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-md bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-40"
            disabled={!file}
            onClick={() => {
              downloadRenamed();
              onClose();
            }}
          >
            Download Renamed File
          </button>
        </div>
      </div>
    </div>
  );
}
