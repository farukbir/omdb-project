/**
 * App entry point: form + filters + cancellable fetch.
 */

import { OMDB_API_KEY } from "./config.js";
import { fetchMovieById, searchMovies } from "./api.js";
import { loadPersistedSearch, persistSearch } from "./state.js";
import {
  setLoading,
  hideLoading,
  showError,
  clearError,
  showPlaceholder,
  renderResultsList,
  renderMovie,
  setLoadMoreLoading,
  getResultsRoot,
  getLoadMoreButton,
} from "./ui.js";

const searchForm = /** @type {HTMLFormElement} */ (document.getElementById("searchForm"));
const searchInput = /** @type {HTMLInputElement} */ (document.getElementById("searchInput"));
const searchBtn = /** @type {HTMLButtonElement} */ (document.getElementById("searchBtn"));
const filterYear = /** @type {HTMLInputElement} */ (document.getElementById("filterYear"));
const filterType = /** @type {HTMLSelectElement} */ (document.getElementById("filterType"));
const filterPlot = /** @type {HTMLSelectElement} */ (document.getElementById("filterPlot"));
const clearFiltersBtn = /** @type {HTMLButtonElement} */ (document.getElementById("clearFiltersBtn"));

/** Last successful query key to avoid accidental duplicate requests. */
let lastSuccessKey = "";

/** Abort previous request when a new one starts. */
let abortController = null;

let currentResultsQueryKey = "";
let currentResultsPage = 1;
let currentResultsTotal = 0;

function apiKeyReady() {
  return (
    typeof OMDB_API_KEY === "string" &&
    OMDB_API_KEY.trim().length > 0
  );
}

function readFiltersFromDom() {
  return {
    year: filterYear.value.trim(),
    type: filterType.value,
    plot: filterPlot.value === "full" ? "full" : "short",
  };
}

function applyFiltersToDom(state) {
  searchInput.value = state.title;
  filterYear.value = state.year ?? "";
  filterType.value = state.type ?? "";
  filterPlot.value = state.plot === "full" ? "full" : "short";
}

function requestKey(title, filters) {
  return `${title}|${filters.year}|${filters.type}|${filters.plot}`;
}

function normalizeOmdbErrorMessage(rawMessage, type) {
  const message = (rawMessage || "").toString().trim();
  const isNotFound =
    message.toLowerCase() === "movie not found!" || message.toLowerCase() === "not found!";

  if (!isNotFound) return message || "Unexpected error occurred.";

  if (type === "series") return "Series not found.";
  if (type === "movie") return "Movie not found.";
  return "No results found.";
}

/**
 * @param {string} title
 * @param {{ year: string, type: string, plot: string }} filters
 * @param {{ force?: boolean }} [opts]
 */
async function runSearch(title, filters, opts = {}) {
  const trimmed = title.trim();
  if (!trimmed) return;

  if (!apiKeyReady()) {
    showError(
      "Missing API key. Put your OMDb key into `js/config.js` (OMDB_API_KEY).",
    );
    showPlaceholder();
    return;
  }

  const key = requestKey(trimmed, filters);
  if (!opts.force && key === lastSuccessKey) {
    clearError();
    return;
  }

  // Always show a list: All / Movie / Series
  await runListSearch(trimmed, filters, { force: opts.force });
}

async function runListSearch(title, filters, opts = {}) {
  const key = requestKey(title, filters);
  if (!opts.force && key === lastSuccessKey) {
    clearError();
    return;
  }

  if (abortController) abortController.abort();
  abortController = new AbortController();

  clearError();
  setLoading(true, "Searching…");
  searchBtn.disabled = true;

  currentResultsQueryKey = key;
  currentResultsPage = 1;
  currentResultsTotal = 0;

  try {
    const data = await searchMovies({
      query: title,
      apiKey: OMDB_API_KEY,
      page: 1,
      year: filters.year,
      type: filters.type || "",
      signal: abortController.signal,
    });

    if (data.Response === "True") {
      const total = Number(data.totalResults || 0);
      currentResultsTotal = total;
      renderResultsList(data.Search || [], { totalResults: total, page: 1 });
      lastSuccessKey = key;
      persistSearch({ title, year: filters.year, type: filters.type || "", plot: filters.plot });
    } else {
      lastSuccessKey = "";
      showPlaceholder();
      showError(normalizeOmdbErrorMessage(data.Error, filters.type));
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return;
    lastSuccessKey = "";
    showPlaceholder();
    showError(err instanceof Error ? err.message : "A network error occurred.");
  } finally {
    hideLoading();
    searchBtn.disabled = false;
  }
}

async function loadMoreResults() {
  if (!currentResultsQueryKey) return;
  if (currentResultsTotal > 0 && currentResultsPage * 10 >= currentResultsTotal) return;

  const title = searchInput.value.trim();
  const filters = readFiltersFromDom();

  if (abortController) abortController.abort();
  abortController = new AbortController();

  setLoadMoreLoading(true);
  try {
    const nextPage = currentResultsPage + 1;
    const data = await searchMovies({
      query: title,
      apiKey: OMDB_API_KEY,
      page: nextPage,
      year: filters.year,
      type: filters.type || "",
      signal: abortController.signal,
    });

    if (data.Response === "True") {
      currentResultsPage = nextPage;
      const total = Number(data.totalResults || currentResultsTotal || 0);
      currentResultsTotal = total;
      renderResultsList(data.Search || [], { totalResults: total, page: nextPage });
    } else {
      showError(normalizeOmdbErrorMessage(data.Error, filters.type));
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return;
    showError(err instanceof Error ? err.message : "A network error occurred.");
  } finally {
    setLoadMoreLoading(false);
  }
}

async function openDetailsByImdbId(imdbID) {
  if (!imdbID) return;
  if (!apiKeyReady()) return;

  const filters = readFiltersFromDom();
  if (abortController) abortController.abort();
  abortController = new AbortController();

  clearError();
  setLoading(true, "Loading details…");

  try {
    const data = await fetchMovieById({
      imdbID,
      apiKey: OMDB_API_KEY,
      plot: filters.plot,
      signal: abortController.signal,
    });
    if (data.Response === "True") {
      renderMovie(data);
    } else {
      showError(normalizeOmdbErrorMessage(data.Error, filters.type));
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return;
    showError(err instanceof Error ? err.message : "A network error occurred.");
  } finally {
    hideLoading();
  }
}

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = searchInput.value;
  // Always perform search when user submits (even if same query).
  runSearch(title, readFiltersFromDom(), { force: true });
});

clearFiltersBtn.addEventListener("click", () => {
  filterYear.value = "";
  filterType.value = "";
  filterPlot.value = "short";
});

window.addEventListener("DOMContentLoaded", () => {
  const saved = loadPersistedSearch();
  if (saved) {
    applyFiltersToDom(saved);
    runSearch(saved.title, {
      year: saved.year ?? "",
      type: saved.type ?? "",
      plot: saved.plot === "full" ? "full" : "short",
    });
  }
});

// Open details from results list
getResultsRoot()?.addEventListener("click", (e) => {
  const target = /** @type {HTMLElement} */ (e.target);
  const item = target.closest?.(".result-item");
  const imdbID = item?.getAttribute?.("data-imdbid");
  if (imdbID) openDetailsByImdbId(imdbID);
});

getResultsRoot()?.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const target = /** @type {HTMLElement} */ (e.target);
  const item = target.closest?.(".result-item");
  const imdbID = item?.getAttribute?.("data-imdbid");
  if (imdbID) openDetailsByImdbId(imdbID);
});

getLoadMoreButton()?.addEventListener("click", () => {
  loadMoreResults();
});
