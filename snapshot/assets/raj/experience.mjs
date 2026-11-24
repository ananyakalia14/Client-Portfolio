import { experiences } from "./content.mjs";

const svgNs = "http://www.w3.org/2000/svg";
const clamp = (value) => Math.max(0, Math.min(1, value));
const escape = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
let mounted;

function createJourney() {
  const section = document.createElement("section");
  section.id = "experience";
  section.className = "raj-journey";
  section.setAttribute("aria-labelledby", "raj-journey-title");
  section.innerHTML =
    '<header class="raj-journey-header"><p class="micro">Internships &amp; leadership</p>' +
    '<h2 class="display" id="raj-journey-title">My journey<span class="fullstop">.</span></h2></header>' +
    '<div class="raj-journey-track"><ol class="raj-journey-list">' +
    experiences.map(({ role, organization, period, logo, details }) =>
      '<li class="raj-journey-stop"><span class="raj-journey-node" aria-hidden="true"></span>' +
      '<article class="raj-journey-card"><header class="raj-journey-role">' +
      '<div><p class="raj-journey-date micro">'+escape(period)+'</p><h3 class="display">'+escape(role)+'</h3>' +
      '<p class="raj-journey-org">'+escape(organization)+'</p></div>' +
      '<img width="50" height="50" loading="lazy" src="/raj/'+escape(logo)+'" alt=""></header>' +
      '<ul>'+details.map(detail => '<li>'+escape(detail)+'</li>').join("")+'</ul></article></li>'
    ).join("") +
    '</ol></div>';
  return section;
}

function buildSpline(points) {
  if (points.length < 2) return "";
  let d = "M " + points[0].x.toFixed(1) + " " + points[0].y.toFixed(1);
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += " C " + cp1x.toFixed(1) + " " + cp1y.toFixed(1) + ", " + cp2x.toFixed(1) + " " + cp2y.toFixed(1) + ", " + p2.x.toFixed(1) + " " + p2.y.toFixed(1);
  }
  return d;
}

