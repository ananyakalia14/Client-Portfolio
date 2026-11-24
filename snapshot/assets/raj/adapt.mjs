import { syncQuoteReveal } from "./quote-reveal.mjs";
import { syncKoiBackground } from "./koi-loader.mjs";
import { syncJourney } from "./experience.mjs";
import { syncFooterLandscape } from "./footer-landscape.mjs";
import { person, projects, history, gallery } from "./content.mjs";
import { assetMap } from "./asset-map.mjs";

const all = (parent, selector) => [...parent.querySelectorAll(selector)];
const one = (parent, selector) => parent.querySelector(selector);
const currentRoute = () => location.pathname.replace(/\/+$/, "") || "/";
const normalize = value => value?.replace(/\s+/g, " ").trim();
const aria = (node, label) => {
  if (node && node.getAttribute("aria-label") !== label) node.setAttribute("aria-label", label);
};
function write(node, message) {
  if (!node || message == null) return;
  const lines = Array.isArray(message) ? message : [message];
  if (node.textContent === lines.join("")) return;
  const content = lines.flatMap((line, i) => i ? [document.createElement("br"), line] : [line]);
  node.replaceChildren(...content);
}
const set = (selector, message, parent = document) => all(parent, selector).forEach(node => write(node, message));
function split(node, message, selector, Class, property, timing = false) {
  if (!node || node.dataset.rajText === message) return;
  const prev = all(node, selector);
  if (!prev.length) return;
  const insertion = prev[0];
  for (const [index, char] of [...message].entries()) {
    const item = document.createElement("span");
    item.className = Class;
    item.setAttribute("aria-hidden", "true");
    if (property) item.style.setProperty(property, index);
    if (timing) {
      item.style.setProperty("--t", 120 + index * 24 + "ms");
      item.style.setProperty("--d", "24ms");
    }
    item.textContent = char === " " ? "\u00a0" : char;
    insertion.before(item);
  }
  prev.forEach(el => el.remove());
  node.dataset.rajText = message;
}
function rolled(link, title) {
  const roll = one(link, ".roll");
  if (!roll) return write(link, title);
  const sr = one(roll, ".sr-only");
  const shown = one(roll, ":scope > [aria-hidden]");
  if (!shown) return;
  if (shown.dataset.rajWord !== title) {
    shown.replaceChildren(...title.split(" ").flatMap((word, index, words) => {
      const hold = document.createElement("span");
      hold.className = "roll__w";
      const offset = words.slice(0, index).reduce((n, w) => n + w.length + 1, 0);
      [...word].forEach((character, j) => {
        const char = document.createElement("span");
        char.className = "roll__c";
        char.style.setProperty("--i", offset + j);
        char.textContent = character;
        hold.append(char);
      });
      return index ? [" ", hold] : [hold];
    }));
    shown.dataset.rajWord = title;
    roll.style.setProperty("--n", title.length);
  }
  write(sr, title);
}
function projectFor(link) {
  const value = link.replace(/\/$/, "");
  if (value.includes("substack.com/@awaaari")) return projects.fit;
  return Object.entries(projects).find(([key]) => value.endsWith("/" + key))?.[1];
}
function applyShared(path) {
  const routes = { "/": person.title, "/work": "Work · Raj Mane", "/about": "About · Raj Mane", "/b-roll": "B-roll · Raj Mane", "/playground": "Playground · Raj Mane" };
  const title = routes[path] || projectFor(path)?.title + " · Raj Mane";
  if (document.title !== title) document.title = title;
  aria(one(document, ".nav-logo"), "Raj Mane, home");
  for (const logo of all(document, ".f-logo,.f2-logo")) aria(logo, "Raj Mane, home");

  for (const link of all(document, "a[href]")) {
    if (link.closest(".f-social, .f2-social")) continue;
    const href = link.getAttribute("href");
    const original = link.dataset.rajHref || href;
    if (!original) continue;
    let change;
    if (/linkedin\.com\/in\/sruthi-ramisetty/.test(original)) change = [person.linkedin, "linkedin"];
    else if (/instagram\.com\/worksruthi/.test(original)) change = [person.github, "github"];
    else if (/x\.com\/awaaari/.test(original)) change = [person.leetcode, "leetcode"];
    else if (/letterboxd\.com\/sruthzi/.test(original)) change = [person.resume, "résumé"];
    else if (/^https:\/\/substack\.com\/@awaaari\/?$/.test(original)) change = [person.github, "projects"];
    else if (/mailto:sruthi|mailto:rmane9313/.test(original)) change = [person.email, "mail"];
    else if (/awwwards\.com\/sites\/sruthis-creative-portfolio/.test(original)) {
      if (link.classList.contains("gsap-ticker-link")) change = ["/work/", person.ticker];
      else {
        change = [person.resume, "Download résumé"];
        const badge = link.closest("div");
        if (badge && !badge.dataset.rajBadge) {
          badge.dataset.rajBadge = "true";
          link.classList.add("raj-resume-badge");
          link.replaceChildren("CV");
        }
      }
    }
    const project = projectFor(original);
    if (project && /^(https:\/\/substack|\/creative-direction|\/email-marketing)/.test(original)) {
      if (project === projects.fit) change = [project.demo, project.short];
      else change = [original, project.short];
    }
    if (link.classList.contains("phs-link")) {
      const caseData = projectFor(path);
      if (caseData) change = [caseData.code, "Open project repository"];
    }
    if (!change) continue;
    link.dataset.rajHref ||= original;
    const [target, label] = change;
    if (href !== target) link.setAttribute("href", target);
    if (link.hasAttribute("aria-label")) aria(link, label);
    if (one(link, ".roll")) rolled(link, label);
    else if (link.classList.contains("label") && !one(link, "img,svg")) write(link, label);
  }
  for (const item of all(document, "p.micro.muted")) {
    if (/©\s*2026\s+Sruthi/i.test(item.textContent)) {
      const first = [...item.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.textContent.includes("©"));
      if (first) first.textContent = "© 2026 Raj Mane";
    }
  }
  set(".f-convo", ["Have a project in mind?", "Say hi at"]);
  set(".f2-tagline", ["AI Data Science Engineer", "and full stack developer"]);
  set(".gsap-ticker-line", person.ticker);
  aria(one(document, "button.pf"), "Email Raj Mane");
  for (const element of all(document, "[alt], [title], [aria-label]")) {
    for (const attribute of ["alt", "title", "aria-label"]) {
      const value = element.getAttribute(attribute);
      if (/sruthi/i.test(value || "")) element.setAttribute(attribute, value.replace(/sruthi(?: ramisetty)?/gi, person.name));
    }
  }
  for (const label of all(document, ".f2-tagline + .fullstop, .f2-tagline .fullstop")) aria(label, ".");
  for (const link of all(document, 'link[rel~="icon"],link[rel="apple-touch-icon"]')) {
    if (link.getAttribute("href") !== "/raj/mark.svg") link.setAttribute("href", "/raj/mark.svg");
  }

  for (const img of all(document, "img[src]")) {
    const raw = img.getAttribute("src");
    const source = assetMap[raw];
    if (!source?.[1]) continue;
    if (img.alt && img.alt !== source[1]) img.alt = source[1];
    const button = img.closest("button.bs-hit, button.ssp-hit");
    if (button) aria(button, source[1]);
  }
  for (const filmFrame of all(document, ".films-acc-item")) {
    const source = assetMap[one(filmFrame, "img")?.getAttribute("src")];
    if (source) write(one(filmFrame, ".films-acc-cap"), source[1]);
  }
  const overlays = all(document, "[role=dialog], .pgl, .bs-viewer, .ssp-lightbox, .el-lightbox, .cork-lightbox, .bs-dive");
  for (const overlay of overlays) {
    const source = assetMap[one(overlay, "img[src]")?.getAttribute("src")];
    if (!source?.[1]) continue;
    for (const element of all(overlay, "figcaption,[class*=caption],.bs-caption,.pgl-cap,.ssp-modal-cap,.el-cap")) {
      if (!one(element, "img,button")) write(element, source[1]);
    }
  }

}

