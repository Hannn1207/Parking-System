import React from 'react';
import { ParkingSpot, Booking } from '../types/parking';
import { formatRupiah } from '../utils/formatters';
import { Car, CheckCircle2, AlertCircle, History, RotateCcw, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  spots: ParkingSpot[];
  bookings: Booking[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenHistory: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  spots,
  bookings,
  theme,
  onToggleTheme,
  onOpenHistory,
  onResetData
}) => {
  const totalSpots = spots.length;
  const availableSpots = spots.filter((s) => s.status === 'available').length;
  const occupiedSpots = spots.filter((s) => s.status === 'occupied').length;

  const totalRevenue = bookings.reduce((sum, b) => {
    if (b.status === 'completed') {
      return sum + (b.finalPaidAmount || b.initialEstimatedCost);
    }
    return sum + b.initialEstimatedCost;
  }, 0);

  return (
    <header
      className="glass-panel"
      style={{
        padding: '16px 24px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap'
      }}
    >
      {/* Brand Logo & Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
          }}
        >
          <Car size={26} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Parkir
          </h1>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Sistem Pengelolaan Parkiran Mobil Multi-Lantai (3 Lantai • 36 Spot)
          </div>
        </div>
      </div>

      {/* Stats Summary Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        {/* Available Pill */}
        <div
          style={{
            background: 'var(--color-available-glow)',
            border: '1px solid rgba(5, 150, 105, 0.3)',
            borderRadius: '12px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={18} color="var(--color-available)" />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Tersedia
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-available)' }}>
              {availableSpots} / {totalSpots}
            </div>
          </div>
        </div>

        {/* Occupied Pill */}
        <div
          style={{
            background: 'var(--color-occupied-glow)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            borderRadius: '12px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertCircle size={18} color="var(--color-occupied)" />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Terisi
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-occupied)' }}>
              {occupiedSpots} Spot
            </div>
          </div>
        </div>

        {/* Revenue Pill */}
        <div
          style={{
            background: 'rgba(37, 99, 235, 0.08)',
            border: '1px solid rgba(37, 99, 235, 0.25)',
            borderRadius: '12px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Est. Pendapatan
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {formatRupiah(totalRevenue)}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action & Theme Switcher Buttons */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="btn btn-secondary"
          style={{ padding: '8px 14px' }}
          title={`Beralih ke Mode ${theme === 'light' ? 'Gelap (Dark)' : 'Terang (Light)'}`}
        >
          {theme === 'light' ? (
            <>
              <Moon size={16} color="#475569" />
              <span>Mode Gelap</span>
            </>
          ) : (
            <>
              <Sun size={16} color="#f59e0b" />
              <span>Mode Terang</span>
            </>
          )}
        </button>

        <button onClick={onOpenHistory} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
          <History size={16} />
          <span>Riwayat Transaksi</span>
        </button>

        <button
          onClick={onResetData}
          className="btn btn-secondary"
          style={{ fontSize: '0.85rem' }}
          title="Reset Data ke Kondisi Awal"
        >
          <RotateCcw size={16} />
          <span>Reset Data</span>
        </button>
      </div>
    </header>
  );
};
