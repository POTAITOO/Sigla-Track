# Custom Alert & Toast System - Design Summary

## Overview
Created a comprehensive messaging system with customized UI/UX for 4 different message types: Success, Error, Warning, and Info.

---

## Design Approach

### 1. **Toast Messages** (Non-blocking, at top)
Used for quick feedback that doesn't require user interaction.

#### Success Toast ✓
- **Icon:** ✓ Circle Check
- **Color Scheme:** Green (#22c55e)
- **Background:** Light green (#f0fdf4)
- **Use Cases:** Habit completed, profile saved, habit created
- **Duration:** 3 seconds
- **Feel:** Positive, encouraging

#### Error Toast ✗
- **Icon:** ✗ Circle X Mark
- **Color Scheme:** Red (#ef4444)
- **Background:** Light red (#fef2f2)
- **Use Cases:** Failed operations, network errors
- **Duration:** 4 seconds (longer to read)
- **Feel:** Urgent, needs attention

#### Warning Toast ⚠️
- **Icon:** ⚠️ Triangle Exclamation
- **Color Scheme:** Amber/Orange (#f59e0b)
- **Background:** Light amber (#fffbeb)
- **Use Cases:** Habit deleted, data loss warnings
- **Duration:** 4 seconds
- **Feel:** Cautious, important

#### Info Toast ℹ️
- **Icon:** ℹ️ Circle Info
- **Color Scheme:** Blue (#3b82f6)
- **Background:** Light blue (#eff6ff)
- **Use Cases:** General information, feature tips
- **Duration:** 3 seconds
- **Feel:** Informative, neutral

---

### 2. **Custom Alert Modal** (Blocking, center screen)
Used for critical actions that need explicit user confirmation.

#### Design Features:
- **Left Border Accent:** 6px colored left border matching alert type
- **Icon + Title:** Large icon (32px) with bold title for quick recognition
- **Message:** Clear, readable explanation (15px, line height 22)
- **Buttons:** Right-aligned with style variants

#### Button Styles:
1. **Primary Button** (Default)
   - Background: Purple (#6366f1)
   - Text: White
   - Use: Confirmations, proceed actions

2. **Destructive Button**
   - Background: Light red (#fecaca)
   - Border: Red
   - Text: Dark red (#991b1b)
   - Use: Delete, dangerous operations

3. **Cancel Button**
   - Background: Light gray (#f3f4f6)
   - Border: Gray
   - Text: Gray
   - Use: Cancel, dismiss

---

## Visual Hierarchy

### Alert Color Scheme:
```
Success  → Green (#22c55e)   | Positive feedback
Error    → Red (#ef4444)     | Critical issues
Warning  → Amber (#f59e0b)   | Caution/destructive
Info     → Blue (#3b82f6)    | Neutral information
```

### Typography:
- **Titles:** 20px, Bold
- **Messages:** 15px, Regular
- **Buttons:** 15px, Semi-bold
- **Toast Text:** 14px, Semi-bold

---

## Files Created/Modified

### New Files:
1. **components/CustomAlert.tsx**
   - Custom alert modal component with 4 type variants
   - Icon support using FontAwesome6
   - Multiple button support with different styles

2. **services/alertService.ts**
   - Service methods for creating alerts
   - Helper functions for each alert type
   - Returns alert configuration object

### Modified Files:
1. **services/toastService.ts**
   - Added duration configuration (3-4 seconds)
   - Enhanced consistency across message types

2. **app/_layout.tsx**
   - Integrated CustomAlert component
   - Added alert state management
   - Updated success/error handlers to use custom alerts

---

## Usage Examples

### Toast (Quick Feedback):
```tsx
import { toastService } from '@/services/toastService';

// Success
toastService.success('Habit completed!');

// Error
toastService.error('Failed to save profile');

// Warning
toastService.warning('Habit deleted');

// Info
toastService.info('Data refreshed');
```

### Custom Alert (Confirmations):
```tsx
import CustomAlert from '@/components/CustomAlert';
import { useState } from 'react';

const [alert, setAlert] = useState({ visible: false, ... });

// In JSX:
<CustomAlert
  visible={alert.visible}
  type="warning"
  title="Delete Habit?"
  message="Are you sure? This action cannot be undone."
  onDismiss={() => setAlert({ ...alert, visible: false })}
  buttons={[
    { text: 'Cancel', style: 'cancel', onPress: () => {} },
    { text: 'Delete', style: 'destructive', onPress: handleDelete }
  ]}
/>
```

---

## Differentiation Summary

| Message Type | Icon | Color | Use Case | Duration | Blocking |
|---|---|---|---|---|---|
| **Success** | ✓ Check | Green | Confirmation, completed actions | 3s | No |
| **Error** | ✗ X Mark | Red | Failed operations, critical errors | 4s | No* |
| **Warning** | ⚠️ Alert | Amber | Destructive actions, caution | 4s | No |
| **Info** | ℹ️ Info | Blue | General information, tips | 3s | No |
| **Custom Alert** | Varies | Type-specific | Critical confirmations | Manual | Yes |

*Errors can be either toast or custom alert depending on severity

---

## Design Philosophy

1. **Clear Visual Distinction:** Each type has unique icon + color
2. **Appropriate Duration:** Shorter for positive feedback, longer for issues
3. **Hierarchy:** Toast for non-critical, Custom Alert for confirmations
4. **Accessibility:** Large icons, readable text, high contrast
5. **Consistency:** Unified color scheme across app
6. **User Experience:** Non-blocking toasts allow quick retry; blocking alerts for important decisions

