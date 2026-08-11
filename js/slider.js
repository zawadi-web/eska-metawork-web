/* ESKA METALWORKS – slider.js */
(function () {
  'use strict';

  /* ── Hero Slider ──────────────────────────────────────────── */
  const heroSlider = document.querySelector('.hero-slider');
  if (heroSlider) {
    const slides = heroSlider.querySelectorAll('.hero-slide');
    const dots   = heroSlider.querySelectorAll('.hero-slider__dot');
    const track  = heroSlider.querySelector('.hero-slider__track');
    const prev   = heroSlider.querySelector('.hero-slider__prev');
    const next   = heroSlider.querySelector('.hero-slider__next');
    let current  = 0;
    let timer    = null;
    let startX   = 0;
    let isDragging = false;

    function goTo(index) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
      track.style.transform = `translateX(-${current * 100}%)`;
    }

    function startAuto() {
      if (window.matchMedia('(max-width: 900px)').matches) return;
      timer = setInterval(() => goTo(current + 1), 8000);
    }

    function stopAuto() {
      clearInterval(timer);
      timer = null;
    }

    function resetAuto() {
      stopAuto();
      startAuto();
    }

    // Init
    slides[0].classList.add('active');
    dots[0].classList.add('active');
    startAuto();

    window.addEventListener('resize', () => {
      stopAuto();
      startAuto();
    });

    prev.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    next.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { goTo(i); resetAuto(); });
    });

    // Pause on hover
    heroSlider.addEventListener('mouseenter', stopAuto);
    heroSlider.addEventListener('mouseleave', startAuto);

    // Touch / Swipe support
    heroSlider.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      stopAuto();
    }, { passive: true });

    heroSlider.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      const diffX = startX - e.changedTouches[0].clientX;
      if (Math.abs(diffX) > 50) {
        goTo(diffX > 0 ? current + 1 : current - 1);
      }
      isDragging = false;
      startAuto();
    }, { passive: true });

    // Keyboard arrow support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { goTo(current - 1); resetAuto(); }
      if (e.key === 'ArrowRight') { goTo(current + 1); resetAuto(); }
    });
  }

  /* ── Testimonials Slider ───────────────────────────────────── */
  const testiSlider = document.querySelector('.testimonials-slider');
  if (testiSlider) {
    const track = testiSlider.querySelector('.testimonials-track');
    const slides = testiSlider.querySelectorAll('.testimonials-slide');
    const dots  = testiSlider.querySelectorAll('.testimonials-dot');
    const prevBtn = testiSlider.querySelector('.testimonials-btn--prev');
    const nextBtn = testiSlider.querySelector('.testimonials-btn--next');
    let current = 0;
    let timer = null;
    let startX = 0;

    function goTo(index) {
      dots[current].classList.remove('active');
      current = (index + slides.length) % slides.length;
      dots[current].classList.add('active');
      track.style.transform = `translateX(-${current * 100}%)`;
    }

    function startAuto() {
      timer = setInterval(() => goTo(current + 1), 6000);
    }

    function resetAuto() {
      clearInterval(timer);
      startAuto();
    }

    dots[0].classList.add('active');
    startAuto();

    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); resetAuto(); }));

    // Touch swipe
    testiSlider.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      clearInterval(timer);
    }, { passive: true });

    testiSlider.addEventListener('touchend', (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
      startAuto();
    }, { passive: true });
  }

})();
