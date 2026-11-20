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
  for (const [index,char] of [...message].entries()) {
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
      const offset = words.slice(0,index).reduce((n,w) => n+w.length+1,0);
      [...word].forEach((character, j) => {
        const char = document.createElement("span");
        char.className = "roll__c";
        char.style.setProperty("--i", offset + j);
        char.textContent = character;
        hold.append(char);
      });
      return index ? [" ",hold] : [hold];
    }));
    shown.dataset.rajWord = title;
    roll.style.setProperty("--n", title.length);
  }
  write(sr,title);
}
function projectFor(link) {
  const value = link.replace(/\/$/, "");
  if (value.includes("substack.com/@awaaari")) return projects.fit;
  return Object.entries(projects).find(([key]) => value.endsWith("/"+key))?.[1];
}
function applyShared(path) {
  const routes = { "/": person.title, "/work": "Work · Raj Mane", "/about": "About · Raj Mane", "/b-roll": "B-roll · Raj Mane", "/playground": "Playground · Raj Mane" };
  const title = routes[path] || projectFor(path)?.title + " · Raj Mane";
  if (document.title !== title) document.title = title;
  aria(one(document, ".nav-logo"), "Raj Mane, home");
  for (const logo of all(document, ".f-logo,.f2-logo")) aria(logo, "Raj Mane, home");

  for (const link of all(document, "a[href]")) {
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
    const [target,label] = change;
    if (href !== target) link.setAttribute("href",target);
    if (link.hasAttribute("aria-label")) aria(link,label);
    if (one(link,".roll")) rolled(link,label);
    else if (link.classList.contains("label") && !one(link,"img,svg")) write(link,label);
  }
  for (const item of all(document,"p.micro.muted")) {
    if (/©\s*2026\s+Sruthi/i.test(item.textContent)) {
      const first = [...item.childNodes].find(n=>n.nodeType===Node.TEXT_NODE && n.textContent.includes("©"));
      if(first) first.textContent = "© 2026 Raj Mane";
    }
  }
  set(".f-convo", ["Have a project in mind?", "Say hi at"]);
  set(".f2-tagline", ["computer vision and AI", "built for the web"]);
  set(".gsap-ticker-line", person.ticker);
  aria(one(document, "button.pf"), "Email Raj Mane");
  for (const element of all(document, "[alt], [title], [aria-label]")) {
    for (const attribute of ["alt", "title", "aria-label"]) {
      const value = element.getAttribute(attribute);
      if (/sruthi/i.test(value || "")) element.setAttribute(attribute, value.replace(/sruthi(?: ramisetty)?/gi, person.name));
    }
  }
  for(const label of all(document,".f2-tagline + .fullstop, .f2-tagline .fullstop")) aria(label,".");
  for(const link of all(document,'link[rel~="icon"],link[rel="apple-touch-icon"]')) {
    if(link.getAttribute("href")!=="/raj/mark.svg")link.setAttribute("href","/raj/mark.svg");
  }

  for (const img of all(document, "img[src]")) {
    const raw = img.getAttribute("src");
    const source = assetMap[raw];
    if (!source?.[1]) continue;
    if (img.alt && img.alt !== source[1]) img.alt=source[1];
    const button = img.closest("button.bs-hit, button.ssp-hit");
    if (button) aria(button,source[1]);
  }
  for (const filmFrame of all(document,".films-acc-item")) {
    const source = assetMap[one(filmFrame, "img")?.getAttribute("src")];
    if (source) write(one(filmFrame,".films-acc-cap"),source[1]);
  }
  const overlays = all(document, "[role=dialog], .pgl, .bs-viewer, .ssp-lightbox, .el-lightbox, .cork-lightbox, .bs-dive");
  for (const overlay of overlays) {
    const source = assetMap[one(overlay,"img[src]")?.getAttribute("src")];
    if (!source?.[1]) continue;
    for (const element of all(overlay, "figcaption,[class*=caption],.bs-caption,.pgl-cap,.ssp-modal-cap,.el-cap")) {
      if (!one(element,"img,button")) write(element,source[1]);
    }
  }

}