const faq = [
  [["what do you", "build?"], "AI & Data Science systems, applied machine learning projects, and full stack web applications."],
  [["what are you", "studying?"], "Computer Science Engineering at TCET Mumbai. Current CGPA: 9.88/10."],
  [["what tools", "do you use?"], "Python, OpenCV, MediaPipe, TensorFlow, Flask, Next.js, and SQL."],
  [["what have you", "won?"], "GenerationTech 2025, Model Forge 2025, and the NEXUS AI Challenge."],
  [["what are you", "curious about?"], "Robotics, space technology, and using interfaces to make complex systems easier to work with."],
  [["where can i", "find your work?"], "Explore the Work and Playground pages, or follow the GitHub links for the code."],
];
function home() {
  set(".hero-word--sruthi .hero-word__txt", "Raj Mane");
  const name = all(document, ".hero-word__txt").at(-1);
  if (normalize(name?.textContent)?.toLowerCase() === "sruthi") write(name, "Raj Mane");
  aria(one(document, "#top.hero"), "Hello, meet Raj Mane");
  const bylines = ["AI Data Science Engineer", " / full stack developer"];
  all(document, ".hero-byline__l").forEach((line, index) => {
    const text = bylines[index] ?? "";
    write(line.querySelector(".sr-only"), text);
  });
  aria(one(document, ".bq"), "What I build");
  aria(one(document, ".bq-ink"), "I build at the intersection of machine learning, physical hardware, and the web. Curiosity comes first. — Raj Mane");
  set(".sfold-head", "I BUILD SYSTEMS THAT SEE");
  const workHeading = one(document, ".wstrip-head");
  editTextNodes(workHeading, ["work I’m", "proud of"]);
  aria(workHeading, "Work I’m proud of.");
  const intro = all(document, ".sfold-body");
  write(intro[0], "I’m Raj Mane, an AI Data Science Engineer and Full Stack Developer studying at TCET Mumbai. I build intelligent AI systems, data science pipelines, and full-stack web applications.");
  write(intro[1], "I’m drawn to space technology, robotics, and making complex systems easier to use.");
  const call = one(document, ".sfold-btn");
  if (call) rolled(call, "see my projects");
  const skills = ["AI & Data Science", "Full Stack", "Development", "Machine", "Learning", "Deep Learning", "Python", "Cloud Systems", "Automation"];
  all(document, ".sfold-w").forEach((item, i) => write(item, skills[i] || ""));
  const questions = all(document, ".faq-a");
  questions.forEach((answer, i) => {
    if (!faq[i]) return;
    const row = answer.closest("li") || answer.parentElement;
    const lines = all(row, ".faq-q-line");
    lines.forEach((line, j) => write(line, lines.length === 1 ? faq[i][0].join(" ") : faq[i][0][j] || ""));
    write(answer, faq[i][1]);
  });
  aria(one(document, ".hli"), "Build something with me");
  renderTechStack();
  const envelope = one(document, ".hli-stage");
  if (envelope) aria(envelope, "Build something with me — email Raj Mane");
}

