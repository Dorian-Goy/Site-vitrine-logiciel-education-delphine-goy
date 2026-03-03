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

// --- Discover gate reveal (show full page only after click) ---
const discoverTrigger = document.getElementById('discoverTrigger');

if (discoverTrigger) {
  discoverTrigger.addEventListener('click', function (event) {
    event.preventDefault();

    if (document.body.classList.contains('discover-revealed') ||
        document.body.classList.contains('discovering')) {
      return;
    }

    // Step 1: collapse dots in place — no camera movement
    document.body.classList.remove('pre-discover');
    document.body.classList.add('discovering');
    discoverTrigger.setAttribute('aria-expanded', 'true');

    // Step 2: after collapse finishes, shoot footer downward
    window.setTimeout(function () {
      document.body.classList.add('footer-shooting');

      // Step 3: after footer shoots off, reveal site and jump to content
      window.setTimeout(function () {
        document.body.classList.add('discover-revealed');

        const firstRevealedSection = document.querySelector('.trust-strip');
        if (firstRevealedSection) {
          firstRevealedSection.scrollIntoView({ behavior: 'instant', block: 'start' });
        }

        // Release footer back to normal flow (it's now at the real bottom)
        window.setTimeout(function () {
          document.body.classList.remove('discovering');
          document.body.classList.remove('footer-shooting');
        }, 50);
      }, 290);
    }, 1750);
  });
}

// --- Reviews display logic (featured + filters + show more) ---
// Modes:
// 1) Base mode: featured top 5 using star priorities.
// 2) Filter mode: only one star level, sorted by most recent first.
// In both modes:
// - "afficher plus" reveals next 5
// - "afficher moins" resets to the initial 5 of the active mode.
const commentsList = document.getElementById('commentsList');
const showMoreReviewsBtn = document.getElementById('showMoreReviewsBtn');
const showLessReviewsBtn = document.getElementById('showLessReviewsBtn');
const reviewsSummary = document.querySelector('.reviews-summary');
const ratingRows = Array.from(document.querySelectorAll('.rating-breakdown .rating-row'));

function parseFrenchDateToTime(dateText) {
  // Expected text like: "Publié le 03/03/2026"
  const match = dateText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) {
    return 0;
  }

  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  const year = Number(match[3]);
  return new Date(year, month, day).getTime();
}

