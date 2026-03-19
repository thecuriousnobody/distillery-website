export interface CalendarEvent {
  id: string;
  summary: string;
  description: string;
  location: string;
  organizer: string;
  calendarId?: string;
  start: string;
  end: string;
  allDay: boolean;
  source?: "google" | "proximity";
}

export interface CalendarInfo {
  id: string;
  summary: string;
  description: string;
  backgroundColor: string;
  primary: boolean;
}
