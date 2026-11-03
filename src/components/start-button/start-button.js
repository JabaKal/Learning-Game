/* „დაიწყე“ ღილაკი: დგას იქ, სადაც scene კომპონენტი ეტყვის (state 'startButton').
   დაჭერისას რბილად იხსნება თამაში (core/screens.js) — რეგისტრაციის გარეშე */
import { on } from '../../core/state.js';
import { openGame } from '../../core/screens.js';

export function init(root) {
  root.addEventListener('click', e => { e.preventDefault(); openGame(); });
  let first = true;
  on('startButton', ({ x, y }) => {
    if (first) root.style.transition = 'none';        // პირველი ადგილი — მაშინვე, ანიმაციის გარეშე (ცენტრიდან არ „მოსრიალებს“)
    root.style.left = `${Math.round(x)}px`;
    root.style.top = `${Math.round(y)}px`;
    if (first) { root.offsetWidth; root.style.transition = ''; first = false; }
  });
}
