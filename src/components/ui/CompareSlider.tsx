import { useState, useRef, useEffect } from "react";
import { cn } from "../../lib/utils";
import { MoveHorizontal } from "lucide-react";

interface CompareSliderProps {
  originalUrl: string;
  enhancedUrl: string;
  isZoomed?: boolean;
  className?: string;
}

export default function CompareSlider({ originalUrl, enhancedUrl, isZoomed = false, className }: CompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    const position = ((clientX - left) / width) * 100;
    setSliderPosition(Math.min(Math.max(position, 0), 100));
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className={cn("relative w-full overflow-hidden select-none touch-none", className)}
      onMouseDown={(e) => {
        handleMove(e.clientX);
        handleMouseDown();
      }}
      onTouchStart={(e) => {
        handleMove(e.touches[0].clientX);
        handleMouseDown();
      }}
    >
      {/* Enhanced Image (Background) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <img 
          src={enhancedUrl} 
          alt="Enhanced" 
          className={cn(
            "absolute inset-0 w-full h-full object-contain transition-transform duration-300 ease-out",
            isZoomed ? "scale-[2.5]" : "scale-100"
          )}
          draggable={false}
        />
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-medium tracking-wide z-10">
          ENHANCED
        </div>
      </div>

      {/* Original Image (Foreground, clipped) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      >
        <img 
          src={originalUrl} 
          alt="Original" 
          className={cn(
            "absolute inset-0 w-full h-full object-contain transition-transform duration-300 ease-out",
            isZoomed ? "scale-[2.5]" : "scale-100"
          )}
          style={{ imageRendering: "pixelated" }}
          draggable={false}
        />
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-medium tracking-wide z-10">
          ORIGINAL
        </div>
      </div>

      {/* Slider Line and Handle */}
      <div 
        className="absolute inset-y-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg cursor-ew-resize hover:scale-110 transition-transform">
          <MoveHorizontal className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
