// რელიეფი, ცა და ბუნება: ქედები, ბორცვები, გზები, ხეები, ღრუბლები, ვულკანი, ნაპერწკლები
import { H } from './config.js';
import { P, rng, curve } from './utils.js';
import { anim } from './fx.js';

// რბილი, ფართო ქედი; y(x) აბრუნებს ქედის სიმაღლეს — ციხეს ზუსტად თხემზე ვსვამთ.
// rim — თხემის განათება: [[ფერი, გამჭვირვალობა], ...] (მზის მხარეს ღია კიდე, ლავის მხარეს წითელი)
export function hills(base, bumps, amp, seed, fill, rim = []) {
  const r = rng(seed), waves = [0, 1, 2].map(i => [amp * (r() * .6 + .4) / (i + 1), (r() * .004 + .002) * (i + 1), r() * 6.28]);
  const y = x => base - bumps.reduce((s, [cx, h, w]) => s + h * Math.exp(-(((x - cx) / w) ** 2)), 0) + waves.reduce((s, [a, f, p]) => s + a * Math.sin(x * f + p), 0);
  let edge = '';
  for (let x = -200; x <= 1800; x += 10) edge += `${edge ? ' L' : 'M'}${x},${P(y(x))}`;
  const light = rim.map(([c, op]) => `<path d="${edge}" stroke="${c}" stroke-width="3" fill="none" stroke-linejoin="round" opacity="${op}"/>`).join('');
  return { svg: `<path d="${edge} L1800,${H + 20} L-200,${H + 20} Z" fill="${fill}"/>${light}`, y };
}

