/* ============================================================
   A & R — LUXURY WEDDING INVITATION — main.js
   ============================================================ */

(function () {
  "use strict";

  /* ==========================================================
     1. CONFIGURATION
     ========================================================== */

  const weddingConfig = {
    initials: "A & R",

    date: "8",
    month: "AVGUST",
    year: "2026",
    weekday: "Shanba",

    weddingDate: "2026-08-08T14:00:00",

    venue: "OSH SHAHRI",
    address: "Sharq (Kalinin kolxoz), Turkmenov ko‘chasi 48",
    guestArrival: "06:00",

    mapUrl: "https://2gis.kg/bishkek/geo/70030076158595624/72.822290,40.551714",

    music: "assets/wedding-music.m4a",

    schedule: [
      {
        time: "06:00",
        title: "Mehmonlarni kutib olish",
        description:
          "Aziz mehmonlarimizni iliq kulgu va samimiy so‘zlar bilan kutib olamiz.",
        icon: "welcome",
      },
      {
        time: "14:00",
        title: "To‘y marosimi boshlanishi",
        description:
          "Bayramona kayfiyatda to‘y marosimimiz boshlanadi, barchani birga nishonlashga kutamiz.",
        icon: "ceremony",
      },
    ],
  };

  /* ==========================================================
     2. DOM SELECTORS
     ========================================================== */

  const dom = {
    html: document.documentElement,
    body: document.body,
    hero: document.getElementById("hero"),
    heroContent: document.getElementById("heroContent"),
    heroGoldBloom: document.getElementById("heroGoldBloom"),
    envelope: document.getElementById("envelope"),
    envelopeCard: document.getElementById("envelopeCard"),
    envelopeFlap: document.getElementById("envelopeFlap"),
    waxSeal: document.getElementById("waxSeal"),
    particleCanvas: document.getElementById("particleCanvas"),
    confettiRainCanvas: document.getElementById("confettiRainCanvas"),
    timeline: document.getElementById("timeline"),
    timelineLineFill: document.querySelector(".timeline__line-fill"),
    cdDays: document.getElementById("cdDays"),
    cdHours: document.getElementById("cdHours"),
    cdMinutes: document.getElementById("cdMinutes"),
    cdSeconds: document.getElementById("cdSeconds"),
    audioToggle: document.getElementById("audioToggle"),
    bgAudio: document.getElementById("bgAudio"),
    mapButton: document.getElementById("mapButton"),
    arrivalTime: document.getElementById("arrivalTime"),
  };

  /* ==========================================================
     3. INITIAL STATE
     ========================================================== */

  const state = {
    opened: false,
    audioPlaying: false,
    audioAvailable: true,
  };

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const hasHover = window.matchMedia("(hover: hover) and (pointer: fine)")
    .matches;

  const hasGSAP = typeof window.gsap !== "undefined";
  const hasScrollTrigger = hasGSAP && typeof window.ScrollTrigger !== "undefined";
  const hasConfetti = typeof window.confetti !== "undefined";

  // Dedicated confetti instance for the continuous rain effect, isolated from
  // the shared global confetti() used for one-off bursts — running both on the
  // same instance concurrently corrupts canvas-confetti's internal render state.
  const rainConfetti =
    hasConfetti && dom.confettiRainCanvas
      ? confetti.create(dom.confettiRainCanvas, { resize: true, useWorker: false })
      : null;

  if (hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ==========================================================
     4. ENVELOPE SETUP
     ========================================================== */

  function setupEnvelope() {
    if (!hasGSAP) return;
    gsap.set(dom.envelopeCard, { yPercent: 68 });
    gsap.set(dom.envelopeFlap, { rotateX: 0, transformPerspective: 1200 });
  }

  /* ==========================================================
     5. WAX SEAL INTERACTION (3D tilt + open trigger)
     ========================================================== */

  function setupWaxSealTilt() {
    if (!hasGSAP || !hasHover || reducedMotion) return;

    dom.envelope.addEventListener("pointermove", (e) => {
      if (state.opened) return;
      const rect = dom.waxSeal.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const maxTilt = 7;
      gsap.to(dom.waxSeal, {
        rotateY: Math.max(-1, Math.min(1, dx)) * maxTilt,
        rotateX: Math.max(-1, Math.min(1, -dy)) * maxTilt,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    });

    dom.envelope.addEventListener("pointerleave", () => {
      if (state.opened) return;
      gsap.to(dom.waxSeal, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: "power2.out",
      });
    });
  }

  function setupWaxSealClick() {
    dom.waxSeal.addEventListener("click", openEnvelope);
  }

  /* ==========================================================
     6. OPENING ANIMATION (the cinematic moment)
     ========================================================== */

  function spawnFloatingPetals(originEl, count) {
    if (reducedMotion) return;
    const rect = originEl.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const svgNS = "http://www.w3.org/2000/svg";
    const xlinkNS = "http://www.w3.org/1999/xlink";

    for (let i = 0; i < count; i++) {
      const petal = document.createElementNS(svgNS, "svg");
      petal.setAttribute("viewBox", "0 0 100 100");
      petal.classList.add("floating-petal");
      const use = document.createElementNS(svgNS, "use");
      use.setAttributeNS(xlinkNS, "href", "#icon-petal");
      petal.appendChild(use);
      petal.style.left = originX + "px";
      petal.style.top = originY + "px";
      document.body.appendChild(petal);

      const angle = Math.random() * Math.PI * 2;
      const dist = 90 + Math.random() * 170;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 70;

      if (hasGSAP) {
        gsap.fromTo(
          petal,
          { opacity: 0, scale: 0.35, x: 0, y: 0, rotate: 0 },
          {
            opacity: 0.95,
            scale: 0.7 + Math.random() * 0.5,
            x: dx * 0.35,
            y: dy * 0.35,
            rotate: Math.random() * 160 - 80,
            duration: 0.45,
            ease: "power2.out",
            onComplete() {
              gsap.to(petal, {
                opacity: 0,
                x: dx,
                y: dy + 160,
                rotate: "+=100",
                duration: 1.6,
                ease: "power1.in",
                onComplete: () => petal.remove(),
              });
            },
          }
        );
      } else {
        petal.remove();
      }
    }
  }

  function goldDustBurst(originEl, particleCount) {
    if (!hasConfetti || reducedMotion) return;
    const rect = originEl.getBoundingClientRect();
    const origin = {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    };
    confetti({
      particleCount: particleCount,
      spread: 100,
      startVelocity: 22,
      gravity: 0.75,
      scalar: 0.6,
      ticks: 140,
      origin: origin,
      colors: ["#C5A059", "#FCF6BA", "#FDFBF7", "#FFFFFF", "#F5EFE6"],
      disableForReducedMotion: true,
    });
  }

  const FESTIVE_COLORS = [
    "#C5A059",
    "#BF953F",
    "#FCF6BA",
    "#AA771C",
    "#9E2A2B",
    "#3E4536",
    "#FDFBF7",
    "#FFFFFF",
    "#E8B4B8",
    "#F0DFC4",
  ];

  let streamerShape = null;
  function getStreamerShape() {
    if (!hasConfetti || typeof confetti.shapeFromPath !== "function") return null;
    if (!streamerShape) {
      streamerShape = confetti.shapeFromPath({ path: "M0 0 L6 0 L6 28 L0 28 Z" });
    }
    return streamerShape;
  }

  /**
   * Continuous festive confetti rain: long paper streamers + confetti falling
   * from the very top across the full width of the screen, in varied colors.
   */
  function confettiRain(durationMs) {
    if (!rainConfetti || reducedMotion) return;
    const shape = getStreamerShape();
    const shapesA = shape ? [shape, "square"] : ["square"];
    const shapesB = shape ? [shape, "circle"] : ["circle"];
    const end = Date.now() + durationMs;
    const spawnIntervalMs = 90;

    (function frame() {
      rainConfetti({
        particleCount: 3,
        startVelocity: 4,
        gravity: 0.55,
        drift: (Math.random() - 0.5) * 0.6,
        ticks: 220,
        scalar: 0.9 + Math.random() * 0.5,
        origin: { x: Math.random(), y: -0.05 },
        angle: 90,
        spread: 45,
        shapes: Math.random() > 0.5 ? shapesA : shapesB,
        colors: [FESTIVE_COLORS[Math.floor(Math.random() * FESTIVE_COLORS.length)]],
        disableForReducedMotion: true,
      });
      if (Date.now() < end) setTimeout(frame, spawnIntervalMs);
    })();
  }

  function tryStartMusic() {
    if (!dom.bgAudio || !state.audioAvailable) return;
    const playPromise = dom.bgAudio.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => {
          state.audioPlaying = true;
          dom.audioToggle.classList.add("is-playing");
          dom.audioToggle.setAttribute("aria-pressed", "true");
        })
        .catch(() => {
          /* autoplay blocked or file missing — fail gracefully */
        });
    }
  }

  function openEnvelope() {
    if (state.opened) return;
    state.opened = true;
    dom.waxSeal.setAttribute("aria-disabled", "true");
    dom.waxSeal.style.pointerEvents = "none";
    dom.envelope.classList.add("is-open");

    tryStartMusic();

    if (!hasGSAP) {
      // graceful fallback without GSAP
      dom.hero.style.display = "none";
      dom.body.classList.remove("scroll-locked");
      dom.html.classList.remove("scroll-locked");
      return;
    }

    const dur = reducedMotion ? 0.001 : 1;
    const crack1 = dom.waxSeal.querySelector(".wax-seal__crack--1");
    const crack2 = dom.waxSeal.querySelector(".wax-seal__crack--2");
    const sealBase = dom.waxSeal.querySelector(".wax-seal__base");

    const tl = gsap.timeline({
      defaults: { duration: dur },
      onComplete() {
        dom.body.classList.remove("scroll-locked");
      dom.html.classList.remove("scroll-locked");
        dom.hero.style.display = "none";
        if (hasScrollTrigger) ScrollTrigger.refresh();
      },
    });

    tl.to(sealBase, { scale: 0.92, duration: 0.12 * dur, ease: "power2.out" }, 0);
    tl.set(crack1, { opacity: 1 }, 0.12 * dur);
    tl.to(sealBase, { scale: 1.04, duration: 0.08 * dur, ease: "power1.out" }, 0.22 * dur);
    tl.set(crack2, { opacity: 1 }, 0.28 * dur);
    tl.to(
      dom.waxSeal,
      { scale: 0.25, opacity: 0, duration: 0.24 * dur, ease: "power2.in" },
      0.3 * dur
    );
    tl.call(() => goldDustBurst(dom.waxSeal, reducedMotion ? 0 : 20), null, 0.35 * dur);
    tl.call(() => spawnFloatingPetals(dom.waxSeal, reducedMotion ? 0 : 9), null, 0.4 * dur);
    tl.call(() => confettiRain(reducedMotion ? 0 : 2600), null, 0.5 * dur);
    tl.to(
      dom.envelopeFlap,
      { rotateX: -165, duration: 0.5 * dur, ease: "power2.inOut" },
      0.5 * dur
    );
    tl.to(
      dom.envelopeCard,
      { yPercent: 18, duration: 0.55 * dur, ease: "power3.out" },
      0.7 * dur
    );
    tl.to(
      dom.envelopeCard,
      { rotateX: 4, yPercent: -22, duration: 0.35 * dur, ease: "power2.out" },
      0.9 * dur
    );
    tl.fromTo(
      dom.heroGoldBloom,
      { opacity: 0 },
      { opacity: 1, duration: 0.35 * dur, ease: "power1.inOut" },
      1.0 * dur
    );
    tl.to(dom.heroContent, { opacity: 0.15, duration: 0.3 * dur }, 1.2 * dur);
    tl.to(dom.hero, { scale: 1.06, duration: 0.3 * dur, ease: "power1.in" }, 1.4 * dur);
    tl.to(dom.hero, { opacity: 0, duration: 0.3 * dur, ease: "power1.in" }, 1.6 * dur);
    tl.call(() => revealMainInvitation(), null, 1.7 * dur);
  }

  function revealMainInvitation() {
    const card = document.querySelector("#invitation .invitation__card");
    if (!card || !hasGSAP) return;
    gsap.fromTo(
      card,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: reducedMotion ? 0.001 : 0.9, ease: "power3.out" }
    );
  }

  /* ==========================================================
     8. SCROLLTRIGGER ANIMATIONS
     ========================================================== */

  function initScrollReveals() {
    if (!hasScrollTrigger) return;

    document.querySelectorAll(".reveal-card").forEach((el) => {
      if (el.closest("#invitation")) return; // handled by open sequence
      gsap.fromTo(
        el,
        { opacity: 0, y: 50, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: reducedMotion ? 0.001 : 1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        }
      );
    });

    const groups = new Map();
    document.querySelectorAll(".reveal-el").forEach((el) => {
      const section = el.closest("section");
      if (!groups.has(section)) groups.set(section, []);
      groups.get(section).push(el);
    });
    groups.forEach((els, section) => {
      gsap.fromTo(
        els,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: reducedMotion ? 0.001 : 0.8,
          ease: "power2.out",
          stagger: 0.12,
          scrollTrigger: { trigger: section, start: "top 80%" },
        }
      );
    });

    // Date section: calendar card slide-up
    const calendar = document.getElementById("dateCalendar");
    if (calendar) {
      gsap.fromTo(
        calendar,
        { opacity: 0, y: 60, rotateX: -8 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: reducedMotion ? 0.001 : 1,
          ease: "power3.out",
          scrollTrigger: { trigger: "#date", start: "top 70%" },
        }
      );
    }

    // Program timeline: draw line + sequential reveal
    if (dom.timelineLineFill) {
      gsap.to(dom.timelineLineFill, {
        scaleX: 1,
        duration: reducedMotion ? 0.001 : 1.2,
        ease: "power2.inOut",
        scrollTrigger: { trigger: "#program", start: "top 65%" },
      });
    }

    const events = document.querySelectorAll(".timeline__event");
    if (events.length) {
      gsap.fromTo(
        events,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: reducedMotion ? 0.001 : 0.7,
          ease: "power2.out",
          stagger: 0.25,
          scrollTrigger: { trigger: "#program", start: "top 60%" },
        }
      );
      events.forEach((ev) => {
        const icon = ev.querySelector(".timeline__node");
        if (!icon) return;
        gsap.fromTo(
          icon,
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: reducedMotion ? 0.001 : 0.6,
            ease: "back.out(1.7)",
            scrollTrigger: { trigger: ev, start: "top 70%" },
          }
        );
      });
    }
  }

  /* ==========================================================
     9. FLOWER HOVER SPARKLE
     ========================================================== */

  function setupFlowerSparkle() {
    if (reducedMotion || !hasHover) return;
    document.querySelectorAll(".lily").forEach((lily) => {
      lily.addEventListener("mouseenter", () => {
        goldDustBurst(lily, 8);
      });
    });
  }

  /* ==========================================================
     10. AMBIENT PARTICLE SYSTEM
     ========================================================== */

  function initParticles() {
    const canvas = dom.particleCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width, height, dpr;
    let particles = [];
    let mouse = { x: -9999, y: -9999 };
    let rafId = null;

    function particleCount() {
      return window.innerWidth < 768 ? 24 : 60;
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeParticle() {
      const kinds = ["dust", "dust", "dust", "petal", "leaf"];
      return {
        kind: kinds[Math.floor(Math.random() * kinds.length)],
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1 + Math.random() * 2.6,
        speedY: 0.12 + Math.random() * 0.28,
        speedX: (Math.random() - 0.5) * 0.18,
        opacity: 0.15 + Math.random() * 0.45,
        drift: Math.random() * Math.PI * 2,
        driftSpeed: 0.002 + Math.random() * 0.004,
      };
    }

    function seedParticles() {
      const count = particleCount();
      particles = new Array(count).fill(null).map(makeParticle);
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.drift += p.driftSpeed;
        p.y -= p.speedY;
        p.x += p.speedX + Math.sin(p.drift) * 0.15;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 10000) {
          const dist = Math.sqrt(distSq) || 1;
          p.x += (dx / dist) * 0.6;
          p.y += (dy / dist) * 0.6;
        }

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        if (p.kind === "leaf") {
          ctx.fillStyle = `rgba(105,112,95,${p.opacity})`;
        } else if (p.kind === "petal") {
          ctx.fillStyle = `rgba(253,251,247,${p.opacity})`;
        } else {
          ctx.fillStyle = `rgba(197,160,89,${p.opacity})`;
        }
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      rafId = requestAnimationFrame(draw);
    }

    resize();
    seedParticles();

    if (!reducedMotion) {
      rafId = requestAnimationFrame(draw);
    } else {
      draw();
      cancelAnimationFrame(rafId);
    }

    window.addEventListener(
      "pointermove",
      (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      },
      { passive: true }
    );
    window.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches && e.touches[0]) {
          mouse.x = e.touches[0].clientX;
          mouse.y = e.touches[0].clientY;
        }
      },
      { passive: true }
    );

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        seedParticles();
      }, 200);
    });
  }

  /* ==========================================================
     11. COUNTDOWN
     ========================================================== */

  function initCountdown() {
    const target = new Date(weddingConfig.weddingDate).getTime();
    let intervalId;

    function tick() {
      const now = Date.now();
      const diff = Math.max(0, target - now);

      const day = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hour = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const min = Math.floor((diff / (1000 * 60)) % 60);
      const sec = Math.floor((diff / 1000) % 60);

      dom.cdDays.textContent = String(day).padStart(2, "0");
      dom.cdHours.textContent = String(hour).padStart(2, "0");
      dom.cdMinutes.textContent = String(min).padStart(2, "0");
      dom.cdSeconds.textContent = String(sec).padStart(2, "0");
    }

    tick();
    intervalId = setInterval(tick, 1000);
  }

  /* ==========================================================
     12. AUDIO PLAYER
     ========================================================== */

  function initAudio() {
    if (!dom.bgAudio || !dom.audioToggle) return;

    dom.bgAudio.addEventListener("error", () => {
      state.audioAvailable = false;
    });

    dom.audioToggle.addEventListener("click", () => {
      if (!state.audioAvailable) return;
      if (state.audioPlaying) {
        dom.bgAudio.pause();
        state.audioPlaying = false;
        dom.audioToggle.classList.remove("is-playing");
        dom.audioToggle.setAttribute("aria-pressed", "false");
        dom.audioToggle.setAttribute("aria-label", "Musiqani yoqish");
      } else {
        const p = dom.bgAudio.play();
        if (p && typeof p.then === "function") {
          p
            .then(() => {
              state.audioPlaying = true;
              dom.audioToggle.classList.add("is-playing");
              dom.audioToggle.setAttribute("aria-pressed", "true");
              dom.audioToggle.setAttribute("aria-label", "Musiqani to‘xtatish");
            })
            .catch(() => {
              state.audioAvailable = false;
            });
        }
      }
    });
  }

  /* ==========================================================
     13. GOOGLE MAPS BUTTON
     ========================================================== */

  function initMapButton() {
    if (dom.mapButton) {
      dom.mapButton.href = weddingConfig.mapUrl;
    }
  }

  /* ==========================================================
     14. DYNAMIC WEDDING SCHEDULE
     ========================================================== */

  function renderSchedule() {
    if (!dom.timeline) return;
    const frag = document.createDocumentFragment();

    weddingConfig.schedule.forEach((item) => {
      const event = document.createElement("div");
      event.className = "timeline__event";
      event.innerHTML = `
        <div class="timeline__node">
          <svg class="timeline__icon" aria-hidden="true"><use href="#icon-${item.icon}"></use></svg>
        </div>
        <div class="timeline__content">
          <p class="timeline__time">${item.time}</p>
          <h3 class="timeline__title">${item.title}</h3>
          <p class="timeline__desc">${item.description}</p>
        </div>
      `;
      frag.appendChild(event);
    });

    dom.timeline.appendChild(frag);
  }

  /* ==========================================================
     STATIC CONFIG-DRIVEN TEXT
     ========================================================== */

  function applyConfigText() {
    if (dom.arrivalTime) dom.arrivalTime.textContent = weddingConfig.guestArrival;
  }

  /* ==========================================================
     17. RESPONSIVE BEHAVIOR
     ========================================================== */

  function initResize() {
    let t;
    window.addEventListener("resize", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (hasScrollTrigger) ScrollTrigger.refresh();
      }, 250);
    });
  }

  /* ==========================================================
     INIT
     ========================================================== */

  function init() {
    applyConfigText();
    initMapButton();
    renderSchedule();
    setupEnvelope();
    setupWaxSealTilt();
    setupWaxSealClick();
    initCountdown();
    initAudio();
    initParticles();
    setupFlowerSparkle();
    initResize();

    // Slight delay so layout (incl. injected schedule) is settled before measuring
    requestAnimationFrame(() => {
      initScrollReveals();
      if (hasScrollTrigger) ScrollTrigger.refresh();
    });

    // Keep envelope escape hatch: if JS/GSAP somehow stalls scroll lock indefinitely,
    // allow Escape key to reveal content for accessibility.
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !state.opened) {
        openEnvelope();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
