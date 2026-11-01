# Redesign backlog - screens still on the old design

Audit of 1 Nov 2026 across the client, driver and admin surfaces, measured
against the redesign language in CLAUDE.md ("Dashboard redesign"): `PageHeader`
titles, `rounded-2xl` hairline cards at `p-4 md:p-5`, 15px section titles, icon
`StatCard`s, `ADMIN_TABLE_HEAD` / stacked cards below `md`, `AppTabs` variants,
`EmptyState`, and dialogs with their actions in `AppDialog`'s `dialogFooter`.

Scope rule: restyle only - every screen keeps exactly the features it has.

Verdicts: **Redesign** = visibly off, rework the layout. **Touch-up** = right
structure, wrong details. Screens already conforming are listed at the end so
nobody re-audits them.

No wrapper-rule violations were found: nothing outside the allowed files imports
`ui/dialog`, `ui/sheet` or `ui/tabs`, and there is no bare `<select>` or
`window.confirm` anywhere in scope.

## Batch 1 - shared by more than one surface (do first)

| # | Screen | Verdict | Why |
| - | ------ | ------- | --- |
| 1.1 ✅ 1 Nov | Settings > User profile + Security tabs (done: shared `components/settings/`; Notifications and Work preferences moved onto `SettingsCard` too) - driver `app/driver/(app)/dashboard/settings/_components/{profile,security}-settings.tsx`, client `app/(app)/dashboard/settings/_components/{profile,security}-settings.tsx` | Redesign | Old drivers-vault layout: a card wrapping a second `rounded-lg border` box split 50/50, a decorative 160-208px avatar (purely decorative on Security), `p-6 md:p-10`, full-width `h-12 rounded-lg` save. Identical markup on both surfaces - restyle together. |
| 1.2 ✅ 1 Nov | Dialog footers - every client/driver/admin form dialog (done: `AppDialog` `primaryAction` + automatic Cancel, slate footer bar, height capped to the viewport) | Touch-up | `AppDialog.dialogFooter` is almost never used: submit buttons sit in the body with mixed `h-11`/`h-12`, `rounded-lg`/`rounded-xl`, and no Cancel. Affects: create-request, hire-request, flag-day, mark-salary-paid, salary dispute (driver), request-preview, reactivate-account, generate invoice / reject proof / decline (admin hires), resolve salary (admin). |
| 1.3 ✅ 1 Nov | `components/drivers/driver-profile-dialog.tsx` (done: now renders `DriverPublicProfile`; working hours, response time and an `aside` slot added to it) (marketplace "Request" dialog) | Redesign | Furthest off on the client side: a 1100px two-column page in a dialog on old tokens (`rounded-2xl border p-5 shadow-sm`, `text-base` titles, `text-lg font-bold` name, `bg-muted/40` review tiles). Duplicates `DriverPublicProfile`, which C3 made the one client-facing profile - rebuild the body on it. |
| 1.4 ✅ 1 Nov | `components/drivers/talent-card.tsx` (done: both cards are `DriverCardShell` from `driver-card.tsx` with different actions) (Find talent, View matches) and `driver-card.tsx` (marketplace grid) | Touch-up | `shadow-sm` not hairline, `p-5` with no `md:` step, `text-lg font-bold` rate, a `tracking-[0.2em] text-[10px]` eyebrow nothing else uses, `h-11 rounded-lg` buttons. |
| 1.5 ✅ 1 Nov | Empty states that are bare text (done: `EmptyState` gained `size="compact"` for in-card empties; 20 bare-text spots converted, 8 icon-less ones given icons, 3 "Loading…" texts became skeletons) | Touch-up | Payslips card, attendance log empty month, admin support list + transcript, admin team tab, referrals leaderboard / referrer sheet, admin activity timeline. Switch to `EmptyState`. |

## Batch 2 - admin

Closed by the owner on 1 Nov - the admin console is good as it is. Done from it anyway: 2.4 candidate picker, 2.5 driver detail, 2.10 salary evidence, the 2.8 Profile tab hydration error, and the two missing confirmations (Support "Resolve", Referrals "Reject" / "Reverse reward"). The rest stays as listed.

