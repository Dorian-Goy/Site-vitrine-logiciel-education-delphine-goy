// =========================================================
// APP.JS - Beginner-friendly behavior script
// =========================================================
// This file does 2 things only:
// 1) Handle mobile menu open/close state (burger <-> cross + side menu)
// 2) Reveal testimonial quote text only after cursive font is ready
//
// Why this matters:
// - If the menu state is not controlled, mobile navigation cannot be opened/closed.
// - If the font loads late, text can "flash" in a default font/size first.
// =========================================================

// --- Mobile menu toggle references ---
// We target the button and the nav list by their IDs from index.html.
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

// Safety check: run menu logic only if both elements exist in the page.
if (menuToggle && navMenu) {
  // Click on burger/cross button:
  // - Toggle .active on button -> CSS animates burger to cross
  // - Toggle .active on nav menu -> CSS slides menu panel in/out
  menuToggle.addEventListener('click', function() {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });
  
  // Better UX on mobile:
  // When user clicks a menu link, close the side menu automatically.
  // This avoids keeping the panel open after navigation.
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function() {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
}

// --- Testimonial text reveal after font loading ---
// In CSS, .testimonial-text starts with visibility: hidden.
// We reveal it only when "Dancing Script" is available.
// Result: cleaner first paint and less visual jump.
if (document.fonts) {
  // Modern browsers: explicitly load the font, then reveal text.
  document.fonts.load('1em "Dancing Script"').then(function() {
    document.querySelectorAll('.testimonial-text').forEach(el => {
      el.style.visibility = 'visible';
    });
  });
} else {
  // Fallback for older browsers that do not support document.fonts.
  // We wait until full page load + a tiny delay, then reveal text.
  window.addEventListener('load', function() {
    setTimeout(() => {
      document.querySelectorAll('.testimonial-text').forEach(el => {
        el.style.visibility = 'visible';
      });
    }, 200);
  });
}