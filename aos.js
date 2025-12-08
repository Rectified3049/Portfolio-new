/* Lightweight AOS - aos.js
   - No dependencies. Uses IntersectionObserver.
   - Place <script src="aos.js" defer></script> in your HTML (preferably before main script).
   - Elements to animate: give them `data-aos="fade-up"` (or other names) and optional
     `data-aos-delay="120"` (ms), `data-aos-duration="800"` (ms), and `data-aos-easing="cubic-bezier(...)"`.
   - Animation triggers once per element (we unobserve after first reveal).
*/

(function () {
  'use strict';

  const defaultOptions = {
    offset: 0.12, // intersection threshold (fraction of element visible)
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.12
  };

  let observer = null;

  function applyStyles(el) {
    const delay = el.getAttribute('data-aos-delay');
    const dur = el.getAttribute('data-aos-duration');
    const easing = el.getAttribute('data-aos-easing');

    if (delay) el.style.transitionDelay = `${parseInt(delay, 10)}ms`;
    if (dur) el.style.transitionDuration = `${parseInt(dur, 10)}ms`;
    if (easing) el.style.transitionTimingFunction = easing;

    // For text-reveal children, apply duration/delay to inner .aos-text as well
    if (el.getAttribute('data-aos') === 'text-reveal') {
      const inner = el.querySelector('.aos-text');
      if (inner) {
        if (delay) inner.style.transitionDelay = `${parseInt(delay, 10)}ms`;
        if (dur) inner.style.transitionDuration = `${parseInt(dur, 10)}ms`;
        if (easing) inner.style.transitionTimingFunction = easing;
      }
    }
  }

  function onIntersect(entries, io) {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        // small async to allow CSS computed values to take effect
        requestAnimationFrame(() => {
          el.classList.add('aos-animate');
        });

        // Make sure it triggers only once
        io.unobserve(el);
      }
    });
  }

  function initAOS(opts = {}) {
    if (typeof window === 'undefined') return;

    const settings = Object.assign({}, defaultOptions, opts);

    // If user prefers reduced motion, simply reveal everything and skip observer
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const elements = Array.from(document.querySelectorAll('[data-aos]'));

    if (reduce) {
      elements.forEach(el => {
        applyStyles(el);
        el.classList.add('aos-animate');
      });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      // Fallback: reveal all
      elements.forEach(el => {
        applyStyles(el);
        el.classList.add('aos-animate');
      });
      return;
    }

    // Prepare each element (apply inline styles from attributes)
    elements.forEach(el => applyStyles(el));

    if (observer) observer.disconnect();

    observer = new IntersectionObserver(onIntersect, { root: null, rootMargin: settings.rootMargin, threshold: settings.threshold });

    elements.forEach(el => observer.observe(el));
  }

  // Expose global helpers
  window.AOSLite = {
    init: initAOS,
    refresh: function () {
      // useful if new elements are added dynamically
      initAOS();
    }
  };

  // Auto-init on DOMContentLoaded with defaults
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAOS());
  } else {
    initAOS();
  }

})();
