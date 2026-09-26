# Browser Extension Standards

## 1. Overview
Applies to extensions built for Chrome, Firefox, Safari, and Edge.

## 2. Core Architectural Constraints
- **Manifest V3**: All modern extensions must conform to Manifest V3.
- **Service Worker Lifecycle**: Background scripts run as ephemeral service workers. Never rely on persistent global in-memory state; store data in `chrome.storage.local`.
- **Content Scripts**: Isolated world execution. Use message passing (`chrome.runtime.sendMessage`) to communicate between content scripts and background workers.
- **Permissions**: Request minimal required permissions. Avoid broad `*://*/*` host permissions unless essential.

## 3. Sub-Platform References
- See `chrome/GUIDE.md` for Chrome Web Store policies and MV3 service worker limits.
- See `firefox/GUIDE.md` for Gecko compatibility and event page variations.
