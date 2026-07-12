# DonateBridge Project Context

## Overview

DonateBridge is a Vite + React + Tailwind single-page application for item-only donations. The product models three main roles: donor, NGO, and admin. The app includes public landing/search pages, role-protected dashboards, a request wizard, smart matching, chat, logistics tracking, analytics, notifications, profile management, and settings.

The current implementation is largely a polished front-end simulation. State is mocked locally in React context and component state, with Axios and Socket.IO prepared as if the app were connected to a backend.

## Tech Stack

- Vite for build and dev server
- React 19
- react-router-dom for navigation and route protection
- Tailwind CSS 4 with custom utility tokens in `src/index.css`
- axios for API access
- socket.io-client for live notification/chat simulation
- react-hook-form for authentication forms
- chart.js and react-chartjs-2 for analytics charts
- lucide-react for icons

## App Architecture

- `src/main.jsx` mounts the app and wraps it in `GlobalStateProvider`.
- `src/context/GlobalStateContext.jsx` holds shared auth, theme, socket, and notification state.
- `src/App.jsx` defines the routing table and protection rules.
- `src/components/Navbar.jsx` is the shared role-aware navigation shell.
- `src/components/ui/*` contains reusable UI primitives.
- `src/pages/*` contains the actual user-facing screens.

## Route Map

Public routes:

- `/` landing page
- `/auth` authentication flow
- `/search` NGO directory/search
- `/ngo/:id` public NGO profile
- `/impact` public impact analytics
- `/tracking/:id` logistics tracking view

Protected routes:

- `/donor-dashboard` donor workspace
- `/ngo-dashboard` NGO workspace
- `/admin-dashboard` admin console
- `/request-wizard` donation request flow
- `/smart-match` ranking visualizer
- `/chat` message terminal
- `/notifications` notification center
- `/profile` user profile
- `/settings` settings terminal

## File-by-File Context

### Root Files

- `package.json`: project metadata, scripts, and dependencies. It is a React/Vite app with Tailwind, Chart.js, Socket.IO, Axios, and form/router libraries.
- `package-lock.json`: generated dependency lockfile.
- `vite.config.js`: enables the React plugin and Tailwind plugin.
- `eslint.config.js`: flat ESLint config for browser JS/JSX with React Hooks and React Refresh rules.
- `index.html`: minimal Vite HTML shell that mounts the React root and loads the favicon from `/favicon.svg`.
- `README.md`: still mostly the default Vite starter text, not yet a project-specific guide.
- `.gitignore`: standard ignore rules for logs, node_modules, dist, and editor files.

### Source Entry Points

- `src/main.jsx`: application entry point. Imports global CSS, wraps `<App />` in `GlobalStateProvider`, and renders to `#root`.
- `src/App.jsx`: route orchestration and role guard logic. It redirects unauthenticated users to auth and routes authenticated users to the appropriate dashboard based on role.
- `src/index.css`: main design system and global styles. Defines theme tokens, `db-*` utility classes, badge/tab/card styles, custom scrollbars, range input styling, and animations.
- `src/App.css`: leftover template CSS from the Vite starter. It appears unrelated to the active DonateBridge UI and is likely not in use.

### Shared State and Utilities

- `src/context/GlobalStateContext.jsx`: central application state layer.
  - Provides auth state and helpers such as `login`, `logout`, and `clearAuthMessage`.
  - Simulates session expiry with localStorage token TTL handling.
  - Configures a shared Axios instance with authorization headers and a mock 401 refresh flow.
  - Opens a Socket.IO client and simulates notifications for preview purposes.
  - Exposes theme and notification hooks through React context.

### Shared Components

- `src/components/Navbar.jsx`: global navigation component.
  - Changes available links depending on whether the user is a visitor, donor, NGO, or admin.
  - Shows unread notification indicators.
  - Provides shortcuts to chat, notifications, settings, profile, login, register, and logout.
