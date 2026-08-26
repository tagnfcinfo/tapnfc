// TapNFC - Shared UI Interactions
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  let backdrop = document.querySelector('.nav-backdrop');

  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);
  }

  let lockedScrollY = 0;

  // "overflow: hidden" da solo non blocca lo scroll touch su iOS Safari.
  // Blocchiamo davvero la pagina fissando il body nella posizione corrente
  // e la ripristiniamo alla chiusura: cosi' quando il menu e' aperto puo'
  // scorrere solo il contenuto interno del menu (.nav-links ha overflow-y: auto).
  function lockBodyScroll() {
    lockedScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
  }

  function unlockBodyScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, lockedScrollY);
  }

  function toggleMenu(forceClose = false) {
    if (!toggle || !navLinks) return;
    const isOpen = forceClose ? false : !navLinks.classList.contains('is-open');
    navLinks.classList.toggle('is-open', isOpen);
    toggle.classList.toggle('is-active', isOpen);
    backdrop.classList.toggle('is-active', isOpen);
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    if (isOpen) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
  }

  if (toggle) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => toggleMenu(true));
  }

  if (navLinks) {
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => toggleMenu(true));
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks && navLinks.classList.contains('is-open')) {
      toggleMenu(true);
    }
  });

  // Touch Swipe Gesture Support for Mobile Drawer
  let startX = 0;
  let startY = 0;
  let isTracking = false;

  document.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isTracking = true;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!isTracking || e.touches.length !== 1) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startX;
    const diffY = currentY - startY;

    // Fast trigger on distinct horizontal swipe
    if (window.innerWidth <= 900 && Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
      const isOpen = navLinks && navLinks.classList.contains('is-open');

      // Swipe left anywhere on the right portion of the screen (or header) at ANY page height
      if (!isOpen && diffX < -35 && (startX > window.innerWidth * 0.35 || startY < 140)) {
        isTracking = false;
        toggleMenu(false);
      }
      // Swipe right anywhere when open to CLOSE
      else if (isOpen && diffX > 35) {
        isTracking = false;
        toggleMenu(true);
      }
    }
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (!isTracking) return;
    isTracking = false;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - startX;
    const diffY = endY - startY;

    if (window.innerWidth <= 900 && Math.abs(diffX) > 30 && Math.abs(diffX) > Math.abs(diffY)) {
      const isOpen = navLinks && navLinks.classList.contains('is-open');
      if (!isOpen && diffX < -30 && (startX > window.innerWidth * 0.35 || startY < 140)) {
        toggleMenu(false);
      } else if (isOpen && diffX > 30) {
        toggleMenu(true);
      }
    }
  }, { passive: true });
});