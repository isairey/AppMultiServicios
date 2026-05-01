/**
 * PROSTIR — User Delight Layer
 * ─────────────────────────────────────────────────────────────────
 * 1. Button press  — scale(0.95) + violet ripple glow
 * 2. Table spring  — bounce + surrounding grid warp toward selection
 * 3. Cursor glow   — soft violet radial follows mouse over interactive zones
 *
 * No dependencies. Single shared file loaded by all pages.
 * Uses CSS Individual Transform `scale` to compose with the
 * magnetic system's `transform: translate(...)` without conflict.
 */
(function () {
  'use strict';

  const V      = '139,92,246';                          // violet RGB
  const APPLE  = 'cubic-bezier(0.22, 1, 0.36, 1)';     // the Apple spring curve
  const TOUCH  = window.matchMedia('(hover: none)').matches;
  const MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══════════════════════════════════════════════════════════════
     1. BUTTON PRESS  —  scale down on mousedown, spring back on up
     Uses CSS individual `scale` property so it composes cleanly
     with the magnetic effect's transform: translate(...)
     ═══════════════════════════════════════════════════════════════ */
  if (!TOUCH) {
    const BTN_SEL = '.cta-btn, .diia-btn, .dine-book-btn, .btn-book, ' +
                    '.booking-submit-btn, .w-accept-btn, [data-magnetic]';

    document.addEventListener('mousedown', e => {
      const btn = e.target.closest(BTN_SEL);
      if (!btn) return;

      btn.dataset.pressing = '1';

      if (!MOTION) emitRipple(btn, e);
    }, { passive: true });

    // Release on mouseup OR when cursor leaves the window
    ['mouseup', 'dragend'].forEach(ev =>
      document.addEventListener(ev, releaseAll, { passive: true })
    );
    document.addEventListener('mouseleave', releaseAll);

    function releaseAll() {
      document.querySelectorAll('[data-pressing]').forEach(btn => {
        delete btn.dataset.pressing;
      });
    }
  }

  /* ── Ripple glow emitter ── */
  function emitRipple(el, e) {
    // Ensure the element can contain the ripple
    const cs = getComputedStyle(el);
    if (cs.overflow !== 'hidden') el.style.overflow = 'hidden';
    if (cs.position === 'static') el.style.position = 'relative';

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // radius large enough to reach the farthest corner
    const r = Math.hypot(
      Math.max(x, rect.width  - x),
      Math.max(y, rect.height - y)
    );

    const ring = document.createElement('span');
    ring.setAttribute('aria-hidden', 'true');
    ring.style.cssText =
      `position:absolute;` +
      `left:${x}px;top:${y}px;` +
      `width:${r * 2.4}px;height:${r * 2.4}px;` +
      `border-radius:50%;` +
      `background:radial-gradient(circle,` +
        `rgba(${V},0.32) 0%,rgba(${V},0.10) 45%,transparent 68%);` +
      `transform:translate(-50%,-50%) scale(0);` +
      `animation:pDelightRipple .7s ${APPLE} forwards;` +
      `pointer-events:none;z-index:0;`;

    el.appendChild(ring);
    // Clean up after animation
    ring.addEventListener('animationend', () => ring.remove(), { once: true });
  }

  /* ═══════════════════════════════════════════════════════════════
     2. CURSOR MICRO-GLOW
     A soft 200px violet radial that lags slightly behind the cursor
     (lerp 16%) — appears only over interactive zones
     ═══════════════════════════════════════════════════════════════ */
  if (!TOUCH) {
    const GLOW_ZONES =
      '.cta-btn, .diia-btn, [data-magnetic], ' +
      '.svg-table, .svg-table *, ' +
      '.feature-card, .ios-widget, ' +
      '.fp-t, .sc-tbl, ' +
      'button:not([aria-hidden="true"]), ' +
      '.slot-btn, .time-slot, .dine-book-btn, .w-accept-btn, ' +
      '.booking-submit-btn, .btn-book, ' +
      '.lang-btn, .theme-toggle';

    const glowEl = document.createElement('div');
    glowEl.id = 'delight-glow';
    glowEl.setAttribute('aria-hidden', 'true');
    glowEl.style.cssText =
      `position:fixed;` +
      `width:200px;height:200px;` +
      `border-radius:50%;` +
      `background:radial-gradient(circle,` +
        `rgba(${V},0.15) 0%,rgba(${V},0.05) 42%,transparent 68%);` +
      `pointer-events:none;` +
      `z-index:9990;` +
      `opacity:0;` +
      `transition:opacity .28s ease;` +
      `mix-blend-mode:screen;` +
      `will-change:transform;`;
    document.body.appendChild(glowEl);

    let gx = -400, gy = -400;  // current visual pos
    let tx = -400, ty = -400;  // target (cursor)
    let rafGlow = null;
    let glowing = false;

    document.addEventListener('mousemove', e => {
      tx = e.clientX;
      ty = e.clientY;

      // Check if cursor is over an interactive zone
      const hit = document.elementFromPoint(tx, ty);
      const shouldGlow = !!(hit && hit.closest(GLOW_ZONES));
      if (shouldGlow !== glowing) {
        glowing = shouldGlow;
        glowEl.style.opacity = glowing ? '1' : '0';
      }

      if (!rafGlow) rafGlow = requestAnimationFrame(tickGlow);
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      glowing = false;
      glowEl.style.opacity = '0';
    });

    function tickGlow() {
      rafGlow = null;
      gx += (tx - gx) * 0.16;
      gy += (ty - gy) * 0.16;
      // Centre the 200×200 div on the cursor
      glowEl.style.transform =
        `translate(${(gx - 100).toFixed(1)}px,${(gy - 100).toFixed(1)}px)`;
      if (Math.abs(tx - gx) > 0.4 || Math.abs(ty - gy) > 0.4) {
        rafGlow = requestAnimationFrame(tickGlow);
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     3. TABLE SPRING BOUNCE + GRID WARP
     On any table click (SVG floor plan, sc-tbl, fp-t):
       – selected table gets a spring bounce animation
       – neighbours within 180px warp gently toward the selection
         then spring back with the Apple curve
     ═══════════════════════════════════════════════════════════════ */
  if (!MOTION) {
    document.addEventListener('click', e => {
      const tbl = e.target.closest('.svg-table, .sc-tbl, .fp-t');
      if (!tbl) return;

      /* Spring bounce on the selected element */
      tbl.classList.remove('d-spring');
      void tbl.offsetWidth;          // force reflow to restart animation
      tbl.classList.add('d-spring');

      /* Grid warp: find siblings inside the nearest floor-plan container */
      const container = tbl.closest(
        '.dine-floor-plan, .dine-map-svg-wrap, .sc-floor, .fp-mini, svg'
      );
      if (!container) return;

      const selR = tbl.getBoundingClientRect();
      const scx  = selR.left + selR.width  * 0.5;
      const scy  = selR.top  + selR.height * 0.5;

      const WARP_RADIUS = 180;   // px — affect siblings within this range
      const WARP_PULL   = 0.13;  // 0→1 — max travel fraction

      const siblings = [...container.querySelectorAll('.svg-table, .sc-tbl, .fp-t')]
        .filter(s => s !== tbl);

      siblings.forEach(sib => {
        const sr   = sib.getBoundingClientRect();
        const sbx  = sr.left + sr.width  * 0.5;
        const sby  = sr.top  + sr.height * 0.5;
        const dist = Math.hypot(sbx - scx, sby - scy);
        if (dist > WARP_RADIUS) return;

        // Pull strength falls off linearly with distance
        const strength = (1 - dist / WARP_RADIUS) * WARP_PULL;
        const px = (scx - sbx) * strength;
        const py = (scy - sby) * strength;

        // Phase 1 — warp toward selection (fast)
        sib.style.transition = `transform .18s ease-in`;
        sib.style.transform  = `translate(${px.toFixed(2)}px,${py.toFixed(2)}px)`;

        // Phase 2 — spring back (Apple curve)
        setTimeout(() => {
          sib.style.transition = `transform .55s ${APPLE}`;
          sib.style.transform  = '';
          // Phase 3 — clear inline styles
          setTimeout(() => {
            sib.style.transition = '';
            sib.style.transform  = '';
          }, 600);
        }, 100);
      });
    });

    // Remove spring class when animation completes
    document.addEventListener('animationend', e => {
      if (e.target.classList && e.target.classList.contains('d-spring')) {
        e.target.classList.remove('d-spring');
      }
    });
  }

})();
