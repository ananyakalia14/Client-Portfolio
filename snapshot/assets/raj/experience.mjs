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

function connectJourney(section) {
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
  cursor.setAttribute("r", "5");
  svg.append(guide, line, cursor);
  track.prepend(svg);

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let length = 0;
  let points = [];
  let bottom = 0;
  let frame = 0;
  let previousTop = Number.NaN;
  let quietFrames = 0;

  function requestPaint() {
    if (!frame) frame = requestAnimationFrame(paint);
  }
  function paint() {
    frame = 0;
    if (!length || !track.isConnected) return;
    const top = track.getBoundingClientRect().top;
    const progress = reducedMotion.matches
      ? 1
      : clamp((innerHeight * .72 - top) / Math.max(1, bottom - innerHeight * .16));
    const distance = length * progress;
    const position = line.getPointAtLength(distance);
    line.style.strokeDashoffset = length - distance;
    cursor.setAttribute("cx", position.x);
    cursor.setAttribute("cy", position.y);
    cursor.toggleAttribute("data-visible", progress > 0 && progress < 1 && !reducedMotion.matches);
    stops.forEach((stop, index) => stop.toggleAttribute("data-reached",
      progress > 0 && position.y >= points[index].y - .75));

    // Continue while the reference site's smooth scrolling is catching up.
    quietFrames = Math.abs(top - previousTop) < .05 ? quietFrames + 1 : 0;
    previousTop = top;
    if (!reducedMotion.matches && quietFrames < 5) requestPaint();
  }
  function measure() {
    const box = track.getBoundingClientRect();
    if (!box.width || !box.height) return;
    points = pins.map(pin => {
      const rect = pin.getBoundingClientRect();
      return { x: rect.left - box.left + rect.width / 2, y: rect.top - box.top + rect.height / 2 };
    });
    const last = points.at(-1);
    bottom = Math.min(box.height - 2, last.y + 35);
    const start = { x: points[0].x, y: Math.max(2, points[0].y - 35) };
    const end = { x: last.x, y: bottom };
    const route = [start, ...points, end];
    const path = route.slice(1).reduce((d, next, i) => {
      const point = route[i];
      const mid = (point.y + next.y)/2;
      return d + " C " + point.x + " " + mid + " " + next.x + " " + mid + " " + next.x + " " + next.y;
    }, "M " + start.x + " " + start.y);
    svg.setAttribute("viewBox", "0 0 " + box.width + " " + box.height);
    guide.setAttribute("d", path);
    line.setAttribute("d", path);
    length = line.getTotalLength();
    line.style.strokeDasharray = length + " " + length;
    requestPaint();
  }
  const resize = new ResizeObserver(measure);
  resize.observe(track);
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
  };
}

export function syncJourney(path) {
  if (mounted?.section.isConnected && path === "/about") return;
  if (mounted) {
    mounted.disconnect();
    mounted.section.remove();
    mounted = null;
  }
  if (path !== "/about") return;
  const next = document.querySelector(".quotes-prose");
  if (!next) return;
  const section = createJourney();
  next.before(section);
  mounted = { section, disconnect: connectJourney(section) };

  if (location.hash === "#experience") {
    requestAnimationFrame(() => {
      if (section.isConnected && location.hash === "#experience") {
        window.scrollTo({ top: Math.max(0, window.scrollY + section.getBoundingClientRect().top - 75), behavior: "instant" });
      }
    });
  }
}
