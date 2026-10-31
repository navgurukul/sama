import React, { useState, useEffect } from 'react';

export default function AutoCarousel({ images = [], alt = "", interval = 4500, className = "" }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [images, interval]);

  if (!images.length) return null;

  return (
    <div className={`carousel ${className}`}>
      {images.map((src, idx) => (
        <img
          key={idx}
          src={src}
          alt={alt}
          className={idx === currentIndex ? "on" : ""}
          loading="lazy"
        />
      ))}
      {images.length > 1 && (
        <div className="dots">
          {images.map((_, idx) => (
            <i key={idx} className={idx === currentIndex ? "on" : ""} />
          ))}
        </div>
      )}
    </div>
  );
}
