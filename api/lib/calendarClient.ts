import { google } from "googleapis";
import { JWT } from "google-auth-library";

/**
 * Get a calendar client. If GOOGLE_IMPERSONATE_EMAIL is set, uses
 * domain-wide delegation to impersonate that user (sees their full
 * calendar list). Otherwise authenticates as the service account itself.
 */
export function getCalendarClient() {
  const impersonate = process.env.GOOGLE_IMPERSONATE_EMAIL;

  if (impersonate) {
    const jwt = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
      ),
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
      subject: impersonate,
    });
    return google.calendar({ version: "v3", auth: jwt });
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
      ),
    },
    scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
  });

  return google.calendar({ version: "v3", auth });
}

export const CALENDAR_ID =
  process.env.GOOGLE_CALENDAR_ID || "info@distillerylabs.org";