if (commentsList && showMoreReviewsBtn && showLessReviewsBtn && reviewsSummary && ratingRows.length > 0) {
  const cards = Array.from(commentsList.querySelectorAll('.comment-card'));

  const enrichedCards = cards.map((card, index) => {
    const stars = card.querySelectorAll('.review-stars .star.filled').length;
    const dateNode = card.querySelector('.comment-date');
    const dateTime = dateNode ? parseFrenchDateToTime(dateNode.textContent) : 0;
    const imageCount = card.querySelectorAll('.comment-photo').length;

    return {
      card,
      stars,
      dateTime,
      imageCount,
      originalIndex: index
    };
  });

  const batchSize = 5;
  let currentInitial = [];
  let currentQueue = [];
  let cursor = 0;

  const resetReviewsBtn = document.createElement('button');
  resetReviewsBtn.type = 'button';
  resetReviewsBtn.className = 'reset-reviews-btn';
  resetReviewsBtn.textContent = 'affiche tous les commentaires';
  reviewsSummary.appendChild(resetReviewsBtn);

  function sortByDateDesc(items) {
    return items.sort((a, b) => {
      if (b.dateTime !== a.dateTime) {
        return b.dateTime - a.dateTime;
      }
      return a.originalIndex - b.originalIndex;
    });
  }

  function sortByImagesThenDate(items) {
    return items.sort((a, b) => {
      if (b.imageCount !== a.imageCount) {
        return b.imageCount - a.imageCount;
      }
      if (b.dateTime !== a.dateTime) {
        return b.dateTime - a.dateTime;
      }
      return a.originalIndex - b.originalIndex;
    });
  }

  function computeBaseState() {
    const maxStars = enrichedCards.reduce((acc, item) => Math.max(acc, item.stars), 0);
    const featured = [];
    const selected = new Set();

    const maxLevelCandidates = sortByImagesThenDate(
      enrichedCards.filter(item => item.stars === maxStars)
    );

    if (maxLevelCandidates.length > 0) {
      featured.push(maxLevelCandidates[0]);
      selected.add(maxLevelCandidates[0].originalIndex);
    }

    let secondLevel = null;
    for (let level = maxStars - 1; level >= 1; level--) {
      const hasLevel = enrichedCards.some(item => item.stars === level);
      if (hasLevel) {
        secondLevel = level;
        break;
      }
    }

    if (secondLevel !== null) {
      const secondCandidates = sortByImagesThenDate(
        enrichedCards.filter(item => item.stars === secondLevel && !selected.has(item.originalIndex))
      );

      if (secondCandidates.length > 0) {
        featured.push(secondCandidates[0]);
        selected.add(secondCandidates[0].originalIndex);
      }
    }

    const remainingPriority = enrichedCards
      .filter(item => !selected.has(item.originalIndex))
      .sort((a, b) => {
        if (b.stars !== a.stars) {
          return b.stars - a.stars;
        }
        if (b.imageCount !== a.imageCount) {
          return b.imageCount - a.imageCount;
        }
        if (b.dateTime !== a.dateTime) {
          return b.dateTime - a.dateTime;
        }
        return a.originalIndex - b.originalIndex;
      });

    for (const item of remainingPriority) {
      if (featured.length >= 5) {
        break;
      }
      featured.push(item);
      selected.add(item.originalIndex);
    }

    const remainingByDate = sortByDateDesc(
      enrichedCards.filter(item => !selected.has(item.originalIndex))
    );

    return {
      initial: featured,
      queue: remainingByDate
    };
  }

  function computeFilteredState(stars) {
    const filtered = sortByDateDesc(
      enrichedCards.filter(item => item.stars === stars)
    );

    return {
      initial: filtered.slice(0, batchSize),
      queue: filtered.slice(batchSize)
    };
  }

  function renderInitial(initialItems, queueItems) {
    currentInitial = initialItems;
    currentQueue = queueItems;
    cursor = 0;

    commentsList.innerHTML = '';
    currentInitial.forEach(item => commentsList.appendChild(item.card));
    updateButtonsState();
  }

  function setActiveRatingRow(targetStars) {
    ratingRows.forEach(row => {
      const label = row.querySelector('.rating-label');
      const match = label ? label.textContent.match(/(\d)/) : null;
      const rowStars = match ? Number(match[1]) : null;
      row.classList.toggle('rating-row-active', rowStars === targetStars);
    });
  }

  const baseState = computeBaseState();

  function updateButtonsState() {
    const hasMore = cursor < currentQueue.length;
    showMoreReviewsBtn.style.display = hasMore ? 'inline-block' : 'none';
    showMoreReviewsBtn.disabled = !hasMore;

    const hasExpanded = cursor > 0;
    showLessReviewsBtn.style.display = hasExpanded ? 'inline-block' : 'none';
    showLessReviewsBtn.disabled = !hasExpanded;
  }

  showMoreReviewsBtn.addEventListener('click', function () {
    const nextBatch = currentQueue.slice(cursor, cursor + batchSize);
    nextBatch.forEach(item => commentsList.appendChild(item.card));
    cursor += nextBatch.length;
    updateButtonsState();
  });

  showLessReviewsBtn.addEventListener('click', function () {
    renderInitial(currentInitial, currentQueue);
  });

  resetReviewsBtn.addEventListener('click', function () {
    renderInitial(baseState.initial, baseState.queue);
    setActiveRatingRow(null);
    resetReviewsBtn.classList.remove('is-visible');
  });

  ratingRows.forEach(row => {
    const label = row.querySelector('.rating-label');
    const match = label ? label.textContent.match(/(\d)/) : null;
    const stars = match ? Number(match[1]) : null;

    if (!stars) {
      return;
    }

    row.classList.add('rating-row-clickable');
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    row.setAttribute('aria-label', `Filtrer les avis ${stars} étoiles`);

    function applyFilter() {
      const filteredState = computeFilteredState(stars);
      renderInitial(filteredState.initial, filteredState.queue);
      setActiveRatingRow(stars);
      resetReviewsBtn.classList.add('is-visible');
    }

    row.addEventListener('click', applyFilter);
    row.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        applyFilter();
      }
    });
  });

  renderInitial(baseState.initial, baseState.queue);
}

// --- Custom rating select (yellow stars only) ---
const ratingSelect = document.getElementById('ratingSelect');
const ratingTrigger = document.getElementById('commentRatingTrigger');
const ratingHiddenInput = document.getElementById('commentRating');

if (ratingSelect && ratingTrigger && ratingHiddenInput) {
  const ratingOptions = Array.from(ratingSelect.querySelectorAll('.rating-option'));

  function closeRatingMenu() {
    ratingSelect.classList.remove('open');
    ratingTrigger.setAttribute('aria-expanded', 'false');
  }

  ratingTrigger.addEventListener('click', function () {
    const willOpen = !ratingSelect.classList.contains('open');
    ratingSelect.classList.toggle('open', willOpen);
    ratingTrigger.setAttribute('aria-expanded', String(willOpen));
  });

  ratingOptions.forEach(option => {
    option.addEventListener('click', function () {
      ratingOptions.forEach(item => item.setAttribute('aria-selected', 'false'));
      option.setAttribute('aria-selected', 'true');
      ratingTrigger.innerHTML = option.innerHTML;
      ratingHiddenInput.value = option.dataset.value || '5';
      closeRatingMenu();
    });
  });

  document.addEventListener('click', function (event) {
    if (!ratingSelect.contains(event.target)) {
      closeRatingMenu();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeRatingMenu();
    }
  });
}