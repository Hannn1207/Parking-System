import { VehicleType } from '../types/parking';

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const getVehicleTypeName = (type: VehicleType): string => {
  switch (type) {
    case 'compact':
      return 'Motor / Mobil Kecil (Compact)';
    case 'sedan':
      return 'Sedan / Hatchback';
    case 'suv':
      return 'SUV / MPV / Van';
    case 'ev':
      return 'Mobil Listrik (EV Charger)';
    default:
      return type;
  }
};

export const getVehicleTypeShort = (type: VehicleType): string => {
  switch (type) {
    case 'compact':
      return 'Compact';
    case 'sedan':
      return 'Sedan';
    case 'suv':
      return 'SUV / MPV';
    case 'ev':
      return 'EV Charger';
    default:
      return type;
  }
};

export interface TimeDiffResult {
  isOvertime: boolean;
  formattedTime: string; // e.g. "01:23:45"
  remainingSeconds: number;
  overtimeSeconds: number;
  totalElapsedSeconds: number;
}

export const calculateTimeRemaining = (startTime: number, durationMinutes: number): TimeDiffResult => {
  const now = Date.now();
  const endTime = startTime + durationMinutes * 60 * 1000;
  const elapsedMs = Math.max(0, now - startTime);
  const totalElapsedSeconds = Math.floor(elapsedMs / 1000);

  if (now <= endTime) {
    const remainingMs = endTime - now;
    const totalSeconds = Math.floor(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return {
      isOvertime: false,
      formattedTime: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
      remainingSeconds: totalSeconds,
      overtimeSeconds: 0,
      totalElapsedSeconds
    };
  } else {
    const overtimeMs = now - endTime;
    const totalSeconds = Math.floor(overtimeMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return {
      isOvertime: true,
      formattedTime: `+${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
      remainingSeconds: 0,
      overtimeSeconds: totalSeconds,
      totalElapsedSeconds
    };
  }
};

export const formatDateTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
