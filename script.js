const canvas = document.querySelector("#ink-canvas");
const ctx = canvas.getContext("2d");
const frame = document.querySelector("#pptx-frame");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const deckFileName = "鎌倉(一部に藤沢あり)_平野巧.pptx";
const deckUrl = new URL(deckFileName, window.location.href).href;
const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(deckUrl)}`;

frame.src = officeViewerUrl;

let width = 0;
let height = 0;
let drops = [];

function resizeCanvas() {
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * scale);
  canvas.height = Math.floor(height * scale);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  const count = Math.max(24, Math.min(62, Math.floor(width / 18)));
  drops = Array.from({ length: count }, () => ({
    x: width * (0.28 + Math.random() * 0.75),
    y: height * (0.1 + Math.random() * 0.84),
    r: 12 + Math.random() * 62,
    a: 0.018 + Math.random() * 0.05,
    pulse: Math.random() * Math.PI * 2,
    speed: 0.002 + Math.random() * 0.006
  }));
}

function drawInkWash() {
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = "multiply";

  for (const drop of drops) {
    drop.pulse += drop.speed;
    const radius = drop.r * (1 + Math.sin(drop.pulse) * 0.08);
    const gradient = ctx.createRadialGradient(drop.x, drop.y, 0, drop.x, drop.y, radius);
    gradient.addColorStop(0, `rgba(8, 17, 31, ${drop.a * 1.9})`);
    gradient.addColorStop(0.48, `rgba(8, 17, 31, ${drop.a})`);
    gradient.addColorStop(1, "rgba(8, 17, 31, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(drop.x, drop.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(drawInkWash);
}

function revealOnScroll() {
  const elements = document.querySelectorAll(".concept-grid article, .data-strip figure, .deck-viewer");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.animate(
          [
            { opacity: 0, transform: "translateY(18px)" },
            { opacity: 1, transform: "translateY(0)" }
          ],
          {
            duration: 560,
            easing: "cubic-bezier(.18,.72,.16,1)",
            fill: "forwards"
          }
        );
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16 }
  );

  elements.forEach((element) => {
    element.style.opacity = "0";
    observer.observe(element);
  });
}

resizeCanvas();

if (!prefersReducedMotion) {
  drawInkWash();
  revealOnScroll();
}

window.addEventListener("resize", resizeCanvas);
