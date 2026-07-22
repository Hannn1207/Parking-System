import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { ParkingSpot, Booking, FloorId, FilterCriteria, VehicleType, SpotStatus } from '../src/types/parking';
import {
  getStoredSpots,
  saveStoredSpots,
  getStoredBookings,
  saveStoredBookings,
  generateInitialSpots,
  generateInitialBookings
} from '../src/utils/storage';
import { calculateTimeRemaining, formatRupiah, getVehicleTypeName } from '../src/utils/formatters';

import { Navbar } from '../src/components/Navbar';
import { FloorSelector } from '../src/components/FloorSelector';
import { SearchFilterBar } from '../src/components/SearchFilterBar';
import { ActiveSessions } from '../src/components/ActiveSessions';
import { BookingModal } from '../src/components/BookingModal';
import { HistoryModal } from '../src/components/HistoryModal';

import { Car, CheckCircle, AlertTriangle, Search, ChevronRight, FilterX } from 'lucide-react';

// Dynamic import for Konva Canvas component (SSR disabled to avoid window canvas errors)
const ParkingCanvas = dynamic(
  () => import('../src/components/ParkingCanvas').then((mod) => mod.ParkingCanvas),
  { ssr: false }
);

export default function Home() {
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentFloor, setCurrentFloor] = useState<FloorId>(1);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);

  // Theme State: Default 'light'
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  // Filter State
  const [filters, setFilters] = useState<FilterCriteria>({
    searchQuery: '',
    floor: 'all',
    vehicleType: 'all',
    status: 'all'
  });

  // Toast alert state
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'warning'; text: string } | null>(null);

  const showToast = (type: 'success' | 'info' | 'warning', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Hydrate state from localStorage on mount (client-only)
  useEffect(() => {
    setSpots(getStoredSpots());
    setBookings(getStoredBookings());
    const savedTheme = (localStorage.getItem('parkir_vision_theme') as 'light' | 'dark') || 'light';
    setTheme(savedTheme);
  }, []);

  // Sync theme to DOM attribute & localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('parkir_vision_theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Sync spots & bookings to localStorage
  useEffect(() => {
    if (spots.length > 0) {
      saveStoredSpots(spots);
    }
  }, [spots]);

  useEffect(() => {
    if (bookings.length > 0) {
      saveStoredBookings(bookings);
    }
  }, [bookings]);

  // Filtered Spots Calculation
  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      // Floor filter
      if (filters.floor !== 'all' && spot.floor !== filters.floor) return false;
      // Status filter
      if (filters.status !== 'all' && spot.status !== filters.status) return false;
      // Vehicle type filter
      if (filters.vehicleType !== 'all' && spot.type !== filters.vehicleType) return false;

      // Search query filter (matches spot code, license plate, driver name, or vehicle size/type)
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const spotCodeMatch = spot.code.toLowerCase().includes(query);
        const typeMatch = spot.type.toLowerCase().includes(query) || getVehicleTypeName(spot.type).toLowerCase().includes(query);
        const activeBooking = bookings.find((b) => b.spotId === spot.id && b.status === 'active');
        const plateMatch = activeBooking?.licensePlate.toLowerCase().includes(query);
        const driverMatch = activeBooking?.driverName.toLowerCase().includes(query);

        return spotCodeMatch || typeMatch || plateMatch || driverMatch;
      }

      return true;
    });
  }, [spots, bookings, filters]);

  // Create a Set of matching spot IDs for quick lookup in Konva canvas
  const matchingSpotIds = useMemo(() => {
    return new Set(filteredSpots.map((s) => s.id));
  }, [filteredSpots]);

  // Auto-switch floor if search query directly points to a spot on another floor
  useEffect(() => {
    if (filters.searchQuery.trim()) {
      const firstMatch = filteredSpots[0];
      if (firstMatch && firstMatch.floor !== currentFloor && filters.floor === 'all') {
        setCurrentFloor(firstMatch.floor);
      }
    }
  }, [filters.searchQuery, filteredSpots]);

  // Handle Spot Selection
  const handleSelectSpot = (spot: ParkingSpot) => {
    setSelectedSpot(spot);
    setCurrentFloor(spot.floor);

    if (spot.status === 'available') {
      setIsBookingModalOpen(true);
    } else {
      const activeBooking = bookings.find((b) => b.spotId === spot.id && b.status === 'active');
      if (activeBooking) {
        showToast('info', `Spot ${spot.code} saat ini terisi oleh ${activeBooking.driverName} (${activeBooking.licensePlate}).`);
      }
    }
  };

  // Handle Booking Creation
  const handleConfirmBooking = (bookingData: {
    driverName: string;
    licensePlate: string;
    vehicleType: VehicleType;
    durationMinutes: number;
  }) => {
    if (!selectedSpot) return;

    const newBooking: Booking = {
      id: `BK-${Date.now().toString().slice(-5)}`,
      spotId: selectedSpot.id,
      floor: selectedSpot.floor,
      driverName: bookingData.driverName,
      licensePlate: bookingData.licensePlate,
      vehicleType: bookingData.vehicleType,
      startTime: Date.now(),
      durationMinutes: bookingData.durationMinutes,
      hourlyRate: selectedSpot.hourlyRate,
      initialEstimatedCost: Math.ceil((bookingData.durationMinutes / 60) * selectedSpot.hourlyRate),
      status: 'active'
    };

    const updatedSpots = spots.map((s) =>
      s.id === selectedSpot.id ? { ...s, status: 'occupied' as SpotStatus } : s
    );

    setSpots(updatedSpots);
    setBookings([newBooking, ...bookings]);

    showToast('success', `Berhasil memesan tempat parkir ${selectedSpot.code} untuk ${bookingData.driverName}!`);
  };

  // Handle Ending Session (Checkout)
  const handleEndSession = (bookingId: string) => {
    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (!targetBooking) return;

    const timeResult = calculateTimeRemaining(targetBooking.startTime, targetBooking.durationMinutes);
    const overtimeHours = Math.ceil(timeResult.overtimeSeconds / 3600);
    const overtimePenalty = timeResult.isOvertime ? overtimeHours * targetBooking.hourlyRate : 0;
    const finalPaidAmount = targetBooking.initialEstimatedCost + overtimePenalty;

    const updatedBookings = bookings.map((b) =>
      b.id === bookingId
        ? {
            ...b,
            status: 'completed' as const,
            endTime: Date.now(),
            overtimeMinutes: Math.floor(timeResult.overtimeSeconds / 60),
            finalPaidAmount
          }
        : b
    );

    const updatedSpots = spots.map((s) =>
      s.id === targetBooking.spotId ? { ...s, status: 'available' as SpotStatus } : s
    );

    setBookings(updatedBookings);
    setSpots(updatedSpots);

    showToast(
      'success',
      `Sesi parkir spot ${targetBooking.spotId} telah diakhiri. Total Tagihan: ${formatRupiah(finalPaidAmount)}.`
    );
  };

  // Reset System Data
  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin me-reset seluruh data parkir ke kondisi default awal?')) {
      const freshSpots = generateInitialSpots();
      const freshBookings = generateInitialBookings(freshSpots);
      setSpots(freshSpots);
      setBookings(freshBookings);
      setSelectedSpot(null);
      setFilters({ searchQuery: '', floor: 'all', vehicleType: 'all', status: 'all' });
      showToast('info', 'Sistem parkir berhasil di-reset ke kondisi awal.');
    }
  };

  const isFilteringActive =
    Boolean(filters.searchQuery.trim()) || filters.floor !== 'all' || filters.vehicleType !== 'all' || filters.status !== 'all';

  return (
    <>
      <Head>
        <title>Sistem Pengelolaan Parkiran - Parking Vision Pro</title>
        <meta name="description" content="Sistem Pengelolaan Parkiran interaktif dan modern" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="app-container">
        {/* Navbar Header */}
        <Navbar
          spots={spots}
          bookings={bookings}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenHistory={() => setIsHistoryModalOpen(true)}
          onResetData={handleResetData}
        />

        {/* Toast Alert Popup */}
        {toastMessage && (
          <div className="toast-popup">
            {toastMessage.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertTriangle size={20} />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <SearchFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onReset={() =>
            setFilters({ searchQuery: '', floor: 'all', vehicleType: 'all', status: 'all' })
          }
        />

        {/* Main Grid Layout */}
        <div className="grid-main">
          {/* Left Column: Interactive Floor Plan Canvas & Search List */}
          <div style={{ minWidth: 0 }}>
            {/* Floor Selection Bar */}
            <FloorSelector
              currentFloor={currentFloor}
              onSelectFloor={(floor) => setCurrentFloor(floor)}
              spots={spots}
            />

            {/* Active Filter Indicator Badge */}
            {isFilteringActive && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  marginBottom: '12px',
                  backgroundColor: 'rgba(37, 99, 235, 0.08)',
                  border: '1px solid rgba(37, 99, 235, 0.2)',
                  borderRadius: '10px',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Search size={16} color="var(--color-primary)" />
                  <span>
                    Filter Aktif: <strong>{filteredSpots.length}</strong> dari 36 spot cocok dengan pencarian.
                  </span>
                </div>
                <button
                  onClick={() => setFilters({ searchQuery: '', floor: 'all', vehicleType: 'all', status: 'all' })}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8rem'
                  }}
                >
                  <FilterX size={14} /> Hapus Filter
                </button>
              </div>
            )}

            {/* Konva Floor Canvas with Matching Spot Highlighting */}
            <ParkingCanvas
              spots={spots}
              activeBookings={bookings}
              selectedSpotId={selectedSpot?.id || null}
              matchingSpotIds={matchingSpotIds}
              isFilteringActive={isFilteringActive}
              onSelectSpot={handleSelectSpot}
              floor={currentFloor}
              theme={theme}
            />

            {/* Filtered Search Results Grid */}
            {isFilteringActive && (
              <div className="glass-panel" style={{ marginTop: '16px', padding: '16px' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Search size={16} color="var(--color-primary)" />
                  Daftar Hasil Pencarian Spot ({filteredSpots.length} Tempat Ditemukan)
                </h4>

                {filteredSpots.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                    Tidak ada tempat parkir yang cocok dengan pencarian &quot;{filters.searchQuery}&quot;.
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                      gap: '10px'
                    }}
                  >
                    {filteredSpots.map((spot) => {
                      const isOccupied = spot.status === 'occupied';
                      const activeBooking = bookings.find((b) => b.spotId === spot.id && b.status === 'active');
                      return (
                        <div
                          key={spot.id}
                          onClick={() => handleSelectSpot(spot)}
                          className="glass-panel-hover"
                          style={{
                            background: isOccupied ? 'var(--color-occupied-glow)' : 'var(--color-available-glow)',
                            border: isOccupied ? '1px solid rgba(220, 38, 38, 0.4)' : '1px solid rgba(5, 150, 105, 0.4)',
                            borderRadius: '10px',
                            padding: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isOccupied ? 'var(--color-occupied)' : 'var(--color-available)' }}>
                              {spot.code}
                            </span>
                            <span className="badge badge-primary" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>
                              Lantai {spot.floor}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {getVehicleTypeName(spot.type)}
                          </div>
                          {activeBooking ? (
                            <div
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                backgroundColor: '#ffffff',
                                color: '#000000',
                                padding: '1px 4px',
                                borderRadius: '3px',
                                fontFamily: 'monospace',
                                alignSelf: 'flex-start'
                              }}
                            >
                              {activeBooking.licensePlate}
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-available)' }}>
                              🟢 Tersedia
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Active Sessions & Quick Action Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
            {/* Selected Spot Action Card */}
            {selectedSpot && (
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  border: '1.5px solid var(--color-primary)',
                  boxShadow: '0 0 20px rgba(37, 99, 235, 0.15)'
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Spot Terpilih Saat Ini
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>
                    {selectedSpot.code} (Lantai {selectedSpot.floor})
                  </h3>
                  <span className={selectedSpot.status === 'available' ? 'badge badge-available' : 'badge badge-occupied'}>
                    {selectedSpot.status === 'available' ? 'Tersedia' : 'Terisi'}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Tipe: {getVehicleTypeName(selectedSpot.type)} • {formatRupiah(selectedSpot.hourlyRate)}/jam
                </div>

                {selectedSpot.status === 'available' ? (
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '14px' }}
                  >
                    <Car size={18} />
                    <span>Pesan Tempat Parkir Ini</span>
                    <ChevronRight size={16} />
                  </button>
                ) : null}
              </div>
            )}

            {/* Active Sessions List Component */}
            <ActiveSessions
              bookings={bookings}
              onEndSession={handleEndSession}
            />
          </div>
        </div>

        {/* Booking Form Modal */}
        {isBookingModalOpen && selectedSpot && (
          <BookingModal
            spot={selectedSpot}
            onClose={() => setIsBookingModalOpen(false)}
            onConfirmBooking={handleConfirmBooking}
          />
        )}

        {/* Transaction History Modal */}
        {isHistoryModalOpen && (
          <HistoryModal
            bookings={bookings}
            onClose={() => setIsHistoryModalOpen(false)}
          />
        )}
      </div>
    </>
  );
}
