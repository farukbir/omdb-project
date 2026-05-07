/**
 * DOM helpers (rendering and UI state)
 */

const els = {
  statusMessage: /** @type {HTMLElement} */ (document.getElementById("statusMessage")),
  errorMessage: /** @type {HTMLElement} */ (document.getElementById("errorMessage")),
  moviePlaceholder: /** @type {HTMLElement} */ (document.getElementById("moviePlaceholder")),
  movieResult: /** @type {HTMLElement} */ (document.getElementById("movieResult")),
  searchResults: /** @type {HTMLElement} */ (document.getElementById("searchResults")),
  resultsMeta: /** @type {HTMLElement} */ (document.getElementById("resultsMeta")),
  resultsList: /** @type {HTMLUListElement} */ (document.getElementById("resultsList")),
  loadMoreBtn: /** @type {HTMLButtonElement} */ (document.getElementById("loadMoreBtn")),
};

export function setLoading(isLoading, message = "Loading…") {
  els.statusMessage.textContent = message;
  els.statusMessage.classList.toggle("status-hidden", !isLoading);
  els.statusMessage.classList.toggle("info-banner", isLoading);
}

export function hideLoading() {
  els.statusMessage.classList.add("status-hidden");
  els.statusMessage.textContent = "";
}

/**
 * @param {string} message
 */
export function showError(message) {
  els.errorMessage.textContent = message;
  els.errorMessage.classList.remove("error-hidden");
}

export function clearError() {
  els.errorMessage.textContent = "";
  els.errorMessage.classList.add("error-hidden");
}

export function showPlaceholder() {
  els.moviePlaceholder.classList.remove("movie-hidden");
  els.movieResult.classList.add("movie-hidden");
  els.movieResult.innerHTML = "";
  els.searchResults.classList.add("results-hidden");
  els.resultsList.innerHTML = "";
  els.loadMoreBtn.classList.add("results-hidden");
}

export function hideResultsList() {
  els.searchResults.classList.add("results-hidden");
  els.resultsList.innerHTML = "";
  els.loadMoreBtn.classList.add("results-hidden");
  els.resultsMeta.textContent = "";
}

/**
 * @param {object} movie OMDb detail response
 */
export function renderMovie(movie) {
  els.moviePlaceholder.classList.add("movie-hidden");
  els.movieResult.classList.remove("movie-hidden");
  hideResultsList();

  const hasPoster = movie.Poster && movie.Poster !== "N/A";
  const posterHtml = hasPoster
    ? `<img src="${escapeAttr(movie.Poster)}" alt="${escapeAttr(movie.Title)} poster" loading="lazy" width="300" height="444" />`
    : `<div class="poster-fallback">No poster</div>`;

  els.movieResult.innerHTML = `
    <div class="movie-poster-wrap">${posterHtml}</div>
    <div class="movie-info">
      <h2>${escapeHtml(movie.Title)} <span class="year">(${escapeHtml(movie.Year)})</span></h2>
      <ul class="movie-meta">
        <li><strong>Director</strong> ${escapeHtml(movie.Director)}</li>
        <li><strong>Genre</strong> ${escapeHtml(movie.Genre)}</li>
        <li><strong>Runtime</strong> ${escapeHtml(movie.Runtime)}</li>
        <li><strong>IMDb</strong> ${escapeHtml(movie.imdbRating)} / 10</li>
      </ul>
      <p class="movie-plot">${escapeHtml(movie.Plot)}</p>
    </div>
  `;
}

/**
 * @param {object[]} items OMDb Search list
 * @param {object} meta
 * @param {number} meta.totalResults
 * @param {number} meta.page
 */
export function renderResultsList(items, meta) {
  els.moviePlaceholder.classList.add("movie-hidden");
  els.movieResult.classList.add("movie-hidden");
  els.movieResult.innerHTML = "";

  els.searchResults.classList.remove("results-hidden");
  const total = Number(meta.totalResults || 0);
  const page = Number(meta.page || 1);
  els.resultsMeta.textContent = total > 0 ? `${total} results • Page ${page}` : "";

  const html = items
    .map((it) => {
      const hasPoster = it.Poster && it.Poster !== "N/A";
      const poster = hasPoster
        ? `<img src="${escapeAttr(it.Poster)}" alt="${escapeAttr(it.Title)} poster" loading="lazy" />`
        : `<div class="poster-fallback">No poster</div>`;
      const typeLabel =
        it.Type === "movie"
          ? "Movie"
          : it.Type === "series"
            ? "Series"
            : it.Type === "game"
              ? "Game"
              : "";
      return `
        <li class="result-item" data-imdbid="${escapeAttr(it.imdbID)}" tabindex="0" role="button" aria-label="Open details for ${escapeAttr(it.Title)}">
          <div class="result-poster">${poster}</div>
          <div class="result-info">
            <p class="result-title">${escapeHtml(it.Title)}</p>
            <p class="result-sub">${escapeHtml(it.Year)}${typeLabel ? ` • ${escapeHtml(typeLabel)}` : ""}</p>
          </div>
        </li>
      `;
    })
    .join("");

  if (page <= 1) {
    // New search: replace previous list
    els.resultsList.innerHTML = html;
  } else {
    // Pagination: append
    els.resultsList.insertAdjacentHTML("beforeend", html);
  }

  const shown = els.resultsList.querySelectorAll(".result-item").length;
  const canLoadMore = total > 0 && shown < total;
  els.loadMoreBtn.classList.toggle("results-hidden", !canLoadMore);
}

export function setLoadMoreLoading(isLoading) {
  if (isLoading) {
    els.loadMoreBtn.disabled = true;
    els.loadMoreBtn.textContent = "Loading…";
  } else {
    els.loadMoreBtn.disabled = false;
    els.loadMoreBtn.textContent = "Load more";
  }
}

export function getResultsRoot() {
  return els.searchResults;
}

export function getLoadMoreButton() {
  return els.loadMoreBtn;
}

function escapeHtml(str) {
  if (str == null) return "";
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}
