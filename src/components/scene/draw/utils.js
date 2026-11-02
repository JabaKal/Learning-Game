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
