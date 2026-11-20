/* THE DANDELION, OFF THE MAIN THREAD — lib/dandelion.js hands this worker
   the seeds' canvas and posts each puff; the flight runs here. Why: off the
   homepage the logo also goes home, and the homepage mounting is a ~130ms
   long task on the main thread (measured on the live site, 2026-10-12) that
   froze the seeds mid-burst and then lurched them on — her "clicking on the
   logo is breaking or jarring". A worker's canvas keeps flying through it. */
import { createSim, createLoop } from "./dandelionSim";

const sim = createSim();
let g = null, W = 0, H = 0;
const loop = createLoop(sim, () => g, () => ({ W, H }));

function size(m) {
  W = m.W; H = m.H;
  g.canvas.width = Math.round(W * m.dpr);
  g.canvas.height = Math.round(H * m.dpr);
  g.setTransform(m.dpr, 0, 0, m.dpr, 0, 0);
}

self.onmessage = ({ data: m }) => {
  if (m.type === "init") { g = m.canvas.getContext("2d"); size(m); }
  else if (m.type === "size") size(m);
  else if (m.type === "puff") { sim.add(m.seeds); loop.kick(); }
};
