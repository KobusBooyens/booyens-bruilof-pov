# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A wedding photo/video-sharing app for Kobus & Simoné. Guests open the app (via a printed QR), type a name, and upload photos/videos from their phones. **There is no database** — a Google Drive folder tree is the single source of truth:

```
ROOT_FOLDER
  ├── "Jan Botha"      ← one sub-folder per guest = one album (folder name = album name)
  │     ├── foto1.jpg
  │     └── clip.mp4
  └── "Marie Steyn"
```

Listing sub-folders = listing albums; listing media in a folder = that album's contents. The folder id is the album id (used directly in `/album/[folderId]` URLs). Guests never get Drive permissions; all reads/writes go through server code.

## Commands

```bash
npm run dev      # dev server (tries :3000, falls back to next free port if taken)
npm run build    # production build
npm run start    # serve the production build
npm run lint     # next lint
npm run token    # one-time: obtain a Google OAuth refresh token (see below)
npx tsc --noEmit # type-check (use this to verify changes — there is no test suite)
```

There is **no test framework** configured. Verify changes with `npx tsc --noEmit` and, when behavior matters, by driving the running app.

## Architecture

**`src/lib/drive.ts` is the only Drive access layer.** Everything that touches Google Drive goes through its exported functions (`listAlbums`, `getAlbum`, `findOrCreateAlbum`, `uploadImage`). `getDrive()` builds a cached authenticated client.

- **Auth is OAuth as a real Google user** (client id/secret + long-lived refresh token). A service account was used originally but abandoned: service accounts have zero storage quota and can't own files in a personal "My Drive", and the couple is on a free Gmail (no Shared Drives). The `README.md` still documents the old service-account setup and claims video is unsupported — **it is stale; trust the code**.
- `MEDIA_QUERY` matches both `image/` and `video/` mime types — reuse it for any new folder-listing query so videos are never dropped.
- Media URLs: `thumbUrl(id, size)` → `drive.google.com/thumbnail` (works for image and video poster); `previewUrl(id)` → the Drive `/preview` iframe player for videos. `Photo.kind` is `"image" | "video"`.

**Pages that read Drive must be `export const dynamic = "force-dynamic"`** (home, gallery, album) so a fresh upload shows immediately and per-request cookies work. `/api/upload` sets `runtime = "nodejs"` because `googleapis` needs Node (not Edge).

**Upload flow** (`src/components/UploadFlow.tsx` → `POST /api/upload`): images are compressed in the browser with `browser-image-compression` (→ JPEG); videos upload as-is. One file per request. `/api/upload` reuses the folder id from the first upload in a batch to avoid re-looking it up. `explainDriveError()` in the route maps Google API failure reasons (`storageQuotaExceeded`, `insufficientFilePermissions`) to actionable messages and returns a `detail` field with the raw error.

**Admin (`/admin`)** — the QR that guests scan to open the app lives here, behind a gate. `src/lib/admin.ts` validates `ADMIN_USERNAME`/`ADMIN_PASSWORD` (constant-time compare) and issues an httpOnly cookie whose value is an HMAC of the username keyed by the password (the password is never stored/derivable). `admin/page.tsx` calls `isAdmin()` server-side and renders `AdminGate` (login / "continue as guest") or `AdminDashboard`. Login/logout are `/api/admin/{login,logout}`. Per-album QR codes are intentionally deferred.

**Two QR kinds:** the site-wide guest-access QR (in `/admin`, and the older public `/qr` page) and a per-guest album QR shown right after a guest's first upload. Both use `src/components/QRCard.tsx`.

## Conventions & gotchas

- **Drive-served `<img>` must set `referrerPolicy="no-referrer"`.** Google's image CDN returns an HTML error (browser blocks it via ORB → `ERR_BLOCKED_BY_ORB`) when a referrer is sent, causing intermittent broken images. This applies to every `<img>` pointing at `drive.google.com`/`lh3.googleusercontent.com` (album grid, lightbox, gallery covers). Local upload previews use `blob:` URLs and are exempt.
- **Language split:** user-facing UI copy is **Afrikaans**; error messages and API responses are **English** (a deliberate choice). Match this when adding strings.
- **Mobile-native:** `layout.tsx` sets `viewport-fit=cover`; `globals.css` handles safe-area insets and `overflow-x: hidden`; full-height layouts use `100dvh`. Hero/section entrances use the `animate-rise` keyframe (staggered via inline `animationDelay`) and respect `prefers-reduced-motion`.
- **Vercel request-body limit (~4.5 MB)** caps single-request uploads in production. Image compression keeps photos under it; **large videos will fail once deployed** (they work in `next dev`, which has no such limit). Direct-to-Drive/resumable upload would be needed for big videos.

## Environment

Required in `.env.local` (see `.env.local.example`):

```
GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET / GOOGLE_OAUTH_REFRESH_TOKEN
GOOGLE_DRIVE_ROOT_FOLDER_ID   # shared "Anyone with the link: Viewer" so public thumbnails load
ADMIN_USERNAME / ADMIN_PASSWORD
```

Getting the refresh token: create an OAuth **Desktop app** client in Google Cloud Console with the Drive API enabled, put the client id/secret in `.env.local`, run `npm run token`, approve in the browser, paste the printed token as `GOOGLE_OAUTH_REFRESH_TOKEN`. The consent screen must be in **Testing** mode with the Gmail added as a **test user** (the `drive` scope is restricted, so production would require Google verification). The same env vars must be set in Vercel for deploys.