| # | Screen | Verdict | Why |
| - | ------ | ------- | --- |
| 2.1 | Support inbox `admin/(app)/dashboard/support` (`conversation-list.tsx`, `transcript-pane.tsx`) | Redesign | No list header / filter / search, hand-rolled `text-[10px] uppercase` status chips, no avatars, list and transcript just stack on a phone (no list-then-detail), plain-text empty states. "Resolve" closes a chat with no `ConfirmDialog`. |
| 2.2 | Attendance `admin/(app)/dashboard/attendance/page.tsx` | Redesign | `max-w-5xl` (every sibling is `max-w-[1360px]`), hand-built title, no stat cards, hand-rolled pill filter buttons instead of `AppTabs` chip/compact. `flag-card.tsx` itself is fine. |
| 2.3 | Transactions > payouts `transactions/_components/payouts-tab.tsx` | Touch-up | Not the list pattern Drivers/Clients/Salaries use: no toolbar title/search, inset table (`mt-4`), unbordered pager, a hand copy of the table head with `font-medium`, Title Case actions. |
| 2.4 | Hires `hires/page.tsx` + `hire-request-card.tsx` | Touch-up | Add-candidates picker done 1 Nov (it also fetched the 6 newest drivers of any status and hid the unapproved ones client-side, so it often showed 2-3 candidates - the server now filters `verified=true`). Still to do: Hand-built header, hand-rolled filter pills, hand-styled status chip, dialog footers (1.2), the pricing guide opens a dialog on top of the invoice dialog, plain-text "no drivers match". |
| 2.5 ✅ 1 Nov | Driver detail `drivers/[id]` (`driver-documents.tsx`, `driver-overview.tsx`) - done as a redesign: profile-style hero, two-column overview | Redesign | `BackLink` + hand-built "Know your Driver." title instead of `PageHeader back`, untitled status card, `rounded-xl` unshadowed document tiles, hand-styled `rounded-md` Download link, Title Case buttons, document viewer shows only the file (no date/status/reason), mixed-case labels. |
| 2.6 | Client detail `clients/[id]` (`client-overview.tsx`) | Touch-up | Same hand-built "Know your Client." header; for an individual client the `lg:grid-cols-2` row holds one card and leaves a half-width hole. |
| 2.7 | User wallet tab `_components/user-wallet.tsx` | Touch-up | Balance is an uppercase label over `text-3xl` instead of icon stat cards; uppercase section label; inset table. |
| 2.8 | Settings `admin/(app)/dashboard/settings` | Touch-up | Profile tab throws a hydration mismatch on load (skeleton on the server, card on the client - same `useIsClient` fix as the other settings). `text-base` section titles, uppercase team label, hand-copied table head, Title Case buttons, team cards can't change a role on mobile (the table can). |
| 2.9 | Referrals `referrals/` | Touch-up | Hand-built header; `referrals-table.tsx` uses `ui/table` heads without `ADMIN_TABLE_HEAD` and `Pagination`'s search; `ReferralStatusChip` has its own palette; plain "Loading…". "Reverse reward" (takes money back) and "Reject reward" fire without `ConfirmDialog`. |
| 2.10 | `resolve-salary-dialog.tsx`, `pricing-guide-dialog.tsx` | Touch-up | Salary evidence is one `<p>` joined with `<br/>` - needs labelled sections. Pricing guide has `text-sm font-bold` titles, a `bg-muted/60` table head, plain-text loading. |

## Batch 3 - client

