const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "http://localhost"
);

if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
}

const calendar = () => google.calendar({ version: "v3", auth: oauth2Client });

function toISO(dateStr, timeStr, minutes = 60) {
  const start = new Date(`${dateStr}T${timeStr}:00`);
  const end = new Date(start.getTime() + minutes * 60000);
  return { start: start.toISOString(), end: end.toISOString() };
}

async function createMeetEvent({ summary, description, dateStr, timeStr, attendees = [] }) {
  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error("Missing GOOGLE_REFRESH_TOKEN");
  }
  const { start, end } = toISO(dateStr, timeStr);
  const event = {
    summary,
    description,
    start: { dateTime: start },
    end: { dateTime: end },
    attendees: attendees.filter(Boolean).map((email) => ({ email })),
    conferenceData: {
      createRequest: { requestId: `skillx-${Date.now()}` },
    },
  };
  const res = await calendar().events.insert({
    calendarId: "primary",
    resource: event,
    conferenceDataVersion: 1,
  });
  const data = res.data || {};
  const link =
    data.hangoutLink ||
    (data.conferenceData &&
      data.conferenceData.entryPoints &&
      data.conferenceData.entryPoints.find((ep) => ep.entryPointType === "video")?.uri) ||
    null;
  return { link, eventId: data.id };
}

module.exports = { createMeetEvent };