function renderTechStack() {
  if (one(document, "#tech-stack")) return;
  const personSec = one(document, "#person");
  if (!personSec) return;
  const temp = document.createElement("div");
  temp.innerHTML = "<section id=\"tech-stack\" class=\"raj-tech-stack-section\" aria-label=\"technical stack and skills\">\n  <div class=\"raj-tech-stack-container\">\n    <div class=\"raj-tech-header\">\n      <span class=\"raj-tech-bracket\" aria-hidden=\"true\">[</span><span class=\"raj-tech-label\">TECH STACK</span><span class=\"raj-tech-bracket\" aria-hidden=\"true\">]</span>\n    </div>\n    <div class=\"raj-tech-stack-card\">\n      <div class=\"raj-tech-divider\" aria-hidden=\"true\"></div>\n      <div class=\"raj-tech-grid\">\n        <!-- Top Left: LANGUAGES -->\n        <div class=\"raj-tech-cell\">\n          <div class=\"raj-tech-title\">LANGUAGES</div>\n          <div class=\"raj-tech-pills\">\n            <div class=\"raj-tech-pill\"><span class=\"raj-tech-icon\"><svg viewBox=\"0 0 128 128\" width=\"16\" height=\"16\"><path d=\"M63.7 3.3c-28.7 0-26.9 12.4-26.9 12.4l.1 12.8h27.4v3.9H25.8S7 30.2 7 59.2c0 29.1 16.4 28 16.4 28h9.8v-13.7s-.5-16.4 16.1-16.4h27.3s15.5.3 15.5-15V18.7S93.7 3.3 63.7 3.3zm-14.7 8.8a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8z\" fill=\"#387eb8\"/><path d=\"M64.3 124.7c28.7 0 26.9-12.4 26.9-12.4l-.1-12.8H63.7v-3.9h38.5s18.8 2.2 18.8-26.8c0-29.1-16.4-28-16.4-28h-9.8v13.7s.5 16.4-16.1 16.4H53.1s-15.5-.3-15.5 15v24.4s-1.6 14.4 26.7 14.4zm14.7-8.8a4.9 4.9 0 1 1 0-9.8 4.9 4.9 0 0 1 0 9.8z\" fill=\"#ffe052\"/></svg></span><span>Python</span></div>\n            <div class=\"raj-tech-pill\"><span class=\"raj-tech-icon\"><svg viewBox=\"0 0 128 128\" width=\"16\" height=\"16\"><path fill=\"#00599C\" d=\"M117.7 54.8l-18-31.2c-2.3-4-6.6-6.5-11.2-6.5H52.2c-4.6 0-8.9 2.5-11.2 6.5l-18 31.2c-2.3 4-2.3 8.9 0 12.9l18 31.2c2.3 4 6.6 6.5 11.2 6.5h36.3c4.6 0 8.9-2.5 11.2-6.5l18-31.2c2.3-4 2.3-9 0-12.9z\"/><path fill=\"#FFF\" d=\"M66.4 46.5c-2.8-4.5-7.7-7.2-13-7.2-8.5 0-15.4 6.9-15.4 15.4 0 8.5 6.9 15.4 15.4 15.4 5.3 0 10.2-2.7 13-7.2l6.8 4.1c-4.4 6.9-12 11.2-20.2 11.2-13 0-23.6-10.6-23.6-23.6s10.6-23.6 23.6-23.6c8.2 0 15.8 4.3 20.2 11.2l-6.8 4.3zm21.3 12.7h-4.3v4.3h-3.6v-4.3h-4.3v-3.6h4.3v-4.3h3.6v4.3h4.3v3.6zm15.4 0h-4.3v4.3h-3.6v-4.3h-4.3v-3.6h4.3v-4.3h3.6v4.3h4.3v3.6z\"/></svg></span><span>C/C++</span></div>\n            <div class=\"raj-tech-pill\"><span class=\"raj-tech-icon\"><svg viewBox=\"0 0 128 128\" width=\"16\" height=\"16\"><rect width=\"128\" height=\"128\" rx=\"8\" fill=\"#F7DF1E\"/><path d=\"M73.4 97.4c2.8 4.7 6.6 8.3 13.5 8.3 5.7 0 9.3-2.8 9.3-6.7 0-4.6-3.7-6.3-10-9-9.1-3.9-15.1-8.9-15.1-19.3 0-9.6 7.3-16.9 18.8-16.9 8.2 0 14.1 2.9 18.2 10.2l-7.9 5.1c-2.2-3.8-4.6-5.4-10.3-5.4-4.3 0-7.3 2.7-7.3 6.1 0 3.7 2.3 5.3 8.3 7.9 10.6 4.6 16.9 9.3 16.9 20.2 0 11.6-9.1 17.8-21.2 17.8-12 0-19.6-5.8-23.2-13.4l10-4.8zM29.5 98.7l8.2-5c2.4 3.9 4.6 6.9 9.8 6.9 5.1 0 8.3-2 8.3-9.9V54.4h11.9v36.3c0 14.2-8.3 20.6-20.2 20.6-10.8 0-16.5-5.6-19.9-12.6z\" fill=\"#000\"/></svg></span><span>JavaScript</span></div>\n            <div class=\"raj-tech-pill\"><span class=\"raj-tech-icon\"><svg viewBox=\"0 0 128 128\" width=\"16\" height=\"16\"><rect width=\"128\" height=\"128\" rx=\"8\" fill=\"#3178C6\"/><path fill=\"#FFF\" d=\"M68.8 46.2H32.4v13.5h12.1V109h12.1V59.7h12.1V46.2zm20.8 28.5c4.7-2.6 10.6-4.4 16.6-4.4 6.7 0 10.6 3.1 10.6 7.8 0 4.9-3.9 7.4-11.4 10.9-10.6 4.7-16.8 10.3-16.8 19.9 0 12.3 9.7 20.7 24.2 20.7 7.7 0 13.9-2 18.4-4.8l-3.6-11.3c-3.6 2.3-8.8 4.2-14.8 4.2-7.5 0-11.4-3.8-11.4-8.3 0-5.1 4.3-7.5 12.4-11.2 10.9-5 15.9-10.8 15.9-19.7 0-12.7-9.8-19.5-23.4-19.5-7.7 0-14.7 2.1-18.9 4.6l2.2 11.7z\"/></svg></span><span>TypeScript</span></div>\n            <div class=\"raj-tech-pill\"><span class=\"raj-tech-icon\"><svg viewBox=\"0 0 128 128\" width=\"16\" height=\"16\"><path fill=\"none\" stroke=\"#4875b4\" stroke-width=\"8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M46 22c-18 0-32 14-32 32 0 12 6 22 15 27l-5 27c-1 4 2 8 6 8h10c4 0 7-3 8-7l4-18c2 1 5 1 8 1 7 0 13-3 18-7 4 4 10 7 17 7 4 0 7-1 10-2l4 19c1 4 4 7 8 7h10c4 0 7-4 6-8l-5-27c9-5 15-15 15-27 0-18-14-32-32-32-9 0-17 4-23 10-6-6-14-10-23-10zm-6 24c3 0 6 3 6 6s-3 6-6 6-6-3-6-6 3-6 6-6zm48 0c3 0 6 3 6 6s-3 6-6 6-6-3-6-6 3-6 6-6z\"/></svg></span><span>SQL</span></div>\n          </div>\n        </div>\n\n        <!-- Top Right: FRAMEWORKS -->\n        <div class=\"raj-tech-cell\">\n          <div class=\"raj-tech-title\">FRAMEWORKS</div>\n          <div class=\"raj-tech-pills\">\n            <div class=\"raj-tech-pill\"><span class=\"raj-tech-icon\"><svg viewBox=\"0 0 128 128\" width=\"16\" height=\"16\"><path fill=\"#02569B\" d=\"M78.6 8l-64 64 19.8 19.8 84-83.8H78.6z\"/><path fill=\"#0175C2\" d=\"M78.6 62.4L44.2 96.8l19.8 19.8 14.6-14.6 39.8-39.6H78.6z\"/></svg></span><span>Flutter</span></div>\n            <div class=\"raj-tech-pill\"><span class=\"raj-tech-icon\"><svg viewBox=\"0 0 128 128\" width=\"16\" height=\"16\"><circle cx=\"64\" cy=\"64\" r=\"10\" fill=\"#4dd0e1\"/><g stroke=\"#4dd0e1\" stroke-width=\"7\" fill=\"none\"><ellipse cx=\"64\" cy=\"64\" rx=\"52\" ry=\"19\"/><ellipse cx=\"64\" cy=\"64\" rx=\"52\" ry=\"19\" transform=\"rotate(60 64 64)\"/><ellipse cx=\"64\" cy=\"64\" rx=\"52\" ry=\"19\" transform=\"rotate(120 64 64)\"/></g></svg></span><span>React</span></div>\n            <div class=\"raj-tech-pill\"><span class=\"raj-tech-icon\"><span style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 900; font-size: 15px; color: #0c4b33; line-height: 1; letter-spacing: -0.05em;\">dj</span></span><span>Django</span></div>\n            <div class=\"raj-tech-pill\"><span class=\"raj-tech-icon\"><svg viewBox=\"0 0 128 128\" width=\"16\" height=\"16\"><path fill=\"none\" stroke=\"#539e43\" stroke-width=\"10\" stroke-linejoin=\"round\" d=\"M64 14L18 40.5v53L64 120l46-26.5v-53L64 14z\"/><text x=\"64\" y=\"74\" font-family=\"-apple-system, BlinkMacSystemFont, sans-serif\" font-weight=\"900\" font-size=\"34\" fill=\"#539e43\" text-anchor=\"middle\">JS</text></svg></span><span>Node.js</span></div>\n          </div>\n        </div>\n\n        <!-- Bottom Left: DATA & CLOUD -->\n        <div class=\"raj-tech-cell\">\n          <div class=\"raj-tech-title\">DATA &amp; CLOUD</div>\n          <div class=\"raj-tech-pills\">\n            <div class=\"raj-tech-pill\"><span class=\"raj-tech-icon\"><svg viewBox=\"0 0 128 128\" width=\"16\" height=\"16\"><path fill=\"none\" stroke=\"#4875b4\" stroke-width=\"8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M46 22c-18 0-32 14-32 32 0 12 6 22 15 27l-5 27c-1 4 2 8 6 8h10c4 0 7-3 8-7l4-18c2 1 5 1 8 1 7 0 13-3 18-7 4 4 10 7 17 7 4 0 7-1 10-2l4 19c1 4 4 7 8 7h10c4 0 7-4 6-8l-5-27c9-5 15-15 15-27 0-18-14-32-32-32-9 0-17 4-23 10-6-6-14-10-23-10zm-6 24c3 0 6 3 6 6s-3 6-6 6-6-3-6-6 3-6 6-6zm48 0c3 0 6 3 6 6s-3 6-6 6-6-3-6-6 3-6 6-6z\"/></svg></span><span>PostgreSQL</span></div>\n            <div class=\"raj-tech-pill\"><span class=\"raj-tech-icon\"><svg viewBox=\"0 0 128 128\" width=\"18\" height=\"16\"><path fill=\"#00618A\" d=\"M102 48c-3-6-8-10-14-11 2-5 2-10 1-16-1-7-5-13-10-18C68-3 53-1 39 4 23 10 10 23 4 39c-5 12-5 25-1 37 4 14 13 25 25 32 11 7 24 9 37 7 14-2 27-9 36-20l-10-7c-7 8-16 13-26 14-9 1-19 0-27-5-9-5-15-13-18-23-3-9-3-18 0-27 4-12 13-21 24-26 11-4 22-4 32 1 5 2 9 6 12 11 2 5 3 10 1 15-2 5-6 9-11 11l4 11c8-2 15-7 19-14 3 0 5 1 7 3 2 3 2 7 0 10l9 8c6-6 7-16 3-24z\"/></svg></span><span>MySQL</span></div>\n            <div class=\"raj-tech-pill\"><span class=\"raj-tech-icon\"><svg viewBox=\"0 0 24 24\" width=\"17\" height=\"17\"><path fill=\"#2b6cb0\" d=\"M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z\"/></svg></span><span>Google Cloud</span></div>\n            <div class=\"raj-tech-pill\"><span class=\"raj-tech-icon\"><svg viewBox=\"0 0 128 128\" width=\"17\" height=\"17\"><path fill=\"#0288d1\" d=\"M123.6 55.7c-2.4-1.8-7.7-2.7-12.8-.7-1.1-7.8-6.5-12.4-6.8-12.6l-2.4-1.8-1.7 2.5c-4.4 6.5-4.4 14.2-2.2 19.3-3.6 2-10 2.2-15.3 1.3-4.7-.8-10.6-3.1-13.8-3.1h-44c-2.2 0-4 1.8-4 4v16c0 19.9 16.1 36 36 36 29.8 0 54.7-18.4 63.8-45 4.5.3 10.3-.2 14.3-4.4 1.2-1.3 1.7-2.9 1.4-4.5-.3-1.6-1.2-2.9-2.5-4zM22.5 44.5h10.9v10.9H22.5zm13.6 0H47v10.9H36.1zm13.6 0h10.9v10.9H49.7zm-27.2-13.6h10.9v10.9H22.5zm13.6 0H47v10.9H36.1zm13.6 0h10.9v10.9H49.7zm13.6 0h10.9v10.9H63.3zm-27.2-13.6H47v10.9H36.1zm13.6 0h10.9v10.9H49.7zm13.6 0h10.9v10.9H63.3z\"/></svg></span><span>Docker</span></div>\n          </div>\n        </div>\n\n        <!-- Bottom Right: ENGINEERING -->\n        <div class=\"raj-tech-cell\">\n          <div class=\"raj-tech-title\">ENGINEERING</div>\n          <div class=\"raj-tech-pills\">\n            <div class=\"raj-tech-pill\"><span class=\"raj-tech-icon\"><svg viewBox=\"0 0 128 128\" width=\"16\" height=\"16\"><path fill=\"#F05032\" d=\"M122.4 56.4L71.6 5.6c-4.4-4.4-11.6-4.4-16 0L42.5 18.7l18 18c4.3-1.4 9.2-.5 12.7 3 3.6 3.6 4.4 8.7 2.8 13.1l17.4 17.4c4.4-1.6 9.5-.8 13.1 2.8 5.1 5.1 5.1 13.3 0 18.4s-13.3 5.1-18.4 0c-3.8-3.8-4.6-9.4-2.6-13.9l-16.3-16.3v27.7c1.8 1.1 3.3 2.7 4.3 4.6 3.6 7 1 15.6-5.9 19.1-7 3.6-15.6 1-19.1-5.9-3.6-7-1-15.6 5.9-19.1 2.4-1.2 5.1-1.7 7.7-1.4V59.4c-2.6.3-5.3-.2-7.7-1.4-4.5-2.3-7.3-6.9-7.3-11.9 0-1.8.4-3.6 1.1-5.3L28.8 22.4 5.6 45.6c-4.4 4.4-4.4 11.6 0 16l50.8 50.8c4.4 4.4 11.6 4.4 16 0l50-50c4.4-4.4 4.4-11.6 0-16z\"/></svg></span><span>Git</span></div>\n            <div class=\"raj-tech-pill\"><span class=\"raj-tech-icon\"><svg viewBox=\"0 0 128 128\" width=\"16\" height=\"16\"><path fill=\"#E24329\" d=\"M64 119.5l25.6-78.7H38.4L64 119.5z\"/><path fill=\"#FC6D26\" d=\"M64 119.5L89.6 40.8h27.2L64 119.5z\"/><path fill=\"#FCA326\" d=\"M116.8 40.8l8.3 25.5c1.2 3.7 0 7.8-3.1 10.1L64 119.5l52.8-78.7z\"/><path fill=\"#E24329\" d=\"M116.8 40.8H89.6l14.4-44.2c1.3-4 7-4 8.3 0l4.5 44.2z\"/><path fill=\"#FC6D26\" d=\"M64 119.5L38.4 40.8H11.2L64 119.5z\"/><path fill=\"#FCA326\" d=\"M11.2 40.8L2.9 66.3c-1.2 3.7 0 7.8 3.1 10.1L64 119.5 11.2 40.8z\"/><path fill=\"#E24329\" d=\"M11.2 40.8h27.2L24 7.6c-1.3-4-7-4-8.3 0l-4.5 33.2z\"/></svg></span><span>GitLab</span></div>\n            <div class=\"raj-tech-pill\"><span class=\"raj-tech-icon\"><svg viewBox=\"0 0 128 128\" width=\"17\" height=\"17\"><path fill=\"#02303A\" d=\"M118 73.4c-4.2-1.7-8.8-1.5-12.8.5-5.7 2.9-9.5 8.7-9.8 15.1-4.7-2.6-10.1-3.9-15.6-3.8-11.2.2-21.7 6.2-27.4 15.9-2.1 3.5-3.4 7.4-4 11.4-8.3-6.9-13.6-17.1-14.5-28.1-.9-10.9 2.7-21.7 10-29.8 7.3-8.1 17.6-12.9 28.5-13.3 11-.4 21.6 3.6 29.4 11.1 2.2-2.1 4.7-3.9 7.4-5.2C98.4 34.6 84.4 29 69.8 29.5c-15.4.6-29.8 7.3-40 18.7C19.7 59.5 14.6 74.7 15.9 90.1c1.2 15.3 8.7 29.4 20.7 39.1 1.9 1.5 4.3 2.3 6.7 2.3 2.1 0 4.2-.6 6-1.8 4.7-3.1 6.8-9 5-14.3-1.1-3.3-3.4-6.1-6.4-7.8-6.1-3.5-10-9.8-10.5-16.9-.5-7 2.5-13.8 7.8-18.4 5.4-4.5 12.3-6.7 19.3-6.1 7.1.6 13.5 4.1 17.7 9.8 1.9 2.6 4.8 4.3 8.1 4.7 3.3.4 6.5-.5 9-2.5 5.5-4.5 12.5-6.8 19.6-6.4 7 .4 13.6 3.6 18.2 8.9 2.5 2.9 6.2 4.4 10 4.1 3.8-.4 7.2-2.4 9.2-5.7 3.2-5.4 1.7-12.2-3.3-15.8z\"/><path fill=\"#02303A\" d=\"M109.8 44.2c-5.8 0-10.5-4.7-10.5-10.5S104 23.2 109.8 23.2s10.5 4.7 10.5 10.5-4.7 10.5-10.5 10.5z\"/></svg></span><span>Gradle</span></div>\n            <div class=\"raj-tech-pill\"><span class=\"raj-tech-icon\"><svg viewBox=\"0 0 128 128\" width=\"16\" height=\"16\"><path fill=\"#181717\" fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M64 5.3C29.6 5.3 1.7 33.2 1.7 67.6c0 27.5 17.8 50.8 42.6 59.1 3.1.6 4.3-1.4 4.3-3 0-1.5-.1-6.4-.1-11.7-17.3 3.8-21-7.4-21-7.4-2.8-7.2-6.9-9.1-6.9-9.1-5.7-3.9.4-3.8.4-3.8 6.3.4 9.6 6.5 9.6 6.5 5.6 9.5 14.6 6.8 18.2 5.2.6-4 2.2-6.8 4-8.3-13.8-1.6-28.4-6.9-28.4-30.8 0-6.8 2.4-12.4 6.4-16.7-.6-1.6-2.8-7.9.6-16.5 0 0 5.3-1.7 17.1 6.4 5-1.4 10.4-2.1 15.7-2.1s10.7.7 15.7 2.1c11.8-8.1 17.1-6.4 17.1-6.4 3.4 8.6 1.2 14.9.6 16.5 4 4.4 6.4 10 6.4 16.7 0 24-14.6 29.2-28.5 30.7 2.3 1.9 4.3 5.8 4.3 11.8 0 8.5-.1 15.4-.1 17.5 0 1.7 1.1 3.6 4.3 3 24.7-8.3 42.5-31.6 42.5-59.1C126.3 33.2 98.4 5.3 64 5.3z\"/></svg></span><span>GitHub</span></div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</section>";
  const section = temp.firstElementChild;
  if (section) {
    personSec.after(section);
  }
}

