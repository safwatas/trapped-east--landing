import React, { useState, useEffect, useMemo } from 'react';

/**
 * HeroBackgroundCarousel
 * 
 * A performant background image carousel for the hero section.
 * Features:
 * - Cross-fade transitions between room images
 * - Subtle Ken Burns (zoom) effect
 * - Respects prefers-reduced-motion
 * - Lazy loads non-first images
 * - No CLS - images are positioned absolute
 */

export default function HeroBackgroundCarousel({ roomImages = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoaded, setIsLoaded] = useState([true]); // First image loads eagerly

    // Check for reduced motion preference
    const prefersReducedMotion = useMemo(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }, []);

    // Fallback images if no rooms loaded yet
    const images = useMemo(() => {
        if (roomImages.length === 0) {
            return ['https://trappedegypt.com/wp-content/uploads/2022/11/TRAPPED-NEW-CAIRO-ROOMS.jpg.webp'];
        }
        return roomImages;
    }, [roomImages]);

    // Auto-advance carousel (reduced motion = static)
    useEffect(() => {
        if (prefersReducedMotion || images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000); // 5 seconds per slide

        return () => clearInterval(interval);
    }, [images.length, prefersReducedMotion]);

    // Preload next image
    useEffect(() => {
        if (prefersReducedMotion || images.length <= 1) return;

        const nextIndex = (currentIndex + 1) % images.length;
        if (!isLoaded[nextIndex]) {
            const img = new Image();
            img.src = images[nextIndex];
            img.onload = () => {
                setIsLoaded(prev => {
                    const newLoaded = [...prev];
                    newLoaded[nextIndex] = true;
                    return newLoaded;
                });
            };
        }
    }, [currentIndex, images, isLoaded, prefersReducedMotion]);

    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Carousel slides */}
            {images.map((image, index) => {
                const isActive = index === currentIndex;
                const isPrev = index === (currentIndex - 1 + images.length) % images.length;
                const shouldRender = isActive || isPrev || isLoaded[index];

                if (!shouldRender && index !== 0) return null;

                return (
                    <div
                        key={index}
                        className={`
              absolute inset-0 transition-opacity duration-1000 ease-in-out
              ${isActive ? 'opacity-30 z-10' : 'opacity-0 z-0'}
            `}
                        style={{
                            backgroundImage: `url(${image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'grayscale(30%)',
                            // Ken Burns effect (subtle zoom)
                            animation: !prefersReducedMotion && isActive
                                ? 'kenBurns 6s ease-in-out forwards'
                                : 'none',
                            transform: prefersReducedMotion ? 'scale(1)' : undefined
                        }}
                        aria-hidden={!isActive}
                    />
                );
            })}

            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[color:var(--bg-base)] z-20" />

            {/* CSS for Ken Burns animation */}
            <style>{`
        @keyframes kenBurns {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.05);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-carousel-slide {
            animation: none !important;
            transform: scale(1) !important;
          }
        }
      `}</style>
        </div>
    );
}
