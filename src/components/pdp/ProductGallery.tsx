'use client';

import React, { useState, useEffect } from 'react';
import { FormattedMedia } from '@/services/product-detail.service';
import { Maximize2, ChevronLeft, ChevronRight, X, Image as ImageIcon } from 'lucide-react';

interface ProductGalleryProps {
  media: FormattedMedia[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ media, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [imgErrorMap, setImgErrorMap] = useState<{ [id: string]: boolean }>({});

  const safeMedia = media.length > 0 ? media : [
    {
      id: 'fallback',
      mediaUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
      altText: productName,
      displayOrder: 1,
      isPrimary: true,
    },
  ];

  const currentMedia = safeMedia[selectedIndex] || safeMedia[0];

  // Handle keyboard navigation in Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, safeMedia.length]);

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? safeMedia.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === safeMedia.length - 1 ? 0 : prev + 1));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="flex flex-col gap-4 w-full select-none">
      {/* Primary Image Viewport */}
      <div
        className="relative aspect-4/3 w-full bg-[var(--mq-surface-muted)] rounded-2xl overflow-hidden border border-[var(--mq-border)] shadow-xs group cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setIsLightboxOpen(true)}
      >
        {!imgErrorMap[currentMedia.id] ? (
          <img
            src={currentMedia.mediaUrl}
            alt={currentMedia.altText || productName}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isZoomed ? 'scale-150' : 'scale-100'
            }`}
            style={
              isZoomed
                ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` }
                : undefined
            }
            onError={() => setImgErrorMap((prev) => ({ ...prev, [currentMedia.id]: true }))}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[var(--mq-text-tertiary)] bg-[var(--mq-surface-muted)] p-6 text-center">
            <ImageIcon className="w-12 h-12 mb-2 text-slate-400" />
            <span className="text-xs font-bold">{productName}</span>
            <span className="text-[10px] text-slate-400 mt-1">Image Preview Unavailable</span>
          </div>
        )}

        {/* Expand Lightbox Badge Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(true);
          }}
          className="absolute bottom-3 right-3 p-2.5 rounded-full bg-black/60 text-white backdrop-blur-md opacity-80 hover:opacity-100 transition-opacity"
          title="Full-screen Lightbox View"
          aria-label="Open Fullscreen Gallery Lightbox"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Image Index Indicator Tag */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-md text-[10px] font-bold text-white tracking-wider">
          {selectedIndex + 1} / {safeMedia.length}
        </div>
      </div>

      {/* Thumbnail Navigation List */}
      {safeMedia.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {safeMedia.map((m, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={m.id || idx}
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[var(--mq-secondary)] ring-2 ring-[var(--mq-secondary)]/30 scale-105'
                    : 'border-[var(--mq-border)] opacity-70 hover:opacity-100'
                }`}
                aria-label={`Select media thumbnail ${idx + 1}`}
              >
                {!imgErrorMap[m.id] ? (
                  <img
                    src={m.mediaUrl}
                    alt={m.altText || `${productName} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--mq-surface-muted)] flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Full-Screen Lightbox Modal Overlay */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-8 mq-animate-fade-in">
          {/* Lightbox Header Controls */}
          <div className="w-full flex items-center justify-between text-white border-b border-white/10 pb-4">
            <div>
              <h4 className="font-bold text-sm sm:text-base text-white line-clamp-1">{productName}</h4>
              <span className="text-xs text-slate-400">
                Image {selectedIndex + 1} of {safeMedia.length}
              </span>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              aria-label="Close Lightbox (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Center Image Viewport */}
          <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-4 overflow-hidden">
            {!imgErrorMap[currentMedia.id] ? (
              <img
                src={currentMedia.mediaUrl}
                alt={currentMedia.altText || productName}
                className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
            ) : (
              <div className="text-white text-center">
                <ImageIcon className="w-16 h-16 mx-auto mb-2 text-slate-500" />
                <p className="text-sm font-semibold">Image file failed to render</p>
              </div>
            )}

            {/* Previous Button */}
            {safeMedia.length > 1 && (
              <button
                onClick={handlePrev}
                className="absolute left-2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next Button */}
            {safeMedia.length > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Lightbox Footer Alt Text */}
          <div className="text-center text-xs text-slate-300 max-w-xl">
            {currentMedia.altText || productName}
          </div>
        </div>
      )}
    </div>
  );
};