const faq = [
  [["what do you", "build?"], "Computer vision systems, applied AI projects, and full-stack web applications."],
  [["what are you", "studying?"], "Computer Science Engineering at TCET Mumbai. Current CGPA: 9.88/10."],
  [["what tools", "do you use?"], "Python, OpenCV, MediaPipe, TensorFlow, Flask, Next.js, and SQL."],
  [["what have you", "won?"], "GenerationTech 2025, Model Forge 2025, and the NEXUS AI Challenge."],
  [["what are you", "curious about?"], "Robotics, space technology, and using interfaces to make complex systems easier to work with."],
  [["where can i", "find your work?"], "Explore the Work and Playground pages, or follow the GitHub links for the code."],
];
function home() {
  set(".hero-word--sruthi .hero-word__txt", "Raj Mane");
  const name = all(document, ".hero-word__txt").at(-1);
  if (normalize(name?.textContent)?.toLowerCase()==="sruthi") write(name,"Raj Mane");
  aria(one(document, "#top.hero"), "Hello, meet Raj Mane");
  const bylines = ["AI & computer vision", " / full-stack developer"];
  all(document,".hero-byline__l").forEach((line,index)=>{
    const text=bylines[index] ?? "";
    write(line.querySelector(".sr-only"),text);
    split(line,text,".hero-byline__c","hero-byline__c","--j",true);
  });
  aria(one(document,".bq"),"What I build");
  aria(one(document,".bq-ink"),"I build at the intersection of machine learning, physical hardware, and the web. Curiosity comes first. — Raj Mane");
  set(".sfold-head", "I BUILD SYSTEMS THAT SEE");
  const workHeading = one(document, ".wstrip-head");
  editTextNodes(workHeading, ["work I’m", "proud of"]);
  aria(workHeading, "Work I’m proud of.");
  const intro = all(document,".sfold-body");
  write(intro[0],"I’m Raj Mane, a computer science engineering student at TCET Mumbai. I build computer vision systems, applied AI projects, and full-stack web applications.");
  write(intro[1],"I’m drawn to space technology, robotics, and making complex systems easier to use.");
  const call = one(document,".sfold-btn");
  if (call) rolled(call,"see my projects");
  const skills = ["Computer Vision","Artificial","Intelligence","Full-stack","Development","Robotics","Automation","OpenCV","Embedded Systems"];
  all(document,".sfold-w").forEach((item,i)=>write(item,skills[i]||""));
  const questions = all(document,".faq-a");
  questions.forEach((answer,i)=>{
    if (!faq[i]) return;
    const row = answer.closest("li") || answer.parentElement;
    const lines=all(row,".faq-q-line");
    lines.forEach((line,j)=>write(line,lines.length===1 ? faq[i][0].join(" ") : faq[i][0][j] || ""));
    write(answer,faq[i][1]);
  });
  aria(one(document,".hli"),"Build something with me");
  const envelope = one(document,".hli-stage");
  if (envelope) aria(envelope,"Build something with me — email Raj Mane");
}
function work() {
  const title = one(document,".problems-body");
  aria(title,"I build systems that see");
}

