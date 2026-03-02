console.log('app.js loaded');

function normalize(val) {
  if (typeof val === 'number') return val + '%';
  if (typeof val === 'string') {
    let cleaned = val.trim();
    if (/^[0-9\.]+(%|px)$/.test(cleaned)) return cleaned;
    if (/^[0-9\.]+$/.test(cleaned)) return cleaned + '%';
    console.warn('testimonialCoords value invalid, using as-is:', val);
    return val;
  }
  return val;
}

function positionTestimonials() {
  console.log('positionTestimonials invoked');
  const testimonials = document.querySelectorAll('.testimonial');
  console.log('testimonials nodeList', testimonials);
  const testimonialCoords = {
    t1: { top: '20%', left: '85%' },
    t2: { top: '45%', left: '50%' },
    t3: { top: '65%', left: '30%' },
    t4: { top: '35%', left: '15%' }
  };

  testimonials.forEach((t) => {
    const cls = Array.from(t.classList).find(c => c.startsWith('t'));
    console.log('processing', t.className, '->', cls);
    if (cls && testimonialCoords[cls]) {
      let {top, left} = testimonialCoords[cls];
      top = normalize(top);
      left = normalize(left);
      console.log('placing', cls, {top,left});
      t.style.position = 'absolute';
      t.style.top = top;
      t.style.left = left;
      t.style.right = 'auto';
      t.style.bottom = 'auto';
      console.log('applied inline', t.style.top, t.style.left,
                  'computed', getComputedStyle(t).top, getComputedStyle(t).left);
    }
  });

  const testimonialLinks = document.querySelectorAll('.testimonial-link');
  testimonialLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const name = this.textContent.toLowerCase();
      window.location.href = `#profile/${name}`;
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', positionTestimonials);
} else {
  positionTestimonials();
}