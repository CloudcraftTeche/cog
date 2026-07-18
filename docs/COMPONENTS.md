# Components

Reference: [client/components](../client/components)

## Organization

Components are organized by role/domain rather than by type, mirroring the dashboard structure under `client/app/dashboard`:

```
client/components/
├── admin-dashboard.tsx          # Top-level admin dashboard composition
├── student-dashboard.tsx        # Top-level student dashboard composition
├── super-admin-dashboard.tsx    # Top-level super-admin dashboard composition
├── teacher-dashboard.tsx        # Top-level teacher dashboard composition
├── auth/
│   └── login-form.tsx
├── dashboard/                   # Shared dashboard shell
│   ├── DashboardHeader.tsx
│   ├── LoadingScreen.tsx
│   ├── NavButton.tsx
│   ├── Sidebar.tsx
│   ├── SidebarHeader.tsx
│   ├── UserAvatar.tsx
│   └── UserMenu.tsx
├── queries/                     # Query/ticket UI shared by admin & super-admin
│   ├── AssignModal.tsx
│   ├── EscalateModal.tsx
│   ├── FilterBar.tsx
│   ├── QueryCard.tsx
│   ├── QueryDetailModal.tsx
│   └── StatCard.tsx
├── shared/                      # Cross-role primitives
│   ├── ConnectionStatus.tsx
│   ├── ErrorComponent.tsx
│   ├── LoadingComponent.tsx
│   ├── LoadingSpinner.tsx
│   ├── MessageBubble.tsx
│   └── MessageInput.tsx
├── admin/                       # Admin & super-admin feature components
│   ├── announcemnets/
│   ├── assignments/
│   ├── attendance/
│   ├── chapters/
│   ├── dashboard/
│   ├── students/
│   ├── teacher-attendance/
│   ├── teacher-chapters/
│   └── teachers/
├── student/                     # Student feature components
│   ├── QueryModal.tsx
│   ├── announcements/
│   ├── assignments/
│   ├── chapter/
│   ├── dashboard/
│   ├── profile/
│   ├── queries/
│   └── todo/
├── teacher/                     # Teacher feature components
│   ├── announcements/
│   ├── attendance/
│   ├── chapter/
│   ├── dashboard/
│   ├── mychapter/
│   ├── profile/
│   ├── query/
│   └── students/
└── ui/                          # Radix-based primitives (shadcn-style)
    ├── alert-dialog.tsx, alert.tsx, avatar.tsx, badge.tsx, button.tsx,
    ├── card.tsx, checkbox.tsx, collapsible.tsx, command.tsx, dialog.tsx,
    ├── dropdown-menu.tsx, input.tsx, label.tsx, pagination.tsx, progress.tsx,
    ├── radio-group.tsx, select.tsx, separator.tsx, skeleton.tsx, sonner.tsx,
    ├── switch.tsx, table.tsx, tabs.tsx, textarea.tsx
    └── grade-form-modal.tsx, unit-form-modal.tsx, animated-progress.tsx, loading.tsx
```

## Conventions Observed

- **Role-scoped reuse**: The `admin/` component tree (announcements, assignments, attendance, chapters, students, teachers, teacher-attendance, teacher-chapters) is shared by both the `admin` and `super-admin` routes — e.g. [client/app/dashboard/admin/announcements/page.tsx](../client/app/dashboard/admin/announcements/page.tsx) and [client/app/dashboard/super-admin/announcements/page.tsx](../client/app/dashboard/super-admin/announcements/page.tsx) import the same `admin/announcemnets/*` components.
- **`ui/`** contains only generic, Radix-based primitives (buttons, dialogs, inputs, tabs, etc.) with no domain logic — consistent with shadcn/ui conventions (confirmed by [client/components.json](../client/components.json)).
- **`shared/`** holds components used across more than one role, notably chat (`ConnectionStatus`, `MessageBubble`, `MessageInput`) and generic loading/error states.
- **Naming inconsistency**: the admin announcements folder is spelled `announcemnets` (not `announcements`) and this spelling is used consistently by importing pages — do not "fix" this without also updating every import.
- Feature components receive data via props from page-level hooks; they do not call the API client directly (API calls live in `client/hooks/*` and `client/lib`/`client/utils` service files).

## Adding a New Component

- Shared, non-domain UI primitive → add to `client/components/ui/`.
- Feature-specific, reusable across pages within one role → add to `client/components/{admin|student|teacher}/<domain>/`.
- Used by more than one role → add to `client/components/shared/`.
