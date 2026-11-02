// რელიეფი, ცა და ბუნება: ქედები, ბორცვები, გზები, ხეები, ღრუბლები, ვულკანი, ნაპერწკლები
import { H } from './config.js';
import { P, rng, bez, normal } from './utils.js';

// რბილი, ფართო ქედი; y(x) აბრუნებს ქედის სიმაღლეს — ციხეს ზუსტად თხემზე ვსვამთ
export function hills(base, bumps, amp, seed, fill) {
  const r = rng(seed), waves = [0, 1, 2].map(i => [amp * (r() * .6 + .4) / (i + 1), (r() * .004 + .002) * (i + 1), r() * 6.28]);
  const y = x => base - bumps.reduce((s, [cx, h, w]) => s + h * Math.exp(-(((x - cx) / w) ** 2)), 0) + waves.reduce((s, [a, f, p]) => s + a * Math.sin(x * f + p), 0);
  let d = `M-200,${H + 20}`;
  for (let x = -200; x <= 1800; x += 10) d += ` L${x},${P(y(x))}`;
  return { svg: `<path d="${d} L1800,${H + 20} Z" fill="${fill}"/>`, y };
}

export function volcano(cx, base, w, top, id) {
  const cw = w * .16, h = base - top;
  return `<circle cx="${cx}" cy="${top}" r="${w * .6}" fill="url(#${id}-evilglow)" class="pulse"/>` +
    `<path d="M${cx - w},${base} L${P(cx - cw)},${top} L${P(cx + cw)},${top} L${cx + w},${base} Z" fill="#2a1c26"/>` +
    `<path d="M${P(cx + cw * .2)},${top} L${P(cx + cw)},${top} L${cx + w},${base} L${P(cx + w * .1)},${base} Z" fill="#160e14" opacity=".7"/>` +
    `<ellipse cx="${cx}" cy="${top}" rx="${P(cw)}" ry="${P(cw * .25)}" fill="#ffb43a"/>` +
    `<path d="M${P(cx - cw * .4)},${top + 2} Q${P(cx - w * .2)},${P(top + h * .4)} ${P(cx - w * .35)},${base - 20}" stroke="#ff7a1a" stroke-width="5" fill="none" stroke-linecap="round"/>` +
    `<path d="M${P(cx + cw * .3)},${top + 2} Q${P(cx + w * .1)},${P(top + h * .5)} ${P(cx + w * .25)},${base - 10}" stroke="#ff9a2a" stroke-width="4" fill="none" stroke-linecap="round"/>`;
}

// ეკლიანი შავი კლდეები
export function crags(x0, x1, base, hMax, seed, fill) {
  const r = rng(seed); let pts = `${x0},${H + 20} ${x0},${base}`;
  for (let x = x0; x < x1; x += 18 + r() * 30) {
    const h = hMax * (.3 + r() * .7) * (.4 + .6 * (1 - (x - x0) / (x1 - x0)));
    pts += ` ${P(x + 8)},${P(base - h)} ${P(x + 20 + r() * 10)},${P(base - h * .2)}`;
  }
  return `<polygon points="${pts} ${x1},${base} ${x1},${H + 20}" fill="${fill}"/>`;
}

export function deadTree(x, y, s, col = '#1a1216') {
  return `<g transform="translate(${P(x)},${P(y)}) scale(${P(s)})"><path d="M-2,0 L-1.5,-40 L-12,-58 M-1.5,-40 L0,-64 M-1,-28 L10,-46 L15,-45 M0,-52 L7,-61 M-6,-50 L-14,-52" stroke="${col}" stroke-width="3" stroke-linecap="round" fill="none"/></g>`;
}

export function deadForest(x0, x1, y0, y1, n, s0, s1, seed) {
  const r = rng(seed), list = [];
  for (let i = 0; i < n; i++) { const y = y0 + r() * (y1 - y0); list.push([x0 + r() * (x1 - x0), y, s0 + (y - y0) / (y1 - y0) * (s1 - s0)]); }
  return list.sort((a, b) => a[1] - b[1]).map(([x, y, s]) => deadTree(x, y, s)).join('');
}

