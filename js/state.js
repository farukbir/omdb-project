/**
 * Son arama görünümü: URL + localStorage ile kalıcılık.
 */

const STORAGE_KEY = "i2i.omdb.lastSearch.v1";

/** @typedef {{ title: string, year?: string, type?: string, plot?: string }} SearchParams */

function readFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const title = params.get("t")?.trim();
  if (!title) return null;
  return {
    title,
    year: params.get("y")?.trim() ?? "",
    type: params.get("type")?.trim() ?? "",
    plot: params.get("plot") === "full" ? "full" : "short",
  };
}

function writeToUrl(state) {
  const params = new URLSearchParams();
  params.set("t", state.title);
  if (state.year) params.set("y", state.year);
  if (state.type) params.set("type", state.type);
  if (state.plot === "full") params.set("plot", "full");
  const qs = params.toString();
  const path = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", path);
}

/** @returns {SearchParams | null} */
export function loadPersistedSearch() {
  const fromUrl = readFromUrl();
  if (fromUrl) return fromUrl;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.title === "string" && parsed.title.trim()) {
      return {
        title: parsed.title.trim(),
        year: typeof parsed.year === "string" ? parsed.year : "",
        type: typeof parsed.type === "string" ? parsed.type : "",
        plot: parsed.plot === "full" ? "full" : "short",
      };
    }
  } catch {
    /* bozuk kayıt — yoksay */
  }
  return null;
}

/** @param {SearchParams} state */
export function persistSearch(state) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        title: state.title,
        year: state.year ?? "",
        type: state.type ?? "",
        plot: state.plot === "full" ? "full" : "short",
      }),
    );
  } catch {
    /* quota / private mode */
  }
  writeToUrl(state);
}
