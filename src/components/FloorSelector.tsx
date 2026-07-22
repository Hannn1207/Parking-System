import React from 'react';
import { FloorId, ParkingSpot } from '../types/parking';
import { Layers } from 'lucide-react';

interface FloorSelectorProps {
  currentFloor: FloorId;
  onSelectFloor: (floor: FloorId) => void;
  spots: ParkingSpot[];
}

export const FloorSelector: React.FC<FloorSelectorProps> = ({
  currentFloor,
  onSelectFloor,
  spots
}) => {
  const floors: FloorId[] = [1, 2, 3];

  const getFloorAvailableCount = (floor: FloorId) => {
    return spots.filter((s) => s.floor === floor && s.status === 'available').length;
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '16px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Layers size={20} color="#3b82f6" />
        <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f3f4f6' }}>
          Pilih Lantai Parkir:
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {floors.map((floor) => {
          const isActive = currentFloor === floor;
          const availableCount = getFloorAvailableCount(floor);

          return (
            <button
              key={floor}
              onClick={() => onSelectFloor(floor)}
              className="btn"
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                color: isActive ? '#ffffff' : '#9ca3af',
                border: isActive ? '1px solid #60a5fa' : '1px solid rgba(255, 255, 255, 0.1)',
                padding: '8px 16px',
                borderRadius: '10px',
                boxShadow: isActive ? '0 4px 14px rgba(59, 130, 246, 0.3)' : 'none'
              }}
            >
              <span>Lantai {floor}</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  backgroundColor: isActive
                    ? 'rgba(255, 255, 255, 0.2)'
                    : availableCount > 0
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(239, 68, 68, 0.2)',
                  color: isActive
                    ? '#ffffff'
                    : availableCount > 0
                    ? '#34d399'
                    : '#f87171',
                  fontWeight: 700
                }}
              >
                {availableCount}/12 Tersedia
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