- `src/components/ui/Button.jsx`: reusable button component with variants, sizes, loading spinner, and optional icon support.
- `src/components/ui/Card.jsx`: reusable card wrapper with hoverable mode.
- `src/components/ui/InputField.jsx`: labeled input with helper text and inline validation error display.
- `src/components/ui/MockMap.jsx`: animated logistics map visualization used by dashboard and matching screens.

### Pages

- `src/pages/LandingPage.jsx`: public marketing/home page. Contains hero content, search entry point, donation categories, featured needs, how-it-works section, FAQ, and a final CTA.
- `src/pages/AuthSuite.jsx`: login/register flow with donor/NGO role selection, OTP step, resend cooldown, rate limiting, and redirect on success.
- `src/pages/DonorDashboard.jsx`: donor workspace with a parcel builder, shipment history, matching map preview, and badges/impact summaries.
- `src/pages/NgoConsole.jsx`: NGO operations dashboard with inbound shipment tracking, inventory need management, and a rejection-state view when verification fails.
- `src/pages/AdminDashboard.jsx`: admin console for NGO approval/rejection, fraud flag review, and global platform metrics.
- `src/pages/SearchDirectory.jsx`: faceted NGO search and filter page with radius and trust score sliders.
- `src/pages/NgoProfile.jsx`: public NGO detail page with active demand cards, audit timeline, and donor reviews.
- `src/pages/RequestWizard.jsx`: multi-step donation request wizard with item details, optional documentation upload, and a success receipt.
- `src/pages/SmartMatchVisualizer.jsx`: scoring/ranking page that ranks NGO matches and lets the donor continue into the request wizard.
- `src/pages/ChatTerminal.jsx`: thread-based secure messaging interface for donor/NGO communication.
- `src/pages/LogisticsTracking.jsx`: shipment tracking timeline tied to a route/shipment ID, paired with the logistics map.
- `src/pages/ImpactAnalytics.jsx`: analytics dashboard. Uses Chart.js to show pie, line, and bar charts for category share, carbon savings, and donation volume.
- `src/pages/NotificationCenter.jsx`: notifications inbox with tabs for all, unread, delivery, and security messages.
- `src/pages/UserProfile.jsx`: account/profile page with editable details, certificate downloads, and achievements.
- `src/pages/SettingsTerminal.jsx`: app settings page for theme, accessibility, notifications, and MFA preferences.

### Assets

- `src/assets/hero.png`: landing page hero image.
- `src/assets/react.svg`: empty placeholder file.
- `src/assets/vite.svg`: default Vite asset, still present from the starter template.
- `public/icons.svg`: shared SVG symbol sheet used for icons.
- `public/favicon.svg`: empty placeholder file referenced by `index.html`.

## Empty or Placeholder Files

- `public/favicon.svg`: empty file; it is referenced by the HTML shell, so it should be replaced with a real favicon.
- `src/assets/react.svg`: empty placeholder file.

## Important Implementation Notes

- The app is mostly a mock product demo. Many flows simulate backend behavior with local state, alerts, and timeouts.
- Authentication is not real. `login()` stores mock user objects and mock tokens in localStorage.
- Session expiry is simulated through a token TTL.
- Notifications are partly simulated by an interval in the global context.
- The design system uses the `db-*` classes in `src/index.css` and a consistent light slate/blue visual language.
- `src/App.css` looks like unused starter CSS and can likely be removed or ignored if not referenced elsewhere.

## Quick Mental Model For Another AI

If another AI needs to work on this codebase, the first places to read are:

1. `src/App.jsx` to understand routing and protection.
2. `src/context/GlobalStateContext.jsx` to understand auth, notifications, and the shared API client.
3. `src/index.css` to understand styling primitives.
4. The target page file in `src/pages/` for the user flow being changed.

## Summary

DonateBridge is a polished mock donation logistics platform with a single shared state layer, route-based role separation, and a reusable light-themed design system. The only clearly empty project files found are `public/favicon.svg` and `src/assets/react.svg`.