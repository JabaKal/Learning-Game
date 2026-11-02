// ჯარი: ადამიანები, ელფები, ჯუჯები, ორკები, გოლიათები, დროშები, კოლონები
import { P, rng, hazed, bez, normal } from './utils.js';

// ---------- ჯარი ----------
export function soldier(x, y, s, c, kind, mirror, torch, id) {
  if (c.race) return creature(x, y, s, c, kind, mirror, torch, id);
  let g = `<g transform="translate(${P(x)},${P(y)}) scale(${P(mirror ? -s : s)},${P(s)})">`;
  if (torch) g += `<circle cx="-12" cy="-62" r="28" fill="url(#${id}-glow)" class="flicker"/>`;
  g += `<rect x="-5" y="-15" width="4" height="15" fill="${c.dark}"/><rect x="1" y="-15" width="4" height="15" fill="${c.dark}"/>`;
  g += `<path d="M-8.5,-13 L-6.5,-32 L6.5,-32 L8.5,-13 Z" fill="${c.body}"/><path d="M0,-32 L6.5,-32 L8.5,-13 L0,-13 Z" fill="#000" opacity=".18"/>`;
  g += `<rect x="-7.5" y="-21" width="15" height="2.6" fill="${c.trim}"/>`;
  g += `<circle cx="0" cy="-37" r="5.2" fill="${c.skin}"/><path d="M-5.8,-37 A5.8,5.8 0 0 1 5.8,-37 L5.8,-36 L-5.8,-36 Z" fill="${c.metal}"/>`;
  if (c.plume) g += `<path d="M0,-43 Q5,-50 -2,-54" stroke="${c.plume}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  if (kind === 'spear') g += `<line x1="9.5" y1="-60" x2="9.5" y2="1" stroke="${c.wood}" stroke-width="1.8"/><polygon points="9.5,-68 12,-59 7,-59" fill="${c.metal}"/>`;
  else if (kind === 'shield') g += `<line x1="9.5" y1="-52" x2="9.5" y2="1" stroke="${c.wood}" stroke-width="1.8"/><polygon points="9.5,-59 12,-51 7,-51" fill="${c.metal}"/><circle cx="-8" cy="-22" r="8.5" fill="${c.trim}"/><circle cx="-8" cy="-22" r="5.6" fill="${c.body}"/><circle cx="-8" cy="-22" r="1.8" fill="${c.trim}"/>`;
  else if (kind === 'bow') g += `<path d="M8,-48 Q19,-30 8,-10" stroke="${c.wood}" stroke-width="2" fill="none"/><line x1="8" y1="-48" x2="8" y2="-10" stroke="${c.trim}" stroke-width=".7"/>`;
  else if (kind === 'sword') g += `<line x1="9" y1="-18" x2="16" y2="-48" stroke="${c.metal}" stroke-width="2.4"/><line x1="5" y1="-22" x2="13" y2="-20" stroke="${c.trim}" stroke-width="2"/>`;
  if (torch) g += `<line x1="-9" y1="-24" x2="-12" y2="-56" stroke="${c.wood}" stroke-width="2"/><path d="M-15.5,-55 Q-15.5,-64 -12,-71 Q-8.5,-64 -8.5,-55 Z" fill="#ffb347" class="flicker"/>`;
  return g + '</g>';
}

// ელფები, ჯუჯები და ორკები — თითოეულს თავისი სილუეტი და იარაღი აქვს
export function creature(x, y, s, c, kind, mirror, torch, id) {
  let g = `<g transform="translate(${P(x)},${P(y)}) scale(${P(mirror ? -s : s)},${P(s)})">`;
  if (c.race === 'elf') {          // მაღალი და წვრილი, გრძელი თმა, წვეტიანი ყურები, მოსასხამი
    g += `<path d="M-7,-36 L-11,-5 L11,-5 L7,-36 Z" fill="${c.cloak}"/>`;
    g += `<rect x="-4.5" y="-17" width="3.6" height="17" fill="${c.dark}"/><rect x=".9" y="-17" width="3.6" height="17" fill="${c.dark}"/>`;
    g += `<path d="M-7,-15 L-5.5,-36 L5.5,-36 L7,-15 Z" fill="${c.body}"/><path d="M0,-36 L5.5,-36 L7,-15 L0,-15 Z" fill="#000" opacity=".15"/>`;
    g += `<rect x="-6.5" y="-24" width="13" height="2.2" fill="${c.trim}"/>`;
    g += `<path d="M-5.6,-43 Q0,-49 5.6,-43 L6.4,-30 L3.6,-33 L-3.6,-33 L-6.4,-30 Z" fill="${c.hair}"/>`;
    g += `<circle cx="0" cy="-41" r="4.7" fill="${c.skin}"/><polygon points="-4.4,-42 -8.6,-45.5 -4.2,-39.4" fill="${c.skin}"/><polygon points="4.4,-42 8.6,-45.5 4.2,-39.4" fill="${c.skin}"/>`;
    g += `<path d="M-5,-42 Q0,-48.5 5,-42 Q0,-44.5 -5,-42 Z" fill="${c.hair}"/>`;
    if (kind === 'shield') g += `<line x1="9.5" y1="-72" x2="9.5" y2="1" stroke="${c.wood}" stroke-width="1.6"/><path d="M9.5,-82 Q12.5,-76 9.5,-70 Q6.5,-76 9.5,-82 Z" fill="${c.metal}"/>`;   // ფოთლისებრი შუბი
    else g += `<path d="M8,-60 Q21,-34 8,-6" stroke="${c.wood}" stroke-width="2" fill="none"/><line x1="8" y1="-60" x2="8" y2="-6" stroke="${c.trim}" stroke-width=".7"/>`;   // გრძელი მშვილდი
  } else if (c.race === 'dwarf') { // დაბალი და განიერი, დიდი წვერი, რქიანი ჩაფხუტი
    g += `<rect x="-6" y="-9" width="5" height="9" fill="${c.dark}"/><rect x="1" y="-9" width="5" height="9" fill="${c.dark}"/>`;
    g += `<path d="M-10.5,-8 L-9.5,-26 L9.5,-26 L10.5,-8 Z" fill="${c.body}"/><path d="M0,-26 L9.5,-26 L10.5,-8 L0,-8 Z" fill="#000" opacity=".15"/>`;
    g += `<rect x="-10" y="-14" width="20" height="3" fill="${c.trim}"/><rect x="-2" y="-14.5" width="4" height="4" fill="${c.metal}"/>`;
    g += `<circle cx="0" cy="-30" r="5" fill="${c.skin}"/>`;
    g += `<path d="M-5.6,-29 Q-7.5,-16 0,-11 Q7.5,-16 5.6,-29 Q0,-26.5 -5.6,-29 Z" fill="${c.beard}"/>`;
    g += `<path d="M-6,-31 A6,6 0 0 1 6,-31 Z" fill="${c.metal}"/><path d="M-5.5,-33 Q-11,-36 -10,-42 Q-8,-36 -4,-35 Z M5.5,-33 Q11,-36 10,-42 Q8,-36 4,-35 Z" fill="#ece4d0"/>`;
    g += `<line x1="9" y1="-36" x2="9" y2="0" stroke="${c.wood}" stroke-width="2.2"/>`;
    g += kind === 'shield' ? `<rect x="4" y="-40" width="10" height="7" rx="1" fill="${c.metal}"/>`               // ურო
                           : `<path d="M9,-36 Q18,-38 18,-27 Q13,-29 9,-28 Z" fill="${c.metal}"/>`;         // ცული
  } else if (c.race === 'orc') {   // მოხრილი, განიერმხრებიანი, მწვანე კანი, ეშვები, წითელი თვალები
    if (torch) g += `<circle cx="-12" cy="-60" r="28" fill="url(#${id}-glow)" class="flicker"/>`;
    g += `<rect x="-6.5" y="-14" width="5.2" height="14" fill="${c.dark}"/><rect x="1.3" y="-14" width="5.2" height="14" fill="${c.dark}"/>`;
    g += `<path d="M-10,-12 L-9.5,-31 L9.5,-31 L10,-12 Z" fill="${c.body}"/><path d="M0,-31 L9.5,-31 L10,-12 L0,-12 Z" fill="#000" opacity=".2"/>`;
    g += `<polygon points="-12.5,-29 -10,-37 -5,-31" fill="${c.metal}"/><polygon points="12.5,-29 10,-37 5,-31" fill="${c.metal}"/>`;
    g += `<rect x="-9.5" y="-20" width="19" height="2.6" fill="${c.trim}"/>`;
    g += `<circle cx="0" cy="-35" r="5.6" fill="${c.skin}"/><rect x="-4.2" y="-33" width="8.4" height="3.4" rx="1" fill="${c.skin}"/>`;
    g += `<polygon points="-3.2,-31 -2.6,-35.5 -1.6,-31" fill="#f0ead8"/><polygon points="3.2,-31 2.6,-35.5 1.6,-31" fill="#f0ead8"/>`;
    g += `<circle cx="-2" cy="-37" r=".95" fill="#ff4a2a"/><circle cx="2" cy="-37" r=".95" fill="#ff4a2a"/>`;
    g += `<path d="M-6.2,-37.5 L-4.5,-44 L-1.8,-39.5 L0,-46.5 L1.8,-39.5 L4.5,-44 L6.2,-37.5 Z" fill="${c.metal}"/>`;
    if (kind === 'shield') g += `<line x1="9" y1="-14" x2="13" y2="-40" stroke="${c.wood}" stroke-width="2"/><polygon points="11,-40 20,-45 19,-31 13.5,-33" fill="${c.blade}"/>` +
      `<circle cx="-8.5" cy="-21" r="8.5" fill="${c.trim}"/><circle cx="-8.5" cy="-21" r="6" fill="#1a1216"/><path d="M-11,-24 L-6,-21 L-11,-18" stroke="${c.trim}" stroke-width="1.6" fill="none"/>`;   // საჭრელი და ფარი
    else g += `<line x1="9.5" y1="-58" x2="9.5" y2="1" stroke="${c.wood}" stroke-width="2"/><polygon points="9.5,-68 13,-58 9.5,-55 6,-58" fill="${c.blade}"/><polygon points="9.5,-58 13.5,-61 11,-56" fill="${c.blade}"/>`;   // უხეში შუბი
    if (torch) g += `<line x1="-9" y1="-24" x2="-12" y2="-54" stroke="${c.wood}" stroke-width="2"/><path d="M-15.5,-53 Q-15.5,-62 -12,-69 Q-8.5,-62 -8.5,-53 Z" fill="#ffb347" class="flicker"/>`;
  }
  return g + '</g>';
}

// გოლიათი (ტროლი): ორკზე ორჯერ მაღალი, ეკლიანი კეტი მხარზე
export function giant(x, y, s, c, id) {
  let g = `<g transform="translate(${P(x)},${P(y)}) scale(${P(s)})">`;
  g += `<rect x="-13" y="-36" width="11" height="36" fill="${c.skinDark}"/><rect x="2" y="-36" width="11" height="36" fill="${c.skinDark}"/>`;
  g += `<polygon points="-15,-38 15,-38 11,-20 -11,-20" fill="${c.cloth}"/>`;
  g += `<path d="M-17,-36 Q-22,-66 -11,-80 L11,-80 Q22,-66 17,-36 Z" fill="${c.skin}"/><path d="M0,-80 L11,-80 Q22,-66 17,-36 L0,-36 Z" fill="#000" opacity=".18"/>`;
  g += `<path d="M-6,-60 Q0,-54 6,-60" stroke="${c.skinDark}" stroke-width="2" fill="none" opacity=".6"/>`;
  g += `<path d="M-16,-76 Q-27,-58 -22,-34 L-15,-34 Q-19,-56 -9,-72 Z" fill="${c.skin}"/>`;                    // ჩამოშვებული ხელი
  g += `<path d="M12,-72 Q24,-80 22,-96 L16,-96 Q16,-82 8,-76 Z" fill="${c.skin}"/>`;                          // აწეული ხელი
  g += `<line x1="18" y1="-90" x2="-2" y2="-128" stroke="${c.wood}" stroke-width="7" stroke-linecap="round"/><circle cx="-4" cy="-131" r="10" fill="${c.wood}"/>`;
  for (const [sx, sy] of [[-14, -134], [-8, -142], [3, -138], [-2, -122], [6, -129]]) g += `<polygon points="${sx - 2},${sy + 2} ${sx},${sy - 5} ${sx + 2},${sy + 2}" fill="${c.metal}"/>`;
  g += `<circle cx="0" cy="-86" r="8" fill="${c.skin}"/><rect x="-7" y="-91" width="14" height="3" fill="${c.skinDark}"/>`;
  g += `<circle cx="-3" cy="-87" r="1.3" fill="#ff4a2a"/><circle cx="3" cy="-87" r="1.3" fill="#ff4a2a"/>`;
  g += `<polygon points="-4,-81 -3.2,-86 -2.2,-81" fill="#f0ead8"/><polygon points="4,-81 3.2,-86 2.2,-81" fill="#f0ead8"/>`;
  return g + '</g>';
}

export function banner(x, y, h, col, em, shape, sc = 1) {
  const fw = 46 * sc, fh = 32 * sc, top = y - h, fx = x + 1.5 * sc;
  const cx = fx + fw / 2, cy = top + fh / 2, r = 7 * sc, sw = P(2.6 * sc);
  let e = '';
  if (shape === 'circle') e = `<circle cx="${P(cx)}" cy="${P(cy)}" r="${P(r)}" fill="${em}"/>`;
  else if (shape === 'ring') e = `<circle cx="${P(cx)}" cy="${P(cy)}" r="${P(r)}" fill="none" stroke="${em}" stroke-width="${sw}"/><circle cx="${P(cx)}" cy="${P(cy)}" r="${P(r * .35)}" fill="${em}"/>`;
  else if (shape === 'tri') e = `<polygon points="${P(cx)},${P(cy - r)} ${P(cx + r)},${P(cy + r * .8)} ${P(cx - r)},${P(cy + r * .8)}" fill="none" stroke="${em}" stroke-width="${sw}"/>`;
  else if (shape === 'chev') e = `<polyline points="${P(cx - r)},${P(cy + r * .5)} ${P(cx)},${P(cy - r * .5)} ${P(cx + r)},${P(cy + r * .5)}" fill="none" stroke="${em}" stroke-width="${P(3 * sc)}"/>`;
  else if (shape === 'diamond') e = `<polygon points="${P(cx)},${P(cy - r)} ${P(cx + r * .7)},${P(cy)} ${P(cx)},${P(cy + r)} ${P(cx - r * .7)},${P(cy)}" fill="${em}"/>`;
  else if (shape === 'cross') e = `<rect x="${P(cx - r * .3)}" y="${P(top + 3 * sc)}" width="${P(r * .6)}" height="${P(fh - 6 * sc)}" fill="${em}"/><rect x="${P(fx + 4 * sc)}" y="${P(cy - r * .3)}" width="${P(fw - 8 * sc)}" height="${P(r * .6)}" fill="${em}"/>`;
  else if (shape === 'geo') { // ხუთჯვრიანი დროშა
    const t = fh * .17;
    e = `<rect x="${P(cx - t / 2)}" y="${P(top)}" width="${P(t)}" height="${P(fh)}" fill="${em}"/><rect x="${P(fx)}" y="${P(cy - t / 2)}" width="${P(fw)}" height="${P(t)}" fill="${em}"/>`;
    for (const [dx, dy] of [[-.25, -.25], [.25, -.25], [-.25, .25], [.25, .25]]) {
      const qx = cx + dx * fw, qy = cy + dy * fh, q = fh * .1;
      e += `<rect x="${P(qx - q * .3)}" y="${P(qy - q)}" width="${P(q * .6)}" height="${P(q * 2)}" fill="${em}"/><rect x="${P(qx - q)}" y="${P(qy - q * .3)}" width="${P(q * 2)}" height="${P(q * .6)}" fill="${em}"/>`;
    }
  }
  return `<line x1="${P(x)}" y1="${P(y)}" x2="${P(x)}" y2="${P(top - 6 * sc)}" stroke="#23170f" stroke-width="${P(3 * sc)}" stroke-linecap="round"/>` +
    `<circle cx="${P(x)}" cy="${P(top - 7 * sc)}" r="${P(3.2 * sc)}" fill="#d8a640"/>` +
    `<g class="flag" style="animation-delay:-${(Math.random() * 2).toFixed(2)}s"><rect x="${P(fx)}" y="${P(top)}" width="${P(fw)}" height="${P(fh)}" fill="${col}"/>${e}</g>`;
}

// ჯარის კოლონა გზაზე: კარიბჭესთან პატარა (შორს), ქვემოთ დიდი (მაყურებელთან ახლოს)
export function marchColumn(p, colors, id, seed, o) {
  const r = rng(seed), scale = t => o.s0 * Math.pow(o.s1 / o.s0, Math.pow(t / o.tMax, 1.4)), ranks = [];
  const t0 = o.tMin || .02;
  let g = '', last = bez(p, t0), dist = Infinity;
  for (let t = t0; t <= o.tMax; t += .002) {
    const pt = bez(p, t);
    dist += Math.hypot(pt[0] - last[0], pt[1] - last[1]); last = pt;
    if (dist >= 20 * scale(t)) { ranks.push(t); dist = 0; }
  }
  let i = 0;
  for (const t of ranks.reverse()) {
    const [x, y] = bez(p, t), [nx, ny] = normal(p, t), s = scale(t), off = 17 * s;
    i++;
    if (o.giant && i % o.giant === 3) g += giant(x, y, s, o.giantC || GIANT, id);     // ზოგ რიგში — გოლიათი
    else for (const side of [-1, 0, 1]) {
      const c = colors[Math.floor(r() * colors.length)];
      g += soldier(x + nx * off * side, y + ny * off * side, s, c, r() < .7 ? 'spear' : 'shield', false, o.torch && r() < o.torch, id);
    }
    if (i % 6 === 4) g += banner(x + 22 * s, y, 74 * s, o.flag[0], o.flag[1], o.flag[2], s * .75);
  }
  return g;
}

// ---------- ფერები ----------
export const SK = '#d9a77c', MET = '#b4bcc6', WD = '#5a3d26';

export const C = (body, trim, o = {}) => ({ body, trim, skin: SK, metal: MET, dark: '#1d1520', wood: WD, ...o });

// სიკეთის ჯარი: ადამიანები, ელფები და ჯუჯები
export const GOOD_ARMY = [
  C('#2f5fb8', '#e8d48a'), C('#24468a', '#cfd8e6', { plume: '#7fb2ff' }),
  { race: 'elf', body: '#2f7a52', cloak: '#1f5a3c', trim: '#d8e0e8', hair: '#f0d890', skin: '#f0d2b4', metal: '#dfe6ee', dark: '#1d2a24', wood: '#6a4a2a' },
  { race: 'elf', body: '#3a8a8a', cloak: '#25606a', trim: '#e8d48a', hair: '#e8e8f0', skin: '#f0d2b4', metal: '#dfe6ee', dark: '#1d2a2a', wood: '#6a4a2a' },
  { race: 'dwarf', body: '#8a3a2a', trim: '#d8a640', beard: '#a0602a', skin: '#e0a880', metal: MET, dark: '#2a1c18', wood: WD },
  { race: 'dwarf', body: '#2f4f8a', trim: '#d8a640', beard: '#c8c0b0', skin: '#e0a880', metal: MET, dark: '#2a1c18', wood: WD }
];

// ბოროტების ჯარი: ორკები (და გოლიათები — იხ. GIANT)
export const EVIL_ARMY = [
  { race: 'orc', body: '#2a2228', trim: '#b8322a', skin: '#5f7a3e', metal: '#4a4450', blade: '#8a8f96', dark: '#120c10', wood: '#2a1a14' },
  { race: 'orc', body: '#3a2a22', trim: '#e0602a', skin: '#6b8442', metal: '#3a3440', blade: '#7a7f86', dark: '#140e0c', wood: '#2a1a14' },
  { race: 'orc', body: '#1e1a22', trim: '#b8322a', skin: '#4f6a3a', metal: '#4a4450', blade: '#8a8f96', dark: '#0e0a0c', wood: '#2a1a14' }
];

export const GIANT = { skin: '#6b7a5a', skinDark: '#4f5c42', cloth: '#4a3428', wood: '#4a3020', metal: '#9a9ea6' };

export const hazeAll = (list, to, t) => list.map(c => hazed(c, to, t));