function work() {
  const title = one(document, ".problems-body");
  aria(title, "I build systems that see");
}

function about() {
  set("#about-video-hero-title", "I love a big idea.");
  set(".timeline .h9", "The projects I learn the most from are the ones I get to build.");
  set(".timeline cite", "— Raj Mane");
  aria(one(document, ".constellation-stage"), "I’m a builder of software that works in the real world.");
  set(".constellation-stage h2.sr-only", "I’m a builder of software that works in the real world.");
  const notes = all(document, "[id^=timeline-story-]");
  notes.forEach(note => {
    const index = Number(note.closest("li")?.querySelector(".timeline-number")?.textContent) - 1;
    const label = history[index] || history[Number(note.id.split("-").at(-1))];
    if (!note.dataset.rajOriginalText) note.dataset.rajOriginalText = normalize(note.textContent);
    write(note, label);
  });
  aria(one(document, ".atlas-canvas"), "Interactive map marking Mumbai, where I study. Drag the map, or use arrow keys to pan and plus and minus to zoom.");
  const reader = one(document, ".timeline-reader");
  if (reader) {
    const num = normalize(one(reader, ".timeline-reader-num")?.textContent)?.match(/\b(\d+)\b/);
    const paragraph = one(reader, ".timeline-reader-body, .timeline-reader-story, p:not(.timeline-reader-num)");
    if (num && paragraph) write(paragraph, history[Number(num[1]) - 1]);
  }
  const mosaic = ["…and", "a", "mosaic", "of", "projects", "and", "results", "I’ve", "built."];
  all(document, ".mosaic-stage .mo-word").forEach((node, i) => write(node, mosaic[i] || ""));
  aria(one(document, ".mosaic-stage"), "A mosaic of the projects I’ve built");
  set(".mosaic-stage h2.sr-only", "A mosaic of the projects I’ve built");
  const cork = ["…", "and", "a", "scrapbook", "of", "the", "projects", "and", "milestones", "I’ve", "built…"];
  all(document, ".corkboard-heading .ch-txt").forEach((node, i) => write(node, cork[i] || ""));
  for (const pin of all(document, "button.cork-pin,button.cork-sticker")) {
    const source = assetMap[pin.parentElement.querySelector("img")?.getAttribute("src")];
    if (source) aria(pin, "Move " + source[1]);
  }
  for (const type of all(document, ".films-head .tw, .films .tw, .films-acc-title .tw")) {
    write(one(type, ".sr-only"), "…and a collection of projects and milestones…");
    split(type, "…and a collection of projects and milestones…", ".tw__c", "tw__c", "--i");
  }
  const summary = one(document, ".prose-sum");
  if (summary) {
    aria(summary, "A sum of what building has taught me");
    split(one(summary, ":scope > span"), "…and a sum of what building has taught me.", ".sc", "sc");
  }
  const lessons = [
    ["Start", " with a real problem."], ["Make", " the first version testable."], ["Build", " the interface around the people using it."],
    ["Track", " what the model is doing."], ["Keep", " all the moving pieces understandable."], ["Ask", " what happens outside the demo."],
    ["Use", " simple tools where they fit."], ["Measure", " before optimizing."], ["Share", " what worked and what didn’t."],
    ["Notice", " the assumptions in the data."], ["Leave", " the code easier to pick up."], ["Stay", " curious about the next problem."],
  ];
  all(document, ".prose-body .prose-q").forEach((quote, i) => {
    if (!lessons[i]) return;
    const lead = one(quote, ".prose-lead");
    if (lead) editTextNodes(lead, [lessons[i][0]]);
    all(quote, ".prose-in").forEach((span, j) => editTextNodes(span, [j === 0 ? lessons[i][1].replace(/\.$/, "") : ""]));
  });
}
function broll() {
  const stage = one(document, ".bs");
  aria(stage, "B-roll — project screenshots and certificates. Scroll or drag to browse. Press Enter to open a frame.");
  for (const [i, button] of all(document, "button.bs-hit").entries()) {
    const image = button.querySelector("img") || button.parentElement.querySelector("img");
    const entry = assetMap[image?.getAttribute("src")];
    aria(button, entry?.[1] || gallery[i % gallery.length][1]);
  }
}
function playground() {
  const index = ["project reel", "screenshots", "web projects", "AI interfaces", "system designs", "certificates", "experiments", "web project reel"];
  all(document, ".pm-label").forEach((node, i) => write(node, index[i % index.length]));
  const markup = [
    [".pgv-play", "Play project reel"], [".pgs-play", "Play web project reel"], [".pga-ads .pga-deck", "Open AI interface gallery"],
    [".pga-postcards .pga-deck", "Open system design gallery"], [".pga-posters .pga-deck", "Open certificates"],
    [".pga-crafts .pga-deck", "Open experiments"], [".pga-banners .pga-deck", "Open web projects"],
    [".pan", "A few interfaces from my AI, data science, and full-stack projects"], [".pcdn", "From a model to an interface"],
    [".ptn", "Hackathons and certificates"], [".pcn", "Experiments in AI and the web"], [".pbn", "More web projects"], [".pgs-title", "Interfaces I’ve built for the web"],
  ];
  markup.forEach(([selector, label]) => aria(one(document, selector), label));
  for (const label of all(document, ".tw .sr-only")) {
    if (label.textContent !== "made in canva") continue;
    const holder = label.closest(".tw");
    write(label, "built for the web");
    split(holder, "built for the web", ".tw__c", "tw__c", "--i");
  }
  [[".sn-shot .tw", "screenshots from my projects"], [".pn-shot .tw", "built for the web"]].forEach(([selector, label]) => {
    const node = one(document, selector);
    if (node) { write(one(node, ".sr-only"), label); split(node, label, ".tw__c", "tw__c", "--i"); }
  });
}
function editTextNodes(element, values) {
  if (!element) return;
  const nodes = [...element.childNodes].filter(node => node.nodeType === Node.TEXT_NODE);
  values.forEach((value, i) => { if (nodes[i] && nodes[i].textContent !== value) nodes[i].textContent = value; });
  nodes.slice(values.length).forEach(node => { if (node.textContent) node.textContent = ""; });
}
function casePage(project) {
  const hero = one(document, ".bo-headline");
  aria(hero, project.title);
  const [first, second] = all(hero || document, ".bo-line");
  if (project === projects["product-hunt"]) {
    write(first, "Practice for");
    editTextNodes(one(second || document, ".php-strike"), ["guesswork"]);
    editTextNodes(second, [" real interviews"]);
  } else if (project === projects["comic-strip-in-a-drip"]) {
    editTextNodes(first, ["I turned ", " into"]);
    write(second, "a drawing tool");
  } else {
    editTextNodes(first, ["Finding ", " for "]);
    write(one(second || document, ".bo-b2b"), "AI");
    editTextNodes(second, ["with ", " and terrain data"]);
  }
  set(".bo-title", project.title);
  const intro = all(document, ".bo-intro p:not(.raj-case-links), .bo-over > p:not(.raj-case-links), .bo-over > div > p:not([class])");
  const unique = [...new Set(intro)];
  unique.forEach((paragraph, i) => write(paragraph, project.intro[i] || ""));
  const direct = one(document, ".bo-over");
  if (direct) {
    const p = all(direct, "p:not([class]),p[data-edit]").filter(node => !node.closest(".bo-impact,.bb,.ssp,.el"));
    p.forEach((paragraph, i) => write(paragraph, project.intro[i] || ""));
  }
  all(document, ".bo-intro li.micro, .bo-over > ul li.micro, .bo-intro + ul li.micro").forEach((tag, i) => write(tag, project.tags[i] ?? ""));
  all(document, ".bo-impact").forEach((block, i) => {
    const section = project.sections[i];
    if (!section) return;
    write(one(block, ".bo-impact-label"), section[0]);
    const paragraphs = all(block, "p:not([class]),p[data-edit]");
    paragraphs.forEach((p, j) => write(p, j === 0 ? section.slice(1) : ""));
    if (!paragraphs.length && section.length > 1 && !one(block, ".raj-section-copy")) {
      const copy = document.createElement("p"); copy.className = "raj-section-copy"; write(copy, section.slice(1)); block.append(copy);
    }
  });
  all(document, ".ssp-cap,.ssp-mat-title,.bb-title,.sp-title").forEach((caption, i) => write(caption, project.captions[i % project.captions.length]));
  aria(one(document, ".shv-play"), "Play the project reel");
  aria(one(document, ".bf"), "How the renewable site analysis works");
  aria(one(document, "canvas.bf-frame"), "Renewable Energy Optimizer visualization");
  aria(one(document, ".st-toss"), "Interactive notes for the Renewable Energy Optimizer");
  const insertion = one(document, ".bo-over") || one(document, ".bo-intro");
  if (insertion && !one(insertion, ".raj-case-links")) {
    const links = document.createElement("div");
    links.className = "raj-case-links micro";
    const items = project.demo === project.code ? [[project.code, "GitHub profile ↗"]] : [[project.demo, "Open demo ↗"], [project.code, "Source code ↗"]];
    for (const [href, text] of items) links.append(Object.assign(document.createElement("a"), { href, textContent: text, target: "_blank", rel: "noreferrer" }));
    insertion.append(links);
  }
}

