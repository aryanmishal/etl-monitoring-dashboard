# Patch Notes - Version 2.3

**Release Date:** [YYYY-MM-DD]

## Major Changes in Version 2.3

### UI/UX Overhaul
- **Navbar Redesign:**
  - Navigation buttons (Summary, Sync Status, Vitals) are now pill-shaped, use only grey tones, and feature instant hover/active feedback (no yellow/gold accent).
  - Profile menu always opens in the top right, directly under the navbar, with modern styling and spacing.
- **Admin/User Label Highlighting:**
  - "Login Portal", "Admin Access", and "Admin Panel" labels now use the yellow accent for emphasis, but all navigation and controls use only greys.
- **Dropdowns:**
  - All filters and settings now use a custom dropdown component (not native `<select>`). Users interact by clicking the button and then the option.
  - Data filter dropdowns and settings dropdowns are visually distinct and responsive.
- **Date Navigation Controls:**
  - Calendar, next, and previous date buttons in all control bars now have a modern hover effect (light grey background, subtle shadow, smooth transition).
- **Button/Control Consistency:**
  - All control bar and navbar buttons have consistent sizing, spacing, and focus/hover states.
- **Accessibility:**
  - Improved focus outlines and keyboard navigation for all interactive elements.

### Logic & Interaction Changes
- **Dropdown Logic:**
  - Custom dropdowns are not native `<select>` elements. All E2E and user interactions must use click to open and select options.
- **Date Picker Logic:**
  - Users cannot select or type a future date; if attempted, the date reverts to today.
  - Date navigation buttons (prev/next) are greyed out and disabled when at the current date.
- **Profile Menu:**
  - Always opens in the top right, with padding below the navbar, and never overlaps the navbar.
- **Admin Panel:**
  - All fields are required when adding or editing a user.
  - Admin/user labels use yellow accent for emphasis only.
- **Summary Page:**
  - Monthly view subtitle now shows only "Monthly View - Month, Year" (no date range).
  - Daily view subtitle uses long date format with ordinal (e.g., "24th July, 2025").
  - Weekly/monthly view subtitles and date logic improved for clarity.

### Testing Improvements
- **E2E Testing (Playwright):**
  - All E2E tests updated to interact with custom dropdowns via click, not `.selectOption()`.
  - Added robust selectors for all navigation, login, settings, and admin flows.
  - Added/updated tests for all major flows, including login, settings, summary, sync status, vitals, and admin panel.
- **Frontend Unit Testing (Vitest):**
  - Unit tests for all major components, including CustomDatePicker, Navbar, and dropdowns.
  - Ensured all UI logic and state changes are covered.
- **Backend Testing (Pytest):**
  - API endpoint tests for authentication, summary, sync status, and user settings.
  - Database and logic tests for all backend services.

### PRD Updates
- **Comprehensive PRD Overhaul:**
  - Both frontend and backend PRDs were updated to include detailed, actionable "AI Build Task List" sections, breaking down every feature, logic, API, and test into explicit tasks and subtasks.
  - Created new AI-ready PRDs for both frontend and backend, ensuring an AI bot or developer can build the complete application from scratch.
  - Merged the original and AI task list PRDs into unified, comprehensive documents for both frontend and backend, serving as the single source of truth for requirements and implementation.

### Bug Fixes & Miscellaneous
- Fixed Playwright E2E test failures by updating dropdown interaction logic.
- Fixed profile menu overlap and alignment issues.
- Fixed date navigation logic and disabled state for next/prev buttons.
- Improved error handling and notification consistency across the app.
- Updated README and USER_GUIDE to reflect all UI/UX, logic, and testing changes in v2.3.

---

**For a full list of features and usage instructions, see the updated [README.md](../README.md) and [USER_GUIDE.md](../USER_GUIDE.md).** 