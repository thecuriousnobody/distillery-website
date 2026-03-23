import { useState, useEffect, useCallback } from "react";

export interface Room {
  id: number;
  name: string;
  color: string;
  seats: number;
  imageUrl?: string;
}

export interface RoomBooking {
  id: number;
  title: string;
  start: string;
  end: string;
  roomId: number;
  roomName: string;
  bookedBy: string;
}

interface RoomBookingsResponse {
  rooms: Room[];
  bookings: RoomBooking[];
}

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useRoomBookings(date?: string) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const params = date ? `?date=${date}` : "";
      const res = await fetch(`/api/room-bookings${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: RoomBookingsResponse = await res.json();
      setRooms(json.rooms);
      setBookings(json.bookings);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("Failed to fetch room bookings:", message);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { rooms, bookings, loading, error, refetch: fetchData };
}
