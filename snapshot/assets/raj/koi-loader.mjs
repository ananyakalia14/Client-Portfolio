let active;

export function syncKoiBackground(route) {
  const hero = route === "/" ? document.querySelector("section.hero#top") : null;
  if (active && active.hero === hero && active.layer.isConnected) return;
  if (active) {
    active.dispose?.();
    active.hero.classList.remove("raj-koi-hero");
    active.layer.remove();
    active = null;
  }
  if (!hero) return;

  const layer = document.createElement("div");
  layer.className = "raj-koi-layer";
  layer.setAttribute("aria-hidden", "true");
  hero.classList.add("raj-koi-hero");
  hero.prepend(layer);

  const state = { hero, layer, dispose: null };
  active = state;
  import("/raj/koi-background.js")
    .then(({ mountKoiBackground }) => {
      if (state === active && layer.isConnected) state.dispose = mountKoiBackground(layer, hero);
    })
    .catch(error => console.warn("Could not start the decorative koi background.", error));
}
