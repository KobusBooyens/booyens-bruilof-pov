/**
 * One-time helper to obtain a Google OAuth refresh token for this app.
 *
 * The wedding app uploads to Google Drive as a real user (so files count
 * against that user's 15 GB), which needs a long-lived refresh token.
 *
 * Usage:
 *   1. Create an OAuth client (type: "Desktop app") in Google Cloud Console
 *      and enable the Google Drive API for the project.
 *   2. Put the client id/secret in .env.local as GOOGLE_OAUTH_CLIENT_ID and
 *      GOOGLE_OAUTH_CLIENT_SECRET (or export them in your shell).
 *   3. Run:  node scripts/get-refresh-token.mjs
 *   4. Open the printed URL, sign in with the Gmail account that owns the
 *      Drive folder, and approve. The refresh token prints in the terminal.
 *   5. Paste it into .env.local as GOOGLE_OAUTH_REFRESH_TOKEN.
 */
import http from "node:http";
import { readFileSync } from "node:fs";
import { google } from "googleapis";

// Load client id/secret from the environment, falling back to .env.local so
// you don't have to export them by hand.
function fromEnvLocal(key) {
  if (process.env[key]) return process.env[key];
  try {
    const line = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
      .split("\n")
      .find((l) => l.trim().startsWith(`${key}=`));
    if (!line) return undefined;
    return line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
  } catch {
    return undefined;
  }
}

const CLIENT_ID = fromEnvLocal("GOOGLE_OAUTH_CLIENT_ID");
const CLIENT_SECRET = fromEnvLocal("GOOGLE_OAUTH_CLIENT_SECRET");
const PORT = 5555;
const REDIRECT = `http://localhost:${PORT}/oauth2callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Missing GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET.\n" +
      "Add them to .env.local (or export them) and run again."
  );
  process.exit(1);
}

const oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT);
const authUrl = oauth2.generateAuthUrl({
  access_type: "offline", // needed to receive a refresh token
  prompt: "consent", // force a refresh token even on re-consent
  scope: ["https://www.googleapis.com/auth/drive"],
});

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.url.startsWith("/oauth2callback")) {
    res.writeHead(404);
    res.end();
    return;
  }
  const code = new URL(req.url, REDIRECT).searchParams.get("code");
  res.end("Done — you can close this tab and return to the terminal.");
  server.close();

  if (!code) {
    console.error("No authorization code received.");
    process.exit(1);
  }
  try {
    const { tokens } = await oauth2.getToken(code);
    if (!tokens.refresh_token) {
      console.error(
        "No refresh token returned. Revoke the app's access at " +
          "https://myaccount.google.com/permissions and run this again."
      );
      process.exit(1);
    }
    console.log("\n✅ Refresh token:\n\n" + tokens.refresh_token + "\n");
    console.log("Add it to .env.local as:\n  GOOGLE_OAUTH_REFRESH_TOKEN=" + tokens.refresh_token + "\n");
    process.exit(0);
  } catch (err) {
    console.error("Failed to exchange code:", err?.message ?? err);
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log(
    "\n1) Open this URL in your browser and approve access:\n\n" +
      authUrl +
      "\n\n2) The refresh token will print here when you're done.\n"
  );
});
