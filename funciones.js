// Elementos
const mobileToggle = document.getElementById('mobileToggle');
const mobileMenu = document.getElementById('mobileMenu');
const navLinks = Array.from(document.querySelectorAll('.nav-link'));


// Toggle menú móvil 
if (mobileToggle && mobileMenu) {
  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.textContent = '☰';
  }

  function openMobileMenu() {
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileToggle.setAttribute('aria-expanded', 'true');
    mobileToggle.textContent = '✕';
  }

  mobileToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // Cerrar al hacer click fuera del menú (mejora UX)
  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !mobileToggle.contains(e.target) && mobileMenu.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  // Mantén cierre con ESC (ya lo tenías; ajustamos para usar closeMobileMenu)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMobileMenu();
    }
  });
}
// Cerrar menú móvil al seleccionar enlace (mejora UX)
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    // comportamiento normal de anchor se mantiene (smooth scroll por CSS)
    if (window.innerWidth <= 900 && mobileMenu) {
      mobileMenu.style.display = 'none';
      mobileMenu.setAttribute('aria-hidden', 'true');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.textContent = '☰';
    }
  });
});

// === Resaltar página actual por URL ===
const currentPage = window.location.pathname.split('/').pop();

navLinks.forEach(link => {
  const linkPage = link.getAttribute('href');
  if (linkPage === currentPage) {
    link.classList.add('active');
  }
});

// Mejor manejo de accesibilidad: cerrar menú con ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (mobileMenu && mobileMenu.style.display !== 'none') {
      mobileMenu.style.display = 'none';
      mobileMenu.setAttribute('aria-hidden', 'true');
      if (mobileToggle) {
        mobileToggle.textContent = '☰';
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    }
  }
});