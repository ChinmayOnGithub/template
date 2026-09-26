# Chrome Extension Guidelines

- Target Manifest V3.
- Use `chrome.storage.local` with fallback to `chrome.storage.sync` for small user preferences (<100KB).
- Offscreen documents: Use for DOM-dependent tasks (audio playback, clipboard copy, canvas parsing) from service workers.
- CSP restrictions: No inline scripts or eval allowed in popup or background scripts.