function about() {
  set("#about-video-hero-title","I love a big idea.");
  set(".timeline .h9","The projects I learn the most from are the ones I get to build.");
  set(".timeline cite","— Raj Mane");
  aria(one(document,".constellation-stage"),"I’m a builder of software that works in the real world.");
  set(".constellation-stage h2.sr-only","I’m a builder of software that works in the real world.");
  const notes = all(document,"[id^=timeline-story-]");
  notes.forEach(note=>{
    const index = Number(note.closest("li")?.querySelector(".timeline-number")?.textContent) - 1;
    const label = history[index] || history[Number(note.id.split("-").at(-1))];
    if (!note.dataset.rajOriginalText) note.dataset.rajOriginalText = normalize(note.textContent);
    write(note,label);
  });
  aria(one(document,".atlas-canvas"),"Interactive map marking Mumbai, where I study. Drag the map, or use arrow keys to pan and plus and minus to zoom.");
  const reader = one(document,".timeline-reader");
  if (reader) {
    const num = normalize(one(reader,".timeline-reader-num")?.textContent)?.match(/\b(\d+)\b/);
    const paragraph = one(reader,".timeline-reader-body, .timeline-reader-story, p:not(.timeline-reader-num)");
    if (num && paragraph) write(paragraph,history[Number(num[1])-1]);
  }
  const mosaic = ["…and","a","mosaic","of","projects","and","results","I’ve","built."];
  all(document,".mosaic-stage .mo-word").forEach((node,i)=>write(node,mosaic[i] || ""));
  aria(one(document,".mosaic-stage"),"A mosaic of the projects I’ve built");
  set(".mosaic-stage h2.sr-only","A mosaic of the projects I’ve built");
  const cork = ["…","and","a","scrapbook","of","the","projects","and","milestones","I’ve","built…"];
  all(document,".corkboard-heading .ch-txt").forEach((node,i)=>write(node,cork[i] || ""));
  for (const pin of all(document,"button.cork-pin,button.cork-sticker")) {
    const source = assetMap[pin.parentElement.querySelector("img")?.getAttribute("src")];
    if (source) aria(pin,"Move " + source[1]);
  }
  for (const type of all(document,".films-head .tw, .films .tw, .films-acc-title .tw")) {
    write(one(type,".sr-only"),"…and a collection of projects and milestones…");
    split(type,"…and a collection of projects and milestones…",".tw__c","tw__c","--i");
  }
  const summary = one(document,".prose-sum");
  if(summary) {
    aria(summary,"A sum of what building has taught me");
    split(one(summary,":scope > span"),"…and a sum of what building has taught me.",".sc","sc");
  }
  const lessons = [
    ["Start"," with a real problem."],["Make"," the first version testable."],["Build"," the interface around the people using it."],
    ["Track"," what the model is doing."],["Keep"," all the moving pieces understandable."],["Ask"," what happens outside the demo."],
    ["Use"," simple tools where they fit."],["Measure"," before optimizing."],["Share"," what worked and what didn’t."],
    ["Notice"," the assumptions in the data."],["Leave"," the code easier to pick up."],["Stay"," curious about the next problem."],
  ];
  all(document,".prose-body .prose-q").forEach((quote,i)=>{
    if (!lessons[i]) return;
    const lead=one(quote,".prose-lead");
    if (lead) editTextNodes(lead,[lessons[i][0]]);
    all(quote,".prose-in").forEach((span,j)=>editTextNodes(span,[j===0?lessons[i][1].replace(/\.$/,""):""]));
  });
}
function broll() {
  const stage = one(document,".bs");
  aria(stage,"B-roll — project screenshots and certificates. Scroll or drag to browse. Press Enter to open a frame.");
  for (const [i,button] of all(document,"button.bs-hit").entries()) {
    const image = button.querySelector("img") || button.parentElement.querySelector("img");
    const entry = assetMap[image?.getAttribute("src")];
    aria(button,entry?.[1] || gallery[i%gallery.length][1]);
  }
}
function playground() {
  const index = ["project reel","screenshots","web projects","AI interfaces","system designs","certificates","experiments","web project reel"];
  all(document,".pm-label").forEach((node,i)=>write(node,index[i%index.length]));
  const markup = [
    [".pgv-play","Play project reel"],[".pgs-play","Play web project reel"],[".pga-ads .pga-deck","Open AI interface gallery"],
    [".pga-postcards .pga-deck","Open system design gallery"],[".pga-posters .pga-deck","Open certificates"],
    [".pga-crafts .pga-deck","Open experiments"],[".pga-banners .pga-deck","Open web projects"],
    [".pan","A few interfaces from my AI and computer vision projects"],[".pcdn","From a model to an interface"],
    [".ptn","Hackathons and certificates"],[".pcn","Experiments in AI and the web"],[".pbn","More web projects"],[".pgs-title","Interfaces I’ve built for the web"],
  ];
  markup.forEach(([selector,label])=> aria(one(document,selector),label));
  for(const label of all(document,".tw .sr-only")) {
    if(label.textContent!=="made in canva")continue;
    const holder=label.closest(".tw");
    write(label,"built for the web");
    split(holder,"built for the web",".tw__c","tw__c","--i");
  }
  [[ ".sn-shot .tw", "screenshots from my projects"], [".pn-shot .tw", "built for the web"]].forEach(([selector,label])=>{
    const node=one(document,selector);
    if(node) {write(one(node,".sr-only"),label);split(node,label,".tw__c","tw__c","--i");}
  });
}
function editTextNodes(element, values) {
  if (!element) return;
  const nodes=[...element.childNodes].filter(node=>node.nodeType===Node.TEXT_NODE);
  values.forEach((value,i)=>{if(nodes[i] && nodes[i].textContent!==value)nodes[i].textContent=value;});
  nodes.slice(values.length).forEach(node=>{if(node.textContent)node.textContent="";});
}
function casePage(project) {
  const hero=one(document,".bo-headline");
  aria(hero,project.title);
  const [first,second]=all(hero || document,".bo-line");
  if (project===projects["product-hunt"]) {
    write(first,"Practice for");
    editTextNodes(one(second || document,".php-strike"),["guesswork"]);
    editTextNodes(second,[" real interviews"]);
  } else if (project===projects["comic-strip-in-a-drip"]) {
    editTextNodes(first,["I turned "," into"]);
    write(second,"a drawing tool");
  } else {
    editTextNodes(first,["Finding "," for "]);
    write(one(second || document,".bo-b2b"),"AI");
    editTextNodes(second,["with "," and terrain data"]);
  }
  set(".bo-title",project.title);
  const intro=all(document,".bo-intro p:not(.raj-case-links), .bo-over > p:not(.raj-case-links), .bo-over > div > p:not([class])");
  const unique=[...new Set(intro)];
  unique.forEach((paragraph,i)=>write(paragraph,project.intro[i] || ""));
  const direct=one(document,".bo-over");
  if (direct) {
    const p=all(direct,"p:not([class]),p[data-edit]").filter(node=>!node.closest(".bo-impact,.bb,.ssp,.el"));
    p.forEach((paragraph,i)=>write(paragraph,project.intro[i]||""));
  }
  all(document,".bo-intro li.micro, .bo-over > ul li.micro, .bo-intro + ul li.micro").forEach((tag,i)=>write(tag,project.tags[i] ?? ""));
  all(document,".bo-impact").forEach((block,i)=>{
    const section=project.sections[i];
    if (!section) return;
    write(one(block,".bo-impact-label"),section[0]);
    const paragraphs=all(block,"p:not([class]),p[data-edit]");
    paragraphs.forEach((p,j)=>write(p,j===0?section.slice(1):""));
    if (!paragraphs.length && section.length>1 && !one(block,".raj-section-copy")) {
      const copy=document.createElement("p"); copy.className="raj-section-copy"; write(copy,section.slice(1)); block.append(copy);
    }
  });
  all(document,".ssp-cap,.ssp-mat-title,.bb-title,.sp-title").forEach((caption,i)=>write(caption,project.captions[i % project.captions.length]));
  aria(one(document,".shv-play"),"Play the project reel");
  aria(one(document,".bf"),"How the renewable site analysis works");
  aria(one(document,"canvas.bf-frame"),"Renewable Energy Optimizer visualization");
  aria(one(document,".st-toss"),"Interactive notes for the Renewable Energy Optimizer");
  const insertion=one(document,".bo-over") || one(document,".bo-intro");
  if (insertion && !one(insertion,".raj-case-links")) {
    const links=document.createElement("div");
    links.className="raj-case-links micro";
    const items = project.demo===project.code ? [[project.code,"GitHub profile ↗"]] : [[project.demo,"Open demo ↗"],[project.code,"Source code ↗"]];
    for(const [href,text] of items) links.append(Object.assign(document.createElement("a"),{href,textContent:text,target:"_blank",rel:"noreferrer"}));
    insertion.append(links);
  }
}

