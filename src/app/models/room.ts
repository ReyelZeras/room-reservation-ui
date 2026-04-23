export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
}
