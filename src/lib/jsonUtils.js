/*** JSON / immutable-state helpers shared across the editor. ***/

// Immutably set a value at a path inside an object, preserving everything else untouched.
// Missing intermediate objects (e.g. an award slot a loaded file omitted) are created
// as empty objects along the way rather than throwing.
export function setAt(root, path, value) {
  const clone = structuredClone(root);
  if (path.length === 0) return value;
  let obj = clone;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (obj[key] == null || typeof obj[key] !== "object") obj[key] = {};
    obj = obj[key];
  }
  obj[path[path.length - 1]] = value;
  return clone;
}

// Immutably delete a key at a path (object key or array index-as-splice for arrays).
export function deleteAt(root, path) {
  const clone = structuredClone(root);
  let obj = clone;
  for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
  const key = path[path.length - 1];
  if (obj && typeof obj === "object") {
    if (Array.isArray(obj)) obj.splice(key, 1);
    else if (Object.prototype.hasOwnProperty.call(obj, key)) delete obj[key];
  }
  return clone;
}

export function getAt(root, path) {
  let obj = root;
  for (const key of path) {
    if (obj == null) return undefined;
    obj = obj[key];
  }
  return obj;
}

export function removeArrayItem(root, pathToArray, idx) {
  const clone = structuredClone(root);
  let arr = clone;
  for (const key of pathToArray) arr = arr[key];
  arr.splice(idx, 1);
  return clone;
}

export function insertArrayItem(root, pathToArray, idx, item) {
  const clone = structuredClone(root);
  let arr = clone;
  for (const key of pathToArray) arr = arr[key];
  arr.splice(idx, 0, item);
  return clone;
}

export function moveArrayItem(root, pathToArray, from, to) {
  const clone = structuredClone(root);
  let arr = clone;
  for (const key of pathToArray) arr = arr[key];
  const [item] = arr.splice(from, 1);
  arr.splice(to, 0, item);
  return clone;
}

// Move a team object from one division/conference to another, preserving the team's data exactly.
export function moveTeamBetweenDivisions(root, fromPath, toPath, toIndex) {
  const clone = structuredClone(root);
  let fromArr = clone;
  for (const key of fromPath.slice(0, -1)) fromArr = fromArr[key];
  const fromIdx = fromPath[fromPath.length - 1];
  const [team] = fromArr.splice(fromIdx, 1);

  let toArr = clone;
  for (const key of toPath) toArr = toArr[key];
  const insertIdx = toIndex == null ? toArr.length : toIndex;
  toArr.splice(insertIdx, 0, team);
  return clone;
}

// Parse JSON text and, on failure, produce a human-readable line/column location.
export function safeJsonParse(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    const msg = e?.message || "Invalid JSON";
    let line, column, alreadyDescribesLocation = false;

    // Newer engines already embed "line X column Y" in the message — don't recompute/duplicate it.
    const lineMatch = /line (\d+) column (\d+)/i.exec(msg);
    if (lineMatch) {
      line = parseInt(lineMatch[1], 10);
      column = parseInt(lineMatch[2], 10);
      alreadyDescribesLocation = true;
    } else {
      const posMatch = /position (\d+)/.exec(msg);
      if (posMatch) {
        const pos = parseInt(posMatch[1], 10);
        const upto = text.slice(0, pos);
        const lines = upto.split("\n");
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }
    }

    return {
      ok: false,
      error: {
        message: msg,
        line,
        column,
        readable: line && !alreadyDescribesLocation ? `${msg} (Line ${line}, Column ${column})` : msg
      }
    };
  }
}
