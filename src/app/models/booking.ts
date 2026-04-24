export interface BookingRequest {
  userId: string;
  roomId: string;
  startTime: string; // Formato ISO 8601 (ex: "2026-04-24T10:00:00")
  endTime: string;
}

export interface BookingResponse {
  id: string;
  userId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}
