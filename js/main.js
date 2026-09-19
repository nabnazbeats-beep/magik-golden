/**
 * STUDIOS MAGIK GOLDEN — SCRIPT PRINCIPAL
 * Interactions de prestige, Curseur Ambiant, Effet 3D Tilt, Comparateur Avant/Après,
 * Lightbox, Filtres, Calendrier Sur-Mesure & Réservation WhatsApp
 */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initNavbar();
  initHeroSlideshow();
  initCursorGlow();
  initTiltCards();
  initBeforeAfterSlider();
  initFocusTabs();
  initPortfolioFilters();
  initLightbox();
  initFaqAccordion();
  initCustomDatepicker();
  initBackToTop();
  initBookingForm();
  initScrollAnimations();
});

/**
 * Utilitaire d'échappement HTML pour prévenir toute faille XSS
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* --------------------------------------------------------------------------
   0. PRELOADER LUXE ÉDITORIAL & ENTRÉE SÉQUENCÉE HERO
   -------------------------------------------------------------------------- */
function initPreloader() {
  const preloader = document.getElementById('site-preloader');
  const bar = document.getElementById('preloader-bar');
  const percentEl = document.getElementById('preloader-percent');

  // Prépare les éléments de la Hero section pour leur apparition fluide
  document.body.classList.add('hero-stagger-ready');

  if (!preloader) {
    document.body.classList.add('hero-animated');
    return;
  }

  let progress = 0;
  const startTime = performance.now();
  const targetDuration = 1350; // 1.35s de chargement luxueux

  function triggerReveal() {
    preloader.classList.add('fade-out');
    // Déclenche l'apparition séquentielle échelonnée de la Hero Section
    setTimeout(() => {
      document.body.classList.add('hero-animated');
    }, 150);

    setTimeout(() => {
      preloader.style.display = 'none';
    }, 850);
  }

  function update() {
    const elapsed = performance.now() - startTime;
    const ratio = Math.min(elapsed / targetDuration, 1);
    const eased = 1 - Math.pow(1 - ratio, 2.5);
    progress = Math.min(100, Math.round(eased * 100));

    if (bar) bar.style.width = `${progress}%`;
    if (percentEl) percentEl.textContent = `${progress}%`;

    if (ratio < 1) {
      requestAnimationFrame(update);
    } else {
      setTimeout(triggerReveal, 180);
    }
  }

  requestAnimationFrame(update);

  // Sécurité anti-blocage : forcer la disparition après 2.2s au plus tard
  setTimeout(() => {
    if (!preloader.classList.contains('fade-out')) {
      triggerReveal();
    }
  }, 2200);
}

/* --------------------------------------------------------------------------
   1. NAVBAR SCROLL & MENU MOBILE
   -------------------------------------------------------------------------- */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  if (menuToggle && mobileDrawer) {
    function closeDrawer() {
      mobileDrawer.classList.remove('open');
      if (drawerBackdrop) drawerBackdrop.classList.remove('open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    function openDrawer() {
      mobileDrawer.classList.add('open');
      if (drawerBackdrop) drawerBackdrop.classList.add('open');
      menuToggle.classList.add('active');
      menuToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    if (drawerBackdrop) {
      drawerBackdrop.addEventListener('click', closeDrawer);
    }

    // Fermeture lors du clic sur un lien du menu mobile
    mobileDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    // Fermeture avec la touche Échap
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  }
}

/* --------------------------------------------------------------------------
   1b. DIAPORAMA D'ARRIÈRE-PLAN HERO (27 PHOTOGRAPHIES EN ROTATION FLUIDE)
   -------------------------------------------------------------------------- */
function initHeroSlideshow() {
  const slideshow = document.getElementById('hero-slideshow');
  if (!slideshow) return;

  const slides = [];
  for (let i = 1; i <= 27; i++) {
    const num = String(i).padStart(2, '0');
    slides.push(`assets/images/hero-diapo/hero-slide-${num}.webp`);
  }

  let currentIndex = 0;
  const slideElements = slideshow.querySelectorAll('.hero-slide');
  if (slideElements.length < 2) return;

  let activeSlide = slideElements[0];
  let nextSlide = slideElements[1];
  let intervalId = null;

  function advanceSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    const nextUrl = slides[currentIndex];

    // Preload image before initiating transition
    const preloader = new Image();
    preloader.src = nextUrl;
    preloader.onload = () => {
      nextSlide.style.backgroundImage = `url('${nextUrl}')`;
      nextSlide.classList.add('active');
      activeSlide.classList.remove('active');

      // Swap pointers
      const temp = activeSlide;
      activeSlide = nextSlide;
      nextSlide = temp;
    };
  }

  function start() {
    if (!intervalId) {
      intervalId = setInterval(advanceSlide, 3200);
    }
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  start();
}

/* --------------------------------------------------------------------------
   2. CURSEUR LUMINEUX AMBIANT AVEC LISSAGE PHYSIQUE (LERP)
   -------------------------------------------------------------------------- */
function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow || window.innerWidth < 768) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function animateGlow() {
    // Interpolation linéaire douce pour un mouvement organique
    currentX += (mouseX - currentX) * 0.08;
    currentY += (mouseY - currentY) * 0.08;

    glow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateGlow);
  }

  requestAnimationFrame(animateGlow);
}

