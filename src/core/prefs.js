/* სტუმრის პარამეტრები — რასაც თვითონ შეცვლის (ენა; მომავალში — ხმა, თემა და სხვ.), ბრაუზერში ინახება და შემდეგ ვიზიტზე
   (საიტის დახურვისა და ხელახლა გახსნის შემდეგაც) იგივე დახვდება. ანგარიშის შექმნის შემდეგ — ბაზაშიც (users.interface_lang და სხვ.).
   getPref('lang') / setPref('lang', 'en'). ბრაუზერის მეხსიერება შეიძლება იყოს გამორთული (პირადი რეჟიმი) — მაშინ უბრალოდ არ ინახება */
const KEY = 'prefs';

const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { return {}; } };

export const getPref = name => read()[name];

export function setPref(name, value) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...read(), [name]: value })); } catch {}
}

// ძველი ფორმატიდან გადმოტანა (ენა ცალკე გასაღებით ინახებოდა)
try {
  const old = localStorage.getItem('lang.chosen');
  if (old) { if (getPref('lang') === undefined) setPref('lang', old); localStorage.removeItem('lang.chosen'); }
} catch {}