function connectJourney(section, bq) {
  const track = section.querySelector(".raj-journey-track");
  const stops = [...track.querySelectorAll(".raj-journey-stop")];
  const pins = stops.map(stop => stop.querySelector(".raj-journey-node"));
  const svg = document.createElementNS(svgNs, "svg");
  svg.classList.add("raj-journey-svg");
  svg.setAttribute("aria-hidden", "true");
  const guide = document.createElementNS(svgNs, "path");
  guide.classList.add("raj-journey-guide");
  const line = document.createElementNS(svgNs, "path");
  line.classList.add("raj-journey-line");
  const cursor = document.createElementNS(svgNs, "circle");
  cursor.classList.add("raj-journey-cursor");
  cursor.setAttribute("r", "5.5");
  svg.append(guide, line, cursor);
  section.prepend(svg);

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let length = 0;
  let points = [];
  let yLut = [];
  let frame = 0;
  let previousTop = Number.NaN;
  let quietFrames = 0;

  function requestPaint() {
    if (!frame) frame = requestAnimationFrame(paint);
  }

  function getDistanceForTargetY(targetY) {
    if (!yLut.length) return 0;
    if (targetY <= yLut[0].y) return 0;
    if (targetY >= yLut[yLut.length - 1].y) return length;

    // Find closest distance in the LUT that reaches targetY
    let bestDist = 0;
    for (let i = 0; i < yLut.length; i++) {
      if (yLut[i].y <= targetY) {
        bestDist = yLut[i].dist;
      }
    }
    return bestDist;
  }

  function paint() {
    frame = 0;
    if (!length || !section.isConnected) return;

    let distance = length;
    let top = 0;
    let activeProgress = 1;

    if (!reducedMotion.matches) {
      if (bq && bq.isConnected) {
        const bqRect = bq.getBoundingClientRect();
        top = bqRect.top;
        // Directly map scroll position to the current viewport eye level (74% down the screen)
        // so the path and cursor dot lead right with the viewport scroll instead of lagging behind
        const targetY = (innerHeight * 0.74) - bqRect.top;
        distance = getDistanceForTargetY(targetY);
        activeProgress = distance / length;
      } else {
        const trackRect = track.getBoundingClientRect();
        top = trackRect.top;
        const bottom = points.length ? points.at(-1).y + 35 : trackRect.height;
        activeProgress = clamp((innerHeight * 0.78 - top) / Math.max(1, bottom - innerHeight * 0.12));
        distance = length * activeProgress;
      }
    }

    const position = line.getPointAtLength(distance);
    line.style.strokeDashoffset = length - distance;
    cursor.setAttribute("cx", position.x.toFixed(1));
    cursor.setAttribute("cy", position.y.toFixed(1));
    cursor.toggleAttribute("data-visible", distance > 5 && distance < length - 5 && !reducedMotion.matches);

    stops.forEach((stop, index) => {
      const reached = reducedMotion.matches || (distance > 0 && position.y >= points[index].y - 4);
      stop.toggleAttribute("data-reached", reached);
    });

    quietFrames = Math.abs(top - previousTop) < 0.05 ? quietFrames + 1 : 0;
    previousTop = top;
    if (!reducedMotion.matches && quietFrames < 6) requestPaint();
  }

  function measure() {
    if (!section.isConnected) return;
    const sBox = section.getBoundingClientRect();
    if (!sBox.width || !sBox.height) return;

    let refRect = sBox;
    let topOffset = 0;

    if (bq && bq.isConnected) {
      const bBox = bq.getBoundingClientRect();
      refRect = bBox;
      topOffset = bBox.top - sBox.top; // negative
    }

    const totalWidth = sBox.width;
    const totalHeight = sBox.height - topOffset;

    svg.style.position = "absolute";
    svg.style.left = "0";
    svg.style.width = "100%";
    svg.style.top = topOffset + "px";
    svg.style.height = totalHeight + "px";
    svg.setAttribute("viewBox", "0 0 " + totalWidth + " " + totalHeight);

    // Timeline stop pins in unified SVG coordinates
    points = pins.map(pin => {
      const rect = pin.getBoundingClientRect();
      return {
        x: rect.left - refRect.left + rect.width / 2,
        y: rect.top - refRect.top + rect.height / 2
      };
    });

    let allPoints = [];

    if (bq && bq.isConnected && points.length) {
      const quoteEl = bq.querySelector(".raj-quote") || bq.querySelector(".bq-ink");
      const accentEl = bq.querySelector(".raj-quote-accent") || quoteEl;

      const qBox = quoteEl ? quoteEl.getBoundingClientRect() : {
        left: refRect.left + 40, top: refRect.top + 80,
        right: refRect.left + totalWidth * 0.65, bottom: refRect.top + 380,
        width: totalWidth * 0.65, height: 300
      };
      const aBox = accentEl ? accentEl.getBoundingClientRect() : qBox;

      const qL = qBox.left - refRect.left;
      const qT = qBox.top - refRect.top;
      const qR = qBox.right - refRect.left;
      const qB = qBox.bottom - refRect.top;
      const qW = qBox.width;
      const qH = qBox.height;

      const aL = aBox.left - refRect.left;
      const aT = aBox.top - refRect.top;
      const aR = aBox.right - refRect.left;
      const aB = aBox.bottom - refRect.top;
      const aW = aBox.width;
      const aMidY = (aT + aB) / 2;

      // Artistic circling loops around the quote, highlighting "Curiosity comes first." (Skiper 19 style)
      const quotePoints = [
        { x: Math.min(totalWidth - 30, qR + Math.max(50, qW * 0.16)), y: Math.max(25, qT - 35) },
        { x: qL + qW * 0.48, y: Math.max(15, qT - 55) },
        { x: Math.max(20, qL - 35), y: qT + qH * 0.28 },
        { x: Math.max(24, aL - 40), y: aMidY + 18 },
        { x: aL + aW * 0.35, y: aB + 30 },
        { x: Math.min(totalWidth - 25, aR + 45), y: aMidY + 5 },
        { x: aL + aW * 0.52, y: aT - 22 },
        { x: Math.max(20, aL - 25), y: aMidY - 10 },
        { x: aL + aW * 0.78, y: aB + 18 },
        { x: Math.min(totalWidth - 35, qR + Math.max(80, qW * 0.26)), y: aMidY - 24 },
        { x: Math.min(totalWidth - 20, qR + Math.max(130, qW * 0.38)), y: aB + 20 },
        { x: Math.min(totalWidth - 45, qR + Math.max(50, qW * 0.15)), y: aB + 85 },
        { x: totalWidth * 0.52, y: -topOffset - 65 },
        { x: Math.max(totalWidth * 0.38, points[0].x - 45), y: -topOffset + 25 }
      ];

      const last = points.at(-1);
      const end = { x: last.x, y: Math.min(totalHeight - 20, last.y + 40) };

      allPoints = [...quotePoints, ...points, end];
    } else if (points.length) {
      const last = points.at(-1);
      const start = { x: points[0].x, y: Math.max(2, points[0].y - 35) };
      const end = { x: last.x, y: Math.min(totalHeight - 2, last.y + 35) };
      allPoints = [start, ...points, end];
    }

    if (allPoints.length < 2) return;

    const path = buildSpline(allPoints);
    guide.setAttribute("d", path);
    line.setAttribute("d", path);
    length = line.getTotalLength();
    line.style.strokeDasharray = length + " " + length;

    // Build dense Y -> Distance Look-Up Table for instant zero-lag scroll tracking
    yLut = [];
    const samples = 120;
    for (let i = 0; i <= samples; i++) {
      const d = (i / samples) * length;
      const pt = line.getPointAtLength(d);
      yLut.push({ dist: d, y: pt.y });
    }

    requestPaint();
  }

  const resize = new ResizeObserver(measure);
  resize.observe(section);
  if (bq) resize.observe(bq);

  reducedMotion.addEventListener("change", requestPaint);
  window.addEventListener("scroll", requestPaint, { passive: true });
  window.addEventListener("resize", measure, { passive: true });

  measure();

  return () => {
    resize.disconnect();
    reducedMotion.removeEventListener("change", requestPaint);
    window.removeEventListener("scroll", requestPaint);
    window.removeEventListener("resize", measure);
    cancelAnimationFrame(frame);
    svg.remove();
  };
}

export function syncJourney(path) {
  if (mounted?.section.isConnected && mounted.path === path) return;
  if (mounted) {
    mounted.disconnect();
    mounted.section.remove();
    mounted = null;
  }

  if (path === "/") {
    const bq = document.querySelector("section.bq");
    if (!bq) return;
    const section = createJourney();
    bq.after(section);
    mounted = { path, section, disconnect: connectJourney(section, bq) };
  } else if (path === "/about") {
    const next = document.querySelector(".quotes-prose");
    if (!next) return;
    const section = createJourney();
    next.before(section);
    mounted = { path, section, disconnect: connectJourney(section, null) };
  }

  if (mounted && location.hash === "#experience") {
    requestAnimationFrame(() => {
      if (mounted?.section.isConnected && location.hash === "#experience") {
        window.scrollTo({
          top: Math.max(0, window.scrollY + mounted.section.getBoundingClientRect().top - 75),
          behavior: "instant"
        });
      }
    });
  }
}
