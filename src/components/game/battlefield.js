// ბრძოლის ველი — ავტორის არჩევანი: „გათელილი ბალახი“ (ბრძოლის შემდგომი ველი: მუზარადები, ხმლები, შუბები, ფარები, სისხლი).
// სამი რაუნდის ვარიანტებიდან დანარჩენი წაიშალა. სიაში ახალი ვარიანტის დამატება შეიძლება — ?battle=N აჩვენებს.
// თითო ვარიანტი: ground(B, id, r) — ველი მიწის ფენაზე (B — ელიფსი {cx, cy, rx, ry}); focal() — შუაგული (ზედა ფენაში, დასაჭერი)
import { P, rng } from '../scene/draw/utils.js';

export const CHOSEN = 1;

// ---------- ნაწილები ----------
const ground = (B, id, c1, c2) => `<defs><radialGradient id="${id}-g"><stop offset="0" stop-color="${c1}"/><stop offset=".7" stop-color="${c2}"/><stop offset="1" stop-color="${c2}" stop-opacity="0"/></radialGradient></defs>` +
  `<ellipse cx="${B.cx}" cy="${B.cy}" rx="${B.rx + 34}" ry="${B.ry + 34}" fill="url(#${id}-g)"/>`;
const haze = (B, id, col, op, k = 1.05) => `<defs><radialGradient id="${id}-h"><stop offset="0" stop-color="${col}" stop-opacity="${op}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs>` +
  `<ellipse cx="${B.cx}" cy="${B.cy}" rx="${P(B.rx * k)}" ry="${P(B.ry * k)}" fill="url(#${id}-h)"/>`;
const inside = (B, r, k = .88) => { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * k; return [B.cx + Math.cos(a) * B.rx * d, B.cy + Math.sin(a) * B.ry * d]; };
// რაოდენობა იზრდება ველის ფართობთან ერთად — დიდ ველზეც ისეთივე ხშირია (ვარიანტები დაწერილია ~185×235 ზომისთვის)
const spots = (B, r, n, k) => Array.from({ length: Math.round(n * Math.min(8, Math.max(1, (B.rx * B.ry) / (185 * 235)))) }, () => inside(B, r, k));

const spear = (x, y, len = 34, ang = 0) => `<g transform="translate(${P(x)},${P(y)}) rotate(${P(ang)})"><line x1="0" y1="0" x2="0" y2="${P(-len)}" stroke="#2e2118" stroke-width="2"/>` +
  `<polygon points="-2.6,${P(-len)} 0,${P(-len - 10)} 2.6,${P(-len)}" fill="#8f979f"/></g>`;
const banner = (x, y, h = 48, ang = 0, col = '#9e1f1a') => `<g transform="translate(${P(x)},${P(y)}) rotate(${P(ang)})"><line x1="0" y1="0" x2="0" y2="${-h}" stroke="#23180f" stroke-width="2.6"/>` +
  `<path d="M0,${-h + 2} L20,${-h + 4} L17,${-h + 15} L21,${-h + 24} L13,${-h + 20} L10,${-h + 31} L6,${-h + 21} L0,${-h + 26} Z" fill="${col}"/>` +
  `<path d="M0,${-h + 2} L20,${-h + 4} L19,${-h + 8} L0,${-h + 7} Z" fill="#000" opacity=".25"/></g>`;
const shield = (x, y, col = '#7a1f1a') => `<ellipse cx="${P(x)}" cy="${P(y)}" rx="8.5" ry="3.8" fill="${col}" stroke="#a8843a" stroke-width="1.3"/><circle cx="${P(x)}" cy="${P(y - .6)}" r="1.6" fill="#a8843a"/>`;
const helmet = (x, y) => `<path d="M${P(x - 5.5)},${P(y)} a5.5,5 0 0 1 11,0 Z" fill="#7d848c"/><rect x="${P(x - 6)}" y="${P(y - .5)}" width="12" height="1.6" fill="#5a6068"/>`;
const sword = (x, y, ang = 0, len = 30) => `<g transform="translate(${P(x)},${P(y)}) rotate(${P(ang)})"><path d="M0,${-len} L2.2,${-len + 4} L2.2,-5 L-2.2,-5 L-2.2,${-len + 4} Z" fill="#c4cad1"/>` +
  `<rect x="-7.5" y="-5" width="15" height="3" rx="1.5" fill="#6b5a40"/><rect x="-1.5" y="-2" width="3" height="8" fill="#2e2118"/></g>`;
