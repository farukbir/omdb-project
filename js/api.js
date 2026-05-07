/**
 * OMDb requests.
 * @see https://www.omdbapi.com/
 */

const BASE = "https://www.omdbapi.com/";

function buildSearchParams({ title, apiKey, year, type, plot }) {
  const params = new URLSearchParams();
  params.set("t", title);
  params.set("apikey", apiKey);
  params.set("plot", plot === "full" ? "full" : "short");
  if (year && String(year).trim() !== "") params.set("y", String(year).trim());
  if (type && ["movie", "series", "episode"].includes(type)) params.set("type", type);
  return params;
}

function buildListParams({ query, apiKey, year, type, page }) {
  const params = new URLSearchParams();
  params.set("s", query);
  params.set("apikey", apiKey);
  if (year && String(year).trim() !== "") params.set("y", String(year).trim());
  if (type && ["movie", "series", "episode"].includes(type)) params.set("type", type);
  params.set("page", String(page || 1));
  return params;
}

/**
 * @param {object} opts
 * @param {string} opts.title
 * @param {string} opts.apiKey
 * @param {string} [opts.year]
 * @param {string} [opts.type] movie | series | episode
 * @param {string} [opts.plot] short | full
 * @param {AbortSignal} [opts.signal]
 * @returns {Promise<object>} OMDb JSON body
 */
export async function fetchMovieByTitle(opts) {
  const { title, apiKey, year, type, plot, signal } = opts;
  const url = `${BASE}?${buildSearchParams({ title, apiKey, year, type, plot })}`;
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: request failed.`);
  }
  const data = await response.json();
  return data;
}

/**
 * List search (s param): 10 results per page
 * @param {object} opts
 * @param {string} opts.query
 * @param {string} opts.apiKey
 * @param {number} [opts.page]
 * @param {string} [opts.year]
 * @param {string} [opts.type]
 * @param {AbortSignal} [opts.signal]
 */
export async function searchMovies(opts) {
  const { query, apiKey, page = 1, year, type, signal } = opts;
  const url = `${BASE}?${buildListParams({ query, apiKey, year, type, page })}`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}: request failed.`);
  return await response.json();
}

/**
 * Details by imdbID (i param)
 * @param {object} opts
 * @param {string} opts.imdbID
 * @param {string} opts.apiKey
 * @param {string} [opts.plot]
 * @param {AbortSignal} [opts.signal]
 */
export async function fetchMovieById(opts) {
  const { imdbID, apiKey, plot, signal } = opts;
  const params = new URLSearchParams();
  params.set("i", imdbID);
  params.set("apikey", apiKey);
  params.set("plot", plot === "full" ? "full" : "short");
  const url = `${BASE}?${params.toString()}`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}: request failed.`);
  return await response.json();
}
