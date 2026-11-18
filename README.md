# TaskFlow — Smart To-Do List

> **New:** this project is now installable (Windows `.exe`, Android `.apk`, PWA) and supports optional cloud sync with Supabase. See [SETUP_GUIDE.md](SETUP_GUIDE.md) for setup and deployment. The architecture notes below describe the original local-first core, which is unchanged: without Supabase keys the app still works fully offline with `localStorage`.

A modern, fast, and accessible task management web application built for personal daily productivity. TaskFlow features persistent local storage, due date and priority tracking, live case-insensitive search, multi-criteria filtering, sorting, and dark mode support.

---

## 1. Project Overview

- **Application Name:** TaskFlow — Smart To-Do List
- **Target Audience:** Personal productivity users (US ages 18–45) seeking an intuitive, clutter-free task organizer.
- **Target Devices:** Smartphones, tablets, laptops, and desktop screens (fully responsive from 320px to 1440px+).
- **Architecture:** Zero-backend, local-first web application with browser `localStorage` persistence.
- **Editions Included:**
  1. **Primary Production App (`src/`):** React 19 + TypeScript + Tailwind CSS with Lucide icons for maximum accessibility, strict typing, and instant static bundle builds.
  2. **Zero-Dependency Static Bundle (`static-bundle/`):** Standalone `index.html`, `style.css`, and `script.js` that can be double-clicked in any web browser without running Node.js or a bundler.

---

## 2. Key Features

### A. Task Creation & Input Validation
- **Required Task Title:** Strips excessive whitespace and rejects empty submissions.
- **Length Caps:** Safe bounds of 120 characters for titles and 500 characters for descriptions.
- **Optional Attributes:** Priority rating (Low, Medium, High), due dates, and descriptive notes.
- **Submission Safeguards:** Built-in submit debounce prevents accidental duplicate creation on rapid clicking.
- **Keyboard Shortcuts:** Press <kbd>Enter</kbd> to submit tasks from the title input, or <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Enter</kbd> from the description box.

### B. Task Management & Organization
- **Interactive Completion:** Clickable checkbox toggles completion with immediate visual status updates.
- **In-Place Editing:** Modal dialog enables editing title, description, priority, and due dates while safely retaining the original task ID and creation timestamp.
- **Safe Deletion:** Deletion requires explicit modal confirmation showing the task title to prevent accidental loss.
- **Bulk Actions:** "Clear Completed" button removes all finished items with confirmation.

### C. Search, Filter, and Sort Engine
- **Live Search:** Instant, case-insensitive search matching both titles and description notes.
- **Segmented Status Filters:** Filter between `All`, `Active`, and `Completed` tasks.
- **Priority Filter:** Filter by `High`, `Medium`, or `Low` priority.
- **Sorting Options:**
  - *Newest First* (default chronological order)
  - *Oldest First*
  - *Due Date* (earliest deadlines first; tasks without due dates sorted to the end)
  - *Priority* (High &rarr; Medium &rarr; Low)
- **One-Click Reset:** Quickly clear search queries and filter constraints when no results match.

### D. Timezone-Safe Due Date & Urgency Tracking
- Accurately distinguishes **Overdue**, **Due Today**, **Due Tomorrow**, and upcoming deadlines without UTC timezone rollover bugs.
- Tasks without a due date are never marked as overdue.
- Completed tasks are automatically excluded from overdue tallies.

### E. Data Persistence & Backup
- **Versioned Local Storage:** Uses `taskflow_tasks_v1` and `taskflow_theme_v1` keys.
- **Error Recovery:** Catches storage quota limits, disabled storage (e.g. strict private browsing modes), and corrupted data gracefully.
- **JSON Export / Import:** Download an offline `.json` backup of your tasks or restore your task list anytime.

---

## 3. Technology Stack

- **HTML5:** Semantic document landmarks (`<header>`, `<main>`, `<section>`, `<footer>`, `<dialog role="dialog">`).
- **CSS3 / Tailwind CSS v4:** Fluid layouts, zero layout shifts, dark mode via `@custom-variant dark`, and custom typography.
- **TypeScript & React 19:** Functional components, strict type definitions, hooks (`useState`, `useMemo`, `useCallback`), and automated DOM string escaping.
- **Lucide React:** Lightweight, accessible icons with meaningful text labels.
- **Vite 8:** Lightning-fast local development and production build pipeline.

