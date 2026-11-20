import { createElement } from "react";
import { createRoot } from "react-dom/client";
import MicroSlats from "./components/MicroSlats.jsx";
import { AnimalEngine } from "./components/ascii-animals/engine.ts";


const scenes = {
  koi:         { base: "#1b1021", water: "#704777", glow: "#eab1c6", accent: "#ffae93", pool: "#40243f", preset: "swell" },
  manta:       { base: "#081d24", water: "#2c6470", glow: "#a7eee6", accent: "#acefe7", pool: "#143b44", preset: "tide" },
  jellyfish:   { base: "#130d29", water: "#62449a", glow: "#e5adff", accent: "#ffc7f1", pool: "#352259", preset: "tide" },
  butterflies: { base: "#15152c", water: "#4e6296", glow: "#bbcaff", accent: "#d9ccff", pool: "#282c53", preset: "swell" },
  frogs:       { base: "#121b10", water: "#567047", glow: "#d9eab0", accent: "#d9e994", pool: "#303f23", preset: "tide" },
  cranes:      { base: "#1f191b", water: "#76564e", glow: "#f3c6a8", accent: "#f9cfb8", pool: "#43302e", preset: "swell" },
  dragonflies: { base: "#09211b", water: "#306553", glow: "#a5e9c0", accent: "#b5f2bb", pool: "#193d32", preset: "tide" },
  crabs:       { base: "#231510", water: "#8d5337", glow: "#ffc28b", accent: "#ffbf9b", pool: "#4a2b20", preset: "swell" },
};
const species = Object.keys(scenes);
const storageKey = "raj-hero-animal-cycle";
function takeNextAnimal() {
  let previous;
  let remaining = [];
  try {
    const stored = JSON.parse(sessionStorage.getItem(storageKey) || "null");
    previous = stored?.last;
    if (Array.isArray(stored?.remaining)) {
      remaining = [...new Set(stored.remaining)]
        .filter(animal => species.includes(animal) && animal !== previous);
    }
  } catch {}
  if (!remaining.length) {
    remaining = [...species];
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }
    if (remaining.at(-1) === previous) {
      [remaining[0], remaining[remaining.length - 1]] = [remaining.at(-1), remaining[0]];
    }
  }
  const animal = remaining.pop();
  try { sessionStorage.setItem(storageKey, JSON.stringify({ last: animal, remaining })); } catch {}
  return animal;
}
let pageAnimal;

export function mountKoiBackground(layer, hero) {
  const animal = pageAnimal ??= takeNextAnimal();
  const scene = scenes[animal];
  hero.dataset.rajAnimal = animal;
  hero.style.setProperty('--raj-animal-base', scene.base);
  hero.style.setProperty('--raj-animal-pool', scene.pool);
  hero.style.setProperty('--raj-animal-accent', scene.accent);
  const water = document.createElement("div");
  water.className = "raj-koi-water";
  let root;
  const probe = document.createElement("canvas").getContext("webgl2");
  if (probe) {
    probe.getExtension("WEBGL_lose_context")?.loseContext();
    layer.append(water);
    root = createRoot(water);
    root.render(createElement(MicroSlats, {
      preset: scene.preset,
      color: scene.water,
      glintColor: scene.glow,
      backgroundColor: scene.base,
      slatWidth: 10,
      slatHeight: 26,
      gap: 3,
      roundness: .75,
      speed: .42,
      contrast: 1.38,
      interactive: true,
      cursorStrength: .85,
      cursorSize: 44,
      swirl: .2,
      trail: 1.5,
      lean: .1,
      intro: false,
    }));
  }

  const fish = document.createElement("canvas");
  fish.className = "raj-koi-fish";
  layer.append(fish);
  const engine = new AnimalEngine(fish, {
    animal,
    theme: "dark",
    transparent: true,
    tuning: { fog: .32, grid: false },
  });

  function feed(event) {
    if (!(event.target instanceof Element) || event.target.closest("a, button, input, [contenteditable]")) return;
    const bounds = fish.getBoundingClientRect();
    engine.startle(event.clientX - bounds.left, event.clientY - bounds.top);
  }
  hero.addEventListener("pointerdown", feed, { passive: true });
  layer.dataset.koiReady = "true";
  return () => {
    hero.removeEventListener("pointerdown", feed);
    engine.destroy();
    root?.unmount();
    delete hero.dataset.rajAnimal;
    for (const name of ["--raj-animal-base", "--raj-animal-pool", "--raj-animal-accent"]) hero.style.removeProperty(name);
  };
}