const fire = (x, y, s = 1) => `<g transform="translate(${P(x)},${P(y)}) scale(${P(s)})"><ellipse cx="0" cy="0" rx="16" ry="6" fill="#ff7a2e" opacity=".35"/>` +
  `<path d="M-7,0 Q-8,-11 0,-20 Q8,-11 7,0 Z" fill="#ff7a22"/><path d="M-3.5,0 Q-3.5,-8 0,-12 Q3.5,-8 3.5,0 Z" fill="#ffd36a"/></g>`;
const smoke = (x, y, s = 1, col = '#4f4a47', op = .55) => `<g transform="translate(${P(x)},${P(y)}) scale(${P(s)})" opacity="${op}">` +
  `<ellipse cx="0" cy="-18" rx="17" ry="13" fill="${col}"/><ellipse cx="10" cy="-38" rx="22" ry="16" fill="${col}" opacity=".85"/><ellipse cx="2" cy="-62" rx="27" ry="19" fill="${col}" opacity=".6"/><ellipse cx="16" cy="-88" rx="30" ry="18" fill="${col}" opacity=".35"/></g>`;
const puddle = (x, y, rx, ry) => `<ellipse cx="${P(x)}" cy="${P(y)}" rx="${P(rx)}" ry="${P(ry)}" fill="#33261d"/><ellipse cx="${P(x)}" cy="${P(y - 1)}" rx="${P(rx * .84)}" ry="${P(ry * .66)}" fill="#e07a34" opacity=".8"/>` +
  `<path d="M${P(x - rx * .45)},${P(y - ry * .15)} h${P(rx * .55)}" stroke="#ffd08a" stroke-width="1.8" opacity=".85"/>`;
const stake = (x, y, h = 26, ang = 0, col = '#4a3220') => `<g transform="translate(${P(x)},${P(y)}) rotate(${P(ang)})"><polygon points="-3,0 3,0 2,${-h} 0,${-h - 6} -2,${-h}" fill="${col}"/></g>`;
const ribs = (x, y, s = 1) => `<g transform="translate(${P(x)},${P(y)}) scale(${P(s)})" fill="none" stroke="#e6dac0" stroke-width="2.2" stroke-linecap="round"><path d="M-18,0 H18"/>` +
  [-12, -6, 0, 6, 12].map(dx => `<path d="M${dx},0 q-7,-9 -1,-17 M${dx},0 q7,-9 1,-17"/>`).join('') + `<circle cx="23" cy="-2" r="5" fill="#e6dac0" stroke="none"/></g>`;
const crater = (x, y, rr) => `<ellipse cx="${P(x)}" cy="${P(y)}" rx="${P(rr)}" ry="${P(rr * .45)}" fill="#241b16"/><ellipse cx="${P(x)}" cy="${P(y - 1)}" rx="${P(rr * .82)}" ry="${P(rr * .34)}" fill="#3a2c22"/>` +
  `<ellipse cx="${P(x)}" cy="${P(y)}" rx="${P(rr * .45)}" ry="${P(rr * .18)}" fill="#ff6a1a" opacity=".6"/>`;
const crow = (x, y, s = 1) => `<path d="M${P(x - 8 * s)},${P(y)} q${P(4 * s)},${P(-5 * s)} ${P(8 * s)},0 q${P(4 * s)},${P(-5 * s)} ${P(8 * s)},0" fill="none" stroke="#15100e" stroke-width="2.2"/>`;
const rock = (x, y, s = 1) => `<polygon points="${P(x - 9 * s)},${P(y)} ${P(x - 6 * s)},${P(y - 7 * s)} ${P(x + 3 * s)},${P(y - 9 * s)} ${P(x + 9 * s)},${P(y - 3 * s)} ${P(x + 8 * s)},${P(y)}" fill="#5b524b"/>`;
const shadowLine = (x, y, len, dx = 1) => `<line x1="${P(x)}" y1="${P(y)}" x2="${P(x + len * dx)}" y2="${P(y + len * .18)}" stroke="#1a110c" stroke-width="3" stroke-linecap="round" opacity=".45"/>`;
const blot = (x, y, rx, ry, col, op = .6) => `<ellipse cx="${P(x)}" cy="${P(y)}" rx="${P(rx)}" ry="${P(ry)}" fill="${col}" opacity="${op}"/>`;
const fog = (x, y, rx, ry, col = '#b9a596', op = .32) => `<ellipse cx="${P(x)}" cy="${P(y)}" rx="${P(rx)}" ry="${P(ry)}" fill="${col}" opacity="${op}"/>`;
const catapult = (x, y, s = 1) => `<g transform="translate(${P(x)},${P(y)}) scale(${P(s)})"><rect x="-22" y="-8" width="44" height="7" fill="#5a3d26"/><circle cx="-16" cy="0" r="6" fill="#3e2a1a"/><circle cx="16" cy="0" r="6" fill="#3e2a1a"/>` +
  `<line x1="-4" y1="-8" x2="22" y2="-40" stroke="#5a3d26" stroke-width="5" stroke-linecap="round"/><line x1="10" y1="-8" x2="2" y2="-26" stroke="#4a3220" stroke-width="4"/><circle cx="24" cy="-43" r="5" fill="#3e2a1a"/></g>`;