// ვულკანი: კლდოვანი, ქვემოთ გაშლილი კონუსი, მანათობელი კრატერი და ლავის ნაკადები, რომლებიც კრატერის კიდიდან გადმოედინება,
// ფერდობზე იკლაკნება, ქვემოთ ფართოვდება და ბოლოში ცივდება (მუქი ქერქი). კრატერის ნათება „სუნთქავს“, ნაკადის შუა ხაზი ციმციმებს (მოძრავი ფენა).
// part: 'cone' — მთა (იხატება ქედების უკან, ღამის ჩრდილი მასზეც ეცემა); 'lava' — ლავა და კრატერი (ღამის ჩრდილის ზემოთ, რომ ანათებდეს;
// draw-scene.js მას წინა ქედის ფორმით ჭრის)
export function volcano(cx, base, w, top, id, part = 'cone') {
  const r = rng(77), cw = w * .17, h = base - top, k = w / 280;   // k — ზომის კოეფიციენტი (ნაკადების სისქისთვის)
  // სილუეტი: ზემოთ ციცაბო, ქვემოთ გაშლილი (x ~ t^1.6), კიდე ოდნავ დაკბილული
  const side = dir => Array.from({ length: 11 }, (_, i) => {
    const t = i / 10, j = i > 0 && i < 10;
    return [P(cx + dir * (cw + (w - cw) * Math.pow(t, 1.6) + (j ? (r() - .5) * 9 : 0))), P(top + h * t + (j ? (r() - .5) * 5 : 0))];
  });
  const L = side(-1), R = side(1), str = a => a.map(p => p.join(',')).join(' ');
  // მწვერვალის ზედა კიდე — კრატერის უკანა კიდე (რკალი), რომ კრატერი მთის შიგნით იჯდეს და არა ზემოდან
  const rim = Array.from({ length: 11 }, (_, i) => { const t = Math.PI + Math.PI * i / 10;
    return `${P(cx + cw * .96 * Math.cos(t))},${P(top - 1 + cw * .3 * Math.sin(t) + (i > 0 && i < 10 ? (r() - .5) * 2.5 : 0))}`; }).join(' ');
  let g = `<defs><linearGradient id="${id}-lavaflow" gradientUnits="userSpaceOnUse" x1="0" y1="${top}" x2="0" y2="${base}">` +
    `<stop offset="0" stop-color="#fff0a0"/><stop offset=".22" stop-color="#ffb43a"/><stop offset=".55" stop-color="#ff6a1a"/><stop offset="1" stop-color="#b8281a"/></linearGradient>` +
    `<radialGradient id="${id}-lavapool"><stop offset="0" stop-color="#fff4b0"/><stop offset=".45" stop-color="#ffb43a"/><stop offset="1" stop-color="#e0401a"/></radialGradient></defs>`;
  if (part === 'lava') g = '';                                          // gradient-ები უკვე 'cone'-შია
  const cone = g + `<circle cx="${cx}" cy="${top}" r="${P(w * .6)}" fill="url(#${id}-evilglow)"/>`;
  g = cone + `<polygon points="${str([...L].reverse())} ${rim} ${str(R)}" fill="#35232f"/>`;   // ბურუსით ოდნავ გაღიავებული — შორს დგას
  // ჩრდილოვანი მხარე და ფერდობის ღარები
  g += `<polygon points="${P(cx + cw * .3)},${top} ${str(R)} ${P(cx + w * .12)},${base}" fill="#140c12" opacity=".6"/>`;
  for (const [x0, x1] of [[-.45, -.62], [-.15, -.3], [.55, .7]])
    g += `<path d="M${P(cx + cw * x0 * 2)},${P(top + h * .12)} Q${P(cx + w * x1 * .55)},${P(top + h * .5)} ${P(cx + w * x1)},${P(base - 4)}" stroke="#120a10" stroke-width="2.5" fill="none" opacity=".45"/>`;
  if (part === 'cone') return g;
  g = '';
  // კრატერი: უკანა კედელი (მუქი), შიგნით ლავის ტბა, წინ — კლდოვანი კიდე, რომელშიც ჭრილებია; ნაკადები ჭრილებიდან გადმოედინება
  const rx = cw * .7, ry = cw * .19, lipY = x => top + ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));
  const starts = [cx - cw * .42, cx + cw * .3, cx - cw * .04];                 // ჭრილების ადგილები კიდეზე
  g += `<circle cx="${cx}" cy="${P(top - cw * .2)}" r="${P(cw * 2)}" fill="url(#${id}-glow)" opacity=".55"/>`;   // მრგვალი სითბოს ნათება
  g += `<ellipse cx="${cx}" cy="${P(top - 1)}" rx="${P(cw * .88)}" ry="${P(cw * .27)}" fill="#2e1a22"/>`;        // უკანა კედელი (ლავისგან ოდნავ განათებული)
  g += `<ellipse cx="${cx}" cy="${P(top + 1)}" rx="${P(rx)}" ry="${P(ry)}" fill="url(#${id}-lavapool)"/>`;       // ლავის ტბა
  g += `<path d="M${P(cx - rx)},${P(top + 1)} A${P(rx)},${P(ry)} 0 0 1 ${P(cx + rx)},${P(top + 1)} A${P(rx)},${P(ry * .45)} 0 0 0 ${P(cx - rx)},${P(top + 1)} Z" fill="#7a2410" opacity=".45"/>`;   // ტბის შორეული ნაწილი — ჩრდილში
  // წინა კიდე: ლოდები ტბის წინა რკალზე, ჭრილებთან — არა
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI * i / 16, x = cx + rx * 1.1 * Math.cos(a), y = top + 1 + ry * 1.2 * Math.sin(a);
    if (starts.some(sx => Math.abs(x - sx) < cw * .13)) continue;
    const bw = cw * (.09 + r() * .05), bh = cw * (.06 + r() * .04);
    g += `<polygon points="${P(x - bw)},${P(y + bh)} ${P(x - bw * .6)},${P(y - bh)} ${P(x + bw * .4)},${P(y - bh * 1.2)} ${P(x + bw)},${P(y + bh * .6)}" fill="#2a1c26"/>` +
      `<polygon points="${P(x - bw * .6)},${P(y - bh)} ${P(x + bw * .4)},${P(y - bh * 1.2)} ${P(x + bw * .2)},${P(y - bh * .4)}" fill="#ff8a3a" opacity=".35"/>`;
  }
  // ლავის ნაკადები: [ბეზიეს 4 წერტილი, სიგანე ზემოთ, სიგანე ქვემოთ, აღწევს თუ არა ძირს]; იწყება ჭრილიდან (წინა კიდიდან), ვიწროდ
  const at = x => [x, P(lipY(x) - 1)];
  const flows = [
    [[at(starts[0]), [cx - cw * 1.1, top + h * .3], [cx - w * .22, top + h * .55], [cx - w * .4, base + 10]], 9, 18, true],
    [[at(starts[1]), [cx + cw * .8, top + h * .28], [cx + w * .05, top + h * .5], [cx + w * .2, top + h * .74]], 8, 14, false],
    [[at(starts[2]), [cx - cw * .35, top + h * .18], [cx + w * .04, top + h * .3], [cx - w * .05, top + h * .44]], 5, 9, false]
  ];
  const core = [];
  for (const [p, w0, w1, full] of flows) {
    const y0 = p[0][1], y1 = p[3][1];
    const wf = y => { const t = Math.max(0, Math.min(1, (y - y0) / (y1 - y0))); return k * (w0 + (w1 - w0) * t) * Math.min(1, .45 + t * 7) * (full ? 1 : Math.min(1, (1 - t) * 5 + .3)); };   // კიდესთან ვიწრო, ქვემოთ — სრული
    g += road(p, y => wf(y) * 2.2, 0, '#ff4a10').replace('/>', ` filter="url(#${id}-blur)" opacity=".5"/>`);      // ნათება ფერდობზე
    g += road(p, wf, 0, `url(#${id}-lavaflow)`);
    const c = curve(p), pts = [];
    for (let t = 0; t <= (full ? .75 : .6); t += .03) { const [x, y] = c.at(t); pts.push(`${P(x)},${P(y)}`); }
    core.push(`<polyline points="${pts.join(' ')}" stroke="#fff4b8" stroke-width="${P(1.6 * k)}" fill="none" stroke-linecap="round" opacity=".85"/>`);
    for (const t of full ? [.55, .72, .88] : [.85]) {                                                     // გაცივებული ქერქი
      const [x, y] = c.at(t), rx = wf(y) * .3;
      g += `<ellipse cx="${P(x)}" cy="${P(y)}" rx="${P(rx)}" ry="${P(rx * .5)}" fill="#3a1810" opacity=".8"/>`;
    }
    if (!full) { const [x, y] = c.at(1); g += `<ellipse cx="${P(x)}" cy="${P(y - 1)}" rx="${P(w1 * .32)}" ry="${P(w1 * .22)}" fill="#4a1c12"/>`; }
  }
  g += core.join('');
  // მოძრავი ფენა: კრატერის „სუნთქვა“ (მრგვალი სითბო ზემოთ), ნაკადების ციმციმი, ნაპერწკლები კრატერზე
  g += anim(`<circle class="breathe" cx="${cx}" cy="${P(top - cw * .35)}" r="${P(cw * 1.3)}" fill="url(#${id}-glow)" opacity=".7"/>`);
  g += anim(`<g class="breathe" style="animation-duration:1.9s">${core.join('')}</g>`);
  g += embers(cx - cw, cx + cw, top - 50, top - 5, 7, 211);
  return g;
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

