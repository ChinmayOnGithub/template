# Mobile Project Standards

## 1. Overview
Applies to iOS and Android applications built with cross-platform frameworks.

## 2. Core Architectural Constraints
- Offline-First: Mobile networks disconnect frequently. Cache persistent records locally (SQLite, WatermelonDB, MMKV).
- Touch Ergonomics: Minimum touch target size is 44x44px. Support safe-area insets on notched devices.
- Battery and Background Work: Minimize background location or poll intervals; use native push notifications.

## 3. Sub-Platform References
- See `react-native/GUIDE.md` for New Architecture, Fabric, and TurboModule conventions.
- See `flutter/GUIDE.md` for state management, widget trees, and platform channels.