---

## 4. How to Run Locally

### Option 1: Standard Development Server (Recommended)
1. Ensure Node.js (version 18 or newer) is installed.
2. In the project root, install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite local development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

### Option 2: Running the Standalone Static Edition
Navigate to the `static-bundle/` directory and open `index.html` directly in any web browser (Chrome, Firefox, Safari, Edge) without requiring any build step or local server!

---

## 5. How LocalStorage Works

All data is stored directly in the user's browser using the Web Storage API:
- `taskflow_tasks_v1`: JSON string array representing tasks.
- `taskflow_theme_v1`: String (`"light"` or `"dark"`).

### Task Data Schema
```typescript
{
  "id": "task_1729680000000_abc12",
  "title": "Prepare quarterly review presentation",
  "description": "Include KPI charts and Q4 roadmap milestones",
  "priority": "high",        // "low" | "medium" | "high"
  "dueDate": "2026-10-30",   // "YYYY-MM-DD" or undefined
  "completed": false,
  "createdAt": "2026-10-23T12:00:00.000Z",
  "updatedAt": "2026-10-23T12:00:00.000Z"
}
```

### Storage Safety Guarantees
1. **Schema Validation on Read:** When reading from `localStorage`, each item is verified for required properties (`id`, `title`, valid priority enum). Malformed objects are safely filtered out without throwing unhandled exceptions.
2. **Non-Destructive Error Handling:** If `localStorage` is disabled or parsing fails, existing corrupted data is preserved in storage rather than silently wiped.
3. **Quota Detection:** If the device exceeds storage quota, a user-visible warning banner is rendered.

---

## 6. How to Deploy to Static Hosting Platforms

Because TaskFlow is a client-side application, it compiles into pure HTML, CSS, and JavaScript.

### Production Build
Generate the optimized production static files:
```bash
npm run build
```
This produces an optimized `/dist` folder containing `index.html`, bundled CSS, and JavaScript assets ready for any static web host.

### Deploying to GitHub Pages
1. Push your repository to GitHub.
2. If building via GitHub Actions, add a workflow file `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [ main ]
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
         - run: npm ci
         - run: npm run build
         - uses: actions/upload-pages-artifact@v3
           with:
             path: ./dist
         - uses: actions/deploy-pages@v4
   ```
3. Alternatively, push the files inside `static-bundle/` to a `gh-pages` branch.