// დამწვარი, მოხრჩოლავე ნანგრევი (ნათება უძრავია, ალი — მოძრავ ფენაში)
export function ruin(x, y, s, id) {
  const tf = `<g transform="translate(${x},${y}) scale(${s})">`;
  return tf +
    `<circle cx="-4" cy="-30" r="44" fill="url(#${id}-glow)"/>` +
    `<polygon points="-34,0 -34,-30 -26,-38 -20,-26 -12,-44 -4,-30 4,-34 10,-20 18,-28 30,-14 34,0" fill="#2a1c1c"/>` +
    `<polygon points="4,-34 10,-20 18,-28 30,-14 34,0 4,0" fill="#1a1012"/>` +
    `<rect x="-24" y="-22" width="8" height="12" fill="#ff7a2a" opacity=".85"/>` +
    anim(`<g class="flicker"><path d="M-16,-30 Q-18,-52 -8,-68 Q-4,-54 0,-62 Q6,-46 2,-30 Z" fill="#ff8a2a"/><path d="M-11,-30 Q-12,-42 -6,-52 Q-1,-40 -1,-30 Z" fill="#ffe08a"/></g>`, tf) +
    '</g>';
}

// ჰაერში მოფრენილი ნაპერწკლები — ყველა მოძრავ ფენაშია; wrap — ჯგუფები, რომლებშიც ნაპერწკლები იხატება (მაგ. ხმლის ტრანსფორმაცია)
export function embers(x0, x1, y0, y1, n, seed, wrap = '') {
  const r = rng(seed); let g = '';
  for (let i = 0; i < n; i++)
    g += anim(`<circle class="ember" cx="${P(x0 + r() * (x1 - x0))}" cy="${P(y0 + r() * (y1 - y0))}" r="${P(1.2 + r() * 1.8)}" fill="${r() < .5 ? '#ffb347' : '#ff6a2a'}" style="animation-delay:-${(r() * 5).toFixed(2)}s;animation-duration:${(3 + r() * 3).toFixed(2)}s"/>`, wrap);
  return g;
}

