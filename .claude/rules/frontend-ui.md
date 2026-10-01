---
paths:
  - "apps/web/src/**"
  - "apps/admin/src/**"
---
# Frontend UI rules
The e2e suites find elements by their accessible names, so treat those names as an API.

- Before you rename or remove a label, tab, form name or button text, grep `apps/web/e2e` / `apps/admin/e2e` for it. Example: `auth-panel.tsx`'s `role="tab"` and `aria-label="Create account"` are what `e2e/auth.ts` uses.
- Admin has no `aria-label`s. Its test hooks are MUI field labels and menu names ("Username", "Password", "Sign in", "Orders").
- Web only: put new user-facing strings in `src/locales/en/translation.json` and read them with `useTranslation()` (i18next is set up in `src/lib/i18n.ts`). Existing components still hardcode text; don't mass-migrate them unless asked.
- Admin (`apps/admin`) has no i18n. Keep text inline in the JSX.