### Deploying to Vercel
1. Install Vercel CLI (`npm i -g vercel`) or connect your GitHub repository in the [Vercel Dashboard](https://vercel.com).
2. Configure project settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Click **Deploy**.

### Deploying to Netlify
1. Connect your repository in [Netlify](https://www.netlify.com).
2. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Click **Deploy site**.

---

## 7. Security Review & Limitations

### Protections Implemented
1. **Cross-Site Scripting (XSS) Prevention:**
   - User inputs (titles and descriptions) are rendered through React JSX string interpolation and safe DOM `textContent`, never raw `innerHTML` or dynamic `eval()`.
   - HTML injection payloads (e.g. `<script>alert(1)</script>`) are treated strictly as literal text.
2. **Input Sanitization & Length Restrictions:**
   - Titles are strictly capped at 120 characters; descriptions at 500 characters.
   - Priority inputs are restricted to an explicit allowlist: `['low', 'medium', 'high']`.
   - Dates are checked against `YYYY-MM-DD` ISO formatting.
3. **Zero Third-Party Telemetry or Trackers:**
   - No external trackers, user tracking beacons, or advertisement scripts exist in the codebase.
   - All tasks stay local to the browser; no data is transmitted to external servers.

### Architecture Limitations & Disclosures
- **LocalStorage is Not Encrypted:** `localStorage` is stored in plaintext on the user's local profile. Any script with execution rights on the same origin or malicious browser extensions with local storage permissions can read this data. Sensitive confidential data (e.g., passwords or credit cards) should never be placed in a standard to-do list.
- **Browser Cache Clearing:** If the user executes "Clear site data / cookies / cache" in browser settings, `localStorage` will be cleared. Users can use the "Export Tasks" button in the footer to keep an offline backup file.
- **Single-Device / Single-Browser Scope:** Because no centralized database or sync server is used, tasks do not automatically synchronize between separate devices (e.g. phone and laptop) unless transferred via the Export/Import feature.

---

## 8. Software Quality Assurance (SQA) Test Report

All 30 functional test cases specified in the engineering master prompt were verified:

| # | Test Scenario | Expected Result | Status |
|---|---|---|---|
| 1 | Add valid task | Task is created, prepended to list, and persisted | **PASSED** |
| 2 | Reject empty title | Inline validation warning displayed; submission blocked | **PASSED** |
| 3 | Reject whitespace-only title | Whitespace trimmed; rejected as empty | **PASSED** |
| 4 | Add task with optional fields | Priority, description, and due date properly stored | **PASSED** |
| 5 | Edit existing task | Modal opens with current values; saves updates properly | **PASSED** |
| 6 | Cancel task edit | Modal closes; original task remains unchanged | **PASSED** |
| 7 | Delete task with confirmation | Modal opens; confirming removes task and updates stats | **PASSED** |
| 8 | Cancel task deletion | Modal closes; task remains in list | **PASSED** |
| 9 | Mark task completed | Checkbox checks, text muted/struck, stats increment | **PASSED** |
| 10 | Reopen completed task | Checkbox unchecks, active count increments | **PASSED** |
| 11 | Search tasks | Live filtering matches title or description | **PASSED** |
| 12 | Case-insensitive search | Searching "MEETING" matches "meeting" | **PASSED** |
| 13 | Filter active tasks | Only incomplete tasks are visible | **PASSED** |
| 14 | Filter completed tasks | Only completed tasks are visible | **PASSED** |
| 15 | Combine search & filters | Both constraints applied conjunctively | **PASSED** |
| 16 | Sort by newest / oldest | Sorted by creation ISO timestamp | **PASSED** |
| 17 | Sort by due date | Items with deadlines ordered earliest first | **PASSED** |
| 18 | Sort by priority | High &rarr; Medium &rarr; Low order maintained | **PASSED** |
| 19 | Statistics recalculation | Total, Active, Completed, Overdue update reactively | **PASSED** |
| 20 | Browser refresh persistence | Reloading browser loads saved tasks from `localStorage` | **PASSED** |
| 21 | Theme switching | Light & dark mode toggle; persisted to `taskflow_theme_v1` | **PASSED** |
| 22 | Clear completed tasks | Removes all completed tasks after modal confirmation | **PASSED** |
| 23 | Empty state rendering | First-time empty state vs search-no-match empty state | **PASSED** |
| 24 | Long titles / descriptions | Capped cleanly; wrapped with CSS `break-words` | **PASSED** |
| 25 | Corrupted storage handling | Recovers with empty state without app crash | **PASSED** |
| 26 | Storage quota limits | Gracefully caught in try/catch; alert displayed | **PASSED** |
| 27 | XSS script injection test | `<script>alert(1)</script>` rendered strictly as text | **PASSED** |
| 28 | Due today not overdue | Tasks due on current calendar date marked "Due today" | **PASSED** |
| 29 | Tasks without due date | Never marked as overdue | **PASSED** |
| 30 | Responsive mobile layout | Tested at 320px, 375px, 768px, 1024px, 1440px | **PASSED** |

---

## 9. Accessibility Compliance

- **Keyboard Navigation:** Full Tab and Shift+Tab navigation support. <kbd>Enter</kbd> submits forms, <kbd>Space</kbd>/<kbd>Enter</kbd> toggles checkboxes, and <kbd>Escape</kbd> closes modal dialogs.
- **Focus Rings:** Distinct `focus-visible:ring-2 focus-visible:ring-indigo-500` rings for keyboard focus.
- **Screen Reader Support:** Accessible names on icon buttons via `aria-label`, dialog roles with `aria-modal="true"`, and live region status announcements for toasts via `role="status"` and `aria-live="polite"`.
- **Contrast Ratios:** Text colors meet WCAG AA standards (minimum 4.5:1 contrast against surface backgrounds in both light and dark themes).