// სიღრმის მიხედვით დალაგება: [y, svg]
const sorted = items => items.sort((a, b) => a[0] - b[0]).map(i => i[1]).join('');
const blots = (B, r, n, cols, op = .5) => spots(B, r, n, .85).map(([x, y]) => blot(x, y, 18 + r() * 34, 7 + r() * 12, cols[Math.floor(r() * cols.length)], op)).join('');

// ---------- ახალი ვარიანტების ნაწილები (მეორე რაუნდი — ავტორს ბნელი ველები არ მოეწონა: ფერადი, „ლამაზი“ ვარიანტები) ----------
const pavilion = (x, y, c1, c2 = '#f4ecd8', s = 1) => `<g transform="translate(${P(x)},${P(y)}) scale(${P(s)})"><ellipse cx="0" cy="1" rx="22" ry="6" fill="#1d3a20" opacity=".2"/>` +
  `<path d="M-18,0 V-18 H18 V0 Z" fill="${c2}"/>` + [-12, 0, 12].map(dx => `<rect x="${dx - 3}" y="-18" width="6" height="18" fill="${c1}"/>`).join('') +
  `<path d="M-6,0 V-12 Q0,-16 6,-12 V0 Z" fill="#3a2a1e" opacity=".75"/><path d="M-21,-18 Q0,-40 21,-18 Z" fill="${c1}"/><path d="M0,-38 Q12,-30 21,-18 H0 Z" fill="#000" opacity=".12"/>` +
  `<line x1="0" y1="-38" x2="0" y2="-52" stroke="#5a3d26" stroke-width="1.6"/><path d="M0,-52 l12,3 l-12,3 Z" fill="${c1}"/></g>`;
const flag = (x, y, h, col) => `<line x1="${P(x)}" y1="${P(y)}" x2="${P(x)}" y2="${P(y - h)}" stroke="#4a3220" stroke-width="2"/><path d="M${P(x)},${P(y - h)} h16 l-4,5 l4,5 h-16 Z" fill="${col}"/>`;
const bunting = (x1, y1, x2, y2, cols) => {
  let g = `<path d="M${P(x1)},${P(y1)} Q${P((x1 + x2) / 2)},${P((y1 + y2) / 2 + 14)} ${P(x2)},${P(y2)}" fill="none" stroke="#5a3d26" stroke-width="1.2"/>`;
  for (let i = 1; i < 9; i++) { const t = i / 9, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * 7; g += `<polygon points="${P(x - 3)},${P(y)} ${P(x + 3)},${P(y)} ${P(x)},${P(y + 7)}" fill="${cols[i % cols.length]}"/>`; }
  return g;
};
const hay = (x, y) => `<ellipse cx="${P(x)}" cy="${P(y)}" rx="13" ry="4" fill="#1d3a20" opacity=".2"/><path d="M${P(x - 12)},${P(y)} Q${P(x - 12)},${P(y - 20)} ${P(x)},${P(y - 22)} Q${P(x + 12)},${P(y - 20)} ${P(x + 12)},${P(y)} Z" fill="#e6b84e"/>` +
  `<path d="M${P(x - 8)},${P(y - 8)} Q${P(x)},${P(y - 12)} ${P(x + 8)},${P(y - 8)}" fill="none" stroke="#b98b2e" stroke-width="1.4"/>`;
