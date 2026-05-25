# Notification Component Usage

## Components Created

### 1. `Notification.tsx`
Single notification bar component with:
- **Photo**: Optional 48x48px rounded image
- **Title**: Max 70 characters (auto-truncated with "...")
- **Body**: Max 100 characters (auto-truncated with "...")
- **Close button**: Optional X button
- **Click handler**: Optional onClick for the whole notification

### 2. `NotificationContainer.tsx`
Container for managing multiple notifications:
- Fixed positioning at top of screen
- Centers notifications (max-width matching nav)
- Stacks multiple notifications vertically
- Handles dismissal

## Basic Usage

### Single Notification
```tsx
import Notification from "~/components/Notification";

<Notification
  photo="https://example.com/photo.jpg"
  title="New Message"
  body="You have a new message from John"
  onClick={() => console.log("Notification clicked")}
  onClose={() => console.log("Notification closed")}
/>
```

### Multiple Notifications with Container
```tsx
import { createSignal } from "solid-js";
import NotificationContainer from "~/components/NotificationContainer";

function MyApp() {
  const [notifications, setNotifications] = createSignal([
    {
      id: "1",
      photo: "https://example.com/user1.jpg",
      title: "Sarah viewed your profile",
      body: "Sarah just checked out your profile. Say hi!",
      timestamp: Date.now(),
      onClick: () => navigate("/profile/sarah")
    },
    {
      id: "2",
      photo: "https://example.com/user2.jpg",
      title: "New match!",
      body: "You and Alex are now connected",
      timestamp: Date.now(),
      onClick: () => navigate("/matches")
    }
  ]);

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      <NotificationContainer
        notifications={notifications()}
        onDismiss={handleDismiss}
      />
      {/* Your app content */}
    </>
  );
}
```

## Props

### Notification Props
```typescript
interface NotificationProps {
  photo?: string;           // Optional image URL
  title: string;            // Title (max 70 chars)
  body: string;             // Body text (max 100 chars)
  onClick?: () => void;     // Click handler
  onClose?: () => void;     // Close button handler
}
```

### NotificationContainer Props
```typescript
interface NotificationItem extends NotificationProps {
  id: string;               // Unique identifier
  timestamp: number;        // When notification was created
}

interface NotificationContainerProps {
  notifications: NotificationItem[];
  onDismiss?: (id: string) => void;
}
```

## Styling
- **Width**: Matches nav width (max-w-md)
- **Colors**: White bg in light mode, gray-800 in dark mode
- **Animation**: Slides in from top with fade
- **Shadow**: Elevated with border
- **Positioning**: Fixed at top-20 (below header)

## Features
- ✅ Auto-truncation of long text
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Click anywhere to trigger action
- ✅ Close button (X) in top right
- ✅ Photo with purple border accent
- ✅ Smooth animations
- ✅ Stacks multiple notifications
