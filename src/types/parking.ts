export type FloorId = 1 | 2 | 3;

export type VehicleType = 'compact' | 'sedan' | 'suv' | 'ev';

export type SpotStatus = 'available' | 'occupied' | 'reserved';

export interface ParkingSpot {
  id: string; // e.g. "F1-01"
  code: string; // e.g. "01"
  floor: FloorId;
  type: VehicleType;
  status: SpotStatus;
  x: number; // grid position x
  y: number; // grid position y
  rotation?: number; // 0 or 180 degrees
  hourlyRate: number; // IDR per hour
}

export interface Booking {
  id: string;
  spotId: string;
  floor: FloorId;
  driverName: string;
  licensePlate: string;
  vehicleType: VehicleType;
  startTime: number; // Timestamp ms
  durationMinutes: number; // Expected duration in minutes
  hourlyRate: number;
  initialEstimatedCost: number;
  status: 'active' | 'completed';
  endTime?: number;
  finalPaidAmount?: number;
  overtimeMinutes?: number;
}

export interface FilterCriteria {
  searchQuery: string;
  floor: FloorId | 'all';
  vehicleType: VehicleType | 'all';
  status: SpotStatus | 'all';
}

export interface FloorStats {
  floor: FloorId;
  total: number;
  available: number;
  occupied: number;
}