const flower = (x, y, col) => `<circle cx="${P(x)}" cy="${P(y)}" r="2.4" fill="${col}"/><circle cx="${P(x)}" cy="${P(y)}" r=".9" fill="#fff6c4"/>`;
const pillar = (x, y, h, broken) => `<ellipse cx="${P(x + 2)}" cy="${P(y + 1)}" rx="11" ry="4" fill="#1d3a20" opacity=".22"/><rect x="${P(x - 8)}" y="${P(y - h)}" width="16" height="${h}" fill="#e8e1d1"/>` +
  `<rect x="${P(x + 2)}" y="${P(y - h)}" width="6" height="${h}" fill="#c9c0ac"/>` + [-4, 0, 4].map(dx => `<line x1="${P(x + dx)}" y1="${P(y - h + 4)}" x2="${P(x + dx)}" y2="${P(y - 4)}" stroke="#bdb39e" stroke-width="1"/>`).join('') +
  (broken ? `<polygon points="${P(x - 8)},${P(y - h)} ${P(x - 2)},${P(y - h - 6)} ${P(x + 3)},${P(y - h - 2)} ${P(x + 8)},${P(y - h - 8)} ${P(x + 8)},${P(y - h)}" fill="#e8e1d1"/>`
    : `<rect x="${P(x - 11)}" y="${P(y - h - 6)}" width="22" height="6" fill="#ded6c4"/>`) + `<rect x="${P(x - 11)}" y="${P(y - 4)}" width="22" height="4" fill="#ded6c4"/>`;
const menhir = (x, y, h) => `<ellipse cx="${P(x + 3)}" cy="${P(y + 1)}" rx="12" ry="4" fill="#1d3a20" opacity=".25"/><path d="M${P(x - 9)},${P(y)} L${P(x - 7)},${P(y - h)} Q${P(x)},${P(y - h - 8)} ${P(x + 7)},${P(y - h)} L${P(x + 9)},${P(y)} Z" fill="#9aa0a6"/>` +
  `<path d="M${P(x + 2)},${P(y)} L${P(x + 3)},${P(y - h - 3)} Q${P(x + 6)},${P(y - h - 2)} ${P(x + 7)},${P(y - h)} L${P(x + 9)},${P(y)} Z" fill="#7e858c"/>` +
  `<path d="M${P(x - 6)},${P(y - h * .4)} q4,-3 8,0" fill="none" stroke="#6f8a52" stroke-width="2" opacity=".7"/>`;
const dune = (x, y, w) => `<path d="M${P(x - w)},${P(y)} Q${P(x - w * .3)},${P(y - w * .32)} ${P(x + w * .2)},${P(y - w * .12)} Q${P(x + w * .6)},${P(y - w * .02)} ${P(x + w)},${P(y)} Z" fill="#e8c27a"/>` +
  `<path d="M${P(x - w * .3)},${P(y - w * .3)} Q${P(x + w * .1)},${P(y - w * .08)} ${P(x + w)},${P(y)} L${P(x + w * .2)},${P(y)} Z" fill="#d1a65e"/>`;
const palisade = (x, y, n = 6) => Array.from({ length: n }, (_, i) => `<polygon points="${P(x + i * 7 - 3)},${P(y)} ${P(x + i * 7 + 3)},${P(y)} ${P(x + i * 7 + 2)},${P(y - 20)} ${P(x + i * 7)},${P(y - 25)} ${P(x + i * 7 - 2)},${P(y - 20)}" fill="#8a6038"/>`).join('') +
  `<line x1="${P(x - 4)}" y1="${P(y - 10)}" x2="${P(x + n * 7)}" y2="${P(y - 10)}" stroke="#5a3d26" stroke-width="2"/>`;
