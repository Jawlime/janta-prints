/**
 * JANTA PRINTS — SHARED JS
 * Drop-in for every page. Self-initialising.
 * Requires: #jp-cursor, #jp-cursor-ring in HTML (or omit for auto-inject).
 */

(function() {
  'use strict';

  /* ── Auto-inject cursor & WhatsApp elements if not in DOM ──────── */
  function injectIfMissing(id, html) {
    if (!document.getElementById(id)) {
      const el = document.createElement('div');
      el.innerHTML = html;
      document.body.insertBefore(el.firstElementChild, document.body.firstChild);
    }
  }
  document.addEventListener('DOMContentLoaded', function() {
    injectIfMissing('jp-cursor', '<div id="jp-cursor"></div>');
    injectIfMissing('jp-cursor-ring', '<div id="jp-cursor-ring"></div>');
    injectIfMissing('jp-toast', `
      <div id="jp-toast">
        <div class="jp-toast-dot" id="jp-toast-dot"></div>
        <div class="jp-toast-text" id="jp-toast-text"></div>
      </div>`);
    init();
  });

  /* ── Cursor ────────────────────────────────────────────────────── */
  function initCursor() {
    const dot  = document.getElementById('jp-cursor');
    const ring = document.getElementById('jp-cursor-ring');
    if (!dot || !ring) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', function(e) { mx = e.clientX; my = e.clientY; });
    (function loop() {
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
      rx += (mx - rx) * 0.13; ry += (my - ry) * 0.13;
      ring.style.left = rx + 'px'; ring.style.top  = ry + 'px';
      requestAnimationFrame(loop);
    })();
  }

  /* ── Nav scroll ────────────────────────────────────────────────── */
  function initNav() {
    var nav = document.querySelector('.jp-nav');
    if (!nav) return;
    function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 50); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Mobile toggle */
    var toggle = document.querySelector('.jp-nav__mobile-toggle');
    var mMenu  = document.querySelector('.jp-nav__mobile-menu');
    if (toggle && mMenu) {
      toggle.addEventListener('click', function() {
        mMenu.classList.toggle('open');
        var spans = toggle.querySelectorAll('span');
        if (mMenu.classList.contains('open')) {
          if (spans[0]) spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
          if (spans[1]) spans[1].style.opacity   = '0';
          if (spans[2]) spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
        } else {
          if (spans[0]) spans[0].style.transform = '';
          if (spans[1]) spans[1].style.opacity   = '';
          if (spans[2]) spans[2].style.transform = '';
        }
      });
    }

    /* Active link */
    var links = document.querySelectorAll('.jp-nav__links a, .jp-nav__mobile-menu a');
    var path  = window.location.pathname.split('/').pop() || 'index.html';
    links.forEach(function(a) {
      if (a.getAttribute('href') === path || a.getAttribute('href') === './' + path) {
        a.classList.add('active');
      }
    });
  }

  /* ── Scroll reveal ─────────────────────────────────────────────── */
  function initReveal() {
    var els = document.querySelectorAll('.jp-reveal, .jp-reveal-left, .jp-reveal-scale');
    if (!els.length) return;
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    els.forEach(function(el) { io.observe(el); });
  }

  /* ── Hero blob parallax ────────────────────────────────────────── */
  function initParallax() {
    var blob = document.querySelector('.jp-hero-blob');
    if (!blob) return;
    window.addEventListener('scroll', function() {
      blob.style.transform = 'translateY(' + (window.scrollY * 0.14) + 'px)';
    }, { passive: true });
  }

  /* ── Accordion ─────────────────────────────────────────────────── */
  function initAccordions() {
    document.querySelectorAll('.jp-accordion-trigger').forEach(function(trigger) {
      trigger.addEventListener('click', function() {
        var body = trigger.nextElementSibling;
        var open = trigger.classList.contains('open');
        /* close all in same accordion */
        var parent = trigger.closest('.jp-accordion');
        if (parent) {
          parent.querySelectorAll('.jp-accordion-trigger.open').forEach(function(t) {
            t.classList.remove('open');
            var b = t.nextElementSibling;
            if (b) b.classList.remove('open');
          });
        }
        if (!open) { trigger.classList.add('open'); if (body) body.classList.add('open'); }
      });
    });
  }

  /* ── Tabs ──────────────────────────────────────────────────────── */
  function initTabs() {
    document.querySelectorAll('.jp-tabs').forEach(function(rail) {
      rail.querySelectorAll('.jp-tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          rail.querySelectorAll('.jp-tab-btn').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          var target = btn.dataset.target;
          if (target) {
            document.querySelectorAll('[data-tab-panel]').forEach(function(p) {
              p.style.display = p.dataset.tabPanel === target ? '' : 'none';
            });
          }
          /* Fire custom event for page-level JS */
          rail.dispatchEvent(new CustomEvent('jp:tab', { detail: { tab: btn.dataset.tab || target, btn: btn } }));
        });
      });
    });
  }

  /* ── Stepper ───────────────────────────────────────────────────── */
  window.JP = window.JP || {};
  JP.setStep = function(stepperEl, active) {
    stepperEl.querySelectorAll('.jp-step').forEach(function(step, i) {
      step.classList.remove('active', 'done');
      if (i < active) step.classList.add('done');
      if (i === active) step.classList.add('active');
    });
  };

  /* ── Toast ─────────────────────────────────────────────────────── */
  var toastTimer;
  JP.toast = function(msg, type) {
    type = type || 'success';
    var t   = document.getElementById('jp-toast');
    var dot = document.getElementById('jp-toast-dot');
    var txt = document.getElementById('jp-toast-text');
    if (!t || !dot || !txt) return;
    dot.className = 'jp-toast-dot jp-toast-dot--' + type;
    txt.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function() { t.classList.remove('show'); }, 3400);
  };

  /* ── Smooth scroll for anchor links ────────────────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(a) {
      a.addEventListener('click', function(e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ── Number counter animation ───────────────────────────────────── */
  JP.animateCount = function(el, to, duration) {
    duration = duration || 1200;
    var start = 0, startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * to);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  };

  /* ── Main init ──────────────────────────────────────────────────── */
  function init() {
    initCursor();
    initNav();
    initReveal();
    initParallax();
    initAccordions();
    initTabs();
    initSmoothScroll();
  }

})();

/* ── Additional nav fixes (appended) ──────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  /* Close mobile menu when any link inside it is clicked */
  var mMenu = document.querySelector('.jp-nav__mobile-menu');
  if (mMenu) {
    mMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mMenu.classList.remove('open');
        var spans = document.querySelectorAll('.jp-nav__mobile-toggle span');
        spans.forEach(function (s) { s.style.transform = ''; s.style.opacity = ''; });
      });
    });
  }

  /* Close mobile menu on outside click */
  document.addEventListener('click', function (e) {
    if (!mMenu) return;
    var toggle = document.querySelector('.jp-nav__mobile-toggle');
    if (mMenu.classList.contains('open') && !mMenu.contains(e.target) && !toggle.contains(e.target)) {
      mMenu.classList.remove('open');
      var spans = document.querySelectorAll('.jp-nav__mobile-toggle span');
      spans.forEach(function (s) { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  /* Animate stat counters when they scroll into view */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var to = parseInt(el.dataset.count, 10);
          JP.animateCount(el, to);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    io.observe(el);
  });
});
