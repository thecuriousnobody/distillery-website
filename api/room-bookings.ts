import type { VercelRequest, VercelResponse } from "@vercel/node";

interface ProximityRoom {
  id: number;
  name: string;
  display_color: string;
  seats: number;
  description: string;
  media_thumb_url: string;
}

interface ProximityBooking {
  id: number;
  title: string;
  start: string;
  end: string;
  conferenceRoomId: number;
  conferenceRoomName: string;
  user_name: string;
  reservation_status: number;
}

const PROXIMITY_BASE = "https://distillerylabs.proximity.app";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=300");

  const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
  // Fetch a 7-day window from the given date
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 7);
  const end = endDate.toISOString().slice(0, 10);

  try {
    const [roomsRes, bookingsRes] = await Promise.all([
      fetch(`${PROXIMITY_BASE}/api/2.0/conference-rooms`),
      fetch(
        `${PROXIMITY_BASE}/api/2.0/conference-rooms/all/bookings?include_approved=1&start=${date}&end=${end}`
      ),
    ]);

    if (!roomsRes.ok || !bookingsRes.ok) {
      throw new Error(`Proximity API error: rooms=${roomsRes.status} bookings=${bookingsRes.status}`);
    }

    const roomsData = (await roomsRes.json()) as { data: ProximityRoom[] };
    const bookingsData = (await bookingsRes.json()) as { data: ProximityBooking[] };

    const rooms = roomsData.data.map((r) => ({
      id: r.id,
      name: r.name.replace(/\s*\$\d+\s*P\/H\s*/i, "").trim(), // Strip price from name
      color: r.display_color,
      seats: r.seats,
      imageUrl: r.media_thumb_url || undefined,
    }));

    const bookings = bookingsData.data.map((b) => ({
      id: b.id,
      title: b.title,
      start: b.start,
      end: b.end,
      roomId: b.conferenceRoomId,
      roomName: b.conferenceRoomName.replace(/\s*\$\d+\s*P\/H\s*/i, "").trim(),
      bookedBy: b.user_name,
    }));

    return res.status(200).json({ rooms, bookings, date, end });
  } catch (err) {
    console.error("room-bookings error:", err);
    return res.status(200).json({ rooms: [], bookings: [], date, end });
  }
}