/* --------------------------------------------------------------------------
   3. INCLINAISON 3D PERSPECTIVE DES CARTES (TILT EFFECT)
   -------------------------------------------------------------------------- */
function initTiltCards() {
  if (window.innerWidth < 1024) return;

  const cards = document.querySelectorAll('.tilt-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Inclinaison douce max 5-6 degrés
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.012, 1.012, 1.012)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

/* --------------------------------------------------------------------------
   4. COMPARATEUR INTERACTIF AVANT / APRÈS RETOUCHE
   -------------------------------------------------------------------------- */
function initBeforeAfterSlider() {
  const container = document.getElementById('before-after-box');
  const overlay = document.getElementById('before-overlay');
  const handle = document.getElementById('before-handle');

  if (!container || !overlay || !handle) return;

  const beforeImg = overlay.querySelector('img');

  function syncDimensions() {
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    container.style.setProperty('--slider-width', `${width}px`);
    if (beforeImg) {
      beforeImg.style.width = `${width}px`;
      beforeImg.style.height = `${height}px`;
    }
  }

  syncDimensions();
  window.addEventListener('resize', syncDimensions);

  const afterImg = container.querySelector('.after-img');
  if (afterImg) afterImg.addEventListener('load', syncDimensions);
  if (beforeImg) beforeImg.addEventListener('load', syncDimensions);

  let isDragging = false;

  function updateSlider(x) {
    const rect = container.getBoundingClientRect();
    let position = ((x - rect.left) / rect.width) * 100;
    if (position < 0) position = 0;
    if (position > 100) position = 100;

    overlay.style.width = `${position}%`;
    handle.style.left = `${position}%`;
  }

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    syncDimensions();
    updateSlider(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updateSlider(e.clientX);
  });

  // Support tactile pour mobile & tablettes
  container.addEventListener('touchstart', (e) => {
    if (!e.touches || !e.touches[0]) return;
    isDragging = true;
    syncDimensions();
    updateSlider(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  window.addEventListener('touchcancel', () => {
    isDragging = false;
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || !e.touches || !e.touches[0]) return;
    updateSlider(e.touches[0].clientX);
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   5. FOCUS SECTION / ACCORDÉON DES EXPERTISES
   -------------------------------------------------------------------------- */
function initFocusTabs() {
  const tabItems = document.querySelectorAll('.focus-tab-item');
  if (!tabItems.length) return;

  tabItems.forEach(item => {
    item.addEventListener('click', () => {
      tabItems.forEach(t => t.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

/* --------------------------------------------------------------------------
   6. PORTFOLIO DYNAMIQUE PAR CATÉGORIE (203 PHOTOGRAPHIES DU STUDIO)
   -------------------------------------------------------------------------- */
let openLightboxItem = null;

function initPortfolioFilters() {
  const grid = document.getElementById('portfolio-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const loadMoreBtn = document.getElementById('portfolio-load-more');
  const countBadge = document.getElementById('portfolio-count-badge');

  if (!grid) return;

  const allItems = window.PORTFOLIO_ITEMS || [];
  let currentCategory = 'all';
  let visibleCount = 12;
  const PAGE_SIZE = 12;

  const categoryLabels = {
    all: 'Toutes les séries',
    fashion: 'Mode & Couture',
    beauty: 'Beauté & Portrait',
    tradition: 'Tradition & Culture',
    retouch: 'Retouche & Art'
  };

  function getFilteredItems() {
    if (currentCategory === 'all') return allItems;
    return allItems.filter(item => item.category === currentCategory);
  }

  function renderPortfolio(append = false) {
    const filtered = getFilteredItems();
    const total = filtered.length;
    const toShow = filtered.slice(0, visibleCount);

    if (!append) {
      grid.innerHTML = '';
    }

    const startIndex = append ? visibleCount - PAGE_SIZE : 0;
    const itemsToRender = append ? toShow.slice(startIndex) : toShow;

    itemsToRender.forEach(item => {
      const card = document.createElement('div');
      card.className = 'portfolio-card tilt-card';
      card.setAttribute('data-category', item.category);
      card.setAttribute('data-id', item.id);
      card.setAttribute('data-full', item.full);
      card.setAttribute('data-title', item.title);

      const catName = categoryLabels[item.category] || 'Éditorial';
      const safeTitle = escapeHtml(item.title);
      const safeCat = escapeHtml(catName);
      const safeThumb = escapeHtml(item.thumb);

      card.innerHTML = `
        <img src="${safeThumb}" alt="${safeTitle} — Studios Magik Golden" loading="lazy">
        <div class="portfolio-card-info">
          <span class="portfolio-card-tag">${safeCat}</span>
          <div class="portfolio-card-bottom">
            <h3>${safeTitle}</h3>
            <span class="portfolio-card-link">
              <span>Agrandir</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
            </span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        if (openLightboxItem) openLightboxItem(item, getFilteredItems());
      });

      grid.appendChild(card);
    });

    // Re-bind 3D tilt
    initTiltCards();

    // Update counter badge
    if (countBadge) {
      countBadge.textContent = `${Math.min(visibleCount, total)} / ${total}`;
    }

    // Hide load more if all items in category are shown
    if (loadMoreBtn) {
      if (visibleCount >= total) {
        loadMoreBtn.style.display = 'none';
      } else {
        loadMoreBtn.style.display = 'inline-flex';
      }
    }
  }

  // Filter button clicks
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentCategory = btn.getAttribute('data-filter') || 'all';
      visibleCount = PAGE_SIZE;

      grid.style.opacity = '0';
      setTimeout(() => {
        renderPortfolio(false);
        grid.style.opacity = '1';
      }, 150);
    });
  });

  // Load more button click
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      visibleCount += PAGE_SIZE;
      renderPortfolio(true);
    });
  }

  // Initial render if portfolio items are loaded
  if (allItems.length > 0) {
    renderPortfolio(false);
  }
}

/* --------------------------------------------------------------------------
   7. LIGHTBOX MODAL PLEIN ÉCRAN AVEC NAVIGATION PAR CATÉGORIE
   -------------------------------------------------------------------------- */
function initLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-image');
  const modalTitle = document.getElementById('lightbox-title');
  const modalCat = document.getElementById('lightbox-category');
  const counterEl = document.getElementById('lightbox-counter');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  const closeBtn = document.querySelector('.lightbox-close');

  if (!modal || !modalImg) return;

  const categoryLabels = {
    all: 'Toutes les séries',
    fashion: 'Mode & Couture',
    beauty: 'Beauté & Portrait',
    tradition: 'Tradition & Culture',
    retouch: 'Retouche & Art'
  };

  let currentList = [];
  let currentIndex = 0;

  function updateDisplay(animate = false) {
    if (!currentList.length) return;
    const item = currentList[currentIndex];
    if (!item) return;

    const catName = categoryLabels[item.category] || 'Éditorial Studio';
    const countText = `Photo ${currentIndex + 1} / ${currentList.length}`;

    function setContent() {
      modalImg.src = item.full || item.thumb;
      modalImg.alt = item.title || 'Photographie Studios Magik Golden';
      if (modalTitle) modalTitle.textContent = item.title;
      if (modalCat) modalCat.textContent = catName;
      if (counterEl) counterEl.textContent = countText;
    }

    if (animate) {
      modalImg.classList.add('fade-out');
      setTimeout(() => {
        setContent();
        modalImg.onload = () => {
          modalImg.classList.remove('fade-out');
        };
        setTimeout(() => modalImg.classList.remove('fade-out'), 50);
      }, 140);
    } else {
      setContent();
    }

    // Préchargement immédiat des photos précédente et suivante pour navigation instantanée
    if (currentList.length > 1) {
      const nextIdx = (currentIndex + 1) % currentList.length;
      const prevIdx = (currentIndex - 1 + currentList.length) % currentList.length;
      if (currentList[nextIdx]) {
        const preNext = new Image();
        preNext.src = currentList[nextIdx].full || currentList[nextIdx].thumb;
      }
      if (currentList[prevIdx]) {
        const prePrev = new Image();
        prePrev.src = currentList[prevIdx].full || currentList[prevIdx].thumb;
      }
    }
  }

  function nextImage() {
    if (!currentList.length) return;
    currentIndex = (currentIndex + 1) % currentList.length;
    updateDisplay(true);
  }

  function prevImage() {
    if (!currentList.length) return;
    currentIndex = (currentIndex - 1 + currentList.length) % currentList.length;
    updateDisplay(true);
  }

  openLightboxItem = function(item, list) {
    if (list && list.length) {
      currentList = list;
    } else {
      currentList = window.PORTFOLIO_ITEMS || [item];
    }

    const foundIdx = currentList.findIndex(i => i.id === item.id || i.full === (item.full || item.thumb));
    currentIndex = foundIdx !== -1 ? foundIdx : 0;

    updateDisplay(false);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  // Clics sur les flèches de navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevImage();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextImage();
    });
  }

  // Déclencheurs pour cartes de vitrine éventuelles
  document.querySelectorAll('.showcase-card').forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      const title = card.querySelector('h3, .showcase-title');
      const tag = card.querySelector('.showcase-tag');
      const customItem = {
        id: 'showcase-' + Date.now(),
        category: 'fashion',
        title: title ? title.textContent : 'Création Studios Magik Golden',
        full: img ? img.src : '',
        thumb: img ? img.src : ''
      };
      openLightboxItem(customItem, window.PORTFOLIO_ITEMS || [customItem]);
    });
  });

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('lightbox-content')) {
      closeModal();
    }
  });

  // Navigation clavier : Échap pour fermer, Flèche Droite pour Suivante, Flèche Gauche pour Précédente
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowRight') {
      nextImage();
    } else if (e.key === 'ArrowLeft') {
      prevImage();
    }
  });

  // Support tactile Swipe gauche / droite sur mobile et tablettes
  let touchStartX = 0;
  let touchStartY = 0;

  modal.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  modal.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      if (diffX < 0) {
        nextImage();
      } else {
        prevImage();
      }
    }
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   8. FAQ ACCORDÉON FLUIDE
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        const q = otherItem.querySelector('.faq-question');
        if (q) q.setAttribute('aria-expanded', 'false');
      });

      if (!isActive) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   9. CALENDRIER SUR-MESURE LUXE & DESIGN
   -------------------------------------------------------------------------- */
function initCustomDatepicker() {
  const trigger = document.getElementById('datepicker-trigger');
  const dropdown = document.getElementById('custom-calendar-dropdown');
  const displayInput = document.getElementById('desired-date-input');
  const hiddenInput = document.getElementById('desired-date');
  const monthYearLabel = document.getElementById('calendar-month-year');
  const daysGrid = document.getElementById('calendar-days-grid');
  const prevBtn = document.getElementById('cal-prev-btn');
  const nextBtn = document.getElementById('cal-next-btn');
  const todayBtn = document.getElementById('cal-today-btn');
  const clearBtn = document.getElementById('cal-clear-btn');

  if (!trigger || !dropdown || !daysGrid) return;

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentYear = today.getFullYear();
  let currentMonth = today.getMonth();
  let selectedDate = null;

  function renderCalendar() {
    monthYearLabel.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    daysGrid.innerHTML = '';

    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const startingDay = (firstDayIndex + 6) % 7;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < startingDay; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'cal-day-cell empty';
      daysGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement('button');
      dayCell.type = 'button';
      dayCell.className = 'cal-day-cell';
      dayCell.textContent = day;

      const dateForCell = new Date(currentYear, currentMonth, day);
      dateForCell.setHours(0, 0, 0, 0);

      if (dateForCell < today) {
        dayCell.classList.add('disabled');
      } else {
        if (dateForCell.getTime() === today.getTime()) {
          dayCell.classList.add('today');
        }

        if (selectedDate && dateForCell.getTime() === selectedDate.getTime()) {
          dayCell.classList.add('selected');
        }

        dayCell.addEventListener('click', () => {
          selectedDate = new Date(currentYear, currentMonth, day);
          const formattedDisplay = `${day} ${monthNames[currentMonth]} ${currentYear}`;
          const formattedIso = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

          displayInput.value = formattedDisplay;
          hiddenInput.value = formattedIso;
          closeCalendar();
        });
      }

      daysGrid.appendChild(dayCell);
    }
  }

  function openCalendar() {
    renderCalendar();
    dropdown.classList.add('open');
    dropdown.setAttribute('aria-hidden', 'false');
  }

  function closeCalendar() {
    dropdown.classList.remove('open');
    dropdown.setAttribute('aria-hidden', 'true');
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains('open');
    if (isOpen) {
      closeCalendar();
    } else {
      openCalendar();
    }
  });

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar();
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
  });

  todayBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();
    const day = today.getDate();
    selectedDate = new Date(today);

    displayInput.value = `${day} ${monthNames[currentMonth]} ${currentYear}`;
    hiddenInput.value = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    closeCalendar();
  });

  clearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedDate = null;
    displayInput.value = '';
    hiddenInput.value = '';
    closeCalendar();
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && !trigger.contains(e.target)) {
      closeCalendar();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdown.classList.contains('open')) {
      closeCalendar();
    }
  });
}

/* --------------------------------------------------------------------------
   10. BOUTON RETOUR HAUT DE PAGE
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* --------------------------------------------------------------------------
   11. FORMULAIRE DE RÉSERVATION, BASE DE DONNÉES SUPABASE & WHATSAPP DIRECT
   -------------------------------------------------------------------------- */
const SUPABASE_CONFIG = {
  url: 'https://iqsfjmbhddyessfknpgz.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxc2ZqbWJoZGR5ZXNzZmtucGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NDE1MjksImV4cCI6MjEwNTMxNzUyOX0.bl6ZxLrkmgxLLnRqhD4dYQDO2JkQYa-qBAAEaG7TfZE'
};

async function saveBookingToSupabase(bookingData) {
  try {
    const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(bookingData)
    });
    return response.ok;
  } catch (err) {
    console.warn('Note: Sauvegarde Supabase asynchrone non bloquante', err);
    return false;
  }
}

function sanitizeInput(str) {
  return String(str || '')
    .trim()
    .replace(/[<>]/g, '');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[+0-9\s\-().]{6,25}$/.test(phone);
}

function initBookingForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = form.querySelector('#client-name');
    const emailInput = form.querySelector('#client-email');
    const phoneInput = form.querySelector('#client-phone');
    const serviceInput = form.querySelector('#project-type');
    const dateInput = form.querySelector('#desired-date');
    const displayDateInput = form.querySelector('#desired-date-input');
    const messageInput = form.querySelector('#client-message');

    const name = sanitizeInput(nameInput ? nameInput.value : '');
    const email = sanitizeInput(emailInput ? emailInput.value : '');
    const phone = sanitizeInput(phoneInput ? phoneInput.value : '');
    const service = sanitizeInput(serviceInput ? serviceInput.value : 'Studio Signature');
    const isoDate = dateInput && dateInput.value ? dateInput.value : null;
    const displayDate = displayDateInput && displayDateInput.value ? displayDateInput.value : 'À convenir';
    const message = sanitizeInput(messageInput ? messageInput.value : '');

    if (!name || name.length < 2) {
      showToast('Veuillez indiquer votre nom complet.');
      if (nameInput) nameInput.focus();
      return;
    }

    if (!email || !isValidEmail(email)) {
      showToast('Veuillez renseigner une adresse email valide.');
      if (emailInput) emailInput.focus();
      return;
    }

    if (!phone || !isValidPhone(phone)) {
      showToast('Veuillez renseigner un numéro de téléphone valide.');
      if (phoneInput) phoneInput.focus();
      return;
    }

    // Affichage immédiat du message de confirmation de prestige
    showToast('Votre demande a bien été transmise à Studios Magik Golden.');

    // 1. Enregistrement sécurisé dans la base de données Supabase (organisation MAGIK GOLDEN)
    saveBookingToSupabase({
      client_name: name,
      email: email,
      phone: phone,
      service_type: service,
      desired_date: isoDate,
      message: message,
      status: 'pending'
    });

    // 2. Ouverture de WhatsApp avec données encodées en toute sécurité
    const waText = encodeURIComponent(
      `*Demande de Réservation — STUDIOS MAGIK GOLDEN*\n\n` +
      `👤 *Nom :* ${name}\n` +
      `✉️ *Email :* ${email}\n` +
      `📞 *Téléphone :* ${phone}\n` +
      `📸 *Service :* ${service}\n` +
      `📅 *Date souhaitée :* ${displayDate}\n` +
      `📝 *Projet :* ${message || 'Échange préliminaire'}`
    );

    window.open(`https://wa.me/2290167731320?text=${waText}`, '_blank', 'noopener,noreferrer');

    form.reset();
  });
}

function showToast(message) {
  let toast = document.getElementById('toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  // Nettoyage sécurisé sans injection HTML directe
  toast.textContent = '';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '20');
  svg.setAttribute('height', '20');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.innerHTML = '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>';

  const span = document.createElement('span');
  span.textContent = message;

  toast.appendChild(svg);
  toast.appendChild(span);

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

/* --------------------------------------------------------------------------
   12. ANIMATIONS D'APPARITION AU SCROLL
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.service-card, .showcase-card, .portfolio-card, .process-card, .testimonial-card, .pricing-card');

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(el);
  });
}
