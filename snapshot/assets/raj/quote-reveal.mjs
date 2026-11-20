const sentences = [
  "I build at the intersection of machine learning, physical hardware, and the web.",
  "Curiosity comes first.",
];
const clamp = value => Math.min(1, Math.max(0, value));
let mounted;

function mountReveal(section) {
  const quote = document.createElement("blockquote");
  quote.className = "raj-quote";
  const words = [];
  sentences.forEach((sentence, index) => {
    const paragraph = document.createElement("p");
    if (index > 0) paragraph.className = "raj-quote-accent";
    const readable = document.createElement("span");
    readable.className = "sr-only";
    readable.textContent = sentence;
    const visual = document.createElement("span");
    visual.setAttribute("aria-hidden", "true");
    sentence.split(" ").forEach((text, i) => {
      if (i) visual.append(" ");
      const word = document.createElement("span");
      word.className = "raj-quote-word";
      const glyph = document.createElement("span");
      glyph.textContent = text;
      word.append(glyph);
      visual.append(word);
      words.push(word);
    });
    paragraph.append(readable, visual);
    quote.append(paragraph);
  });
  const signature = document.createElement("footer");
  signature.textContent = "— Raj Mane";
  quote.append(signature);
  section.append(quote);
  section.classList.add("raj-quote-reveal");

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let previousTop = Number.NaN;
  let previousProgress = -1;
  let quietFrames = 0;

  function schedule() {
    if (!frame) frame = requestAnimationFrame(paint);
  }
  function paint() {
    frame = 0;
    if (!section.isConnected) return;
    const top = quote.getBoundingClientRect().top;
    const progress = reducedMotion.matches ? 1 : clamp((innerHeight * .84 - top) / (innerHeight * .66));
    if (progress !== previousProgress) {
      const cursor = progress * (words.length + 3) - .35;
      words.forEach((word, index) => {
        const value = clamp((cursor - index) / 1.65);
        const distance = clamp((index - cursor) / 11);
        word.style.setProperty("--reveal-word", value.toFixed(3));
        word.style.setProperty("--reveal-distance", distance.toFixed(3));
      });
      signature.style.setProperty("--reveal-signature", clamp((progress - .84) / .16).toFixed(3));
      previousProgress = progress;
    }

    // The reference uses a smooth-scroll wrapper. Keep sampling until it settles.
    quietFrames = Math.abs(top - previousTop) < .06 ? quietFrames + 1 : 0;
    previousTop = top;
    if (!reducedMotion.matches && quietFrames < 6) schedule();
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  reducedMotion.addEventListener("change", schedule);
  const observer = new IntersectionObserver(schedule, { rootMargin: "180px 0px" });
  observer.observe(quote);
  schedule();

  return () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    reducedMotion.removeEventListener("change", schedule);
    section.classList.remove("raj-quote-reveal");
    quote.remove();
  };
}

export function syncQuoteReveal(route) {
  const section = route === "/" ? document.querySelector("section.bq") : null;
  if (mounted?.section === section) return;
  mounted?.dispose();
  mounted = section ? { section, dispose: mountReveal(section) } : null;
}

