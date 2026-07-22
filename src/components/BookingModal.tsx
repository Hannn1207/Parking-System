import React, { useState } from 'react';
import { ParkingSpot, VehicleType } from '../types/parking';
import { formatRupiah, getVehicleTypeName } from '../utils/formatters';
import { X, CheckCircle, Car, Clock, CreditCard, User, ShieldCheck } from 'lucide-react';

interface BookingModalProps {
  spot: ParkingSpot;
  onClose: () => void;
  onConfirmBooking: (bookingData: {
    driverName: string;
    licensePlate: string;
    vehicleType: VehicleType;
    durationMinutes: number;
  }) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  spot,
  onClose,
  onConfirmBooking
}) => {
  const [driverName, setDriverName] = useState<string>('');
  const [licensePlate, setLicensePlate] = useState<string>('');
  const [vehicleType, setVehicleType] = useState<VehicleType>(spot.type);
  const [durationHours, setDurationHours] = useState<number>(1);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  const estimatedCost = Math.ceil(durationHours * spot.hourlyRate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!driverName.trim() || !licensePlate.trim()) {
      alert('Mohon isi nama pengemudi dan nomor kendaraan (plat nomor).');
      return;
    }

    const durationMinutes = Math.round(durationHours * 60);

    const bookingPayload = {
      driverName: driverName.trim(),
      licensePlate: licensePlate.trim().toUpperCase(),
      vehicleType,
      durationMinutes
    };

    onConfirmBooking(bookingPayload);

    setCreatedBooking({
      ...bookingPayload,
      spotCode: spot.code,
      floor: spot.floor,
      estimatedCost,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    });

    setIsSuccess(true);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
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

        {isSuccess && createdBooking ? (
          /* Confirmation Success Screen */
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '2px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}
            >
              <CheckCircle size={36} color="#10b981" />
            </div>

            <h2 style={{ fontSize: '1.4rem', color: '#f3f4f6', marginBottom: '6px' }}>
              Pemesanan Berhasil!
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '20px' }}>
              Tempat parkir <strong style={{ color: '#34d399' }}>{createdBooking.spotCode}</strong> (Lantai {createdBooking.floor}) telah berhasil dipesan.
            </p>

            {/* Receipt Box */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px dashed rgba(255, 255, 255, 0.2)',
                borderRadius: '14px',
                padding: '18px',
                textAlign: 'left',
                marginBottom: '24px',
                fontSize: '0.9rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Kode Tempat Parkir:</span>
                <span style={{ fontWeight: 700, color: '#f3f4f6' }}>{createdBooking.spotCode}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Nama Pengemudi:</span>
                <span style={{ fontWeight: 600, color: '#f3f4f6' }}>{createdBooking.driverName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Plat Nomor:</span>
                <span
                  style={{
                    fontWeight: 700,
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontFamily: 'monospace'
                  }}
                >
                  {createdBooking.licensePlate}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Durasi Dipesan:</span>
                <span style={{ fontWeight: 600, color: '#60a5fa' }}>{durationHours} Jam ({createdBooking.durationMinutes} Menit)</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '12px',
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  fontWeight: 700
                }}
              >
                <span style={{ color: '#f3f4f6' }}>Estimasi Biaya:</span>
                <span style={{ color: '#34d399', fontSize: '1.05rem' }}>
                  {formatRupiah(createdBooking.estimatedCost)}
                </span>
              </div>
            </div>

            <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>
              Kembali ke Dashboard Parkir
            </button>
          </div>
        ) : (
          /* Form Input View */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Car color="#3b82f6" size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', color: '#f3f4f6' }}>
                  Pemesanan Tempat Parkir
                </h2>
                <div style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 600 }}>
                  Spot {spot.code} • Lantai {spot.floor} ({formatRupiah(spot.hourlyRate)}/jam)
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Nama Pengemudi */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={15} color="#9ca3af" />
                  Nama Pengemudi / Pemilik
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Cth: Budi Santoso"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  required
                />
              </div>

              {/* Plat Nomor */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={15} color="#9ca3af" />
                  Nomor Kendaraan (Plat Nomor)
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Cth: B 1234 ABC"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                  required
                  style={{ fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
              </div>

              {/* Tipe Kendaraan */}
              <div className="form-group">
                <label className="form-label">Jenis / Ukuran Kendaraan</label>
                <select
                  className="form-select"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                >
                  <option value="compact">Motor / Mobil Kecil (Compact)</option>
                  <option value="sedan">Sedan / Hatchback</option>
                  <option value="suv">SUV / MPV / Van</option>
                  <option value="ev">Mobil Listrik (EV Charger Spot)</option>
                </select>
              </div>

              {/* Durasi Parkir */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={15} color="#9ca3af" />
                  Durasi Parkir (Jam)
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  {[1, 2, 4, 8, 12, 24].map((hr) => (
                    <button
                      key={hr}
                      type="button"
                      onClick={() => setDurationHours(hr)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '8px',
                        border: durationHours === hr ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: durationHours === hr ? 'rgba(59, 130, 246, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                        color: durationHours === hr ? '#60a5fa' : '#9ca3af',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      {hr} Jam
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="0.5"
                  max="72"
                  step="0.5"
                  className="form-input"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Math.max(0.5, parseFloat(e.target.value) || 1))}
                  placeholder="Atau masukkan jam custom..."
                />
              </div>

              {/* Cost Summary Box */}
              <div
                style={{
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '12px',
                  padding: '14px',
                  margin: '20px 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Estimasi Biaya Total:</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34d399' }}>
                    {formatRupiah(estimatedCost)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9ca3af' }}>
                  Tarif: {formatRupiah(spot.hourlyRate)} / jam
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                >
                  <CreditCard size={18} />
                  Konfirmasi Pemesanan
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
