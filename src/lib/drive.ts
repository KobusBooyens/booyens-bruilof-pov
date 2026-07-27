import { google, type drive_v3 } from "googleapis";
import { Readable } from "node:stream";
import { cleanName } from "./utils";

/**
 * Google Drive is the single source of truth — there is no database.
 *
 *   ROOT_FOLDER (shared "Anyone with the link: Viewer")
 *     ├── "Jan Botha"      ← one sub-folder per guest = one album
 *     │     ├── foto1.jpg
 *     │     └── foto2.jpg
 *     └── "Marie Steyn"
 *           └── ...
 *
 * A guest's album *is* their Drive sub-folder. The folder id is the album id.
 * Everyone can view every album (read-only) because listing/serving happens
 * through this server code; guests never receive Drive edit access.
 */

const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID ?? "";

const FOLDER_MIME = "application/vnd.google-apps.folder";

// Shared options so the code also works with a Google Shared Drive if the
// couple ever needs more than the 15 GB service-account quota.
const SHARED = {
  supportsAllDrives: true,
  includeItemsFromAllDrives: true,
} as const;

let cached: drive_v3.Drive | null = null;

function getDrive(): drive_v3.Drive {
  if (cached) return cached;
  // OAuth as a real Google user: uploaded files are owned by that user and
  // count against their 15 GB. (A service account has no storage of its own,
  // so it can't own files in a personal "My Drive" — only a Shared Drive.)
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken || !ROOT_FOLDER_ID) {
    throw new Error(
      "Google Drive is not configured. Check GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN and GOOGLE_DRIVE_ROOT_FOLDER_ID."
    );
  }
  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });
  cached = google.drive({ version: "v3", auth });
  return cached;
}

/** Escape a value for use inside a Drive query string. */
function esc(value: string): string {
  return value.replace(/['\\]/g, "\\$&");
}

/** Public thumbnail URL for a file that lives in an "anyone with link" folder.
 *  Works for both images and videos (videos return a poster frame). */
export function thumbUrl(fileId: string, size = 800): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

/** Embeddable player URL for a video in an "anyone with link" folder. */
export function previewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

// Match both images and videos when listing a folder's contents.
const MEDIA_QUERY = "(mimeType contains 'image/' or mimeType contains 'video/')";

export type MediaKind = "image" | "video";

export type Album = {
  id: string;
  name: string;
  cover: string | null;
  count: number;
};

export type Photo = {
  id: string;
  name: string;
  kind: MediaKind;
  thumb: string;
  /** Large image URL (images) — also used as the video poster. */
  full: string;
  /** Embeddable player URL (videos only). */
  embed?: string;
  width?: number;
  height?: number;
};

/** List every guest album under the root folder, newest first. */
export async function listAlbums(): Promise<Album[]> {
  const drive = getDrive();
  const res = await drive.files.list({
    q: `'${ROOT_FOLDER_ID}' in parents and mimeType = '${FOLDER_MIME}' and trashed = false`,
    fields: "files(id, name)",
    orderBy: "createdTime desc",
    pageSize: 500,
    ...SHARED,
  });

  const folders = res.data.files ?? [];

  const albums = await Promise.all(
    folders.map(async (folder): Promise<Album> => {
      const photos = await drive.files.list({
        q: `'${folder.id}' in parents and ${MEDIA_QUERY} and trashed = false`,
        fields: "files(id)",
        orderBy: "createdTime desc",
        pageSize: 1000,
        ...SHARED,
      });
      const files = photos.data.files ?? [];
      return {
        id: folder.id!,
        name: folder.name ?? "Album",
        cover: files[0]?.id ? thumbUrl(files[0].id!, 700) : null,
        count: files.length,
      };
    })
  );

  // Show albums that actually have photos first; keep the rest for completeness.
  return albums.sort((a, b) => b.count - a.count);
}

/** Everything inside one album (folder). */
export async function getAlbum(
  folderId: string
): Promise<{ name: string; photos: Photo[] } | null> {
  const drive = getDrive();

  let name = "Album";
  try {
    const meta = await drive.files.get({
      fileId: folderId,
      fields: "id, name",
      ...SHARED,
    });
    name = meta.data.name ?? "Album";
  } catch {
    return null; // folder id doesn't exist / not accessible
  }

  const res = await drive.files.list({
    q: `'${folderId}' in parents and ${MEDIA_QUERY} and trashed = false`,
    fields:
      "files(id, name, mimeType, imageMediaMetadata(width, height), videoMediaMetadata(width, height))",
    orderBy: "createdTime desc",
    pageSize: 1000,
    ...SHARED,
  });

  const photos: Photo[] = (res.data.files ?? []).map((f) => {
    const kind: MediaKind = (f.mimeType ?? "").startsWith("video/")
      ? "video"
      : "image";
    const meta = kind === "video" ? f.videoMediaMetadata : f.imageMediaMetadata;
    return {
      id: f.id!,
      name: f.name ?? "foto",
      kind,
      thumb: thumbUrl(f.id!, 900),
      full: thumbUrl(f.id!, 1600),
      embed: kind === "video" ? previewUrl(f.id!) : undefined,
      width: meta?.width ? Number(meta.width) : undefined,
      height: meta?.height ? Number(meta.height) : undefined,
    };
  });

  return { name, photos };
}

/** Find an existing guest album by name, or create one. Returns the folder id. */
export async function findOrCreateAlbum(rawName: string): Promise<string> {
  const drive = getDrive();
  const name = cleanName(rawName);
  if (!name) throw new Error("Name is missing.");

  const existing = await drive.files.list({
    q: `'${ROOT_FOLDER_ID}' in parents and mimeType = '${FOLDER_MIME}' and name = '${esc(
      name
    )}' and trashed = false`,
    fields: "files(id)",
    pageSize: 1,
    ...SHARED,
  });

  const found = existing.data.files?.[0]?.id;
  if (found) return found;

  const created = await drive.files.create({
    requestBody: { name, mimeType: FOLDER_MIME, parents: [ROOT_FOLDER_ID] },
    fields: "id",
    ...SHARED,
  });
  return created.data.id!;
}

/** Upload one image into an album folder. Returns the new file id. */
export async function uploadImage(
  folderId: string,
  filename: string,
  mimeType: string,
  buffer: Buffer
): Promise<string> {
  const drive = getDrive();
  const res = await drive.files.create({
    requestBody: { name: filename, parents: [folderId] },
    media: { mimeType: mimeType || "image/jpeg", body: Readable.from(buffer) },
    fields: "id",
    ...SHARED,
  });
  return res.data.id!;
}
