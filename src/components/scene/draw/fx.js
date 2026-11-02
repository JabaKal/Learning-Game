// ორი ფენა: უძრავი ნახატი ერთხელ იხატება სურათად (<img>), მოძრავი ნაწილები — ცალკე პატარა SVG-ში ზემოდან.
// სახატავი ფუნქციები მოძრავ ფრაგმენტს anim()-ს აწვდიან: უძრავ ფენაში ის არ ჩანს (ფუნქცია '' აბრუნებს),
// ზედა ფენაში კი იმავე ტრანსფორმაციებით ჯდება — wrap არის გახსნილი <g ...> ტეგები, რომლებშიც ფრაგმენტი იხატებოდა.
let items = [], context = '';

export function anim(frag, wrap = '') {
  const open = context + wrap;
  items.push(open + frag + '</g>'.repeat((open.match(/<g[\s>]/g) || []).length));
  return '';
}

// ფრაგმენტი ორივე ფენაში — მაგ. ჯვარედინის მკლავი, რომელიც ქანავ გვირგვინს უნდა ფარავდეს
export const both = (frag, wrap = '') => { anim(frag, wrap); return frag; };

// კონტექსტი, რომელშიც ყველა შიდა anim() ჯდება — მაგ. clip-path ჯგუფი, რომელიც მთელ კოლონას ჭრის
export function within(wrap, fn) {
  const prev = context; context += wrap;
  try { return fn(); } finally { context = prev; }
}

// მოძრავი ფენის შიგთავსი (შეგროვებული რიგით) — ერთხელ, სცენის აწყობის ბოლოს
export function takeAnim() { const s = items.join(''); items = []; return s; }