| # | Screen | Verdict | Why |
| - | ------ | ------- | --- |
| 3.1 ✅ 1 Nov | `components/hires/hire-request-dialog.tsx` ("Hire {driver}") | Redesign (light) | No width (falls back to the primitive), unsectioned field stack, two-value engagement type as a select where the wizards use chips, submit in the body. |
| 3.2 ✅ 1 Nov | Find talent `/dashboard/requests/find-talent` | Redesign (light) | Hand-built title, `SearchPanel` with `shadow-sm`, "Can't decide?" banner and result count loose between blocks. |
| 3.3 ✅ 1 Nov | Hire detail `/dashboard/my-hire/[reference]` | Touch-up | Bespoke header (avatar + `text-lg` name + bare `border-t`), hand-styled status pill. Cards below conform. |
| 3.4 ✅ 1 Nov | Hire requests tab `components/hires/hire-request-row.tsx` | Touch-up | `divide-y` link list with a hand-made pill, no horizontal padding - doesn't match the Active tab's `HiredStaffTable` beside it. |
| 3.5 ✅ 1 Nov | Hire request `/dashboard/my-hire/requests/[reference]`, Request a driver `/dashboard/my-hire/request`, View matches `/dashboard/requests/[reference]` | Touch-up | Hand-built headers (`BackLink` + h2 + pill) instead of `PageHeader back`; loose caption text outside cards; `h-12 rounded-lg` proof submit. |
| 3.6 ✅ 1 Nov | `create-request-dialog.tsx` ("Post a request") | Touch-up | Ten fields in one flat stack - group into role / location / budget / preferences. |
| 3.7 ✅ 1 Nov | Marketplace `/marketplace`, `/marketplace/search` | Touch-up | `text-lg font-medium` / `text-xl font-medium` headings where everything else is 22px semibold. |
| 3.8 ✅ 1 Nov (in 1.2) | `request-preview-dialog.tsx`, `reactivate-account-dialog.tsx` | Touch-up | Body-level button rows; reactivate has an emoji title and no icon tile like `ConfirmDialog`. |

## Batch 4 - driver

| # | Screen | Verdict | Why |
| - | ------ | ------- | --- |
| 4.1 | Payout accounts `earnings/_components/bank-accounts.tsx` (Earnings + Wallet) | Touch-up | Card inside a card inside a card on Wallet (`rounded-xl border` list, a third bordered box for the form), `h-11 rounded-lg px-6` buttons. |
| 4.2 | `withdraw-dialog.tsx` | Touch-up | Uses the footer correctly, but the body is a bare "Available to withdraw" caption over two fields - give the balance a panel. |
| 4.3 ✅ 1 Nov (in 1.2) | Salary dispute dialog in `job-request/_components/job-salary.tsx` | Touch-up | Submit inside the body, no Cancel (part of 1.2). |
| 4.4 | Small outliers | Touch-up | `unverified-notice.tsx` (unshadowed, `h-11 rounded-lg` - shown on three pages), Wallet info notes, `support/[reference]` separate `BackLink` above `PageHeader`, `p-5 md:p-6` drift on Trust score, Notification settings, Work preferences, `driver-public-profile` `CARD`. |

## Decisions needed before starting

- **Settings tab style - decided 1 Nov:** the filled `pill` stays on all
  three surfaces.
- **Button convention:** `rounded-xl`, `h-10`, sentence case - applied from
  1.1 onward.

## Already conforming - no work

- **Client.** Overview and shell, My hire list, Requests list, Billing list
  and detail, the dashboard driver profile (`DriverPublicProfile`), Settings
  shell and Notifications tab, notifications popover, support widget, auth
  (`AuthShell`), and the onboarding wizard.
- **Driver.** Overview and shell, My jobs and job detail, Earnings and
  payslips, Wallet (apart from 4.1), Referrals, Reviews, Trust score, Support
  list and thread, Settings shell plus the Notifications, Verification and
  Work preferences tabs, auth, and all eight onboarding steps with the status
  page.
- **Admin.** Overview and shell, Drivers list with the verification queue,
  Clients list, Salaries, `flag-card`, `booking-attendance-dialog`,
  `detail-card`, `activity-timeline`, and auth.

## Not styling, found on the way

- **Fixed 1 Nov.** `bank-accounts.tsx` matched account numbers against
  `/^d{10}$/`, missing the backslash, so the bank-name lookup never fired and
  a payout account could not be saved.
- **Duplicated support panels.** The driver
  `app/driver/(app)/_components/support/report-issue-panel.tsx` is
  byte-identical to `components/support/report-issue-panel.tsx`, and
  `contact-panel.tsx` differs from the client one by about 12 lines.
- **Hard-coded referral reward.** `driver/onboarding/status/page.tsx` says
  "Earn ₦1,000". The real figure is `reward_minor` from the server.
- **Multi-line comments against CLAUDE.md.** Found in `job-request/page.tsx`,
  `onboarding/page.tsx`, `use-save-onboarding-step.ts`, `faq-content.ts`,
  `unverified-notice.tsx` and `job-request/[reference]/page.tsx`.
