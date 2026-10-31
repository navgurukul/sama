import React, { useState, useEffect, useRef } from 'react';

export default function BfgSlider({ slides = [], interval = 5000 }) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);

  const total = slides.length;

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, interval);
    return () => clearInterval(timer);
  }, [total, interval]);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % total);
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  if (!total) return null;

  return (
    <div
      className="slider reveal"
      id="bfg-slider"
      aria-roledescription="carousel"
      aria-label="Build for Good 2026 photos"
    >
      <div
        className="slider__track"
        style={{ transform: `translateX(${-100 * current}%)` }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {slides.map((s, idx) => (
          <figure className="slider__slide" key={idx}>
            <img src={s.src} alt={s.alt || `Build for Good finale photo ${idx + 1}`} loading="lazy" />
          </figure>
        ))}
      </div>

      <button
        type="button"
        className="slider__btn slider__btn--prev"
        aria-label="Previous photo"
        onClick={handlePrev}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <button
        type="button"
        className="slider__btn slider__btn--next"
        aria-label="Next photo"
        onClick={handleNext}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      <div className="slider__dots">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            className={idx === current ? "on" : ""}
            aria-label={`Photo ${idx + 1}`}
            onClick={() => setCurrent(idx)}
          />
        ))}
      </div>
    </div>
  );
}
