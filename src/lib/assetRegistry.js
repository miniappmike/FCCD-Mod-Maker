/*** Asset registry — the actual repository filenames under /Images are the
 * source of truth. Nothing here is a hand-typed list; Vite's import.meta.glob
 * enumerates the real files on disk at build time, so adding/removing a file
 * in Images/ automatically changes what this module reports. ***/

function buildList(modules) {
  return Object.entries(modules)
    .map(([path, url]) => {
      const filename = path.split("/").pop();
      const baseName = filename.replace(/\.[^./]+$/, "");
      const ext = filename.slice(baseName.length + 1).toLowerCase();
      return { path, filename, baseName, ext, url };
    })
    .sort((a, b) => a.baseName.localeCompare(b.baseName));
}

const teamModules = import.meta.glob("/Images/Teams/*.{png,PNG,jpg,JPG,jpeg,JPEG,webp,WEBP}", {
  eager: true,
  query: "?url",
  import: "default"
});
const conferenceModules = import.meta.glob("/Images/Conferences/*.{png,PNG,jpg,JPG,jpeg,JPEG,webp,WEBP}", {
  eager: true,
  query: "?url",
  import: "default"
});
const bowlModules = import.meta.glob("/Images/Bowls/*.{png,PNG,jpg,JPG,jpeg,JPEG,webp,WEBP}", {
  eager: true,
  query: "?url",
  import: "default"
});
const playoffModules = import.meta.glob("/Images/Playoffs/*.{png,PNG,jpg,JPG,jpeg,JPEG,webp,WEBP}", {
  eager: true,
  query: "?url",
  import: "default"
});

export const teamAssets = buildList(teamModules);
export const conferenceAssets = buildList(conferenceModules);
export const bowlAssets = buildList(bowlModules);
export const playoffAssets = buildList(playoffModules);

export const ASSET_CATEGORIES = {
  teams: { label: "Teams", dir: "Images/Teams", assets: teamAssets },
  conferences: { label: "Conferences", dir: "Images/Conferences", assets: conferenceAssets },
  bowls: { label: "Bowls", dir: "Images/Bowls", assets: bowlAssets },
  playoffs: { label: "Playoffs", dir: "Images/Playoffs", assets: playoffAssets }
};
