# OMDB Movie Search Project

## Live Demo

Deployed on GitHub Pages: `https://farukbir.github.io/omdb-project/`

## Project Summary (My Implementation)

A responsive single-page movie search app using the [OMDb API](https://www.omdbapi.com/).

- **Search** by movie title
- **Filters (bonus UI)**: year, type (movie/series/episode), plot length
- **Details shown**: Title, Year, Genre, Director, Poster (plus extra fields when available)
- **Error handling** with clear user messages
- **Persistence**: last search is restored on refresh via **URL params + LocalStorage**

---

## Run Locally

1. Put your API key into `js/config.js`:

```js
export const OMDB_API_KEY = "YOUR_KEY";
```

2. Start a local server (ES modules require HTTP):

```bash
python3 -m http.server 5173
```

3. Open `http://localhost:5173` in your browser.

---

## Deploy to GitHub Pages

1. Push your code to your own GitHub repo.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set:
   - **Source**: Deploy from a branch
   - **Branch**: `main`
   - **Folder**: `/ (root)`
4. Save. Your site will be published at a URL like:
   - `https://<username>.github.io/omdb-project/`

> Note: This is a frontend-only project, so the API key is visible in the browser.

---

## Overview

This project is designed to evaluate your coding skills in web development. You are required to build a simple web application that consumes the [OMDB API](http://www.omdbapi.com/).

* The application must be a fully responsive **Single Page Application (SPA)** and should display movie details such as **title, year, genre, director, and poster**.
* The application must be written using **HTML, CSS, and JavaScript**.
* If your project meets all the requirements, you may extend it with additional functionalities.
* After development, you must deploy the project using [GitHub Pages](https://pages.github.com). **Projects that are not deployed to GitHub Pages will not be evaluated and will receive 0 points.**

You must **create your own repository using this template** and upload your work there. 
Do **not** attempt to push changes directly to this repository or any of its original branches.

---

## Functional Requirements

1. **Movie Search Input**
   - Users must be able to enter a movie name and trigger a search.
   - A search box and button are sufficient, but adding well-composed UI elements (e.g., filters similar to sahibinden.com) will earn bonus points.

2. **Display Movie Details**
   - Show at least: Title, Year, Genre, Director, and Poster image.
   - The design is up to you.

3. **Error Handling**
   - If the movie is not found or the API returns an error, display a clear message to the user.
   - Unhandled errors will result in point deductions.

4. **Multiple Searches**
   - Users should be able to perform multiple searches without refreshing the page.
   - If the page is refreshed, the last search view should be retained (e.g., using LocalStorage or URL parameters).

5. **Backend Proxy (Optional)**
   - If you implement a backend, it should handle API requests and return clean JSON to the frontend.

---

## Non-Functional Requirements

1. **Performance**
   - API calls should be efficient. Avoid unnecessary repeated requests.

2. **Usability**
   - The interface should be simple, intuitive, and user-friendly.
   - The design is up to you.

3. **Portability**
   - The application should work across modern browsers and be responsive for different screen sizes.

4. **Maintainability**
   - Code should be modular, well-documented, and easy to extend.

---

## Deliverables & Submission

Once you have completed the project, ensure you have the following ready:
- A **public GitHub repository** containing your project code (created via the template).
- A **hosted version** of the project deployed on GitHub Pages.
