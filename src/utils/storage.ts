import { ParkingSpot, Booking, FloorId, VehicleType } from '../types/parking';

const SPOTS_STORAGE_KEY = 'parkir_vision_spots_v1';
const BOOKINGS_STORAGE_KEY = 'parkir_vision_bookings_v1';

// Generate default 12 spots per floor for 3 floors (total 36 spots)
export const generateInitialSpots = (): ParkingSpot[] => {
  const spots: ParkingSpot[] = [];
  const floors: FloorId[] = [1, 2, 3];

  const vehicleTypes: VehicleType[] = ['compact', 'sedan', 'suv', 'ev'];

  floors.forEach((floor) => {
    // Top Row (6 spots: 01-06)
    for (let i = 1; i <= 6; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      const type = vehicleTypes[(i - 1) % vehicleTypes.length];
      const rate = type === 'ev' ? 15000 : type === 'suv' ? 10000 : 7000;

      spots.push({
        id: `F${floor}-${numStr}`,
        code: `F${floor}-${numStr}`,
        floor: floor,
        type: type,
        status: 'available',
        x: 60 + (i - 1) * 110,
        y: 60,
        rotation: 0,
        hourlyRate: rate
      });
    }

    // Bottom Row (6 spots: 07-12)
    for (let i = 7; i <= 12; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      const type = vehicleTypes[(i - 1) % vehicleTypes.length];
      const rate = type === 'ev' ? 15000 : type === 'suv' ? 10000 : 7000;

      spots.push({
        id: `F${floor}-${numStr}`,
        code: `F${floor}-${numStr}`,
        floor: floor,
        type: type,
        status: 'available',
        x: 60 + (i - 7) * 110,
        y: 280,
        rotation: 180,
        hourlyRate: rate
      });
    }
  });

  return spots;
};

// Default initial bookings to make the dashboard look active immediately
export const generateInitialBookings = (spots: ParkingSpot[]): Booking[] => {
  const now = Date.now();
  const initialBookings: Booking[] = [
    {
      id: 'BK-1001',
      spotId: 'F1-02',
      floor: 1,
      driverName: 'Budi Santoso',
      licensePlate: 'B 1452 RFS',
      vehicleType: 'sedan',
      startTime: now - 35 * 60 * 1000,
      durationMinutes: 60,
      hourlyRate: 7000,
      initialEstimatedCost: 7000,
      status: 'active'
    },
    {
      id: 'BK-1002',
      spotId: 'F1-05',
      floor: 1,
      driverName: 'Siti Rahma',
      licensePlate: 'B 8899 EV',
      vehicleType: 'ev',
      startTime: now - 70 * 60 * 1000,
      durationMinutes: 60, // 
      hourlyRate: 15000,
      initialEstimatedCost: 15000,
      status: 'active'
    },
    {
      id: 'BK-1003',
      spotId: 'F2-04',
      floor: 2,
      driverName: 'Andi Wijaya',
      licensePlate: 'D 3341 XYZ',
      vehicleType: 'suv',
      startTime: now - 15 * 60 * 1000,
      durationMinutes: 120,
      hourlyRate: 10000,
      initialEstimatedCost: 20000,
      status: 'active'
    },
    {
      id: 'BK-1004',
      spotId: 'F3-08',
      floor: 3,
      driverName: 'Dewi Lestari',
      licensePlate: 'B 2210 JKT',
      vehicleType: 'compact',
      startTime: now - 45 * 60 * 1000,
      durationMinutes: 180,
      hourlyRate: 7000,
      initialEstimatedCost: 21000,
      status: 'active'
    }
  ];

  // Mark corresponding spots as occupied
  initialBookings.forEach((b) => {
    const spot = spots.find((s) => s.id === b.spotId);
    if (spot) {
      spot.status = 'occupied';
    }
  });

  return initialBookings;
};

// Storage Helpers
export const getStoredSpots = (): ParkingSpot[] => {
  try {
    const stored = localStorage.getItem(SPOTS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length === 36) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading spots from localStorage:', e);
  }

  const initialSpots = generateInitialSpots();
  // Ensure default bookings are also set up if initial spots created
  const initialBookings = generateInitialBookings(initialSpots);
  saveStoredSpots(initialSpots);
  saveStoredBookings(initialBookings);
  return initialSpots;
};

export const saveStoredSpots = (spots: ParkingSpot[]): void => {
  try {
    localStorage.setItem(SPOTS_STORAGE_KEY, JSON.stringify(spots));
  } catch (e) {
    console.error('Error saving spots to localStorage:', e);
  }
};

export const getStoredBookings = (): Booking[] => {
  try {
    const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading bookings from localStorage:', e);
  }

  // If no bookings exist yet, initialize spots and return default bookings
  const spots = generateInitialSpots();
  const initialBookings = generateInitialBookings(spots);
  saveStoredSpots(spots);
  saveStoredBookings(initialBookings);
  return initialBookings;
};

export const saveStoredBookings = (bookings: Booking[]): void => {
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.error('Error saving bookings to localStorage:', e);
  }
};