const SOCIAL_LINKS = [
  {
    name: "LinkedIn",
    href: person.linkedin,
    svg: '<svg viewBox="0 0 448 512" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3M447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2c-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3c94 0 111.28 61.9 111.28 144.7V448z"/></svg>',
    target: "_blank",
  },
  {
    name: "GitHub",
    href: person.github,
    svg: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12z"/></svg>',
    target: "_blank",
  },
  {
    name: "LeetCode",
    href: person.leetcode,
    svg: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/></svg>',
    target: "_blank",
  },
  {
    name: "Mail",
    href: person.email,
    svg: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>',
    target: null,
  },
];

function syncFooterSocial() {
  const lists = all(document, ".f-social, .f2-social");
  for (const list of lists) {
    if (list.dataset.rajIcons === "true" && list.children.length === SOCIAL_LINKS.length && one(list, ".raj-social-btn")) continue;
    list.dataset.rajIcons = "true";
    list.innerHTML = "";
    for (const item of SOCIAL_LINKS) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.className = "raj-social-btn tap";
      a.href = item.href;
      a.setAttribute("aria-label", item.name);
      a.setAttribute("title", item.name);
      if (item.target) {
        a.target = item.target;
        a.rel = "noopener noreferrer";
      }
      a.innerHTML = `${item.svg}<span class="sr-only">${item.name}</span>`;
      li.appendChild(a);
      list.appendChild(li);
    }
  }
}

