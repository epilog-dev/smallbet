/**
 * Tiny navigation-progress store (the bar at the top of the page while a route loads).
 * `NavigationProgress` renders it; anything that navigates programmatically can call `progress.start()`
 * so the bar shows before the new route has committed. Link clicks are picked up automatically.
 */
type Listener = () => void;

let value = 0; // 0 = hidden, (0,1) = in flight, 1 = finishing
let active = false;
let timer: ReturnType<typeof setInterval> | null = null;
let fallback: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<Listener>();

const emit = () => listeners.forEach((l) => l());

function clear() {
  if (timer) clearInterval(timer);
  if (fallback) clearTimeout(fallback);
  timer = fallback = null;
}

export const progress = {
  start() {
    if (active) return;
    active = true;
    value = 0.08;
    emit();
    // Trickle toward ~90% so a slow route still looks alive.
    timer = setInterval(() => {
      value = Math.min(0.9, value + (0.95 - value) * 0.08);
      emit();
    }, 200);
    // Never hang forever (a navigation that was cancelled or errored).
    fallback = setTimeout(() => progress.done(), 8000);
  },
  done() {
    if (!active) return;
    clear();
    value = 1;
    emit();
    setTimeout(() => {
      active = false;
      value = 0;
      emit();
    }, 250);
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get: () => value,
};
