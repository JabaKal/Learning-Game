/* „სწრაფი გამოწვევა“ — დროშების ტესტი თამაშის შიგნით: 3 კითხვა „იპოვე დროშა“, ყოველ სწორ პასუხზე +10 ოქრო.
   იხსნება თამაშიდან — რუკების დარბაზი ან „სწავლა“ (state 'quizOpen'); მოპოვებული ოქრო ჩანს თამაშის ზოლში (state 'gold'). ოქრო მხოლოდ ამ რაუნდში ითვლება და ბრაუზერში არ ინახება —
   ოქრო მხოლოდ სერვერზე ინახება (kingdoms.gold), რომ ვერავინ შეცვალოს. ეს დროებითი რაუნდია, სანამ ნამდვილი თამაში აეწყობა */
import { on, set, get } from '../../core/state.js';
import { t } from '../../core/i18n.js';
import { FLAGS, flagSvg } from './flags.js';

const ROUNDS = 3, OPTIONS = 4, REWARD = 10;
const shuffle = list => list.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k]);

// 3 კითხვა: სწორი ქვეყანა + 3 სხვა დროშა; ერთი და იგივე ქვეყანა ორჯერ არ მეორდება
function makeRound() {
  const answers = shuffle(Object.keys(FLAGS)).slice(0, ROUNDS);
  return answers.map(answer => ({
    answer,
    options: shuffle([answer, ...shuffle(Object.keys(FLAGS).filter(c => c !== answer)).slice(0, OPTIONS - 1)])
  }));
}

export function init(root) {
  const body = root.querySelector('.quiz__body');
  const bar = root.querySelector('.quiz__progress i');
  const goldEl = root.querySelector('.quiz__gold-n');
  let round = [], index = 0, correct = 0, gold = 0, opener = null;

  const showGold = () => { goldEl.textContent = gold; };

  const question = () => {
    const q = round[index];
    bar.style.width = `${(index / ROUNDS) * 100}%`;
    body.innerHTML = `
      <p class="quiz__step">${fill(t('quiz.question'), { n: index + 1, total: ROUNDS })}</p>
      <p class="quiz__ask">${t('quiz.find')} <b>${t('quiz.countries')[q.answer]}</b></p>
      <div class="quiz__options">${q.options.map(c => `<button type="button" class="quiz__flag" data-code="${c}">${flagSvg(c)}</button>`).join('')}</div>
      <p class="quiz__feedback" aria-live="polite"></p>`;
    body.querySelector('.quiz__flag').focus();
  };

  const answer = button => {
    const q = round[index], ok = button.dataset.code === q.answer;
    body.querySelectorAll('.quiz__flag').forEach(b => {
      b.disabled = true;
      if (b.dataset.code === q.answer) b.classList.add('is-right');
    });
    const feedback = body.querySelector('.quiz__feedback');
    if (ok) {
      correct++; gold += REWARD; showGold(); set('gold', (get('gold') || 0) + REWARD);
      feedback.textContent = t('quiz.correct');
      button.insertAdjacentHTML('beforeend', `<span class="quiz__plus">+${REWARD}</span>`);
    } else {
      button.classList.add('is-wrong');
      feedback.textContent = `${t('quiz.wrong')} ${t('quiz.countries')[q.answer]}`;
    }
    feedback.classList.add(ok ? 'is-ok' : 'is-bad');
    setTimeout(() => { index++; index < ROUNDS ? question() : result(); }, ok ? 900 : 1500);
  };

  const result = () => {
    bar.style.width = '100%';
    body.innerHTML = `
      <div class="quiz__result">
        <span class="quiz__chest" aria-hidden="true"></span>
        <p class="quiz__won">${t('quiz.result')} <b>${gold} ${t('quiz.gold')}</b></p>
        <p class="quiz__score">${fill(t('quiz.score'), { n: correct, total: ROUNDS })}</p>
        <div class="quiz__actions">
          <button type="button" class="btn btn--primary quiz__again">${t('quiz.again')}</button>
          <button type="button" class="btn btn--ghost quiz__save" disabled>${t('quiz.save')}</button>
        </div>
        <p class="quiz__soon">${t('quiz.soon')}</p>
      </div>`;
    body.querySelector('.quiz__again').focus();
  };

  const start = () => { round = makeRound(); index = 0; correct = 0; gold = 0; showGold(); question(); };
  const open = () => {
    opener = document.activeElement;
    root.hidden = false;
    requestAnimationFrame(() => root.classList.add('quiz--open'));
    start();
  };
  const close = () => {
    root.classList.remove('quiz--open');
    setTimeout(() => { root.hidden = true; }, 200);
    set('quizOpen', false);
    opener?.focus?.();
  };

  on('quizOpen', isOpen => { if (isOpen && root.hidden) open(); });
  on('lang', () => { if (!root.hidden) start(); });               // სხვა ენაზე — თავიდან, ახალი ენით
  root.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) return close();
    const flag = e.target.closest('.quiz__flag:not(:disabled)');
    if (flag) return answer(flag);
    if (e.target.closest('.quiz__again')) start();
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !root.hidden) close(); });
}