function apply() {
  const path = currentRoute();
  applyShared(path);
  syncJourney(path);
  syncKoiBackground(path);
  syncQuoteReveal(path);
  syncFooterLandscape();
  if(path==="/") home();
  else if(path==="/work") work();
  else if(path==="/about") about();
  else if(path==="/b-roll") broll();
  else if(path==="/playground") playground();
  else { const project=projectFor(path); if(project)casePage(project); }
}
let frame = 0;
function schedule() {
  if (!frame) frame = requestAnimationFrame(() => {
    try { apply(); }
    finally { frame=0; }
  });
}
function start() {
  apply();
  new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["src","href","aria-label"]});
  new MutationObserver(schedule).observe(document.head,{subtree:true,childList:true,characterData:true});
  addEventListener("popstate",schedule);
  addEventListener("pageshow",schedule);
}
setTimeout(start, 180);

document.addEventListener("click", (event)=>{
  const button=event.target.closest?.(".pgv-play,.pgs-play,.shv-play");
  if(!button)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const dialog=document.createElement("dialog");
  dialog.className="raj-video-dialog";
  const video=document.createElement("video");
  video.src="/raj/project-reel.webm";
  video.controls=true;
  video.autoplay=true;
  video.playsInline=true;
  const close=Object.assign(document.createElement("button"),{textContent:"Close",type:"button"});
  close.onclick=()=>dialog.close();
  dialog.addEventListener("close",()=>{dialog.remove();button.focus();},{once:true});
  dialog.append(close,video);
  document.body.append(dialog);
  dialog.showModal();
},true);
