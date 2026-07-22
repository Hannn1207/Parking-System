import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Group, Path, Line } from 'react-konva';
import { ParkingSpot, Booking } from '../types/parking';

interface ParkingCanvasProps {
  spots: ParkingSpot[];
  activeBookings: Booking[];
  selectedSpotId: string | null;
  matchingSpotIds: Set<string>;
  isFilteringActive: boolean;
  onSelectSpot: (spot: ParkingSpot) => void;
  floor: number;
  theme: 'light' | 'dark';
}

const CAR_SVG_PATH =
  'M 12,25 C 10,12 18,2 35,2 L 45,2 C 62,2 70,12 68,25 L 75,45 C 77,52 75,85 75,90 C 75,94 72,96 68,96 L 68,102 C 68,106 63,108 58,108 L 54,108 C 49,108 46,105 46,101 L 46,96 L 34,96 L 34,101 C 34,105 31,108 26,108 L 22,108 C 17,108 12,106 12,102 L 12,96 C 8,96 5,94 5,90 C 5,85 3,52 5,45 Z';

export const ParkingCanvas: React.FC<ParkingCanvasProps> = ({
  spots,
  activeBookings,
  selectedSpotId,
  matchingSpotIds,
  isFilteringActive,
  onSelectSpot,
  floor,
  theme
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [stageWidth, setStageWidth] = useState<number>(780);

  const BASE_WIDTH = 780;
  const BASE_HEIGHT = 440;

  const floorSpots = spots.filter((s) => s.floor === floor);

  // Dynamic stage scaling listener using ResizeObserver for fluid mobile/tablet responsiveness
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const availableWidth = containerRef.current.clientWidth - 32;
        const newScale = Math.min(1.2, Math.max(0.35, availableWidth / BASE_WIDTH));
        setScale(newScale);
        setStageWidth(availableWidth);
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const isLight = theme === 'light';

  return (
    <div
      ref={containerRef}
      className="glass-panel"
      style={{
        padding: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        width: '100%'
      }}
    >
      {/* Floor Plan Header Indicator */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              boxShadow: '0 0 10px var(--color-primary)'
            }}
          />
          <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0 }}>
            Denah Interaktif Lantai {floor}
          </h3>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Klik slot untuk memesan / melihat detail
        </div>
      </div>

      {/* Konva Stage Canvas */}
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          display: 'flex',
          justifyContent: 'center',
          paddingBottom: '4px'
        }}
      >
        <Stage width={BASE_WIDTH * scale} height={BASE_HEIGHT * scale} scaleX={scale} scaleY={scale}>
          <Layer>
            {/* Asphalt Ground */}
            <Rect
              x={0}
              y={0}
              width={BASE_WIDTH}
              height={BASE_HEIGHT}
              fill={isLight ? '#1e293b' : '#0d1424'}
              cornerRadius={12}
            />

            {/* Central Driving Lane */}
            <Rect
              x={20}
              y={165}
              width={740}
              height={90}
              fill={isLight ? '#0f172a' : '#141e33'}
              cornerRadius={6}
            />

            {/* Yellow Dashed Lane Line */}
            <Line
              points={[40, 210, 740, 210]}
              stroke="#f59e0b"
              strokeWidth={3}
              dash={[16, 12]}
              opacity={0.85}
            />

            {/* Entry / Exit Tags */}
            <Group x={30} y={175}>
              <Rect width={42} height={20} fill="#059669" cornerRadius={4} />
              <Text x={6} y={4} text="MASUK" fontSize={9} fontStyle="bold" fill="#ffffff" />
            </Group>

            <Group x={708} y={225}>
              <Rect width={44} height={20} fill="#dc2626" cornerRadius={4} />
              <Text x={6} y={4} text="KELUAR" fontSize={9} fontStyle="bold" fill="#ffffff" />
            </Group>

            {/* Directional Lane Arrows */}
            <Path data="M 120 205 L 140 210 L 120 215 Z" fill="#f59e0b" opacity={0.8} />
            <Path data="M 380 205 L 400 210 L 380 215 Z" fill="#f59e0b" opacity={0.8} />
            <Path data="M 640 205 L 660 210 L 640 215 Z" fill="#f59e0b" opacity={0.8} />

            {/* Render 12 Parking Spots */}
            {floorSpots.map((spot) => {
              const isSelected = spot.id === selectedSpotId;
              const isOccupied = spot.status === 'occupied';
              const isMatch = matchingSpotIds.has(spot.id);

              // Filter Dimming Logic: Dim non-matching spots when filtering is active
              const opacity = isFilteringActive ? (isMatch ? 1 : 0.22) : 1;

              const activeBooking = activeBookings.find((b) => b.spotId === spot.id && b.status === 'active');

              const spotWidth = 95;
              const spotHeight = 105;

              let strokeColor = '#10b981';
              let fillColor = 'rgba(16, 185, 129, 0.12)';

              if (isOccupied) {
                strokeColor = '#ef4444';
                fillColor = 'rgba(239, 68, 68, 0.15)';
              }

              if (isSelected) {
                strokeColor = '#f59e0b';
                fillColor = 'rgba(245, 158, 11, 0.28)';
              }

              // Highlight matched search spots with cyan/blue glow
              if (isFilteringActive && isMatch && !isSelected) {
                strokeColor = '#38bdf8';
              }

              return (
                <Group
                  key={spot.id}
                  x={spot.x}
                  y={spot.y}
                  opacity={opacity}
                  onClick={() => onSelectSpot(spot)}
                  onTap={() => onSelectSpot(spot)}
                  onMouseEnter={(e) => {
                    const stage = e.target.getStage();
                    if (stage) stage.container().style.cursor = 'pointer';
                  }}
                  onMouseLeave={(e) => {
                    const stage = e.target.getStage();
                    if (stage) stage.container().style.cursor = 'default';
                  }}
                >
                  {/* Parking Bay Box */}
                  <Rect
                    width={spotWidth}
                    height={spotHeight}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isSelected ? 3.5 : isFilteringActive && isMatch ? 3 : 2}
                    cornerRadius={8}
                    dash={isOccupied ? [] : [6, 4]}
                    shadowColor={isSelected ? '#f59e0b' : isFilteringActive && isMatch ? '#38bdf8' : isOccupied ? '#ef4444' : '#10b981'}
                    shadowBlur={isSelected ? 16 : isFilteringActive && isMatch ? 12 : isOccupied ? 6 : 4}
                    shadowOpacity={0.5}
                  />

                  {/* Spot Code Header Tag */}
                  <Rect
                    x={4}
                    y={4}
                    width={spotWidth - 8}
                    height={20}
                    fill="rgba(15, 23, 42, 0.9)"
                    cornerRadius={4}
                  />
                  <Text
                    x={8}
                    y={8}
                    width={spotWidth - 16}
                    text={spot.code}
                    fontSize={11}
                    fontStyle="bold"
                    fill={isSelected ? '#fbbf24' : isFilteringActive && isMatch ? '#38bdf8' : isOccupied ? '#f87171' : '#34d399'}
                    align="center"
                  />

                  {/* Occupied vs Available Graphics */}
                  {isOccupied ? (
                    <Group x={12} y={36}>
                      {/* Red Car Vector */}
                      <Path
                        data={CAR_SVG_PATH}
                        fill="#dc2626"
                        scaleX={0.9}
                        scaleY={0.54}
                      />
                      <Rect x={18} y={16} width={34} height={20} fill="#0f172a" cornerRadius={3} />
                      <Rect x={22} y={18} width={26} height={16} fill="#38bdf8" opacity={0.7} cornerRadius={2} />

                      {/* License Plate Badge */}
                      {activeBooking && (
                        <Group x={6} y={39}>
                          <Rect
                            width={58}
                            height={14}
                            fill="#ffffff"
                            stroke="#000000"
                            strokeWidth={1}
                            cornerRadius={2}
                          />
                          <Text
                            x={2}
                            y={3}
                            width={54}
                            text={activeBooking.licensePlate}
                            fontSize={7}
                            fontStyle="bold"
                            fill="#000000"
                            align="center"
                          />
                        </Group>
                      )}
                    </Group>
                  ) : (
                    <Group x={18} y={40}>
                      <Path
                        data={CAR_SVG_PATH}
                        stroke={isSelected ? '#fbbf24' : isFilteringActive && isMatch ? '#38bdf8' : '#10b981'}
                        strokeWidth={1.5}
                        fill="transparent"
                        scaleX={0.75}
                        scaleY={0.48}
                        opacity={0.5}
                      />
                      <Text
                        x={-10}
                        y={42}
                        width={80}
                        text={isSelected ? 'DIPILIH' : 'TERSEDIA'}
                        fontSize={9}
                        fontStyle="bold"
                        fill={isSelected ? '#fbbf24' : isFilteringActive && isMatch ? '#38bdf8' : '#34d399'}
                        align="center"
                      />
                    </Group>
                  )}
                </Group>
              );
            })}
          </Layer>
        </Stage>
      </div>

      {/* Map Legend */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          marginTop: '12px',
          paddingTop: '8px',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.8rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '3px',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '1.5px solid #10b981'
            }}
          />
          <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>Tersedia</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '3px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1.5px solid #ef4444'
            }}
          />
          <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>Terisi / Terpesan</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '3px',
              backgroundColor: 'rgba(245, 158, 11, 0.3)',
              border: '1.5px solid #f59e0b'
            }}
          />
          <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>Sedang Dipilih</span>
        </div>
        {isFilteringActive && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                backgroundColor: 'rgba(56, 189, 248, 0.3)',
                border: '1.5px solid #38bdf8'
              }}
            />
            <span style={{ color: '#0284c7', fontWeight: 700 }}>Hasil Pencarian</span>
          </div>
        )}
      </div>
    </div>
  );
};
