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
            color: '#9ca3af',
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
            <h2 style={{ fontSize: '1.25rem', color: '#f3f4f6' }}>
              Riwayat Transaksi Parkir Selesai
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
              Total Sesi Selesai: {completedBookings.length}
            </div>
          </div>
        </div>

        {completedBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
            <Car size={36} color="#4b5563" style={{ marginBottom: '10px' }} />
            <p>Belum ada riwayat sesi parkir yang diselesaikan.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '55vh', overflowY: 'auto', paddingRight: '4px' }}>
            {completedBookings.map((b) => (
              <div
                key={b.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
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
                    <span style={{ fontWeight: 700, color: '#f3f4f6' }}>Spot {b.spotId}</span>
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
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px' }}>
                    Pengemudi: <strong>{b.driverName}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                    Mulai: {formatDateTime(b.startTime)} • Selesai: {b.endTime ? formatDateTime(b.endTime) : '-'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                    <CheckCircle size={12} /> Selesai
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f3f4f6', marginTop: '2px' }}>
                    {formatRupiah(b.finalPaidAmount || b.initialEstimatedCost)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
