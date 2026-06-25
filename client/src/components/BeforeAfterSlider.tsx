import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  linkTo?: string;
  linkLabel?: string;
}

const BeforeAfterSlider = ({
  beforeSrc,
  afterSrc,
  beforeLabel = 'Before',
  afterLabel = 'After',
  linkTo,
  linkLabel = 'View product',
}: BeforeAfterSliderProps) => {
  const [position, setPosition] = useState(50); // percentage 0–100
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  // Mouse
  const onMouseDown = () => { isDragging.current = true; };
  const onMouseMove = (e: React.MouseEvent) => { if (isDragging.current) updatePosition(e.clientX); };
  const onMouseUp   = () => { isDragging.current = false; };

  // Touch
  const onTouchMove = (e: React.TouchEvent) => { updatePosition(e.touches[0].clientX); };

  // Keyboard (accessibility)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft')  setPosition((p) => Math.max(0,   p - 2));
    if (e.key === 'ArrowRight') setPosition((p) => Math.min(100, p + 2));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl select-none cursor-col-resize"
      style={{ aspectRatio: '1 / 1' }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
    >
      {/* After image (full width, behind) */}
      <img
        src={afterSrc}
        alt={afterLabel}
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Before image (clipped to left of handle) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src={beforeSrc}
          alt={beforeLabel}
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: `${10000 / position}%`, maxWidth: 'none' }}
        />
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full pointer-events-none">
        {beforeLabel}
      </div>
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full pointer-events-none">
        {afterLabel}
      </div>

      {/* Divider line */}
      <div
        className="absolute inset-y-0 w-px bg-white/80 pointer-events-none"
        style={{ left: `${position}%` }}
      />

      {/* Handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
        style={{ left: `${position}%` }}
        onMouseDown={onMouseDown}
        onTouchStart={() => { isDragging.current = true; }}
        onTouchEnd={() => { isDragging.current = false; }}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="slider"
        aria-valuenow={Math.round(position)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Before/After slider"
      >
        <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing">
          <svg fill="none" width="26" height="26" viewBox="0 0 50 50">
            <path d="m19.25 19-6 6 6 6m11.5 0 6-6-6-6" stroke="#000" strokeWidth="2" strokeLinecap="square" />
          </svg>
        </div>
      </div>

      {/* Link overlay at the bottom */}
      {linkTo && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <Link
            to={linkTo}
            className="bg-amber-500 text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-amber-400 transition shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {linkLabel} →
          </Link>
        </div>
      )}
    </div>
  );
};

export default BeforeAfterSlider;
