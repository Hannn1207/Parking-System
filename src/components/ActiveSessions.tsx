import React, { useState, useEffect } from 'react';
import { Booking } from '../types/parking';
import { calculateTimeRemaining, formatRupiah, formatDateTime, getVehicleTypeShort } from '../utils/formatters';
import { Clock, AlertTriangle, LogOut, Car, User, Shield, CheckCircle2 } from 'lucide-react';

interface ActiveSessionsProps {
  bookings: Booking[];
  onEndSession: (bookingId: string) => void;
}

export const ActiveSessions: React.FC<ActiveSessionsProps> = ({
  bookings,
  onEndSession
}) => {
  // Ticker trigger to force re-render every second for real-time countdown
  const [, setTick] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeBookings = bookings.filter((b) => b.status === 'active');

  if (activeBookings.length === 0) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '32px 20px',
          textAlign: 'center',
          color: '#9ca3af'
        }}
      >
        <Car size={40} color="#4b5563" style={{ marginBottom: '12px' }} />
        <h4 style={{ color: '#f3f4f6', marginBottom: '4px' }}>Tidak Ada Sesi Parkir Aktif</h4>
        <p style={{ fontSize: '0.85rem' }}>
          Pilih spot pada denah parkir untuk melakukan pemesanan tempat parkir baru.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} color="#3b82f6" />
          Rincian Sesi Parkir Aktif ({activeBookings.length})
        </h3>
      </div>

      {activeBookings.map((booking) => {
        const timeResult = calculateTimeRemaining(booking.startTime, booking.durationMinutes);
        const { isOvertime, formattedTime, remainingSeconds, overtimeSeconds } = timeResult;

        // Calculate progress percentage
        const totalDurationSec = booking.durationMinutes * 60;
        const elapsedSec = timeResult.totalElapsedSeconds;
        const progressPercent = Math.min(100, Math.max(0, (elapsedSec / totalDurationSec) * 100));

        // Overtime penalty calculation (e.g. Rp 2,000 per 15 mins overtime)
        const overtimeHours = Math.ceil(overtimeSeconds / 3600);
        const overtimePenalty = isOvertime ? overtimeHours * booking.hourlyRate : 0;
        const currentTotalBill = booking.initialEstimatedCost + overtimePenalty;

        return (
          <div
            key={booking.id}
            className="glass-panel glass-panel-hover"
            style={{
              padding: '20px',
              position: 'relative',
              borderLeft: isOvertime ? '4px solid #ef4444' : '4px solid #10b981'
            }}
          >
            {/* Header Spot Code & Floor */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '14px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: isOvertime ? '#f87171' : '#34d399'
                    }}
                  >
                    Spot {booking.spotId}
                  </span>
                  <span className="badge badge-primary">Lantai {booking.floor}</span>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    {getVehicleTypeShort(booking.vehicleType)}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                  ID: {booking.id} • Dipesan: {formatDateTime(booking.startTime)}
                </div>
              </div>

              {/* Status Badge */}
              {isOvertime ? (
                <span className="badge badge-occupied pulse-red">
                  <AlertTriangle size={12} /> OVERTIME
                </span>
              ) : (
                <span className="badge badge-available">
                  <CheckCircle2 size={12} /> BERJALAN
                </span>
              )}
            </div>

            {/* Driver & License Details Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '12px',
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '10px',
                padding: '12px',
                marginBottom: '16px',
                fontSize: '0.85rem'
              }}
            >
              <div>
                <div style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={12} /> Pengemudi:
                </div>
                <div style={{ fontWeight: 600, color: '#f3f4f6', marginTop: '2px' }}>
                  {booking.driverName}
                </div>
              </div>

              <div>
                <div style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Shield size={12} /> Plat Nomor:
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    display: 'inline-block',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    marginTop: '2px',
                    fontSize: '0.8rem'
                  }}
                >
                  {booking.licensePlate}
                </div>
              </div>

              <div>
                <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Durasi Dipesan:</div>
                <div style={{ fontWeight: 600, color: '#60a5fa', marginTop: '2px' }}>
                  {booking.durationMinutes / 60} Jam ({booking.durationMinutes} mnt)
                </div>
              </div>
            </div>

            {/* Live Ticker Counter Box */}
            <div
              style={{
                backgroundColor: isOvertime ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.12)',
                border: isOvertime ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: isOvertime ? '#f87171' : '#34d399', fontWeight: 600 }}>
                  {isOvertime ? ' WAKTU MELEBIHI BATAS (OVERTIME)' : ' WAKTU PARKI TERSISA'}
                </span>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: isOvertime ? '#ef4444' : '#10b981',
                    letterSpacing: '0.05em'
                  }}
                >
                  {formattedTime}
                </span>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    backgroundColor: isOvertime ? '#ef4444' : '#10b981',
                    transition: 'width 1s linear'
                  }}
                />
              </div>
            </div>

            {/* Pricing Summary & Checkout Button */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Total Tagihan Selesai:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f3f4f6' }}>
                  {formatRupiah(currentTotalBill)}{' '}
                  {isOvertime && (
                    <span style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 400 }}>
                      (+{formatRupiah(overtimePenalty)} Overtime)
                    </span>
                  )}
                </div>
              </div>

              {/* End Parking Button (Requirement 3.3) */}
              <button
                onClick={() => onEndSession(booking.id)}
                className="btn btn-danger"
                style={{ fontSize: '0.85rem', padding: '10px 16px' }}
              >
                <LogOut size={16} />
                <span>Mengakhiri Sesi Parkir</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