// ---------- რელიეფი ----------
export function ridge(y, amp, seed, fill, n = 8, rim = []) {
  const r = rng(seed), pts = [];
  for (let i = 0; i <= n; i++) pts.push([-200 + i * 2000 / n, y + (r() * 2 - 1) * amp]);
  let top = `M${P(pts[0][0])},${P(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[i + 1];
    top += ` Q${P(a[0])},${P(a[1])} ${P((a[0] + b[0]) / 2)},${P((a[1] + b[1]) / 2)}`;
  }
  top += ` L1800,${P(pts[n][1])}`;
  const light = rim.map(([c, op]) => `<path d="${top}" stroke="${c}" stroke-width="3" fill="none" opacity="${op}"/>`).join('');
  return `<path d="${top} L1800,${H + 20} L-200,${H + 20} Z" fill="${fill}"/>${light}`;
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
  // edge(x) — მწვერვალის ზედა კიდე (მის გარეთ — Infinity): მის უკან მდგომი ჯარის მოსაჭრელად
  const outline = [...L].reverse().concat(R).map(p => p.map(Number));
  const edge = x => {
    for (let i = 1; i < outline.length; i++) {
      const [x0, y0] = outline[i - 1], [x1, y1] = outline[i];
      if (x >= x0 && x <= x1) return y0 + (y1 - y0) * (x - x0) / ((x1 - x0) || 1);
    }
    return Infinity;
  };
  return { svg: g, top: P(top), edge };
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
// დილის ღრუბელი: რამდენიმე გაწელილი, ერთმანეთზე გადადებული ზოლი რბილი კიდეებით (ბუნდოვანების ფილტრი);
// light — ღია ზოლი ზედა, მზისკენა მხარეს
export function cloud(x, y, w, col, op, id, light) {
  const bands = [[0, 0, 1, .11], [-.25, -.05, .62, .08], [.3, -.035, .5, .07], [-.5, .03, .35, .05], [.58, .02, .3, .05]];
  let g = `<g opacity="${op}" filter="url(#${id}-soft)">`;
  for (const [dx, dy, rw, rh] of bands) g += `<ellipse cx="${P(x + dx * w)}" cy="${P(y + dy * w)}" rx="${P(rw * w)}" ry="${P(rh * w)}" fill="${col}"/>`;
  if (light) g += `<ellipse cx="${P(x - w * .18)}" cy="${P(y - w * .075)}" rx="${P(w * .5)}" ry="${P(w * .03)}" fill="${light}" opacity=".7"/>`;
  return g + '</g>';
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
// ნაძვის იარუსი: დაკბილული სამკუთხედი (w — ნახევარსიგანე, y0 — ძირი, y1 — წვერი); აბრუნებს წერტილებს მარცხნიდან მარჯვნივ
const tier = (w, y0, y1) => {
  const h = y0 - y1;
  return [[-w, y0], [-w * .55, y0 - h * .22], [-w * .72, y0 - h * .3], [-w * .3, y0 - h * .6], [-w * .42, y0 - h * .66], [0, y1],
    [w * .42, y0 - h * .66], [w * .3, y0 - h * .6], [w * .72, y0 - h * .3], [w * .55, y0 - h * .22], [w, y0]].map(p => `${P(p[0])},${P(p[1])}`);
};

// ნაძვი: სამი დაკბილული იარუსი, მარჯვენა (მზისგან მოშორებული) მხარე ჩრდილშია
export function tree(x, y, s, col, col2) {
  let g = `<g transform="translate(${P(x)},${P(y)}) scale(${P(s)})"><rect x="-3" y="-12" width="6" height="12" fill="#3b2a1e"/>`;
  for (const [w, y0, y1] of [[22, -10, -48], [18, -30, -66], [13, -50, -84]]) {
    const pts = tier(w, y0, y1);
    g += `<polygon points="${pts.join(' ')}" fill="${col}"/><polygon points="${pts.slice(5).join(' ')} 0,${y0}" fill="${col2}"/>`;
  }
  return g + '</g>';
}

// ფოთლოვანი ხე (მუხა): მრგვალი ვარჯი რამდენიმე წრისგან, ჩრდილი მარჯვნივ
export function oak(x, y, s, col, col2) {
  return `<g transform="translate(${P(x)},${P(y)}) scale(${P(s)})"><rect x="-3" y="-18" width="6" height="18" fill="#3b2a1e"/>` +
    `<g fill="${col}"><circle cx="-13" cy="-32" r="15"/><circle cx="12" cy="-34" r="14"/><circle cx="0" cy="-48" r="17"/><circle cx="1" cy="-30" r="14"/></g>` +
    `<path d="M6,-64 A17,17 0 0 1 16,-44 A14,14 0 0 1 24,-30 Q14,-18 2,-26 Q8,-44 6,-64 Z" fill="${col2}" opacity=".9"/></g>`;
}

// ტყე: ხეები შემთხვევით ადგილებზე, შორს პატარა, ახლოს დიდი; oakRatio — მუხების წილი (სიკეთის მხარეს მრავალფეროვნებისთვის)
export function forest(x0, x1, y0, y1, n, s0, s1, col, col2, seed, skip = [], oakRatio = 0) {
  const r = rng(seed), list = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), kind = r() < oakRatio;
    if (skip.some(([a, b]) => x > a && x < b)) continue;
    list.push([x, y, s0 + (y - y0) / (y1 - y0 || 1) * (s1 - s0), kind]);
  }
  return list.sort((a, b) => a[1] - b[1]).map(([x, y, s, isOak]) => (isOak ? oak : tree)(x, y, s, col, col2)).join('');
}

export function smoke(x, y, h, col, op, id) {
  return `<path d="M${x - 10},${y} C${x - 34},${y - h * .4} ${x - 6},${y - h * .7} ${x - 80},${y - h} L${x + 70},${y - h} C${x + 30},${y - h * .6} ${x + 22},${y - h * .3} ${x + 10},${y} Z" fill="${col}" opacity="${op}" filter="url(#${id}-blur)"/>`;
}

// t0..t1 — მრუდის რომელი ნაწილი დაიხატოს (ნაგულისხმევად მთლიანი).
// w0 შეიძლება იყოს ფუნქციაც: სიგანე სიღრმის (y) მიხედვით — ახლოს ფართო, შორს ვიწრო.
// p — ბეზიეს 4 წერტილი ან სერპანტინი (trail, utils.js); სერპანტინს მეტი წერტილი სჭირდება, რომ მოსახვევები გლუვი იყოს
export function road(p, w0, w1, fill, t0 = 0, t1 = 1) {
  const L = [], R = [], c = curve(p), n = Array.isArray(p) ? 40 : 160;
  for (let i = 0; i <= n; i++) {
    const t = t0 + (t1 - t0) * i / n, [x, y] = c.at(t), [nx, ny] = c.nrm(t);
    const w = (typeof w0 === 'function' ? w0(y) : w0 + (w1 - w0) * t) / 2;
    L.push(`${P(x + nx * w)},${P(y + ny * w)}`); R.push(`${P(x - nx * w)},${P(y - ny * w)}`);
  }
  return `<path d="M${L.join(' L')} L${R.reverse().join(' L')} Z" fill="${fill}"/>`;
}
