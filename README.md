# Kobus & Simoné · Troue Foto's 📸

A wedding photo-sharing app (like POV / Dot Memories). Guests upload photos from
their phones, everything lands in a **Google Drive** folder, and everyone can
browse everyone else's albums — all **without a database**. Drive is the single
source of truth.

- **No guest logins.** Guests just type their name and upload.
- **One album per guest** = one Drive sub-folder (the folder name is the guest's name).
- **Read-only for everyone.** Guests view through the site; they never get Drive edit access.
- **Two kinds of QR code:** one for the whole site (print it for the tables), and a
  personal one each guest receives after their first upload to reopen their album.
- Matches the invite's earthy / sage aesthetic, in Afrikaans.

---

## Tech

Next.js 14 (App Router) · TypeScript · Tailwind · Google Drive API · `qrcode.react`
· `browser-image-compression`.

---

## 1. Requirements

- [Node.js 18.17+](https://nodejs.org)
- A Google account (the couple's — this is where photos live)
- A free [Vercel](https://vercel.com) account for hosting

---

## 2. Create a Google service account

The app talks to Drive as a "service account" (a robot Google account). Its login
never expires, so once set up you can leave it running for months.

1. Go to the [Google Cloud Console](https://console.cloud.google.com) and create a
   new project (e.g. `troue-fotos`).
2. Enable the Drive API: **APIs & Services → Library → search "Google Drive API" → Enable**.
3. Create the account: **APIs & Services → Credentials → Create Credentials →
   Service account**. Give it a name, click through, and Done.
4. Open the new service account → **Keys → Add Key → Create new key → JSON**. A
   `.json` file downloads. Keep it safe — treat it like a password.

From that JSON file you'll need two values:
- `client_email`  → goes in `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key`   → goes in `GOOGLE_PRIVATE_KEY`

---

## 3. Create & share the Drive folder

1. In [Google Drive](https://drive.google.com), create a folder, e.g. **"Troue Foto's"**.
2. **Share it so photos display publicly:** right-click → Share → under *General
   access* choose **Anyone with the link → Viewer**.
3. **Share it with the robot so it can upload:** in the same Share dialog, add the
   service account's `client_email` and give it **Editor**.
4. Open the folder and copy its ID from the address bar:
   `https://drive.google.com/drive/folders/`**`THIS_IS_THE_ID`**
   → goes in `GOOGLE_DRIVE_ROOT_FOLDER_ID`.

That's it — sub-folders (albums) and photos created inside automatically inherit
the "anyone with link" viewing, so thumbnails load on the site.

---

## 4. Configure environment variables

Copy the example file and fill in your three values:

```bash
cp .env.local.example .env.local
```

See `.env.local.example` for the exact format. The private key must stay on one
line with `\n` where the line breaks are, wrapped in double quotes.

---

## 5. Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

- `/`         → landing page
- `/upload`   → guest upload flow
- `/gallery`  → all albums
- `/qr`       → the printable site QR code (for you, the couple)

---

## 6. Deploy to Vercel

1. Push this folder to a GitHub repo.
2. On [Vercel](https://vercel.com), **New Project → import the repo**.
3. Add the three environment variables under **Settings → Environment Variables**.
   For `GOOGLE_PRIVATE_KEY`, paste the value exactly as in `.env.local` (quotes and
   all). Deploy.
4. Your live URL is something like `https://troue-fotos.vercel.app`.

### Generate the QR codes

- **Site QR (for the tables):** visit `https://your-site.vercel.app/qr` and click
  **Laai QR-kode af**. Print it, put it on table cards / signage.
- **Per-guest QR:** each guest automatically gets theirs on-screen right after
  their first upload, with a download button. It links straight to their album.

---

## How it stays a "read-only, no-database" app

- **No database:** the Drive folder tree *is* the data. Listing sub-folders =
  listing guests; listing images in a folder = that guest's photos.
- **Read-only:** all viewing happens server-side through the service account. The
  app exposes no delete or edit endpoint, and guests never receive Drive
  permissions, so no one can change or remove another guest's photos through the site.
- **Performance:** photos are compressed in the browser before upload (fast, small),
  and the grid uses Google's own resized thumbnail URLs (served from Google's CDN,
  lazy-loaded).

---

## Good to know / limits

- **Storage quota:** a service account has ~15 GB. With in-browser compression a
  wedding's worth of photos fits comfortably. If you expect *huge* volume or want
  to store **video**, create the folder inside a **Google Shared Drive** (needs
  Google Workspace) and use its folder ID instead — the code already supports it
  (`supportsAllDrives`).
- **Videos** aren't handled by the compression step (photos only). Keep it to images.
- **Upload size:** hosting platforms cap request bodies (~4.5 MB on Vercel's free
  tier). Compression keeps photos well under that; it uploads one photo per request.
- **Duplicate names:** two guests named exactly the same share one album. If that
  matters, ask guests to add a surname.

---

## Customising

- **Colours / fonts:** `tailwind.config.ts` (palette) and `src/app/layout.tsx` (fonts).
- **Wording:** all Afrikaans copy lives in the page/component files under `src/`.
- **The mountain-contour motif:** `src/components/Contours.tsx`.
