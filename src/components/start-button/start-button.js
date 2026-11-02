/* „დაიწყე“ ღილაკი: დგას იქ, სადაც scene კომპონენტი ეტყვის (state 'startButton').
   რეგისტრაციის / თამაშის გვერდი — შემდეგი ეტაპი; მაშინ აქ შეიცვლება href */
import { on } from '../../core/state.js';

export function init(root) {
  on('startButton', ({ x, y }) => {
    root.style.left = `${Math.round(x)}px`;
    root.style.top = `${Math.round(y)}px`;
  });
}
