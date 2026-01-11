# Productivity Page: Code & Logic Overview

This document summarizes all code and logic related to the Productivity page in the Sigla-Track app. It covers UI components, analytics, business logic, and user experience features, providing a comprehensive overview for developers and maintainers.

---

## 1. Purpose & Features

The Productivity page is the central hub for users to:
- View their habit analytics (completion rates, streaks, top habits)
- See progress visualizations (charts, streaks, etc.)
- Access and manage all habits (due/completed status, details)
- Gain insights into their productivity patterns

---

## 2. Main Files & Components

### UI Layer
- **app/tabs/productivity.tsx**
  - Main screen for productivity analytics and habit overview.
  - Renders analytics cards, charts, and modals for details and all habits.
  - Handles user interactions (viewing details, opening modals, etc.).

- **components/productivity/AnalyticsCard.tsx**
  - Displays key analytics metrics (e.g., weekly completion, best streak).
  - Used for modular, reusable analytics display.

- **components/productivity/EmptyState.tsx**
  - Shown when there are no habits or analytics to display.

- **components/productivity/HabitListItem.tsx**
  - Renders individual habit items in lists/modals.

- **components/productivity/ProgressRing.tsx**
  - Visualizes completion rates as a ring/progress chart.

### Modals
- **All Habits Modal**
  - Shows all habits, with due/completed status, opacity for inactive, and action buttons.
  - Enhanced for clarity and usability.

- **Top Streaks Modal**
  - Lists top 5 habits by best streak, with streak counts and habit names.

---

## 3. Analytics & Business Logic

### Analytics Hook
- **hooks/useHabitAnalytics.ts**
  - Aggregates analytics data for the productivity page.
  - Calculates:
    - Weekly completion rate (completions/opportunities, last 7 days)
    - Best active streak (current best streak among active habits)
    - Top 5 habits by streak
    - Per-habit completion and due status
  - Exposes analytics data and loading/error states.

### Habit Services
- **services/habitServices.ts**
  - Core business logic for habits and analytics.
  - Functions:
    - `isHabitDueOn`: Determines if a habit is due on a given day (handles weekly logic)
    - Completion tracking: Counts completions and opportunities for analytics
    - Streak calculation: Tracks current and best streaks per habit
    - Returns enriched habit objects with analytics fields

---

## 4. UI/UX Enhancements

- **Clarified Analytics**: "Current Streak" renamed to "Best Active Streak" for accuracy.
- **All Habits Modal**: Shows due/completed status, disables actions for inactive habits, uses opacity for clarity.
- **Error Handling**: Displays errors if analytics fail to load.
- **Charts**: (Planned/Optional) Integration with `react-native-svg-charts` for visual analytics.
- **Accessibility**: Improved button logic, feedback, and modal usability.

---

## 5. Data Flow & State

- **State Management**: Uses React hooks (`useState`, `useMemo`, `useCallback`) for UI and analytics state.
- **Context**: May use context for user points and authentication.
- **Type Definitions**: `HabitWithStatus`, `AnalyticsData` for strong typing and clarity.

---

## 6. Key Ideas & Best Practices

- **Separation of Concerns**: UI, analytics, and business logic are modular and well-separated.
- **Accurate Analytics**: Weekly completion and streaks are calculated based on due days and completions, not just raw counts.
- **User-Centric Design**: UI is clear, actionable, and provides feedback for all states (loading, error, empty, success).
- **Extensibility**: Structure allows for easy addition of new analytics, charts, or UI features.

---

## 7. Future Improvements

- **Graphical Analytics**: Integrate charts for trends and progress visualization.
- **More Insights**: Add habit formation trends, missed days, or motivational stats.
- **Customization**: Allow users to filter or customize analytics views.

---

## 8. References

- Main files: `app/tabs/productivity.tsx`, `hooks/useHabitAnalytics.ts`, `services/habitServices.ts`, `components/productivity/`
- Charting: `react-native-svg-charts` (installed, not yet fully integrated)

---

This document should be updated as new analytics features or UI improvements are added to the Productivity page.
