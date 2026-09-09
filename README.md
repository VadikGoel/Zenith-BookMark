# Zenith

Zenith is a local-first personal knowledge workspace starting with bookmarks and designed to grow into notes, pages, whiteboards, collections, and portable sharing.

## Current architecture

- React + Vite frontend
- IndexedDB local vault for offline-first data
- Google OAuth + Drive `appDataFolder` for each user's private cloud storage
- No Zenith-owned database required for the personal data path
- Self-contained compressed share links for small structured documents
- GitHub Actions build verification

### Storage model

```text
React UI
   ↓
Zenith data layer
   ├── IndexedDB (local)
   └── Google Drive appDataFolder (private cloud)
```

The Drive integration requests the narrow `drive.appdata` scope. Zenith stores its application data in the user's hidden application-data area rather than accessing the user's normal Drive files.

### Portable sharing

A shared bookmark is serialized, gzip-compressed when supported, and encoded into a URL-safe payload:

```text
https://<zenith-host>/s/z1.<payload>
```

The recipient can view the document without Zenith storing a server-side copy and can import it into their own Zenith vault.

## Development

```bash
npm install
npm run dev
npm run build
```

## Google setup

The current OAuth client ID is the original Zenith web client. Before public deployment, configure the Google OAuth consent screen and add every production origin to the OAuth web client's authorized JavaScript origins. The Drive API must also be enabled.

For a public release, review Google's OAuth verification requirements and keep the requested scopes minimal.

## Roadmap

1. Bookmark collections, tags, folders and richer metadata
2. Notion-style pages and block editor
3. Infinite whiteboard / canvas
4. Portable page and whiteboard share links
5. Browser extension
6. PWA and mobile app shell
7. Optional cloud collaboration layer if real-time editing is needed
8. Optional AI features
