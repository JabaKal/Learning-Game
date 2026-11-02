// დამხმარე ფუნქციები: დამრგვალება, შემთხვევითი რიცხვები, ფერები, ბეზიეს მრუდი

export const P = n => Math.round(n * 10) / 10;

export const rng = seed => { let s = seed % 233280; return () => (s = (s * 9301 + 49297) % 233280) / 233280; };

// ---------- ჰაერის ბურუსი (შორეული ობიექტები ღია და მკრთალია) ----------
export const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));

export const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');

export const hazed = (c, to, t) => Object.fromEntries(Object.entries(c).map(([k, v]) => [k, /^#[0-9a-f]{6}$/i.test(v) ? mix(v, to, t) : v]));

export const fog = (y, h, op, id) => `<rect x="-200" y="${y}" width="2000" height="${h}" fill="url(#${id}-fog)" opacity="${op}"/>`;

// ბეზიეს მრუდი — გზისთვის და მიმავალი ჯარისთვის
export const bez = (p, t) => { const u = 1 - t; return [0, 1].map(i => u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i]); };

export const normal = (p, t) => { const a = bez(p, Math.max(0, t - .01)), b = bez(p, Math.min(1, t + .01)); const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; };

// ---------- ბილიკები ----------
// curve(p) — ერთიანი ფორმა გზისა და ჯარისთვის: p ან ბეზიეს 4 წერტილია, ან უკვე მზა ბილიკი ({ at, nrm }, იხ. trail)
export const curve = p => Array.isArray(p) ? { at: t => bez(p, t), nrm: t => normal(p, t) } : p;

// სერპანტინი: სწორი მონაკვეთები მომრგვალებული მოსახვევებით (r — მოსახვევის რადიუსი). t (0..1) — მანძილი ბილიკის გასწვრივ,
// ამიტომ ჯარისკაცები თანაბრად ნაწილდება და მოსახვევში არ გროვდება
export function trail(pts, r = 12) {
  const s = [pts[0]];
  const line = (a, b) => { const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2)); for (let i = 1; i <= n; i++) s.push([a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]); };
  for (let i = 1; i < pts.length - 1; i++) {
    const [a, b, c] = [pts[i - 1], pts[i], pts[i + 1]];
    const la = Math.hypot(a[0] - b[0], a[1] - b[1]), lc = Math.hypot(c[0] - b[0], c[1] - b[1]), k = Math.min(r, la * .45, lc * .45);
    const p1 = [b[0] + (a[0] - b[0]) * k / la, b[1] + (a[1] - b[1]) * k / la], p2 = [b[0] + (c[0] - b[0]) * k / lc, b[1] + (c[1] - b[1]) * k / lc];
    line(s[s.length - 1], p1);
    for (let j = 1; j <= 10; j++) { const t = j / 10, u = 1 - t; s.push([u * u * p1[0] + 2 * u * t * b[0] + t * t * p2[0], u * u * p1[1] + 2 * u * t * b[1] + t * t * p2[1]]); }
  }
  line(s[s.length - 1], pts[pts.length - 1]);
  const len = [0];
  for (let i = 1; i < s.length; i++) len.push(len[i - 1] + Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]));
  const total = len[len.length - 1];
  const idx = t => { const d = Math.max(0, Math.min(1, t)) * total; let i = 1; while (i < len.length - 1 && len[i] < d) i++; return [i, (d - len[i - 1]) / ((len[i] - len[i - 1]) || 1)]; };
  return {
    at: t => { const [i, f] = idx(t); return [s[i - 1][0] + (s[i][0] - s[i - 1][0]) * f, s[i - 1][1] + (s[i][1] - s[i - 1][1]) * f]; },
    nrm: t => { const [i] = idx(t), a = s[Math.max(0, i - 2)], b = s[Math.min(s.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; }
  };
}
