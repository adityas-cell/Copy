// Hero behaviour for the Nuraform clone.
// The hero background is now a fullscreen <video>; the original gradient
// (UnicornStudio) and the interactive circle/prompt/motifs have been removed.
// Only the mobile menu panel logic remains.

// ---- Mobile menu panel (hamburger) ----
// Mirrors the original site: clicking the burger toggles `.open` on the button
// and on the `.nav__menu` panel (CSS drives the slide-down + backdrop + stagger).
// The nav's `white` class is stripped while open and restored on close, and the
// backdrop / links close the panel — same as nuraform.com.
(function menuToggle() {
  const nav = document.querySelector(".nav");
  const btn = document.querySelector(".nav__menu-btn");
  const menu = document.querySelector(".nav__menu");
  if (!nav || !btn || !menu) return;

  let wasWhite = false;

  function open() {
    btn.classList.add("open");
    menu.classList.add("open");
    wasWhite = nav.classList.contains("white");
    nav.classList.remove("white");
    document.body.style.overflow = "hidden";
  }
  function close() {
    btn.classList.remove("open");
    menu.classList.remove("open");
    if (wasWhite) nav.classList.add("white");
    document.body.style.overflow = "";
  }
  function toggle() {
    (btn.classList.contains("open") ? close : open)();
  }

  btn.addEventListener("click", toggle);
  const bg = menu.querySelector(".bg");
  if (bg) bg.addEventListener("click", close);
  menu.querySelectorAll(".links a").forEach((a) => a.addEventListener("click", close));
})();

// ---- Section two: scroll-driven blue -> orange gradient + nav colour switch ----
// As the sticky pane pins, cross-fade the orange gradient in over the blue one
// based on how far the section has scrolled. Also flip the nav from `white`
// (over the dark hero video) to dark (over the light gradient) so it stays legible.
(function scrollGradient() {
  const section = document.querySelector("#section-two");
  const orange = section && section.querySelector(".scroll-gradient__layer.--orange");
  const textOne = section && section.querySelector(".sg-text.--one");
  const textTwo = section && section.querySelector(".sg-text.--two");
  const nav = document.querySelector(".nav");
  const banner = document.querySelector(".banner");
  if (!section || !orange) return;

  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  let ticking = false;

  function update() {
    ticking = false;

    // gradient progress: 0 when the section top reaches the top of the viewport,
    // 1 after we've scrolled its full extra (sticky) distance.
    const rect = section.getBoundingClientRect();
    const distance = section.offsetHeight - window.innerHeight;
    const scrolled = clamp(-rect.top, 0, distance);
    const p = distance > 0 ? scrolled / distance : 0;
    orange.style.opacity = p.toFixed(3);

    // text cross-fade: text 1 (blue phase) -> text 2 (orange phase),
    // swapping across a band centred on the middle of the scroll.
    if (textOne && textTwo) {
      const t2 = clamp((p - 0.4) / 0.2, 0, 1);
      textTwo.style.opacity = t2.toFixed(3);
      textOne.style.opacity = (1 - t2).toFixed(3);
    }

    // nav colour: white while over the hero video, dark once past it
    if (nav && banner) {
      const overHero = window.scrollY < banner.offsetHeight - 100;
      nav.classList.toggle("white", overHero);
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();

// ---- Section two: play the animated logo when it scrolls into view ----
// Adds `.is-visible` to trigger the CSS build-in animation, and removes it when
// the section leaves so the animation replays the next time it comes back.
(function logoInView() {
  const logo = document.querySelector("#sg-logo");
  if (!logo) return;

  if (!("IntersectionObserver" in window)) {
    logo.classList.add("is-visible"); // fallback: just show it playing
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) logo.classList.add("is-visible");
        else logo.classList.remove("is-visible");
      }
    },
    { threshold: 0.35 }
  );
  io.observe(logo);
})();
