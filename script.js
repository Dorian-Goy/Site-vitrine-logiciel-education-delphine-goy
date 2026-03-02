document.addEventListener('DOMContentLoaded', function () {
  const items = document.querySelectorAll('.q-item');

  function applyOffsets() {
    const w = window.innerWidth;
    let range = 22; // default for desktop
    if (w <= 600) range = 0; // no random offsets on small screens
    else if (w <= 900) range = 12; // smaller offsets on tablet

    items.forEach((el, i) => {
      const dx = Math.round(Math.random() * (range * 2) - range);
      const dy = Math.round(Math.random() * (range * 0.7 * 2) - range * 0.7);
      el.style.setProperty('--tx', dx + 'px');
      el.style.setProperty('--ty', dy + 'px');
      el.style.zIndex = 20 + i;
    });
  }

  applyOffsets();

  // reapply offsets on resize (debounced)
  let rTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(rTimer);
    rTimer = setTimeout(applyOffsets, 120);
  });
});
