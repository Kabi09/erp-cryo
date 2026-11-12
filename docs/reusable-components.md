# Reusable Component Registry — Cryo Scientific ERP

All frontend UI components are functional React components located in `frontend/src/components/common/` and `frontend/src/components/layout/`.

## Shared UI Components

### 1. `Badge`
- **Location**: `frontend/src/components/common/Badge.jsx`
- **Purpose**: Semantic status pill with circular indicator dot.
- **Props**: `children`, `variant` (default, primary, success, warning, danger, purple, cyan), `size` (sm, md, lg), `className`.
- **Auto-Detection**: Dynamically maps common status text (`Won`, `Approved`, `Verified`, `Pending`, `Mismatch`, `Lost`) to appropriate color scheme when variant is default.

### 2. `Button`
- **Location**: `frontend/src/components/common/Button.jsx`
- **Purpose**: Interactive button with loading spinner, icons, and variants.
- **Props**: `children`, `type`, `variant` (primary, secondary, outline, success, danger, ghost), `size` (sm, md, lg), `loading`, `disabled`, `icon`, `onClick`, `className`.

### 3. `Card`
- **Location**: `frontend/src/components/common/Card.jsx`
- **Purpose**: White rounded container with subtle border and shadow for tables and metrics.
- **Props**: `children`, `title`, `subtitle`, `action`, `className`, `noPadding`.

### 4. `Modal`
- **Location**: `frontend/src/components/common/Modal.jsx`
- **Purpose**: Accessible dialog overlay with animated backdrop and escape key listener.
- **Props**: `isOpen`, `onClose`, `title`, `children`, `maxWidth`.

### 5. `ConfirmDialog`
- **Location**: `frontend/src/components/common/ConfirmDialog.jsx`
- **Purpose**: Action confirmation prompt before destructive actions (deletions, rejections).
- **Props**: `isOpen`, `onClose`, `onConfirm`, `title`, `message`, `confirmText`, `cancelText`, `variant`, `loading`.

### 6. `LoadingSpinner`
- **Location**: `frontend/src/components/common/LoadingSpinner.jsx`
- **Purpose**: Animated spinner with status label for async data retrieval states.
- **Props**: `text`, `size`.

### 7. `EmptyState`
- **Location**: `frontend/src/components/common/EmptyState.jsx`
- **Purpose**: Informative placeholder when lists or registers return zero matches.
- **Props**: `icon`, `title`, `description`, `actionLabel`, `onAction`.

### 8. `Sidebar`
- **Location**: `frontend/src/components/layout/Sidebar.jsx`
- **Purpose**: Grouped ERP navigation with role-based visibility filtering and responsive drawer on mobile.

### 9. `Header`
- **Location**: `frontend/src/components/layout/Header.jsx`
- **Purpose**: Application header with global search, notification dropdown feed, profile info, and logout.