// დამწვარი, მოხრჩოლავე ნანგრევი
export function ruin(x, y, s, id) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <circle cx="-4" cy="-30" r="44" fill="url(#${id}-glow)" class="flicker"/>
    <polygon points="-34,0 -34,-30 -26,-38 -20,-26 -12,-44 -4,-30 4,-34 10,-20 18,-28 30,-14 34,0" fill="#2a1c1c"/>
    <polygon points="4,-34 10,-20 18,-28 30,-14 34,0 4,0" fill="#1a1012"/>
    <rect x="-24" y="-22" width="8" height="12" fill="#ff7a2a" opacity=".85"/>
    <path d="M-16,-30 Q-18,-52 -8,-68 Q-4,-54 0,-62 Q6,-46 2,-30 Z" fill="#ff8a2a" class="flicker"/>
    <path d="M-11,-30 Q-12,-42 -6,-52 Q-1,-40 -1,-30 Z" fill="#ffe08a"/>
  </g>`;
}

// ჰაერში მოფრენილი ნაპერწკლები
export function embers(x0, x1, y0, y1, n, seed) {
  const r = rng(seed); let g = '';
  for (let i = 0; i < n; i++)
    g += `<circle class="ember" cx="${P(x0 + r() * (x1 - x0))}" cy="${P(y0 + r() * (y1 - y0))}" r="${P(1.2 + r() * 1.8)}" fill="${r() < .5 ? '#ffb347' : '#ff6a2a'}" style="animation-delay:-${(r() * 5).toFixed(2)}s;animation-duration:${(3 + r() * 3).toFixed(2)}s"/>`;
  return g;
}

// ---------- რელიეფი ----------
export function ridge(y, amp, seed, fill, n = 8) {
  const r = rng(seed), pts = [];
  for (let i = 0; i <= n; i++) pts.push([-200 + i * 2000 / n, y + (r() * 2 - 1) * amp]);
  let d = `M-200,${H + 20} L${P(pts[0][0])},${P(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[i + 1];
    d += ` Q${P(a[0])},${P(a[1])} ${P((a[0] + b[0]) / 2)},${P((a[1] + b[1]) / 2)}`;
  }
  return `<path d="${d} L1800,${P(pts[n][1])} L1800,${H + 20} Z" fill="${fill}"/>`;
}

// კლდოვანი მწვერვალი ქედზე — ციხე მთის ნაწილად გამოიყურება და არა ზემოდან დადებულად
export function summit(h, cx, w, rise, fill, seed) {
  const r = rng(seed), top = h.y(cx) - rise, f = [0, .3, .22, .55, .5, .82, 1];
  const side = dir => f.map((t, i) => {
    const x = cx + dir * w * (1 + i * .18);
    return [P(x + (i ? (r() - .5) * 8 : 0)), P(top + (h.y(x) + 6 - top) * t + (i && i < f.length - 1 ? (r() - .5) * 6 : 0))];
  });
  const L = side(-1), R = side(1), str = a => a.map(p => p.join(',')).join(' '), end = p => `${p[0]},${P(p[1] + 40)}`;
  let g = `<polygon points="${end(L[L.length - 1])} ${str([...L].reverse())} ${str(R)} ${end(R[R.length - 1])}" fill="${fill}"/>`;
  g += `<polygon points="${P(cx + w * .3)},${P(top)} ${str(R)} ${end(R[R.length - 1])} ${P(cx + w * .2)},${P(top + rise + 40)}" fill="#1a1030" opacity=".3"/>`;
  g += `<polygon points="${str([...L].reverse().slice(-4))} ${P(cx - w * .6)},${P(top + rise * .6)}" fill="#fff" opacity=".14"/>`;
  g += `<path d="M${P(cx - w * .5)},${P(top + 4)} L${P(cx - w * .4)},${P(top + rise * .5)} L${P(cx - w * .55)},${P(top + rise)} M${P(cx + w * .6)},${P(top + 6)} L${P(cx + w * .7)},${P(top + rise * .6)} M${P(cx + w * 1.1)},${P(top + rise * .4)} L${P(cx + w * 1.05)},${P(top + rise)}" stroke="#1a1030" stroke-width="1.6" fill="none" opacity=".45"/>`;
  return { svg: g, top: P(top) };
}

// ციხის ძირთან წინ დაყრილი ლოდები (და ბუჩქები ან ეკლები) — ციხის სწორ ძირს ფარავს
export function lip(cx, top, w, fills, seed, kind) {
  const r = rng(seed); let g = '';
  for (let x = cx - w * 1.1; x <= cx + w * 1.1; x += 9 + r() * 8) {
    const bw = 7 + r() * 7, bh = 4 + r() * 6, by = top + 2 + r() * 3;
    const pts = `${P(x - bw)},${P(by + 3)} ${P(x - bw * .6)},${P(by - bh)} ${P(x + bw * .3)},${P(by - bh - 2)} ${P(x + bw)},${P(by - 1)} ${P(x + bw * .8)},${P(by + 3)}`;
    for (const f of fills) g += `<polygon points="${pts}" fill="${f}"/>`;
    g += `<polygon points="${P(x + bw * .3)},${P(by - bh - 2)} ${P(x + bw)},${P(by - 1)} ${P(x + bw * .8)},${P(by + 3)} ${P(x + bw * .2)},${P(by + 3)}" fill="#1a1030" opacity=".3"/>`;
    if (kind === 'good' && r() < .45) g += `<circle cx="${P(x)}" cy="${P(by - bh)}" r="${P(3 + r() * 3)}" fill="${r() < .5 ? '#4f8f62' : '#3f7d52'}"/>`;
    if (kind === 'evil' && r() < .35) g += `<polygon points="${P(x - 2)},${P(by - bh)} ${P(x + 1)},${P(by - bh - 9)} ${P(x + 3)},${P(by - bh)}" fill="#140a10"/>`;
  }
  return g;
}

