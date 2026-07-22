import React from 'react';
import { FilterCriteria, VehicleType, SpotStatus } from '../types/parking';
import { Search, Filter, RotateCcw } from 'lucide-react';

interface SearchFilterBarProps {
  filters: FilterCriteria;
  onFilterChange: (newFilters: FilterCriteria) => void;
  onReset: () => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset
}) => {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      {/* Search Input */}
      <div style={{ flex: '1 1 240px', position: 'relative' }}>
        <Search
          size={18}
          color="#9ca3af"
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          className="form-input"
          placeholder="Cari spot (cth: F1-04) atau Plat Nomor..."
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
          style={{ paddingLeft: '38px' }}
        />
      </div>

      {/* Filter Options */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: '1 1 auto' }}>


        {/* Status Select */}
        <div style={{ minWidth: '150px' }}>
          <select
            className="form-select"
            value={filters.status}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                status: e.target.value as SpotStatus | 'all'
              })
            }
          >
            <option value="all">📌 Semua Status</option>
            <option value="available">🟢 Tersedia</option>
            <option value="occupied">🔴 Terisi</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="btn btn-secondary"
          title="Reset Filter"
          style={{ padding: '10px 14px' }}
        >
          <RotateCcw size={16} />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
