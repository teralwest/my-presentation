const canvas = document.querySelector("#night-canvas");
const ctx = canvas.getContext("2d");
const track = document.querySelector("#slide-track");
const slides = [...document.querySelectorAll(".slide-card")];
const dots = document.querySelector("#slide-dots");
const prev = document.querySelector("#prev-slide");
const next = document.querySelector("#next-slide");

let width = 0;
let height = 0;
let particles = [];
let activeIndex = 0;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function resizeCanvas() {
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * scale);
  canvas.height = Math.floor(height * scale);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  const count = Math.max(34, Math.min(90, Math.floor(width / 16)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.9 + 0.4,
    vx: (Math.random() - 0.5) * 0.18,
    vy: Math.random() * -0.22 - 0.04,
    a: Math.random() * 0.55 + 0.16,
    hue: Math.random() > 0.72 ? "112, 196, 207" : "231, 183, 90"
  }));
}

function drawNight() {
  ctx.clearRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(width * 0.5, height * 0.38, 0, width * 0.5, height * 0.38, width * 0.64);
  glow.addColorStop(0, "rgba(231, 183, 90, 0.08)");
  glow.addColorStop(0.36, "rgba(211, 76, 63, 0.045)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.y < -8) p.y = height + 8;
    if (p.x < -8) p.x = width + 8;
    if (p.x > width + 8) p.x = -8;

    ctx.beginPath();
    ctx.fillStyle = `rgba(${p.hue}, ${p.a})`;
    ctx.shadowColor = `rgba(${p.hue}, 0.62)`;
    ctx.shadowBlur = 12;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  requestAnimationFrame(drawNight);
}

function setActive(index, shouldScroll = true) {
  activeIndex = Math.max(0, Math.min(slides.length - 1, index));
  [...dots.children].forEach((button, i) => {
    button.setAttribute("aria-current", i === activeIndex ? "true" : "false");
  });

  if (shouldScroll) {
    slides[activeIndex].scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "start"
    });
  }
}

function nearestSlide() {
  const left = track.scrollLeft;
  let best = 0;
  let bestDistance = Infinity;
  slides.forEach((slide, index) => {
    const distance = Math.abs(slide.offsetLeft - track.offsetLeft - left);
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}

function buildDots() {
  slides.forEach((_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(index + 1).padStart(2, "0");
    button.setAttribute("aria-label", `スライド${index + 1}へ移動`);
    button.addEventListener("click", () => setActive(index));
    dots.append(button);
  });
}

let scrollTimer = 0;
function handleSlideScroll() {
  window.clearTimeout(scrollTimer);
  scrollTimer = window.setTimeout(() => setActive(nearestSlide(), false), 70);
}

buildDots();
setActive(0, false);
resizeCanvas();

if (!prefersReducedMotion) {
  drawNight();
}

window.addEventListener("resize", resizeCanvas);
track.addEventListener("scroll", handleSlideScroll, { passive: true });

prev.addEventListener("click", () => setActive(activeIndex - 1));
next.addEventListener("click", () => setActive(activeIndex + 1));

track.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    setActive(activeIndex + 1);
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    setActive(activeIndex - 1);
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.animate(
          [
            { opacity: 0, transform: "translateY(18px)" },
            { opacity: 1, transform: "translateY(0)" }
          ],
          {
            duration: 560,
            easing: "cubic-bezier(.2,.74,.18,1)",
            fill: "forwards"
          }
        );
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

if (!prefersReducedMotion) {
  document.querySelectorAll(".summary-grid article, .slide-card, .model-main, .model-side").forEach((element) => {
    element.style.opacity = "0";
    revealObserver.observe(element);
  });
}
