console.log('app.js loaded');

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

if (menuToggle && navMenu) {
  menuToggle.addEventListener('click', function() {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });
  
  // Close menu when a link is clicked
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function() {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
}

// this file no longer handles positioning; CSS now defines fixed coordinates
// It now also waits for the cursive font to load before showing quotes.

console.log('app.js loaded (no positioning logic)');

// Reveal testimonials when the Dancing Script font is available
if (document.fonts) {
  document.fonts.load('1em "Dancing Script"').then(function() {
    document.querySelectorAll('.testimonial-text').forEach(el => {
      el.style.visibility = 'visible';
    });
  });
} else {
  // fallback: just show them after a short timeout
  window.addEventListener('load', function() {
    setTimeout(() => {
      document.querySelectorAll('.testimonial-text').forEach(el => {
        el.style.visibility = 'visible';
      });
    }, 200);
  });
}