const siegeTower = (x, y, s = 1) => `<g transform="translate(${P(x)},${P(y)}) scale(${P(s)})"><ellipse cx="2" cy="2" rx="22" ry="6" fill="#1d3a20" opacity=".25"/>` +
  `<polygon points="-16,0 16,0 12,-70 -12,-70" fill="#8a6038"/><polygon points="4,0 16,0 12,-70 4,-70" fill="#6b4628"/>` +
  [-56, -40, -24, -8].map(yy => `<line x1="-14" y1="${yy}" x2="14" y2="${yy}" stroke="#5a3d26" stroke-width="2"/>`).join('') +
  `<rect x="-14" y="-78" width="28" height="8" fill="#a07448"/>` + [-12, -4, 4].map(xx => `<rect x="${xx}" y="-84" width="6" height="6" fill="#a07448"/>`).join('') +
  `<circle cx="-11" cy="0" r="5" fill="#3e2a1a"/><circle cx="11" cy="0" r="5" fill="#3e2a1a"/><path d="M-12,-62 l0,-14" stroke="#4a3220" stroke-width="2"/><path d="M-12,-76 h12 l-3,4 l3,4 h-12 Z" fill="#c8392b"/></g>`;
const torch = (x, y) => `<line x1="${P(x)}" y1="${P(y)}" x2="${P(x)}" y2="${P(y - 24)}" stroke="#4a3220" stroke-width="2"/><ellipse cx="${P(x)}" cy="${P(y - 26)}" rx="12" ry="12" fill="#ffb347" opacity=".22"/>` +
  `<path d="M${P(x - 3.5)},${P(y - 23)} Q${P(x - 4)},${P(y - 31)} ${P(x)},${P(y - 36)} Q${P(x + 4)},${P(y - 31)} ${P(x + 3.5)},${P(y - 23)} Z" fill="#ff9a2e"/>`;
const groundSoft = (B, id, c1, c2) => `<defs><radialGradient id="${id}-g"><stop offset="0" stop-color="${c1}"/><stop offset=".8" stop-color="${c2}"/><stop offset="1" stop-color="${c2}" stop-opacity="0"/></radialGradient></defs>` +
  `<ellipse cx="${B.cx}" cy="${B.cy}" rx="${B.rx + 40}" ry="${B.ry + 40}" fill="url(#${id}-g)"/>`;
const TEAM = ['#c8392b', '#2f6fc0', '#e0ad3e', '#2f9a4c', '#7b4fc2'];

// ---------- მესამე რაუნდი (ავტორის თხოვნა): ბრძოლის შემდგომი ველი — ეყარა მუზარადები, ხმლები, შუბები, ფარები, სისხლი.
// სტილი — მულტიპლიკაციური, როგორც მთელი რუკა (თამაშს ბავშვებიც თამაშობენ — სისხლი მუქი წითელი ლაქებია, დეტალების გარეშე)
const helm = (x, y, kind, ang = 0) => {
  const t = `transform="translate(${P(x)},${P(y)}) rotate(${P(ang)})"`;
  if (kind === 0) return `<g ${t}><ellipse cx="0" cy="1" rx="8" ry="2.6" fill="#1d1410" opacity=".25"/><path d="M-6.5,0 a6.5,6.5 0 0 1 13,0 Z" fill="#9aa3ad"/><rect x="-8.5" y="-1" width="17" height="2.6" rx="1.3" fill="#7d858e"/><path d="M-3,-5 a4,4 0 0 1 4,-1" stroke="#dfe4ea" stroke-width="1.2" fill="none"/></g>`;
  if (kind === 1) return `<g ${t}><ellipse cx="0" cy="1" rx="7" ry="2.4" fill="#1d1410" opacity=".25"/><rect x="-6" y="-11" width="12" height="11" rx="3" fill="#8d959e"/><rect x="-6" y="-7" width="12" height="2" fill="#2a2420"/><line x1="0" y1="-5" x2="0" y2="0" stroke="#2a2420" stroke-width="1.4"/><rect x="2" y="-11" width="4" height="11" rx="2" fill="#747c85"/></g>`;
  if (kind === 2) return `<g ${t}><ellipse cx="0" cy="1" rx="8" ry="2.4" fill="#1d1410" opacity=".25"/><path d="M-6,0 Q-7,-10 0,-12 Q7,-10 6,0 Z" fill="#a0a8b1"/><path d="M0,-12 Q-6,-17 -9,-12" stroke="#c8392b" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="-1" y="-8" width="2" height="8" fill="#6e767f"/></g>`;
  return `<g ${t}><ellipse cx="0" cy="1" rx="8" ry="2.4" fill="#1d1410" opacity=".25"/><path d="M-6,0 a6,6 0 0 1 12,0 Z" fill="#8d959e"/><path d="M-6,-3 q-5,-3 -4,-9 q3,4 6,5 M6,-3 q5,-3 4,-9 q-3,4 -6,5" fill="#efe6d2"/></g>`;
};
const swordDown = (x, y, ang) => `<g transform="translate(${P(x)},${P(y)}) rotate(${P(ang)})"><ellipse cx="0" cy="1" rx="14" ry="2" fill="#1d1410" opacity=".22"/>` +
  `<path d="M-14,0 L8,-1.6 L12,0 L8,1.6 Z" fill="#cfd5dc"/><line x1="-14" y1="0" x2="8" y2="0" stroke="#9aa3ad" stroke-width=".7"/><rect x="-16" y="-4" width="2.6" height="8" rx="1.2" fill="#b38a2e"/><rect x="-21" y="-1.3" width="5" height="2.6" fill="#4a3220"/><circle cx="-22" cy="0" r="1.6" fill="#b38a2e"/></g>`;