export function mound(cx, y, w, h, fill) {
  return `<path d="M${cx - w},${H + 800} L${cx - w},${y} C${cx - w * .5},${y} ${cx - w * .45},${y - h} ${cx},${y - h} C${cx + w * .45},${y - h} ${cx + w * .5},${y} ${cx + w},${y} L${cx + w},${H + 800} Z" fill="${fill}"/>`;
}

// ---------- ცა ----------
export function cloud(x, y, w, col, op) {
  return `<g class="drift" opacity="${op}"><ellipse cx="${x}" cy="${y}" rx="${w}" ry="${P(w * .12)}" fill="${col}"/><ellipse cx="${P(x - w * .3)}" cy="${P(y - w * .06)}" rx="${P(w * .45)}" ry="${P(w * .1)}" fill="${col}"/><ellipse cx="${P(x + w * .35)}" cy="${P(y - w * .04)}" rx="${P(w * .35)}" ry="${P(w * .08)}" fill="${col}"/></g>`;
}

export function birds(x, y, n, seed, col) {
  const r = rng(seed); let g = '';
  for (let i = 0; i < n; i++) {
    const bx = x + r() * 220 - 110, by = y + r() * 90 - 45, s = .6 + r() * .6;
    g += `<path d="M${P(bx)},${P(by)} q${P(6 * s)},${P(-6 * s)} ${P(12 * s)},0 q${P(6 * s)},${P(-6 * s)} ${P(12 * s)},0" stroke="${col}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  }
  return g;
}

// ---------- ბუნება ----------
export function tree(x, y, s, col, col2) {
  return `<g transform="translate(${P(x)},${P(y)}) scale(${P(s)})">
    <rect x="-3" y="-12" width="6" height="12" fill="#3b2a1e"/>
    <polygon points="-22,-10 0,-48 22,-10" fill="${col}"/><polygon points="0,-48 22,-10 0,-10" fill="${col2}"/>
    <polygon points="-18,-30 0,-66 18,-30" fill="${col}"/><polygon points="0,-66 18,-30 0,-30" fill="${col2}"/>
    <polygon points="-13,-50 0,-84 13,-50" fill="${col}"/><polygon points="0,-84 13,-50 0,-50" fill="${col2}"/>
  </g>`;
}

export function forest(x0, x1, y0, y1, n, s0, s1, col, col2, seed, skip = []) {
  const r = rng(seed), list = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0);
    if (skip.some(([a, b]) => x > a && x < b)) continue;
    list.push([x, y, s0 + (y - y0) / (y1 - y0 || 1) * (s1 - s0)]);
  }
  return list.sort((a, b) => a[1] - b[1]).map(([x, y, s]) => tree(x, y, s, col, col2)).join('');
}

export function smoke(x, y, h, col, op, id) {
  return `<path d="M${x - 10},${y} C${x - 34},${y - h * .4} ${x - 6},${y - h * .7} ${x - 80},${y - h} L${x + 70},${y - h} C${x + 30},${y - h * .6} ${x + 22},${y - h * .3} ${x + 10},${y} Z" fill="${col}" opacity="${op}" filter="url(#${id}-blur)"/>`;
}

// t0..t1 — მრუდის რომელი ნაწილი დაიხატოს (ნაგულისხმევად მთლიანი).
// w0 შეიძლება იყოს ფუნქციაც: სიგანე სიღრმის (y) მიხედვით — ახლოს ფართო, შორს ვიწრო
export function road(p, w0, w1, fill, t0 = 0, t1 = 1) {
  const L = [], R = [];
  for (let i = 0; i <= 40; i++) {
    const t = t0 + (t1 - t0) * i / 40, [x, y] = bez(p, t), [nx, ny] = normal(p, t);
    const w = (typeof w0 === 'function' ? w0(y) : w0 + (w1 - w0) * t) / 2;
    L.push(`${P(x + nx * w)},${P(y + ny * w)}`); R.push(`${P(x - nx * w)},${P(y - ny * w)}`);
  }
  return `<path d="M${L.join(' L')} L${R.reverse().join(' L')} Z" fill="${fill}"/>`;
}
