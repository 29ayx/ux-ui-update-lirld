# Lirld - Social Dating & Networking Platform

## Overview

**Lirld** is a modern social dating and networking web application built with SolidJS and Firebase. The platform enables users to discover, connect, and interact with others through profiles, real-time messaging, video/voice calls, and a unique host-based speed dating system.

---

## Core Purpose

Lirld serves as a comprehensive social discovery platform where users can:
- Browse and discover other users based on various filters
- Connect through real-time chat and calls
- Engage with premium "host" users for paid interactions
- Track profile views and interactions
- Purchase coins for premium features

---

## Key Features

### 🔍 **User Discovery System**

The homepage provides multiple discovery modes through tabbed navigation:

- **Discover Tab**: Main discovery feed featuring VIP users, online users, recently active users, and available users
- **Nearby Tab**: Location-based discovery showing users grouped by country
- **Speed Date Tab**: Specialized section for connecting with "host" users who offer paid interactions
- **Online Tab**: Real-time view of currently active users
- **Explore Tab**: Advanced filtering by age range and gender preferences

**Important**: The system automatically filters out users you've already chatted with to keep discovery fresh.

### 💬 **Real-Time Messaging**

Full-featured chat system with:
- Real-time message delivery and read receipts
- Unread message counters
- Chat deletion with confirmation
- Message persistence in Firebase
- Photo sharing in conversations
- Swipe-to-delete actions on chat items
- Long-tap options for chat management

### 📞 **Voice & Video Calls**

Integrated calling functionality:
- Call logs tracking all incoming/outgoing calls
- Call history with timestamps
- Swipe actions on call logs (delete, show popup)
- Long-tap interactions for call entries

### 👤 **User Profiles**

Comprehensive profile system featuring:
- Multi-photo galleries (up to 4 photos)
- Age and gender display with icons
- Bio and personal information
- Country/location data
- VIP status indicators
- Online/offline status tracking
- Birthday card visibility controls

**Profile Tracking**:
- Track who viewed your profile
- See profiles you've viewed
- View counts and timestamps for all interactions

### 🔔 **Notifications System**

Three-tab notification center:
- **All Tab**: Combined feed of incoming and outgoing profile views with distinct visual indicators
- **Viewers Tab**: Users who viewed your profile (with unread count badges)
- **Viewed Accounts Tab**: Profiles you've visited

Features visual differentiation with:
- Purple theme for incoming views (people who viewed you)
- Blue theme for outgoing views (profiles you viewed)
- Distinct icons (eye icon vs compass icon)
- Timestamp tracking with "time ago" formatting

### 💰 **Monetization & Credits**

**Coin System**:
- Users purchase coins through various plans
- Coins used for premium features and host interactions
- Transaction history tracking

**Plans Page**:
- Multiple pricing tiers
- One-time purchase options
- Instant credit delivery
- Admin-configurable plans

### 🎯 **Host System**

Unique "Speed Date" feature:
- Special users designated as "hosts"
- Hosts set price-per-minute rates
- Users can book time with hosts
- Online/offline status for hosts
- Separate filtering for host users

### 👑 **VIP Features**

Premium user designation:
- VIP badge display on profiles
- Priority placement in discovery feeds
- Enhanced visibility

### 🎨 **Marketing & Promotions**

Dynamic banner system:
- Firebase-powered marketing banners
- Multiple banner types (home, promotions, plans)
- Admin-configurable content
- Strategic placement across pages

### 🛡️ **Admin Dashboard**

Comprehensive admin panel for platform management:

**User Management**:
- View all users with detailed information
- Edit user profiles and settings
- Force online status for demo/testing
- Hide users from discovery
- Manage VIP status
- Create demo accounts with AI capabilities

**Host Management**:
- Designate users as hosts
- Set pricing for host services
- Manage host availability

**Plans Management**:
- Create, edit, and delete pricing plans
- Set coin amounts and prices
- Configure plan visibility

**Marketing Management**:
- Create and edit marketing banners
- Configure banner content and placement
- Manage promotional campaigns

**Analytics Overview**:
- User statistics and metrics
- Platform activity monitoring

### 🔐 **Authentication & Security**

- Google OAuth integration
- Firebase Authentication
- Profile completion requirements
- Secure Firestore rules
- Permission-based access control

### 🌍 **Filtering & Preferences**

Advanced filtering options:
- Gender filtering (Male, Female, All)
- Age range filtering
- Country/location filtering
- Online status filtering
- Exclude chatted users automatically

### 📱 **User Experience Features**

**Design**:
- Dark mode support throughout
- Responsive design for all screen sizes
- Modern glassmorphism effects
- Smooth animations and transitions
- Pull-to-refresh functionality

**Performance**:
- Infinite scroll for user feeds
- Real-time updates via Firebase listeners
- Optimized photo caching
- Lazy loading for better performance

**Interactions**:
- Swipe gestures for actions
- Long-tap menus
- Confirmation modals for destructive actions
- Toast notifications for feedback

---

## Technical Stack

- **Frontend**: SolidJS with TypeScript
- **Styling**: TailwindCSS v4
- **Backend**: Firebase (Firestore, Authentication, Functions)
- **Build Tool**: Vinxi
- **Runtime**: Bun
- **Routing**: @solidjs/router
- **Icons**: solid-icons, react-icons
- **Image Processing**: browser-image-compression, compressorjs

---

## User Flow

1. **Sign Up/Login**: Users authenticate via Google
2. **Profile Setup**: Complete profile with photos, bio, age, gender, location
3. **Discovery**: Browse users through various tabs and filters
4. **Connect**: Send messages to interesting profiles
5. **Chat**: Real-time conversations with matched users
6. **Calls**: Voice/video calls with connections
7. **Notifications**: Track profile views and interactions
8. **Premium**: Purchase coins for enhanced features and host interactions

---

## Key Differentiators

- **Smart Filtering**: Automatically hides users you've already chatted with
- **Dual Notification System**: Track both who viewed you AND who you viewed
- **Host/Speed Date System**: Unique monetization through paid host interactions
- **Real-time Everything**: Live updates for messages, online status, and notifications
- **Comprehensive Admin Tools**: Full platform control for administrators
- **Coin Economy**: Flexible monetization with purchasable credits

---

## Platform Status

The application is actively developed with features for:
- Social discovery and dating
- Real-time communication
- Monetization through hosts and premium features
- Admin management and analytics
- Marketing and promotional campaigns
