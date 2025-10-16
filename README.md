# Gaspoll CMS (React) 🚀

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-4.x-F8CE00?logo=chartdotjs&logoColor=black)
![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4?logo=axios&logoColor=white)
![SweetAlert2](https://img.shields.io/badge/SweetAlert2-11.x-FF6B6B)

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A modern React-based Content Management System (CMS) for Gaspoll. This repository contains the admin dashboard UI with management pages (Menu, Outlet, Tax, Reports, Members, etc.) and a special public fullscreen view for donation transparency.

✨ Built to be modular and extensible — split components for management vs public presentation (e.g. `Tax` management and `TaxFullscreen` public view).

---

## Highlights 🌟

- Clean React (CRA) scaffold with React Router v6 routing
- Charting with Chart.js via `react-chartjs-2`
- File uploads via FilePond
- Auth via JWT token stored in localStorage
- Public fullscreen route for donation transparency: `/tax-fullscreen/:id`
- Management pages protected by token/menu access

---

## Quick Tech Stack 🧰

- React 18
- react-router-dom v6
- axios
- chart.js + react-chartjs-2
- sweetalert2
- filepond + plugins
- jwt-decode

---

## Getting Started (dev) 🛠️

Clone repo and install dependencies:

```bash
git clone <your-repo-url>
cd gaspol-cms
npm install
```

Run dev server:

```bash
npm start
```

Build for production:

```bash
npm run build
npm run serve
```

---

## Useful Scripts

- `npm start` — start dev server
- `npm run build` — build production bundle
- `npm run serve` — serve built bundle (requires `serve` package)

---

## Routing & Auth Notes 🔐

- The app reads JWT token from `localStorage` and validates expiration using `src/helpers/token.js`.
- Management routes (e.g. `/tax`, `/menu`, `/report`) are only available when authenticated and the user's token `menu_access` includes the required ID.
- Public route:
	- `/tax-fullscreen/:id` — public donation transparency page. Can be accessed without login and will fetch data from `/tax/:id`.
	- `/tax-fullscreen` — authenticated fullscreen using outlet id from token.

Layout hides header/sidebar for fullscreen routes (`/tax-fullscreen*`) to provide a clean public presentation.

---

## Components structure (important)

- `src/components/Tax.js` — Management view for configuring tax/donation report and preview.
- `src/components/TaxFullscreen.js` — Fullscreen/public view (logo, title, charts, latest donations, kas masuk table).
- `src/components/common/` — Header, Footer, Sidebar, modals, etc.

---

## API expectations 🧾

The frontend expects an API base defined in `REACT_APP_API_BASE_URL`.
For tax/fullscreen endpoints it calls:

- `GET ${API_BASE_URL}/tax/:outletId` — returns an object with keys like `total_nominal`, `total_donasi`, `daily_chart`, `latestTaxes`, and optionally `kas_masuk`.

If your backend uses slightly different keys (e.g. `kas` instead of `kas_masuk`) the frontend contains fallbacks to support both.

---

## Tips & Troubleshooting ⚠️

- Static assets in `public/index.html` are referenced using `%PUBLIC_URL%/assets/...` to support client-side routing on nested routes.
- If you see a blank page on nested routes, ensure the dev server catches all routes (CRA dev server does this by default).
- To test fullscreen as a guest: open `http://localhost:3000/tax-fullscreen/3`.

---

## Contribution & Next Steps 🤝

- Add tests (React Testing Library) for pages and route guards
- Add i18n support if needed
- Add configuration UI in `Tax.js` so admins can choose which blocks appear in fullscreen

---

Thanks for using Gaspoll CMS! If you want, I can also add a quick CONTRIBUTING.md, CODE_OF_CONDUCT, or a small demo GIF for the README to make it more attractive. 😄