const spearDown = (x, y, ang, broken) => `<g transform="translate(${P(x)},${P(y)}) rotate(${P(ang)})"><line x1="-26" y1="0" x2="${broken ? 4 : 18}" y2="0" stroke="#6b4a2e" stroke-width="2.2" stroke-linecap="round"/>` +
  (broken ? `<path d="M4,-1.5 L7,0 L4,1.5" fill="#6b4a2e"/>` : `<polygon points="18,-3 28,0 18,3" fill="#b4bcc6"/>`) + '</g>';
const spearUp = (x, y, ang, len = 36) => `<g transform="translate(${P(x)},${P(y)}) rotate(${P(ang)})"><ellipse cx="0" cy="1" rx="4" ry="1.4" fill="#1d1410" opacity=".3"/><line x1="0" y1="0" x2="0" y2="${-len}" stroke="#5a3d26" stroke-width="2.2"/>` +
  `<polygon points="-2.8,${-len} 0,${-len - 11} 2.8,${-len}" fill="#b4bcc6"/><path d="M-3,${-len + 6} h6" stroke="#c8392b" stroke-width="2"/></g>`;
const swordUp = (x, y, ang) => `<g transform="translate(${P(x)},${P(y)}) rotate(${P(ang)})"><ellipse cx="0" cy="1" rx="5" ry="1.6" fill="#1d1410" opacity=".3"/><path d="M-2,0 L-2,-26 L0,-30 L2,-26 L2,0 Z" fill="#cfd5dc"/>` +
  `<rect x="-7" y="-30" width="14" height="3" rx="1.5" fill="#b38a2e"/><rect x="-1.4" y="-38" width="2.8" height="8" fill="#4a3220"/><circle cx="0" cy="-39" r="2" fill="#b38a2e"/></g>`;
const shieldDown = (x, y, col, ang = 0) => `<g transform="translate(${P(x)},${P(y)}) rotate(${P(ang)})"><ellipse cx="1" cy="2" rx="12" ry="5.4" fill="#1d1410" opacity=".25"/><ellipse cx="0" cy="0" rx="11" ry="5" fill="${col}" stroke="#7a5a2a" stroke-width="1.6"/>` +
  `<ellipse cx="0" cy="-.5" rx="3" ry="1.4" fill="#c9a24a"/><path d="M-11,0 H11" stroke="#000" stroke-opacity=".15" stroke-width="2"/></g>`;
