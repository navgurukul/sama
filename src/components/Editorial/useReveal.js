import { useEffect } from 'react';

export default function useReveal() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function show(el) {
      el.classList.add('in');
      const trackBar = el.querySelector('.track i');
      if (trackBar && trackBar.dataset.w) {
        trackBar.style.width = trackBar.dataset.w;
      }
    }

    if (reduce || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(show);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);
}
