# Google Authentication with Age Verification - Integration Guide

## Overview

This guide explains how to integrate the Google sign-in button with age verification in your authentication flow.

## Components

### GoogleSignInButton

A reusable component that handles Google OAuth sign-in with proper error handling and loading states.

**Props:**
- `onError?: (error) => void` - Callback for handling authentication errors
- `onSuccess?: (user: User) => void` - Callback when sign-in succeeds (use for age verification)
- `disabled?: boolean` - Disable the button

**Features:**
- 48px minimum height (accessibility)
- White background with Google logo
- Loading state with spinner
- Error handling with user-friendly messages
- Touch-optimized for mobile

## Integration Example

### Basic Usage (No Age Verification)

```tsx
import GoogleSignInButton from "~/components/auth/GoogleSignInButton";

export default function Login() {
  const [error, setError] = createSignal(null);

  return (
    <GoogleSignInButton
      onError={(err) => setError(err)}
    />
  );
}
```

### With Age Verification Flow

```tsx
import { createSignal } from "solid-js";
import GoogleSignInButton from "~/components/auth/GoogleSignInButton";
import AgeVerification from "~/components/auth/AgeVerification";
import { verifyGoogleUserAge } from "~/lib/auth/googleAgeVerification";
import type { User } from "firebase/auth";

export default function Login() {
  const [error, setError] = createSignal(null);
  const [showAgeVerification, setShowAgeVerification] = createSignal(false);
  const [currentUser, setCurrentUser] = createSignal<User | null>(null);

  const handleGoogleSuccess = (user: User) => {
    // After successful Google sign-in, show age verification
    setCurrentUser(user);
    setShowAgeVerification(true);
  };

  const handleAgeVerified = async (birthdate: Date) => {
    try {
      // Verify age server-side
      await verifyGoogleUserAge(birthdate);
      
      // Age verified successfully, user can proceed
      // The auth context will handle the redirect
    } catch (err) {
      setError({
        code: 'age-verification-failed',
        message: 'Age verification failed',
        userFriendly: 'You must be 21 or older to use this app'
      });
      
      // User will be automatically signed out and blocked by the server
    }
  };

  return (
    <Show when={!showAgeVerification()} fallback={
      <AgeVerification
        onVerified={handleAgeVerified}
        onError={(err) => setError(err)}
      />
    }>
      <GoogleSignInButton
        onSuccess={handleGoogleSuccess}
        onError={(err) => setError(err)}
      />
    </Show>
  );
}
```

## Age Verification Flow

### Client-Side Flow (Recommended)

1. User clicks "Sign in with Google"
2. Google OAuth popup opens
3. User authenticates with Google
4. `onSuccess` callback is triggered with the authenticated user
5. Show age verification component (birthdate picker)
6. User enters birthdate
7. Call `verifyGoogleUserAge(birthdate)` to verify server-side
8. If eligible (21+):
   - Birthdate is stored in Firestore
   - User proceeds to app
9. If underage (<21):
   - User account is deleted
   - User is added to blockedUsers collection
   - Error is shown to user

### Server-Side Verification (Cloud Functions)

The `checkAgeEligibility` Cloud Function handles:
- Age calculation (must be 21+)
- Storing birthdate in user profile
- Blocking underage users
- Deleting underage user accounts

**Security Benefits:**
- Age verification cannot be bypassed by client-side manipulation
- Underage users are permanently blocked
- Birthdate is validated server-side

## Google Birthday Scope (Optional)

To automatically extract birthdate from Google profile:

1. The birthday scope is already requested in `src/lib/auth.tsx`:
```typescript
provider.addScope('https://www.googleapis.com/auth/user.birthday.read');
```

2. To extract the birthday, you need to:
   - Get the OAuth access token (not just ID token)
   - Call Google People API
   - Parse the birthday response

**Note:** This is complex and may not always work (users can deny the scope). The recommended approach is to ask users for their birthdate during onboarding.

## Error Handling

The component handles these error codes:

- `auth/popup-closed-by-user` - User closed the popup
- `auth/popup-blocked` - Browser blocked the popup
- `auth/network-request-failed` - Network error
- `auth/internal-error` - Firebase internal error
- `auth/cancelled-popup-request` - Sign-in cancelled
- `auth/account-exists-with-different-credential` - Email already in use

All errors are mapped to user-friendly messages.

## Styling

The button follows the design system:
- White background (`bg-white`)
- Gray text (`text-gray-900`)
- 48px minimum height
- Rounded corners (`rounded-lg`)
- Hover and active states
- Focus ring for accessibility
- Touch-optimized (`touch-manipulation`)

## Accessibility

- Proper ARIA label (`aria-label="Sign in with Google"`)
- Keyboard accessible
- Focus indicators
- Screen reader compatible
- Minimum 48px touch target

## Firebase Configuration

Ensure Firebase Functions are deployed:

```bash
cd functions
npm install
npm run build
npm run deploy
```

## Testing

### Local Testing with Emulators

```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal, start your app
npm run dev
```

### Manual Testing Checklist

- [ ] Google sign-in popup opens
- [ ] User can authenticate with Google
- [ ] Age verification component shows after sign-in
- [ ] Valid birthdate (21+) allows user to proceed
- [ ] Invalid birthdate (<21) blocks user and shows error
- [ ] Blocked user cannot sign in again
- [ ] Error messages are user-friendly
- [ ] Loading states work correctly
- [ ] Button is keyboard accessible

## Troubleshooting

### Popup Blocked
- Ensure popups are allowed for your domain
- Test in different browsers

### Birthday Scope Not Working
- Use client-side age verification instead
- Ask users for birthdate during onboarding

### Cloud Function Errors
- Check Firebase Console logs
- Ensure functions are deployed
- Verify Firestore rules allow function writes

### Age Verification Fails
- Check that birthdate is in correct format (ISO string)
- Verify Cloud Function is deployed
- Check Firebase Console for function logs

## Security Considerations

1. **Server-Side Verification**: Age is always verified server-side to prevent tampering
2. **Blocked Users**: Underage users are stored in `blockedUsers` collection
3. **Account Deletion**: Underage accounts are immediately deleted
4. **Firestore Rules**: Client cannot read or modify `blockedUsers` collection
5. **No Client-Side Bypass**: All age checks happen on the server

## Future Enhancements

1. **Google People API Integration**: Automatically extract birthdate from Google profile
2. **Email Verification**: Require email verification before age verification
3. **ID Verification**: Add optional ID verification for enhanced trust
4. **Appeal Process**: Allow users to appeal age verification failures
