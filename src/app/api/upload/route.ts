import { NextRequest, NextResponse } from "next/server";
import { findOrCreateAlbum, uploadImage } from "@/lib/drive";
import { cleanName } from "@/lib/utils";

// googleapis needs the Node.js runtime (not Edge).
export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const name = cleanName(String(form.get("name") ?? ""));
    const file = form.get("file");
    const folderIdHint = form.get("folderId");

    if (!name) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Only photos and videos are supported." },
        { status: 415 }
      );
    }

    // Reuse the folder id from the first upload if the client sent it — saves a
    // lookup on every subsequent file in the batch.
    const folderId =
      typeof folderIdHint === "string" && folderIdHint
        ? folderIdHint
        : await findOrCreateAlbum(name);

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = await uploadImage(folderId, file.name || "foto.jpg", file.type, buffer);

    return NextResponse.json({ ok: true, folderId, fileId });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json(explainDriveError(err), { status: 500 });
  }
}

/**
 * Turn a Google Drive API failure into an honest, actionable message. The two
 * failure modes we see with a service account are (a) it can read the folder
 * but was never granted *edit* access, and (b) the folder lives in a normal
 * "My Drive", where a service account has **zero** storage quota of its own —
 * both surface only on writes, which is exactly what "read works, upload fails"
 * looks like. `detail` carries the raw reason so it's visible while developing.
 */
function explainDriveError(err: unknown): { error: string; detail?: string } {
  const anyErr = err as {
    errors?: Array<{ reason?: string; message?: string }>;
    response?: { data?: { error?: { message?: string; errors?: Array<{ reason?: string }> } } };
    message?: string;
  };
  const reason =
    anyErr?.errors?.[0]?.reason ??
    anyErr?.response?.data?.error?.errors?.[0]?.reason ??
    "";
  const detail =
    anyErr?.response?.data?.error?.message ?? anyErr?.message ?? String(err);

  if (reason === "storageQuotaExceeded") {
    return {
      error:
        "The connected Google Drive is out of storage space. Free up space or upgrade the account's storage, then try again.",
      detail,
    };
  }
  if (
    reason === "insufficientFilePermissions" ||
    /permission/i.test(detail)
  ) {
    return {
      error:
        "The service account can see the folder but cannot write to it. Share the root folder as an Editor with the service account's email.",
      detail,
    };
  }
  return {
    error: "Something went wrong with the upload. Please try again.",
    detail,
  };
}