const kite = (x, y, col, ang = 0) => `<g transform="translate(${P(x)},${P(y)}) rotate(${P(ang)})"><path d="M-8,-12 H8 V-2 Q8,8 0,14 Q-8,8 -8,-2 Z" fill="${col}" stroke="#7a5a2a" stroke-width="1.4"/><path d="M0,-12 V13 M-8,-3 H8" stroke="#f4ecd8" stroke-width="1.6" opacity=".8"/></g>`;
const blood = (x, y, s, r) => {
  let g = `<g transform="translate(${P(x)},${P(y)}) scale(${P(s)},${P(s * .5)})"><path d="`;
  const n = 9; for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, rr = 10 + r() * 6 + (i % 2 ? 0 : r() * 4); g += `${i ? 'L' : 'M'}${P(Math.cos(a) * rr)},${P(Math.sin(a) * rr)} `; }
  g += 'Z" fill="#7e1414"/>';
  for (let i = 0; i < 4; i++) { const a = r() * Math.PI * 2, d = 18 + r() * 8; g += `<circle cx="${P(Math.cos(a) * d)}" cy="${P(Math.sin(a) * d)}" r="${P(1.5 + r() * 2.5)}" fill="#7e1414"/>`; }
  return g + '<ellipse cx="-3" cy="-3" rx="5" ry="3" fill="#a52222" opacity=".7"/></g>';
};
const arrowIn = (x, y, ang) => `<g transform="translate(${P(x)},${P(y)}) rotate(${P(ang)})"><line x1="0" y1="0" x2="0" y2="-16" stroke="#6b4a2e" stroke-width="1.4"/><path d="M-2.4,-16 L0,-12 L2.4,-16 M-2.4,-13 L0,-9 L2.4,-13" fill="none" stroke="#e8dcc0" stroke-width="1.4"/></g>`;
const brokenBanner = (x, y, col, ang) => `<g transform="translate(${P(x)},${P(y)}) rotate(${P(ang)})"><line x1="0" y1="0" x2="0" y2="-40" stroke="#4a3220" stroke-width="2.4"/>` +
  `<path d="M0,-40 L18,-38 L14,-30 L19,-22 L8,-25 L4,-17 L0,-22 Z" fill="${col}"/></g>`;
const ARMS = ['#a52a22', '#2f5f9e', '#a52a22', '#c49a32', '#2f5f9e'];

// ველზე დაყრილი იარაღი: [y, svg] სია — ყველა ვარიანტისთვის საერთო, რაოდენობები და ფერები ცვლადია
function aftermath(B, r, o) {
  const it = [], c = () => (o.cols || ARMS)[Math.floor(r() * (o.cols || ARMS).length)], side = x => o.sides ? (x < B.cx ? '#a52a22' : '#2f5f9e') : c();
  for (const [x, y] of spots(B, r, o.blood ?? 16, .86)) it.push([y - 30, blood(x, y, .8 + r() * 1.1, r)]);
  for (const [x, y] of spots(B, r, o.helms ?? 26)) it.push([y, helm(x, y, Math.floor(r() * 4), (r() - .5) * 60)]);
  for (const [x, y] of spots(B, r, o.swords ?? 18)) it.push([y, r() < .65 ? swordDown(x, y, r() * 360) : swordUp(x, y, (r() - .5) * 40)]);
  for (const [x, y] of spots(B, r, o.spears ?? 26)) it.push([y, r() < .5 ? spearUp(x, y, (r() - .5) * 50, 28 + r() * 16) : spearDown(x, y, r() * 360, r() < .4)]);
  for (const [x, y] of spots(B, r, o.shields ?? 16)) it.push([y, r() < .6 ? shieldDown(x, y, side(x), (r() - .5) * 30) : kite(x, y, side(x), (r() - .5) * 70)]);
  for (const [x, y] of spots(B, r, o.arrows ?? 20)) it.push([y, arrowIn(x, y, (r() - .5) * 50)]);
  for (const [x, y] of spots(B, r, o.banners ?? 5, .85)) it.push([y, brokenBanner(x, y, side(x), (r() - .5) * 50)]);
  return it;
}

export const BATTLE_VARIANTS = [
  {
    name: 'გათელილი ბალახი',
    desc: 'მწვანე ველი, ბრძოლისგან გათელილი ბილიკებით — ბალახში ეყარა მუზარადები, ფარები, ხმლები და სისხლი',
    ground(B, id, r) { return groundSoft(B, id, '#7fae55', '#6b9a48') + blots(B, r, 18, ['#8a7a4e', '#5f8a40'], .55) + sorted(aftermath(B, r, { helms: 22, blood: 12 })); },
    focal: () => blood(0, 4, 1.6, rng(5)) + kite(-18, 0, '#2f5f9e', -30) + helm(12, 2, 0, 15) + swordDown(0, 12, 20) + spearUp(26, 8, 14, 46)
  }
];

// არჩეული ვარიანტი: მისამართით ?battle=N (სანახავად) ან CHOSEN
export function battleVariant() {
  const n = Number(new URLSearchParams(location.search).get('battle')) || CHOSEN;
  return BATTLE_VARIANTS[Math.min(BATTLE_VARIANTS.length, Math.max(1, n)) - 1];
}

// ფიქსირებული შემთხვევითობა — ერთი და იგივე ვარიანტი ყოველთვის ერთნაირად იხატება
export const battleRng = () => rng(23);