function syncNavBurger() {
  const burger = one(document, "#nav-burger");
  if (!burger) return;
  const oldOrb = one(burger, ".raj-nav-orb");
  if (oldOrb) oldOrb.remove();
  const heart = one(burger, ".nav-heart");
  if (heart && heart.style.display !== "none") {
    heart.style.setProperty("display", "none", "important");
  }
  if (!one(burger, ".raj-burger-bars")) {
    const bars = document.createElement("div");
    bars.className = "raj-burger-bars";
    bars.setAttribute("aria-hidden", "true");
    bars.innerHTML = `
      <span class="raj-bar raj-bar-1"></span>
      <span class="raj-bar raj-bar-2"></span>
      <span class="raj-bar raj-bar-3"></span>
    `;
    burger.appendChild(bars);
  }
}

function apply() {
  const path = currentRoute();
  applyShared(path);
  syncNavBurger();
  syncFooterSocial();
  syncQuoteReveal(path);
  syncJourney(path);
  syncKoiBackground(path);
  syncFooterLandscape();
  if (path === "/") home();
  else if (path === "/work") work();
  else if (path === "/about") about();
  else if (path === "/b-roll") broll();
  else if (path === "/playground") playground();
  else { const project = projectFor(path); if (project) casePage(project); }
}
let frame = 0;
function schedule() {
  if (!frame) frame = requestAnimationFrame(() => {
    try { apply(); }
    finally { frame = 0; }
  });
}
function start() {
  apply();
  new MutationObserver(schedule).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["src", "href", "aria-label"] });
  new MutationObserver(schedule).observe(document.head, { subtree: true, childList: true, characterData: true });
  addEventListener("popstate", schedule);
  addEventListener("pageshow", schedule);
}
if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", start); } else { start(); }

document.addEventListener("click", (event) => {
  const button = event.target.closest?.(".pgv-play,.pgs-play,.shv-play");
  if (!button) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const dialog = document.createElement("dialog");
  dialog.className = "raj-video-dialog";
  const video = document.createElement("video");
  video.src = "/raj/project-reel.webm";
  video.controls = true;
  video.autoplay = true;
  video.playsInline = true;
  const close = Object.assign(document.createElement("button"), { textContent: "Close", type: "button" });
  close.onclick = () => dialog.close();
  dialog.addEventListener("close", () => { dialog.remove(); button.focus(); }, { once: true });
  dialog.append(close, video);
  document.body.append(dialog);
  dialog.showModal();
}, true);
