import React from 'react';
import { Booking } from '../types/parking';
import { formatRupiah, formatDateTime } from '../utils/formatters';
import { X, History, Car, CheckCircle } from 'lucide-react';

interface HistoryModalProps {
  bookings: Booking[];
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ bookings, onClose }) => {
  const completedBookings = bookings.filter((b) => b.status === 'completed');

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <History color="#8b5cf6" size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 800 }}>
              Riwayat Transaksi Parkir Selesai
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Total Sesi Selesai: {completedBookings.length}
            </div>
          </div>
        </div>

        {completedBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Car size={36} color="var(--text-dim)" style={{ marginBottom: '10px' }} />
            <p>Belum ada riwayat sesi parkir yang diselesaikan.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '55vh', overflowY: 'auto', paddingRight: '4px' }}>
            {completedBookings.map((b) => (
              <div
                key={b.id}
                style={{
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Spot {b.spotId}</span>
                    <span className="badge badge-primary">Lantai {b.floor}</span>
                    <span
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        fontFamily: 'monospace'
                      }}
                    >
                      {b.licensePlate}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Pengemudi: <strong>{b.driverName}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Mulai: {formatDateTime(b.startTime)} • Selesai: {b.endTime ? formatDateTime(b.endTime) : '-'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-available)' }}>
                    {formatRupiah(b.finalPaidAmount || b.initialEstimatedCost)}
                  </div>
                  <span className="badge badge-available" style={{ marginTop: '4px' }}>
                    <CheckCircle size={12} style={{ marginRight: '4px' }} /> Selesai
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
