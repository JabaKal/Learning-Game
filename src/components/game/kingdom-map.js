// სამეფოს რუკა: ერთ ეკრანზე, სქროლისა და მასშტაბის გარეშე. ორი განლაგება იგივე ადგილებით (ავტორის ესკიზებით, 2026-11-03):
// wide — კომპიუტერი (ჰორიზონტალური): ზემოთ მთები; მარცხნიდან მარჯვნივ — ზღვა ჩაძირული გემებით და მეგობრების კუნძულით,
//   ბრძოლის ველი, გალავანი (რკალი, ბრძოლის ველისკენ), არმია, მაღაზია, მდინარე, მარჯვნივ სასახლე (საკუთარი გალავნით) და სწავლა;
// tall — ტელეფონი (ვერტიკალური): კომპიუტერის რუკა 90°-ით მობრუნებული + ცვლილებები: მთები ზემოთ (ზედა ზოლის უკან), სასახლე
//   მარჯვენა ზედა კუთხეში, ზღვა მარცხნივ ქვემოთ (კუნძული და გემები), გალავანი ირიბად, ბრძოლის ველი მარჯვენა ქვედა კუთხეში.
// focus — ის ნაწილი, რომელიც ყოველთვის მთლიანად ჩანს (ყველა ადგილი წარწერებით; game.js ატევს ეკრანზე); ext — რამდენზე
// გრძელდება ნახატი, რომ ნებისმიერი ფორმის ეკრანი შეივსოს (ცარიელი ზოლების გარეშე).
// სამი ფენა: drawGround — მიწა, ტყე, მდინარე, გალავანი, ჯარი, ბრძოლის ველი → სურათად (canvas), მხოლოდ ხილული ნაწილი;
// drawOverlay — შენობები, წარწერები, დროშები, გემი → SVG ზემოდან (დასაჭერი); drawLights — ღამის ჩირაღდნები და ფანჯრები (game.js).
// იგივე სახატავი ფუნქციები, რაც მთავარ გვერდზე (scene/draw/), რომ სტილი ერთი იყოს. ნახატი დროებითია — ნამდვილი გრაფიკისას
// ფენები შეიცვლება სურათებით, ადგილები (LAYOUTS) და კოდი დარჩება.
import { P, rng, bez } from '../scene/draw/utils.js';
import { takeAnim } from '../scene/draw/fx.js';
import { fortress, STONE } from '../scene/draw/buildings.js';
import { tree, oak } from '../scene/draw/nature.js';
import { battleVariant, battleRng } from './battlefield.js';

// ადგილები: ready — უკვე მუშაობს (დანარჩენი „მალე“); decor — მხოლოდ ნახატი (წარწერისა და დაჭერის გარეშე)
export const READY = new Set(['castle', 'geography']);
export const NO_LABEL = new Set(['army']);              // მხოლოდ ნახატი წარწერის გარეშე, მაგრამ დასაჭერია
const DECOR = new Set(['wrecks', 'wall', 'army']);          // გალავანი — მხოლოდ ნახატი: წარწერის, მონიშვნისა და დაჭერის გარეშე (ავტორის თხოვნა)
const spots = obj => Object.entries(obj).map(([id, [x, y]]) => ({ id, x, y, ready: READY.has(id), decor: DECOR.has(id) }));

// მომრგვალებული გალავანი: გლუვი რკალი (კვადრატული ბეზიე) — მკვრივი წერტილები ხატვისთვის, კოშკებისა და ხეებისთვის
const arc = (p0, c, p2, n = 64) => Array.from({ length: n + 1 }, (_, i) => {
  const t = i / n, u = 1 - t;
  return [P(u * u * p0[0] + 2 * u * t * c[0] + t * t * p2[0]), P(u * u * p0[1] + 2 * u * t * c[1] + t * t * p2[1])];
});
const nearestOn = (pts, [x, y]) => pts.reduce((b, p) => Math.hypot(p[0] - x, p[1] - y) < Math.hypot(b[0] - x, b[1] - y) ? p : b);
const unitV = ([x, y]) => { const l = Math.hypot(x, y); return [x / l, y / l]; };

// გალავნის სიმაღლე და „ზემოთ“ მიმართულება: ტელეფონზე — პირდაპირ ზემოთ (ბრძოლის ველი ქვემოთაა, კედლის პირი მისკენ იყურება);
// კომპიუტერზე — ოდნავ მარჯვნივ დახრილი, რომ კედლის პირი მარცხნივ, ბრძოლის ველისკენ ჩანდეს
const WALL_H = 78;

const UPRIGHT = [0, -1];

// ტელეფონი — ავტორის ესკიზით (2026-11-03): ზემოთ, მთელ სიგანეზე — ციხესიმაგრე „პროფილი“ (გალავანი კოშკებით და კარიბჭით,
// შიგნით პატარა შენობები, შუაში მთავარი ციხე); მარჯვნივ — სწავლა (აკადემია), მარცხნივ — მაღაზია; მდინარე მარჯვნიდან ზღვაში ჩადის;
// მარცხნივ — ზღვა: კიდეზე გრძელი კუნძული (მეგობრების სამეფო), ქვემოთ ჩაძირული გემები; შემდეგ არმია, ირიბი გალავანი,
// მარჯვნივ ქვემოთ — ბრძოლის ველი. მთები — ზედა ზოლის უკან.
// გზები — ერთი და იგივე ორივე ვერსიაზე (ავტორის თხოვნა): სასახლე → კარიბჭე → მაღაზია / ენები → გეოგრაფია; არმია → გეოგრაფია;
// მაღაზია → არმია → გალავანი → ბრძოლის ველი
const ROADS = [['castle', 'gate'], ['gate', 'shop'], ['gate', 'academy'], ['academy', 'geography'], ['shop', 'army'], ['army', 'geography'], ['army', 'wall'], ['wall', 'battlefield']];
function phone() {
  const ext = { x: -700, y: -500, w: 2300, h: 2600 }, horizon = -330, right = ext.x + ext.w, bottom = ext.y + ext.h;
  const LAND_TOP = -60;
  const land = `M${ext.x},${LAND_TOP} L${right},${LAND_TOP} L${right},${bottom} L430,${bottom} C405,1560 380,1420 340,1250 C300,1080 252,900 236,830 ` +
    `C220,740 180,640 120,575 C70,520 20,480 -60,462 C-300,440 -500,450 ${ext.x},455 Z`;
  const wall = arc([372, 1415], [700, 1392], [1150, 1170]);
  const citadel = arc([-120, 150], [442, 330], [1004, 150]);
  const citadelPoly = 'M' + citadel.map(q => q.join(',')).join(' L') + ` L1004,${horizon} L-120,${horizon} Z`;
  return {
    focus: { x: -10, y: -6, w: 900, h: 1650 }, ext, horizon, land,
    spots: spots({
      // გეოგრაფია — ციხესიმაგრის ქვემოთ, მარცხნივ (ავტორის მითითება)
      castle: [442, 150], academy: [770, 450], geography: [610, 712], shop: [282, 676], army: [600, 1150], wall: nearestOn(wall, [640, 1350]),
      battlefield: [700, 1565], friends: [70, 1090], wrecks: [262, 1508]
    }),
    roads: ROADS,
    river: [[[1120, 790], [960, 800], [880, 812], [760, 826]], [[760, 826], [640, 840], [520, 808], [420, 800]], [[420, 798], [330, 812], [270, 818], [200, 822]]],
    wall, wallUp: UPRIGHT, wallDepth: unitV([.34, -1]),       // სავალი სიღრმეში ოდნავ დახრილი — კედელს სისქე ეტყობა (არა „ფურცელი“)
    // ქალაქ-ციხე უშუალოდ გალავნიდან ამოდის (გალავანი მის უკანაა) — ზედა ზოლის ქვეშ რომ არ დაიმალოს
    citadel, citadelPoly, citadelBox: { x0: -40, x1: 940, y0: 40, y1: 330 }, gateFlank: true, citadelGuards: true, citadelGateNear: [442, 999], citadelFront: true, citadelDepth: unitV([.34, -1]),
    castleArt: 'keep', keepScale: .6, labels: { castle: 'profile' }, labelAt: { castle: [0, 130], friends: [78, 196] },   // „პროფილი“ — კარიბჭის ქვემოთ
    battle: { cx: 760, cy: 1700, rx: 760, ry: 560 },
    battleArea: 'M' + wall.map(q => q.join(',')).join(' L') + ' L1600,1170 L1600,2200 L300,2200 L300,1415 Z',    // მთელი არე გალავნის ქვემოთ
    camp: { x: 380, y: 1035, w: 470, h: 205 },
    island: null, friendsArt: 'fleet', ship: null,     // მეგობრების სამეფო — ფლოტი, მარცხენა კიდიდან შემოდის (ავტორის ესკიზი)
    mountains: { from: ext.x - 100, base: -40, line: -20, bare: true }, landTop: LAND_TOP,     // bare — ფონის ქედის გარეშე (წვერებს შორის ცა / მთვარე ჩანს)
    fields: [[420, 470], [462, 498], [120, 380], [880, 600], [920, 630], [480, 930], [300, 980], [960, 980]],
    villages: [[560, 470], [150, 330], [620, 640], [420, 930], [720, 920], [1000, 560], [1000, 1000]]
  };
}

// კომპიუტერი (ავტორის თხოვნა): იგივე რუკა ჰორიზონტალურად — ტელეფონის რუკა 90°-ით მობრუნებული (საათის ისრით):
// ციხესიმაგრე „პროფილი“ — მარჯვნივ, ბრძოლის ველი — მარცხნივ ქვემოთ, ზღვა ფლოტით — ზემოთ. შენობები და წარწერები სწორად დგას
const Y0 = 1600;
const cw = ([x, y]) => [Y0 - y, x];
const cwPath = d => d.replace(/(-?[\d.]+),(-?[\d.]+)/g, (_, x, y) => cw([+x, +y]).join(','));
const cwRect = r => ({ x: Y0 - (r.y + r.h), y: r.x, w: r.h, h: r.w });
// ვერტიკალური კედელი 2.5D-ში ვიწრო ზოლად ჩანს (ავტორს არ მოეწონა) — ამიტომ კომპიუტერზე ორივე გალავანი ირიბი რკალია:
// მთავარი — ნაპირიდან ქვემოთ, ბრძოლის ველს (მარცხნივ ქვემოთ) შემოუვლის; ციხესიმაგრისა — მარჯვენა ზედა კუთხეს შემოუვლის
export const dirAt = (pts, q) => { const i = pts.indexOf(q), a = pts[Math.max(0, i - 3)], b = pts[Math.min(pts.length - 1, i + 3)]; return unitV([b[0] - a[0], b[1] - a[1]]); };
function desktop(T) {
  // მთავარი გალავანი: ირიბად — სანაპიროდან ქვემოთ, მარჯვნივ (როგორც ციხესიმაგრის გალავანი, რომელიც ავტორს მოეწონა):
  // ირიბ კედელს მთელი პირი და სიმაღლე უჩანს; ვერტიკალური / ნაპირის გასწვრივ ჰორიზონტალური ცუდად ჩანდა
  const wall = arc([60, 430], [220, 730], [390, 1060], 48).concat([[480, 1260], [560, 1500]]);      // დასაწყისი — ნაპირიდან შიგნით
  const citadel = arc([1150, -120], [1380, 330], [2000, 820]);
  const gate = nearestOn(citadel, [1386, 266]);
  const place = { castle: [1575, 150], wall: nearestOn(wall, [240, 640]), battlefield: [60, 690], academy: [1335, 535], geography: [1235, 800], wrecks: [-40, 120] };      // ენები ზემოთ, გეოგრაფია ქვემოთ — როგორც ტელეფონზე
  return {
    focus: cwRect(T.focus), ext: cwRect(T.ext), horizon: T.ext.x,
    land: cwPath(T.land.split(`,${T.landTop}`).join(`,${T.ext.y - 400}`)),     // ხმელეთი მარჯვენა კიდემდე — ზღვის ზოლი მარჯვნივ არ ჩანს
    spots: T.spots.map(q => { const [x, y] = place[q.id] || cw([q.x, q.y]); return { ...q, x, y }; }), roads: ROADS.map(r => r[0] === 'army' && r[1] === 'geography' ? [...r, 'elbow'] : r),      // არმია → გეოგრაფია — ავტორის ესკიზის ფორმით
    river: T.river.map(seg => seg.map(cw)), wall, wallUp: UPRIGHT, wallH: 116, wallThick: 64, wallDepth: unitV([1, -.32]),   // ირიბი კედელი: სიმაღლე და სავლის სიღრმე გვერდზე
    towerCount: 4, towerScale: .78, towerGap: 230, gateFlank: true,     // კოშკები ერთმანეთს არ ფარავს; კარიბჭის ორივე მხარეს — კოშკი (როგორც ტელეფონზე)
    citadelTowerPlan: [320], citadelGuards: true,     // ციხესიმაგრე: ავტორის ესკიზის კოშკები, თითო მცველი კოშკებს შორის
    citadel, citadelPoly: 'M' + citadel.map(q => q.join(',')).join(' L') + ' L2200,820 L2200,-900 L1150,-900 Z',
    citadelBox: { x0: 1150, x1: 1760, y0: -110, y1: 760 },
    citadelGateNear: gate, citadelGateDir: dirAt(citadel, gate), citadelFront: true, citadelDepth: unitV([.72, -.7]),
    battleArea: 'M' + wall.map(q => q.join(',')).join(' L') + ' L320,1400 L-600,1400 L-600,390 Z',      // ბრძოლის ველი — გალავნის გარეთ
    castleArt: 'keep', keepScale: .45, labels: T.labels, labelAt: { castle: [0, 42], friends: [0, 118], battlefield: [0, 112] },
    battle: { cx: 60, cy: 820, rx: 760, ry: 680 }, camp: cwRect(T.camp),      // ფარავს მთელ არეს — კიდეები არ ჩანს
    island: null, friendsArt: 'fleet', fleetTurn: true, ship: null, mountains: null,
    fields: T.fields.map(cw), villages: T.villages.map(cw)
  };
}

const TALL = phone();
export const LAYOUTS = { wide: desktop(TALL), tall: TALL };

const C = {
  sky: '#8fc6e8', sky2: '#dcedf2', sea: '#2b8fb0', sea2: '#1d6688', foam: '#e6f7ff', sand: '#e9d49a', grass: '#5cae4c', meadow: '#7cc663', dark: '#3f8f3e',
  river: '#3aa6c6', riverEdge: '#2a7f99', curb: '#8a8172', curbLight: '#a39a88', joint: '#6e665a', paving: '#c9bfac', paving2: '#bfb4a0',
  tree: ['#2a8a45', '#1d6e36'], oak: ['#4aa547', '#36863a'],
  wallTop: '#f4f3ef', wallFace: '#e6e4de', wallDark: '#a19d93', wallLine: '#d3d0c8'      // თეთრი ქვა (ავტორის რეფერენსი)
};
const FIELD_COLORS = ['#e2c55a', '#b9cf5e', '#d4a94c', '#c9d466'];

const sample = (segs, n) => segs.flatMap(s => Array.from({ length: n }, (_, i) => bez(s, i / n)));
const near = (pts, x, y, r) => pts.some(([px, py]) => (px - x) ** 2 + (py - y) ** 2 < r * r);
const inEllipse = (e, x, y, k = 1) => ((x - e.cx) / (e.rx * k)) ** 2 + ((y - e.cy) / (e.ry * k)) ** 2 < 1;
// ტეხილის წერტილები ყოველ step ერთეულზე (ხეების შესამოწმებლად)
const along = (pts, step) => pts.slice(1).flatMap(([x, y], i) => {
  const [px, py] = pts[i], n = Math.max(1, Math.round(Math.hypot(x - px, y - py) / step));
  return Array.from({ length: n }, (_, j) => [px + (x - px) * j / n, py + (y - py) * j / n]);
});
// წერტილები ტეხილზე ყოველ step ერთეულზე, მთლიანი სიგრძით (გალავნის კოშკები — თანაბრად, მკვრივ რკალზეც)
const spaced = (pts, step) => {
  const out = [pts[0]]; let left = step;
  for (let i = 1; i < pts.length; i++) {
    let [px, py] = pts[i - 1]; const [x, y] = pts[i]; let d = Math.hypot(x - px, y - py);
    while (d >= left) { const t = left / d; px += (x - px) * t; py += (y - py) * t; out.push([px, py]); d -= left; left = step; }
    left -= d;
  }
  return out;
};
const roadsOf = L => {
  const by = Object.fromEntries(L.spots.map(s => [s.id, [s.x, s.y + 4]]));
  if (L.citadel) by.gate = citadelGate(L);
  return L.roads.map(([a, b, shape]) => {
    const [px, py] = by[a], [qx, qy] = by[b];
    // 'elbow' — ჯერ ქვემოთ ეშვება, მერე რბილად უხვევს და სწორად მიდის (ავტორის ესკიზი: არმია → ენები)
    if (shape === 'elbow') return [[px, py], [px + (qx - px) * .08, qy], [px + (qx - px) * .35, qy], [qx, qy]];
    if (Math.abs(qx - px) > Math.abs(qy - py)) { const mx = (px + qx) / 2; return [[px, py], [mx, py], [mx, qy], [qx, qy]]; }
    const my = (py + qy) / 2; return [[px, py], [px, my], [qx, my], [qx, qy]];
  });
};
// ადგილი, სადაც ხეები არ დგას (შენობა + წარწერა): [მარცხნივ / მარჯვნივ, ზემოთ, ქვემოთ]; ბრძოლის ველსა და ბანაკს თავისი არე აქვს
const BOX = { castle: [205, 215, 120], academy: [110, 290, 84], geography: [110, 230, 84], shop: [110, 120, 84], battlefield: [0, 0, 0], army: [0, 0, 0] };
const boxOf = id => BOX[id] || [100, 130, 84];
const inMountains = (L, x, y) => !!L.mountains && y < L.mountains.line && x > L.mountains.from - 40;
// გალავნის კოშკები: თანაბრად, კარიბჭის და ნაპირის გარდა
// n კოშკი თანაბრად გალავნის ხილულ ნაწილზე (focus); პირველი — კიდეზე (ნაპირთან, რომ კედელი დამთავრებული ჩანდეს);
// კარიბჭე ერთ-ერთ ადგილს იკავებს: n + 1 თანაბარი ადგილიდან კარიბჭესთან უახლოესი გამოტოვებულია (კოშკები წყვილად არ დგას)
function towersAlong(L, pts, n, gate, minGap = L.towerGap || 0) {
  const F = L.focus, m = 40;
  const vis = pts.filter(([x, y]) => x > F.x - m && x < F.x + F.w + m && y > F.y - m && y < F.y + F.h + m);
  const src = vis.length > 1 ? vis : pts, cum = [0];
  for (let i = 1; i < src.length; i++) cum.push(cum[i - 1] + Math.hypot(src[i][0] - src[i - 1][0], src[i][1] - src[i - 1][1]));
  const total = cum.at(-1);
  const at = d => { d = Math.max(0, Math.min(total, d)); let i = 1; while (i < cum.length - 1 && cum[i] < d) i++; const t = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1);
    return [src[i - 1][0] + (src[i][0] - src[i - 1][0]) * t, src[i - 1][1] + (src[i][1] - src[i - 1][1]) * t]; };
  const end = total * .94;
  if (!gate) return Array.from({ length: n }, (_, k) => at(end * k / (n - 1)));
  // კარიბჭის ორივე მხარეს — თანაბრად, სიგრძის პროპორციულად; კარიბჭის გარშემო თავისუფალი ადგილი
  const dg = cum[src.reduce((b, q, i) => Math.hypot(q[0] - gate[0], q[1] - gate[1]) < Math.hypot(src[b][0] - gate[0], src[b][1] - gate[1]) ? i : b, 0)];
  const gap = Math.min(110, end / (n + 1) / 2), lenL = Math.max(0, dg - gap), lenR = Math.max(0, end - dg - gap);
  // კოშკებს შორის მინიმუმ minGap (კომპიუტერზე კედელი ეკრანზე თითქმის ვერტიკალურია — ახლოს მდგარი კოშკები ერთმანეთს ფარავს)
  const cap = len => minGap ? Math.floor(len / minGap) + 1 : n;
  const nl = Math.min(cap(lenL), Math.max(lenL > 60 ? 1 : 0, Math.min(n, Math.round(n * lenL / (lenL + lenR || 1))))), nr = Math.min(cap(lenR), n - nl);
  return [...Array.from({ length: nl }, (_, k) => at(lenL * k / nl)), ...Array.from({ length: nr }, (_, k) => at(dg + gap + lenR * (k + 1) / nr))];
}
// გარე გალავანი — მხოლოდ 4 კოშკი (ავტორის თხოვნა)
// კარიბჭის ორივე მხარეს — კოშკი, კედლის ხაზზე off ერთეულით დაშორებით (ტელეფონზე, ავტორის ესკიზი)
function gateFlank(pts, gate, off = 74) {
  const i = pts.reduce((b, q, k) => Math.hypot(q[0] - gate[0], q[1] - gate[1]) < Math.hypot(pts[b][0] - gate[0], pts[b][1] - gate[1]) ? k : b, 0);
  const walk = dir => { let d = 0, k = i; while (k + dir >= 0 && k + dir < pts.length) { const s = Math.hypot(pts[k + dir][0] - pts[k][0], pts[k + dir][1] - pts[k][1]);
    if (d + s >= off) { const t = (off - d) / s; return [pts[k][0] + (pts[k + dir][0] - pts[k][0]) * t, pts[k][1] + (pts[k + dir][1] - pts[k][1]) * t]; } d += s; k += dir; } return pts[k]; };
  return [walk(-1), walk(1)];
}
const towersOf = L => {
  const g = L.spots.find(s => s.id === 'wall'), gate = [g.x, g.y];
  let t = towersAlong(L, L.wall, L.towerCount || 4, gate);
  return L.gateFlank ? withFlank(t, L.wall, gate) : t;
};

// გეგმა თითო განლაგებაზე ერთხელ ითვლება: სად დგას ხე, სახლი, რაზმი, ხიდი, ტალღა (ხმელეთის შემოწმება — Path2D, ბრაუზერში)
const plans = new Map();
function planOf(L) {
  if (plans.has(L)) return plans.get(L);
  const land = new Path2D(L.land), ctx = document.createElement('canvas').getContext('2d');
  const isLand = (x, y) => ctx.isPointInPath(land, x, y);
  const citadelArea = L.citadelPoly && new Path2D(L.citadelPoly);
  const battleArea = L.battleArea && new Path2D(L.battleArea);
  const inBattle = (x, y, k) => inEllipse(L.battle, x, y, k) && (!battleArea || ctx.isPointInPath(battleArea, x, y));
  const inCitadel = (x, y) => !!citadelArea && ctx.isPointInPath(citadelArea, x, y);
  const onLand = (x, y, m = 0) => [[x, y], [x - m, y], [x + m, y], [x, y - m], [x, y + m]].every(([a, b]) => isLand(a, b));
  const roads = roadsOf(L), riverPts = sample(L.river, 40), roadPts = sample(roads, 50), wallPts = [...along(L.wall, 12), ...(L.citadel ? along(L.citadel, 12) : [])];
  const inBox = (x, y, pad = 0) => L.spots.some(s => { const [w, up, down] = boxOf(s.id); return x > s.x - w - pad && x < s.x + w + pad && y > s.y - up - pad && y < s.y + down + pad; });
  const inCamp = (x, y, pad = 0) => x > L.camp.x - pad && x < L.camp.x + L.camp.w + pad && y > L.camp.y - pad && y < L.camp.y + L.camp.h + pad;
  const free = (x, y, r) => onLand(x, y, r + 8) && !near(riverPts, x, y, r + 24) && !near(roadPts, x, y, r + 12) && !near(wallPts, x, y, r + 62) &&
    !inBox(x, y, r) && !inCamp(x, y, r + 6) && !inBattle(x, y, 1.12) && !inMountains(L, x, y) && !inCitadel(x, y) &&
    !L.fields.some(([fx, fy]) => x > fx - 10 - r && x < fx + 60 + r && y > fy - 16 - r && y < fy + 24 + r);
  // ხიდები: სადაც გზა მდინარეს კვეთს — გზის მიმართულებით
  const bridges = [];
  for (const road of roads) {
    let best = null;
    for (let i = 1; i < 60; i++) {
      const [x, y] = bez(road, i / 60);
      const d = Math.min(...riverPts.map(([px, py]) => Math.hypot(px - x, py - y)));
      if (!best || d < best.d) { const [x2, y2] = bez(road, (i + 1) / 60); best = { d, x, y, a: Math.atan2(y2 - y, x2 - x) * 180 / Math.PI }; }
    }
    if (best.d < 16) bridges.push(best);
  }
  const r = rng(11), houses = [];
  for (const [cx, cy] of L.villages) {
    for (let i = 0; i < 60 && houses.filter(h => Math.hypot(h[0] - cx, h[1] - cy) < 140).length < 5; i++) {
      const x = cx + (r() - .5) * 220, y = cy + (r() - .5) * 130;
      if (free(x, y, 14) && !houses.some(h => Math.hypot(h[0] - x, h[1] - y) < 40)) houses.push([x, y, r() < .5]);
    }
  }
  // ციხესიმაგრის („პროფილი“) შიგნით: პატარა სახლები და კოშკები, მთავარი ციხის გარშემო
  const inner = [];
  if (L.citadel) {
    const keep = L.spots.find(q => q.id === 'castle');
    const B = L.citadelBox, citPts = along(L.citadel, 12);
    for (let y = B.y0; y < B.y1; y += 36) for (let x = B.x0; x < B.x1; x += 46) {
      const tx = x + (r() - .5) * 18, ty = y + (r() - .5) * 12;
      if (!inCitadel(tx, ty) || near(citPts, tx, ty, 34) || (Math.abs(tx - keep.x) < 150 && Math.abs(ty - keep.y) < 170) || near(roadPts, tx, ty, 18)) continue;
      // (ავტორის თხოვნით შიგნით სახლები და კოშკები აღარ დგას — მხოლოდ სასახლე)
    }
  }
  // ბანაკი: ჯარისკაცების რაზმები მწყობრში, თითოს თავისი ბაირაღი (არმიის შუაგულის გარშემო)
  const units = [], army = L.spots.find(s => s.id === 'army');
  const unitPts = sample(roads, 80);
  for (let y = L.camp.y + 44; y < L.camp.y + L.camp.h; y += 70) for (let x = L.camp.x + 46; x < L.camp.x + L.camp.w - 20; x += 112) {
    if (Math.abs(x - army.x) < 80 && y > army.y - 90 && y < army.y + 40) continue;
    // რაზმი იკავებს x-37..x+60, y-36..y+12 — მის არეში გზა / გალავანი არ უნდა იყოს
    const hit = pts => pts.some(([px, py]) => px > x - 46 && px < x + 66 && py > y - 44 && py < y + 22);
    if (hit(unitPts) || hit(wallPts)) continue;
    units.push([x, y, UNIT_COLORS[Math.floor(r() * UNIT_COLORS.length)]]);
  }
  // ტყე: ბადე შემთხვევითი წანაცვლებით — სადაც თავისუფალია
  const trees = [], ext = L.ext;
  for (let y = L.horizon; y < ext.y + ext.h; y += 30) for (let x = ext.x; x < ext.x + ext.w; x += 34) {
    const tx = x + (r() - .5) * 24, ty = y + (r() - .5) * 18;
    if (!free(tx, ty, 6) || houses.some(h => Math.hypot(h[0] - tx, h[1] - ty) < 26)) continue;
    trees.push([tx, ty, .42 + r() * .14, r() < .35]);
  }
  // ტალღები ზღვაზე (კუნძულის გარეშე)
  const waves = [];
  for (let i = 0; i < 900 && waves.length < 140; i++) {
    const top = L.landTop ?? L.horizon, x = ext.x + r() * ext.w, y = top + 20 + r() * (ext.y + ext.h - top);
    if (!isLand(x, y) && !isLand(x + 60, y) && !isLand(x - 30, y) && !(L.island && inEllipse(L.island, x, y, 1.5))) waves.push([x, y]);
  }
  // ბალახის ლაქები — მხოლოდ ხმელეთზე
  const patches = [];
  for (let i = 0; i < 1200 && patches.length < 260; i++) {
    const x = ext.x + r() * ext.w, y = ext.y + r() * ext.h;
    if (onLand(x, y, 50) && !inMountains(L, x, y) && !inBattle(x, y, 1.2)) patches.push([x, y, 40 + r() * 70, 14 + r() * 22, r() < .5]);
  }
  const plan = { roads, bridges, houses, inner, units, trees, waves, patches, towers: towersOf(L) };
  plans.set(L, plan);
  return plan;
}

// ---------- მიწის ფენის ნაწილები ----------
const house = (x, y, blue) => `<g transform="translate(${P(x)},${P(y)})"><ellipse cx="0" cy="1" rx="17" ry="5" fill="#1d3a20" opacity=".25"/>` +
  `<rect x="-12" y="-14" width="24" height="14" fill="${STONE.wall}"/><rect x="3" y="-14" width="9" height="14" fill="${STONE.shade}"/>` +
  `<polygon points="-15,-14 0,-27 15,-14" fill="${blue ? STONE.slate : STONE.roof}"/><polygon points="0,-27 15,-14 0,-14" fill="${blue ? STONE.slateShade : STONE.roofShade}"/>` +
  `<rect x="-4" y="-8" width="5" height="8" fill="${STONE.dark}"/></g>`;

// ჯარისკაცი: შუბი, ჩაფხუტი, ფარი; რაზმი — 3 მწკრივი × 4, გვერდით ბაირაღი
const UNIT_COLORS = ['#c8392b', '#2f6fc0', '#c8392b', '#e0ad3e'];
const soldier = (x, y, col) => `<g transform="translate(${P(x)},${P(y)})"><ellipse cx="0" cy="1" rx="5" ry="1.8" fill="#1d3a20" opacity=".25"/>` +
  `<line x1="5" y1="-21" x2="5" y2="2" stroke="#6b5a40" stroke-width="1.6"/><polygon points="3.4,-21 5,-27 6.6,-21" fill="#cfd5dc"/>` +
  `<rect x="-4" y="-12" width="8" height="12" rx="2" fill="${col}"/><circle cx="0" cy="-15" r="3.6" fill="#d9a77c"/><path d="M-3.9,-16 a3.9,3.9 0 0 1 7.8,0 Z" fill="#9aa3ad"/>` +
  `<circle cx="-4.5" cy="-6" r="3.6" fill="${col === '#2f6fc0' ? '#c8392b' : '#2f6fc0'}" stroke="${STONE.gold}" stroke-width="1"/></g>`;
const unit = (x, y, col) => {
  let g = `<line x1="${P(x + 44)}" y1="${P(y + 4)}" x2="${P(x + 44)}" y2="${P(y - 38)}" stroke="${STONE.dark}" stroke-width="2"/><path d="M${P(x + 44)},${P(y - 38)} h16 l-4,5 l4,5 h-16 Z" fill="${col}"/>`;
  for (let row = 0; row < 3; row++) for (let c = 0; c < 4; c++) g += soldier(x - 33 + c * 20 + (row % 2) * 5, y - 16 + row * 11, col);
  return g;
};

const bridge = ({ x, y, a }) => `<g transform="translate(${P(x)},${P(y)}) rotate(${P(a)})">` +
  `<rect x="-30" y="-13" width="60" height="26" rx="3" fill="#8a6038"/>` +
  [-20, -10, 0, 10, 20].map(px => `<line x1="${px}" y1="-12" x2="${px}" y2="12" stroke="#6b4628" stroke-width="2"/>`).join('') +
  `<rect x="-32" y="-15" width="64" height="4" rx="2" fill="#5a3a20"/><rect x="-32" y="11" width="64" height="4" rx="2" fill="#5a3a20"/></g>`;

// ---------- გალავანი სიმაღლით (2.5D) ----------
// pts — კედლის ძირი (მკვრივი ტეხილი), up — „ზემოთ“ მიმართულება ეკრანზე, h — სიმაღლე. ჩანს: ჩრდილი, ქვის პირი რიგებით,
// ზემოთ — სავალი და კბილანები
const shift = (pts, [ux, uy], d) => pts.map(([x, y]) => [P(x + ux * d), P(y + uy * d)]);
const line = pts => 'M' + pts.map(p => p.join(',')).join(' L');
// სქელი გალავანი (ავტორის რეფერენსით): ქვის პირი რიგებით, ზემოთ განიერი სავალი, კბილანები ორივე კიდეზე (წინაც და უკანაც).
// guards — სავალზე მდგარი ჯარისკაცები (მხოლოდ გარე გალავანზე); skip — წერტილები (კოშკები, კარიბჭე), სადაც მცველი არ დგას
// o.depth — სავლის სიღრმის მიმართულება (ირიბ კედელზე — გვერდზე, სამეფოს შიგნით; ნაგულისხმევად — ზემოთ)
function wallBand(pts, up, h, thick = 40, o = {}) {
  const dv = o.depth || up, top = shift(pts, up, h), back = shift(top, dv, thick), poly = (a, b) => `${line(a)} L${[...b].reverse().map(p => p.join(',')).join(' L')} Z`;
  const [ux, uy] = up, mh = 12, mw = 10;
  // კბილანები — პატარა ქვის ბლოკები, კედლის გასწვრივ შემობრუნებული (როგორც კოშკები — ავტორის თხოვნა):
  // წინა პირი კედლის მიმართულებით, სიმაღლე up-ით, სიღრმე dv-ით; ჩანს წინა, ზედა და გვერდითი პირი
  const md = 7, ph = 6;
  // dd — პარაპეტის სიღრმის მიმართულება (ნაგულისხმევად dv; კოშკის გვერდით კიდეზე — კედლის გასწვრივ, შიგნით)
  const merlons = (edge, col, dark, dd = dv) => {
    const [vx, vy] = dd, rise = d => shift(edge, up, d), lift = (a, d) => a.map(([x, y]) => [P(x + vx * d), P(y + vy * d)]);
    // პარაპეტი: წინა პირი (კედლის ფერი, ნაკერის გარეშე) და ზედა ზოლი
    const pr = `<path d="${poly(edge, rise(ph))}" fill="${col}"/>` + `<path d="${poly(rise(ph), lift(rise(ph), md))}" fill="${C.wallTop}" stroke="${dark}" stroke-width=".7"/>` +
      `<path d="${line(rise(ph))}" fill="none" stroke="${dark}" stroke-width=".8"/>`;
    const len = edge.slice(1).reduce((t, p, i) => t + Math.hypot(p[0] - edge[i][0], p[1] - edge[i][1]), 0), gap = mw * .6;
    const raw = spaced(edge, 19), cum = raw.map((p, i) => i ? Math.hypot(p[0] - raw[0][0], p[1] - raw[0][1]) : 0);
    let keep = raw.filter((_, i) => cum[i] >= gap && cum[i] <= len - gap);
    if (!keep.length && len > mw) keep = [raw[Math.floor(raw.length / 2)]];
    const q = keep.map(([x, y]) => [x + ux * ph, y + uy * ph]);
    return pr + q.map(([x, y], i) => {
      const a = q[Math.max(0, i - 1)], b = q[Math.min(q.length - 1, i + 1)];
      let [tx, ty] = q.length > 1 ? unitV([b[0] - a[0], b[1] - a[1]]) : unitV([edge.at(-1)[0] - edge[0][0], edge.at(-1)[1] - edge[0][1]]); if (!isFinite(tx)) [tx, ty] = [1, 0];
      const pt = (s, u, d) => `${P(x + tx * s + ux * u + vx * d)},${P(y + ty * s + uy * u + vy * d)}`, w = mw / 2;
      const sideS = (tx * vy - ty * vx) > 0 ? -w : w;             // გვერდი, რომელიც მაყურებლისკენ ჩანს
      return `<polygon points="${pt(sideS, 0, 0)} ${pt(sideS, mh, 0)} ${pt(sideS, mh, md)} ${pt(sideS, 0, md)}" fill="${dark}" opacity=".55"/>` +
        `<polygon points="${pt(-w, mh, 0)} ${pt(w, mh, 0)} ${pt(w, mh, md)} ${pt(-w, mh, md)}" fill="${C.wallTop}" stroke="${dark}" stroke-width=".7"/>` +
        `<polygon points="${pt(-w, -1, 0)} ${pt(w, -1, 0)} ${pt(w, mh, 0)} ${pt(-w, mh, 0)}" fill="${col}" stroke="${dark}" stroke-width=".8"/>`;
    }).join('');
  };
  let g = o.noShadow ? '' : `<path d="${line(pts)}" fill="none" stroke="#1d3a20" stroke-opacity=".25" stroke-width="44" stroke-linejoin="round" stroke-linecap="round" transform="translate(9,11)"/>`;
  // სავალი (ქვაფენილი), უკანა პარაპეტი კბილანებით, მცველები
  g += `<path d="${poly(top, back)}" fill="${C.wallTop}" stroke="${C.wallDark}" stroke-width="1.4" stroke-linejoin="round"/>` +
    `<path d="${line(shift(top, dv, thick * .35))}" fill="none" stroke="#c8bb9f" stroke-width="2" stroke-dasharray="18 5"/>` +
    `<path d="${line(shift(top, dv, thick * .7))}" fill="none" stroke="#c8bb9f" stroke-width="2" stroke-dasharray="12 7"/>`;
  g += merlons(shift(back, dv, -md), C.wallFace, C.wallDark);     // უკანა პარაპეტი — კედლის კონტურის შიგნით (კიდეს არ ცდება)
  if (o.sides) {                         // კოშკი: გვერდით კიდეებზეც — წინიდან უკანამდე, სიღრმე კედლის გასწვრივ შიგნით
    const t0 = unitV([top[1][0] - top[0][0], top[1][1] - top[0][1]]), t1 = unitV([top.at(-2)[0] - top.at(-1)[0], top.at(-2)[1] - top.at(-1)[1]]);
    g += merlons([top[0], back[0]], C.wallFace, C.wallDark, t0) + merlons([top.at(-1), back.at(-1)], C.wallFace, C.wallDark, t1);
  }
  if (o.guards) {
    const mid = shift(top, dv, thick * .55);
    g += spaced(mid, 30).filter(([x, y]) => !(o.skip || []).some(([sx, sy]) => Math.hypot(sx - x, sy - y) < 44))
      .map(([x, y], i) => soldier(x, y, i % 3 === 2 ? '#2f6fc0' : '#c8392b')).join('');
  }
  if (o.guardsAt) g += o.guardsAt.map(([x, y], i) => soldier(x + up[0] * h + dv[0] * thick * .55, y + up[1] * h + dv[1] * thick * .55, i % 2 ? '#2f6fc0' : '#c8392b')).join('');
  // ქვის პირი რიგებით
  g += `<path d="${poly(pts, top)}" fill="${C.wallFace}" stroke="${C.wallDark}" stroke-width="1.6" stroke-linejoin="round"/>`;
  for (const f of [.2, .4, .6, .8]) g += `<path d="${line(shift(pts, up, h * f))}" fill="none" stroke="${C.wallLine}" stroke-width="1.3" stroke-dasharray="${f === .4 || f === .8 ? '16 3' : '10 3'}"/>`;
  g += `<path d="${line(shift(pts, up, 6))}" fill="none" stroke="${C.wallDark}" stroke-width="6" stroke-opacity=".35"/>`;            // ძირის ჩრდილი
  // წინა პარაპეტი კბილანებით (კედლის პირის გაგრძელება)
  return g + merlons(top, C.wallFace, C.wallDark);
}
// მრგვალი კოშკი ღერძით up-ის მიმართულებით, კონუსური სახურავით; ძირში ფართო ქვის საძირკველი და მკვრივი ჩრდილი (მიწაზე დგას)
function towerAt([x, y], up, h, r = 22) {
  const [ux, uy] = up, tx = x + ux * h, ty = y + uy * h, ax = tx + ux * 44, ay = ty + uy * 44;
  const R = r + 5, bh = Math.min(14, h * .12), half = (cx, cy, w, k = .38) => `M${P(cx - w)},${P(cy)} A${P(w)},${P(w * k)} 0 0 0 ${P(cx + w)},${P(cy)} Z`;
  const shade = (cx, cy, w, k = .38) => `M${P(cx + w * .25)},${P(cy)} L${P(cx + w)},${P(cy)} A${P(w)},${P(w * k)} 0 0 1 ${P(cx + w * .25)},${P(cy + w * k * .97)} Z`;
  return `<g><ellipse cx="${P(x + 4)}" cy="${P(y + 4)}" rx="${R + 9}" ry="${P((R + 9) * .42)}" fill="#1d1410" opacity=".3"/>` +
    // საძირკველი (ოდნავ ფართო, მუქი ქვა)
    `<rect x="${P(x - R)}" y="${P(y - bh)}" width="${2 * R}" height="${P(bh)}" fill="#a99c82"/><path d="${half(x, y, R)}" fill="#a99c82"/><path d="${shade(x, y, R)}" fill="#8c8068"/>` +
    `<rect x="${P(x + R * .25)}" y="${P(y - bh)}" width="${P(R * .75)}" height="${P(bh)}" fill="#8c8068"/><ellipse cx="${P(x)}" cy="${P(y - bh)}" rx="${R}" ry="${P(R * .38)}" fill="#b9ad93"/>` +
    `<polygon points="${P(x - r)},${P(y - bh)} ${P(x + r)},${P(y - bh)} ${P(tx + r)},${P(ty)} ${P(tx - r)},${P(ty)}" fill="${C.wallFace}"/>` +
    `<polygon points="${P(x + r * .25)},${P(y - bh)} ${P(x + r)},${P(y - bh)} ${P(tx + r)},${P(ty)} ${P(tx + r * .25)},${P(ty)}" fill="${C.wallLine}" opacity=".7"/>` +
    `<path d="${half(x, y - bh, r)}" fill="${C.wallFace}"/><path d="${shade(x, y - bh, r)}" fill="${C.wallLine}" opacity=".7"/>` +
    `<rect x="${P(tx + ux * -22 - 2.5)}" y="${P(ty - uy * -22 - 7)}" width="5" height="12" rx="2" fill="${STONE.dark}" opacity=".8"/>` +
    `<ellipse cx="${P(tx)}" cy="${P(ty)}" rx="${r + 3}" ry="${P(r * .42)}" fill="${C.wallTop}" stroke="${C.wallDark}" stroke-width="1.2"/>` +
    `<polygon points="${P(tx - r - 5)},${P(ty)} ${P(ax)},${P(ay)} ${P(tx + r + 5)},${P(ty)}" fill="${STONE.roof}"/>` +
    `<polygon points="${P(ax)},${P(ay)} ${P(tx + r + 5)},${P(ty)} ${P(tx + ux * 2)},${P(ty)}" fill="${STONE.roofShade}"/></g>`;
}
// კვადრატული კოშკი, ჩაშენებული გალავანში (ავტორის თხოვნა — გალავნის ნაწილი, არა ცალკე ობიექტი):
// წინა პირი კედლის პირის ხაზზე ოდნავ წინ გამოდის, სიღრმე = გალავნის სისქე (depth — იგივე მიმართულებით, რაც სავალი),
// ზედა მოედანი სავალზე მაღლაა, კბილანებით ოთხივე კიდეზე; ცალკე ჩრდილი მიწაზე არ აქვს (გალავნის ჩრდილი საკმარისია)
function squareTower([x, y], h, r = 30, depth = [r * .55, -r * .38]) {
  const w = r * 1.05, [ddx, ddy] = depth, fy = y + 5, t = fy - h, mw = 8, mh = 9;
  const L = C.wallTop, F = C.wallFace, S = C.wallLine, D = C.wallDark;
  const pt = (px, py) => `${P(px)},${P(py)}`;
  let g = '<g>';
  // გვერდითი პირი (თუ სიღრმე მარჯვნივ მიდის)
  if (ddx > 1) g += `<polygon points="${pt(x + w, fy)} ${pt(x + w + ddx, fy + ddy)} ${pt(x + w + ddx, t + ddy)} ${pt(x + w, t)}" fill="${S}" stroke="${D}" stroke-width="1"/>`;
  // წინა პირი: ქვის რიგები, ვიწრო სარკმლები, ძირის ზოლი
  g += `<rect x="${P(x - w)}" y="${P(t)}" width="${P(2 * w)}" height="${P(h)}" fill="${F}" stroke="${D}" stroke-width="1.2"/>`;
  g += `<rect x="${P(x + w * .45)}" y="${P(t)}" width="${P(w * .55)}" height="${P(h)}" fill="${S}" opacity=".55"/>`;
  for (let yy = t + 16; yy < fy - 4; yy += 16) g += `<line x1="${P(x - w)}" y1="${P(yy)}" x2="${P(x + w)}" y2="${P(yy)}" stroke="${S}" stroke-width="1"/>`;
  g += `<rect x="${P(x - w)}" y="${P(fy - 9)}" width="${P(2 * w)}" height="9" fill="${D}" opacity=".25"/>`;
  for (let yy = t + 22; yy < fy - 26; yy += 36) g += `<rect x="${P(x - 2.5)}" y="${P(yy)}" width="5" height="13" rx="1.5" fill="${D}" opacity=".9"/>`;
  // ზედა მოედანი — გალავნის სისქის სიღრმით
  g += `<polygon points="${pt(x - w, t)} ${pt(x + w, t)} ${pt(x + w + ddx, t + ddy)} ${pt(x - w + ddx, t + ddy)}" fill="${L}" stroke="${D}" stroke-width="1"/>`;
  // კბილანები: უკანა კიდე, გვერდები, წინა კიდე (ბოლოს)
  const row = (x0, y0, x1, y1, n, col) => { let o = ''; for (let k = 0; k <= n; k++) { const px = x0 + (x1 - x0) * k / n, py = y0 + (y1 - y0) * k / n; o += `<rect x="${P(px - mw / 2)}" y="${P(py - mh)}" width="${mw}" height="${mh}" fill="${col}" stroke="${D}" stroke-width=".8"/>`; } return o; };
  g += row(x - w + ddx + mw / 2, t + ddy, x + w + ddx - mw / 2, t + ddy, 3, F);
  g += row(x - w + mw / 2, t, x - w + ddx + mw / 2, t + ddy, 2, F) + row(x + w - mw / 2, t, x + w + ddx - mw / 2, t + ddy, 2, S);
  g += row(x - w + mw / 2, t, x + w - mw / 2, t, 3, F);
  return g + '</g>';
}
// გალავნის კოშკი — გალავნის ამაღლებული მონაკვეთი (ავტორის რეფერენსით): იგივე ქვა, იგივე მიმართულება და სისქე,
// კბილანები გრძელდება, ნაკერი არ არის. pts — გალავნის ხაზი, q — კოშკის ადგილი, half — ნახევარსიგანე კედლის გასწვრივ
function subLine(pts, q, half, n = 8) {
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const qi = pts.reduce((b, p, k) => Math.hypot(p[0] - q[0], p[1] - q[1]) < Math.hypot(pts[b][0] - q[0], pts[b][1] - q[1]) ? k : b, 0);
  const at = d => { d = Math.max(0, Math.min(cum.at(-1), d)); let i = 1; while (i < cum.length - 1 && cum[i] < d) i++; const t = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1);
    return [P(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t), P(pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t)]; };
  const c = Math.max(half, Math.min(cum.at(-1) - half, cum[qi]));          // კიდესთან — შიგნით გადმოწეული, რომ არ მოიჭრას
  return Array.from({ length: n + 1 }, (_, k) => at(c - half + 2 * half * k / n));
}
function wallTower(pts, q, up, h, H, thick, dv = up, half = 34) {
  const seg = subLine(pts, q, half), [ux, uy] = up, [vx, vy] = dv;
  // ბოლოები (მონაკვეთის გვერდები სავლის ზემოთ) — ჯერ, მერე მთელი მონაკვეთი, როგორც გალავანი, მაღალი
  const door = ([x, y]) => {          // თაღოვანი კარი სავლის დონეზე, გვერდის შუაში
    const bx = x + ux * h + vx * thick * .5, by = y + uy * h + vy * thick * .5, w = Math.min(8, thick * .2), dh = Math.min(26, (H - h) * .7);
    const pt = (a, b) => `${P(bx + vx * a + ux * b)},${P(by + vy * a + uy * b)}`;
    return `<polygon points="${pt(-w, 0)} ${pt(-w, dh * .7)} ${pt(-w * .6, dh * .92)} ${pt(0, dh)} ${pt(w * .6, dh * .92)} ${pt(w, dh * .7)} ${pt(w, 0)}" fill="#1a1410" stroke="${C.wallDark}" stroke-width=".8"/>`;
  };
  const cap = ([x, y]) => `<polygon points="${P(x + ux * h)},${P(y + uy * h)} ${P(x + ux * H)},${P(y + uy * H)} ${P(x + ux * H + vx * thick)},${P(y + uy * H + vy * thick)} ${P(x + ux * h + vx * thick)},${P(y + uy * h + vy * thick)}" fill="${C.wallLine}" stroke="${C.wallDark}" stroke-width=".8"/>` + door([x, y]);
  let g = cap(seg[0]) + cap(seg.at(-1)) + wallBand(seg, up, H, thick, { depth: dv, noShadow: true, sides: true });
  // ვიწრო სარკმლები შუაში
  const [cx, cy] = seg[Math.floor(seg.length / 2)];
  for (const f of [.45, .72]) g += `<rect x="${P(cx + ux * H * f - 2.5)}" y="${P(cy + uy * H * f - 6)}" width="5" height="12" rx="1.5" fill="${C.wallDark}" opacity=".85"/>`;
  return g;
}
function rampart(L, towers) {
  const h = L.wallH || WALL_H, thick = L.wallThick || 44, gate = L.spots.find(q => q.id === 'wall');
  return wallBand(L.wall, L.wallUp, h, thick, { guards: true, depth: L.wallDepth, skip: [...towers, [gate.x, gate.y]] }) +
    towers.map(p => wallTower(L.wall, p, L.wallUp, h, h + 40, thick, L.wallDepth || L.wallUp)).join('');
}

const peak = ([x, w, h, base], rock, shade, snow) =>
  `<polygon points="${P(x - w / 2)},${P(base)} ${P(x)},${P(base - h)} ${P(x + w / 2)},${P(base)}" fill="${rock}"/><polygon points="${P(x)},${P(base - h)} ${P(x + w / 2)},${P(base)} ${P(x + 8)},${P(base)}" fill="${shade}"/>` +
  `<polygon points="${P(x - w * .13)},${P(base - h * .7)} ${P(x)},${P(base - h)} ${P(x + w * .13)},${P(base - h * .7)} ${P(x + w * .04)},${P(base - h * .64)} ${P(x - w * .05)},${P(base - h * .73)}" fill="${snow}"/>`;

// შორეული, ბურუსიანი ნაპირი ჰორიზონტზე
function farShore(L) {
  const r = rng(3); let d = `M${L.ext.x},${L.horizon + 30}`;
  for (let x = L.ext.x; x <= L.ext.x + L.ext.w; x += 60) d += ` L${x},${P(L.horizon - 10 - r() * 60)}`;
  return `<path d="${d} L${L.ext.x + L.ext.w},${L.horizon + 40} L${L.ext.x},${L.horizon + 40} Z" fill="#7d8fb8" opacity=".5"/>`;
}

// მთები ზემოთ: შორეული ქედი ცაზე, ახლო ქედი თოვლიანი წვერებით, მთისწინეთი (ტელეფონზე — ზედა ზოლის უკან)
function mountains(L) {
  const M = L.mountains; if (!M) return '';
  const r = rng(8), end = L.ext.x + L.ext.w;
  let g = '';
  if (!M.bare) {
    for (let x = M.from; x < end; x += 150) g += peak([x, 260, 150 + r() * 70, L.horizon + 30], '#a39cbf', '#8f88ae', '#eeeaf4');
    g += `<rect x="${M.from - 60}" y="${L.horizon + 20}" width="${end - M.from + 60}" height="${M.base - L.horizon}" fill="${C.dark}"/>`;
  }
  for (let x = M.from + 40; x < end; x += 130) g += peak([x, 230 + r() * 40, 100 + r() * 70, M.base + r() * 12], '#8b8274', '#6c6458', '#f4f1ea');
  return g + `<path d="M${M.from - 40},${M.base + 12} Q${M.from + 200},${M.base - 14} ${M.from + 420},${M.base + 8} T${M.from + 900},${M.base + 4} T${end},${M.base + 6} L${end},${M.line + 10} L${M.from - 40},${M.line + 10} Z" fill="${C.dark}"/>`;
}

// მიწის ფენა — მხოლოდ ხილული ნაწილი (view: {x, y, w, h} რუკის ერთეულებში); ტყე და სახლები ხილვის გარეთ არ იხატება
export function drawGround(id, view, L) {
  const { roads, bridges, houses, inner, units, trees, waves, patches, towers } = planOf(L), m = 80, ext = L.ext;
  const seen = (x, y) => x > view.x - m && x < view.x + view.w + m && y > view.y - m && y < view.y + view.h + m;
  let s = `<defs><linearGradient id="${id}-sea" gradientUnits="userSpaceOnUse" x1="0" y1="${L.horizon}" x2="0" y2="${ext.y + ext.h}"><stop offset="0" stop-color="${C.sea}"/><stop offset="1" stop-color="${C.sea2}"/></linearGradient>` +
    `<linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sky}"/><stop offset="1" stop-color="${C.sky2}"/></linearGradient>` +
    `<clipPath id="${id}-land"><path d="${L.land}"/></clipPath></defs>`;
  // მთებიან რუკაზე ცა გამჭვირვალეა — უკან ჩანს ცის ფენა მთვარით (.game__skyback), რომ მთვარე მთების უკან იყოს
  if (!L.mountains) s += `<rect x="${ext.x}" y="${ext.y}" width="${ext.w}" height="${L.horizon - ext.y + 10}" fill="url(#${id}-sky)"/>`;
  const seaTop = L.landTop ?? L.horizon;
  s += `<rect x="${ext.x}" y="${seaTop}" width="${ext.w}" height="${ext.y + ext.h - seaTop}" fill="url(#${id}-sea)"/>`;
  s += farShore(L);
  s += waves.filter(([x, y]) => seen(x, y)).map(([x, y]) => `<path d="M${P(x)},${P(y)} q9,-5 18,0 q9,5 18,0" fill="none" stroke="${C.foam}" stroke-opacity=".35" stroke-width="2.4" stroke-linecap="round"/>`).join('');
  // მეგობრების კუნძული
  const I = L.island;
  if (I) s += `<ellipse cx="${I.cx}" cy="${I.cy + 4}" rx="${I.rx + 16}" ry="${I.ry + 10}" fill="${C.foam}" opacity=".3"/><ellipse cx="${I.cx}" cy="${I.cy}" rx="${I.rx + 8}" ry="${I.ry + 6}" fill="${C.sand}"/>` +
    `<ellipse cx="${I.cx}" cy="${I.cy - 2}" rx="${I.rx}" ry="${I.ry}" fill="${C.grass}"/><ellipse cx="${I.cx}" cy="${I.cy - 4}" rx="${I.rx * .7}" ry="${I.ry * .6}" fill="${C.meadow}" opacity=".7"/>`;
  // ნაპირი: ქაფი, ქვიშა, ბალახი
  s += `<path d="${L.land}" fill="none" stroke="${C.foam}" stroke-opacity=".35" stroke-width="44" stroke-linejoin="round"/><path d="${L.land}" fill="${C.sand}" stroke="${C.sand}" stroke-width="26" stroke-linejoin="round"/>`;
  s += `<path d="${L.land}" fill="${C.grass}" transform="translate(0,4)"/><path d="${L.land}" fill="${C.grass}"/>`;
  s += mountains(L);
  s += patches.filter(([x, y]) => seen(x, y)).map(([x, y, rx, ry, light]) => `<ellipse cx="${P(x)}" cy="${P(y)}" rx="${P(rx)}" ry="${P(ry)}" fill="${light ? C.meadow : C.dark}" opacity=".3"/>`).join('');
  L.fields.forEach(([fx, fy], i) => { s += `<polygon points="${fx},${fy} ${fx + 44},${fy - 12} ${fx + 62},${fy + 6} ${fx + 18},${fy + 18}" fill="${FIELD_COLORS[i % 4]}" stroke="#a48a46" stroke-width="1.2"/>`; });
  // ციხესიმაგრის ეზო: ქვაფენილი სასახლის გარშემო, ბაღი და ბილიკი კარიბჭემდე
  if (L.citadel) {
    const k = L.spots.find(q => q.id === 'castle'), sc = (L.keepScale || .5) / .5;
    s += `<defs><clipPath id="${id}-cit"><path d="${L.citadelPoly}"/></clipPath></defs><g clip-path="url(#${id}-cit)"><g transform="rotate(${keepAngle(L)} ${k.x} ${k.y + 14})">` + `<ellipse cx="${k.x}" cy="${k.y + 14}" rx="${P(250 * sc)}" ry="${P(70 * sc)}" fill="#cdbf9f"/>` +
      `<ellipse cx="${k.x}" cy="${k.y + 14}" rx="${P(250 * sc)}" ry="${P(70 * sc)}" fill="none" stroke="#b3a585" stroke-width="2" stroke-dasharray="14 6"/>` +
      `<ellipse cx="${k.x}" cy="${k.y + 14}" rx="${P(300 * sc)}" ry="${P(96 * sc)}" fill="none" stroke="${C.meadow}" stroke-width="16" opacity=".8"/></g></g>`;
  }
  // ბრძოლის ველი — არჩეული ვარიანტი (battlefield.js), მხოლოდ ხმელეთზე
  const bf = battleVariant().ground(L.battle, `${id}-bf`, battleRng());
  s += L.battleArea ? `<defs><clipPath id="${id}-bfa"><path d="${L.battleArea}"/></clipPath></defs><g clip-path="url(#${id}-land)"><g clip-path="url(#${id}-bfa)">${bf}</g></g>`
    : `<g clip-path="url(#${id}-land)">${bf}</g>`;
  // გზები, მდინარე, ხიდები
  const curve = seg => `M${seg[0]} C${seg[1]} ${seg[2]} ${seg[3]}`;
  // რომაული გზა: ჩრდილი, ქვის ბორდიური, ფილების საფუძველი (ნაკერები), ფილები ორ წანაცვლებულ მწკრივად
  const layer = (stroke, w, extra = '') => roads.map(d => `<path d="${curve(d)}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round"${extra}/>`).join('');
  s += layer('#1d3a20', 24, ' opacity=".18" transform="translate(2,3)"') + layer(C.curb, 21) + layer(C.curbLight, 21, ' stroke-dasharray="9 3"') +
    layer(C.joint, 15) + layer(C.paving, 6.4, ' stroke-dasharray="10 2.2" transform="translate(0,-3.6)"') + layer(C.paving2, 6.4, ' stroke-dasharray="10 2.2" stroke-dashoffset="5" transform="translate(0,3.2)"');
  const riverD = `M${L.river[0][0]} ` + L.river.map(seg => `C${seg[1]} ${seg[2]} ${seg[3]}`).join(' ');
  const [mx0, my0] = L.river.at(-1)[2], [mx1, my1] = L.river.at(-1)[3], [ex, ey] = unitV([mx1 - mx0, my1 - my0]);
  const mouthD = `${riverD} L${P(mx1 + ex * 120)},${P(my1 + ey * 120)}`;          // შესართავი — ზღვაში გაგრძელებული
  s += `<g clip-path="url(#${id}-land)"><path d="${riverD}" fill="none" stroke="${C.sand}" stroke-width="44" stroke-linecap="round" opacity=".7"/>` +
    `<path d="${mouthD}" fill="none" stroke="${C.riverEdge}" stroke-width="34"/></g>` +
    `<path d="${mouthD}" fill="none" stroke="url(#${id}-sea)" stroke-width="26"/>` +
    `<g clip-path="url(#${id}-land)"><path d="${riverD}" fill="none" stroke="#9fe0f0" stroke-width="3" stroke-dasharray="14 26" stroke-linecap="round" opacity=".5"/></g>`;
  s += bridges.map(bridge).join('');
  // სახლები, რაზმები, ხეები — სიღრმის მიხედვით (ზემოთ მდგარი — უკან); გალავანი — ხმელეთზე, ხეების წინ / უკან
  const items = [
    ...houses.filter(([x, y]) => seen(x, y)).map(([x, y, b]) => [x, y, house(x, y, b)]),
    ...inner.map(([x, y, kind]) => [x, y, kind === 'tower' ? towerAt([x, y], UPRIGHT, 46, 11) : house(x, y, kind)]),
    ...units.map(([x, y, col]) => [x, y, unit(x, y, col)]),
    ...trees.filter(([x, y]) => seen(x, y)).map(([x, y, sc, isOak]) => [x, y, isOak ? oak(x, y, sc, ...C.oak) : tree(x, y, sc, ...C.tree)])
  ].sort((a, b) => a[1] - b[1]);
  const wallYAt = x => L.wall.reduce((b, q) => Math.abs(q[0] - x) < Math.abs(b[0] - x) ? q : b)[1];
  const behind = i => i[1] < wallYAt(i[0]);
  s += items.filter(behind).map(i => i[2]).join('');
  s += rampart(L, towers);
  s += items.filter(i => !behind(i)).map(i => i[2]).join('');
  return s;
}

// ---------- შენობები (ზედა ფენა) ----------
const shadow = rx => `<ellipse cx="0" cy="2" rx="${rx}" ry="${P(rx * .3)}" fill="#1d3a20" opacity=".25"/>`;
const gable = (x1, x2, top, h, c1, c2) => { const m = (x1 + x2) / 2; return `<polygon points="${x1 - 6},${top} ${m},${top - h} ${x2 + 6},${top}" fill="${c1}"/><polygon points="${m},${top - h} ${x2 + 6},${top} ${m},${top}" fill="${c2}"/>`; };
const wall = (x, y, w, h, c = STONE.wall, s = STONE.shade) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/><rect x="${P(x + w * .62)}" y="${y}" width="${P(w * .38)}" height="${h}" fill="${s}"/>`;
const door = (x, y, w) => `<path d="M${x - w},${y} V${y - w * 1.6} A${w},${w} 0 0 1 ${x + w},${y - w * 1.6} V${y} Z" fill="${STONE.dark}"/>`;
const pennant = (x, y, col) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - 22}" stroke="${STONE.dark}" stroke-width="2"/><path d="M${x},${y - 22} h16 l-4,5 l4,5 h-16 Z" fill="${col}"/>`;

// სასახლე: დიდი ციხე-სასახლე საკუთარი მრგვალი გალავნით — ოთხი კოშკი, წინ კარიბჭე, შიგნით ეზო
function palace(id) {
  const RX = 190, RY = 66, H = 36, oy = -6;
  const ring = (a0, a1, n = 30) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [P(RX * Math.cos(a)), P(RY * Math.sin(a) + oy)]; });
  const at = a => [RX * Math.cos(a), RY * Math.sin(a) + oy];
  let g = `<ellipse cx="6" cy="${oy + 10}" rx="${RX + 22}" ry="${RY + 16}" fill="#1d3a20" opacity=".22"/><ellipse cx="0" cy="${oy}" rx="${RX}" ry="${RY}" fill="#8fcb6c"/>` +
    `<ellipse cx="0" cy="${oy + 4}" rx="${RX * .7}" ry="${RY * .55}" fill="#d9c79c" opacity=".55"/>`;
  g += wallBand(ring(Math.PI, 2 * Math.PI), [0, -1], H) + [5, 7].map(k => towerAt(at(k * Math.PI / 4), [0, -1], H * 1.7, 18)).join('');
  g += fortress(0, oy - 4, .48, { ...STONE, ground: '#8fcb6c', type: 'georgian', id });
  g += towerAt(at(Math.PI), [0, -1], H * 1.8, 20) + towerAt(at(0), [0, -1], H * 1.8, 20);
  g += wallBand(ring(0, Math.PI / 2 - .2, 14), [0, -1], H) + wallBand(ring(Math.PI / 2 + .2, Math.PI, 14), [0, -1], H);
  g += [1, 3].map(k => towerAt(at(k * Math.PI / 4), [0, -1], H * 1.7, 18)).join('');
  // კარიბჭე წინ: ორი კოშკი, თაღი, ოქროს დროშები
  const gy = RY + oy;
  g += towerAt([-26, gy], [0, -1], H * 1.9, 14) + towerAt([26, gy], [0, -1], H * 1.9, 14) +
    `<rect x="-16" y="${gy - H - 8}" width="32" height="${H + 8}" fill="${C.wallFace}" stroke="${C.wallDark}" stroke-width="1.2"/>` +
    `<path d="M-10,${gy} V${gy - 18} A10,10 0 0 1 10,${gy - 18} V${gy} Z" fill="${STONE.dark}"/>` + pennant(-26, gy - H * 1.9 - 40, STONE.gold) + pennant(26, gy - H * 1.9 - 40, STONE.gold);
  return g;
}

// მაღაზია: ორსართულიანი სავაჭრო სახლი — ქვის პირველი სართული ფარდულით და ვიტრინით, ძელებიანი მეორე სართული,
// ციცაბო სახურავი სარკმლით და საკვამურით, ჩამოკიდებული ფირნიში მონეტით, ფარანი; გვერდით დახლი ხილით, კასრები, ტომრები
function shop() {
  const plaster = '#f1e2c2', beam = '#6b4426', roof = '#b84a2c', roofShade = '#923a22';
  let g = shadow(92);
  // კასრები და ტომრები უკან-მარცხნივ
  g += `<g transform="translate(-74,-2)"><ellipse cx="0" cy="0" rx="9" ry="3" fill="#3e2a1a"/><rect x="-9" y="-20" width="18" height="20" rx="4" fill="#8a5a32"/><rect x="-9" y="-15" width="18" height="2.4" fill="#4a3220"/><rect x="-9" y="-6" width="18" height="2.4" fill="#4a3220"/>` +
    `<ellipse cx="14" cy="-1" rx="9" ry="9" fill="#d8c28e"/><path d="M8,-8 q6,-5 12,0" fill="none" stroke="#a48a56" stroke-width="2"/></g>`;
  // ქვის პირველი სართული
  g += wall(-50, -36, 100, 36, '#cdbb98', '#ad9b78');
  g += `<path d="M-40,0 V-22 Q-40,-30 -30,-30 H-10 Q0,-30 0,-22 V0 Z" fill="#3a2a20"/><path d="M-37,-4 V-21 Q-37,-27 -30,-27 H-10 Q-3,-27 -3,-21 V-4 Z" fill="#ffcf73" opacity=".85"/>` +
    `<circle cx="-28" cy="-10" r="4" fill="#d63a2f"/><circle cx="-20" cy="-12" r="4" fill="#ff9a2e"/><circle cx="-12" cy="-9" r="4" fill="#7fcb68"/><rect x="-34" y="-6" width="28" height="3" fill="#8a6038"/>`;
  g += `<path d="M14,0 V-24 A10,10 0 0 1 34,-24 V0 Z" fill="${beam}"/><circle cx="30" cy="-12" r="1.6" fill="${STONE.gold}"/>`;
  // ფარდული (ზოლიანი, კიდით)
  for (let i = 0; i < 6; i++) {
    const x = -56 + i * 18.7;
    g += `<polygon points="${P(x)},-44 ${P(x + 18.7)},-44 ${P(x + 20.7)},-32 ${P(x - 2)},-32" fill="${i % 2 ? '#f4ecd8' : '#c8392b'}"/><path d="M${P(x - 2)},-32 q${P(11.35)},8 ${P(22.7)},0" fill="${i % 2 ? '#f4ecd8' : '#c8392b'}"/>`;
  }
  // მეორე სართული: შელესილობა ძელებით, გადმოწეული
  g += `<rect x="-56" y="-86" width="112" height="42" fill="${plaster}"/><rect x="14" y="-86" width="42" height="42" fill="#dccaa6"/>` +
    `<rect x="-56" y="-88" width="112" height="5" fill="${beam}"/><rect x="-56" y="-47" width="112" height="5" fill="${beam}"/>` +
    [-56, -20, 16, 52].map(x => `<rect x="${x}" y="-86" width="4" height="42" fill="${beam}"/>`).join('') +
    `<path d="M-52,-46 L-24,-84 M-24,-46 L-52,-84 M20,-46 L48,-84" stroke="${beam}" stroke-width="3"/>`;
  for (const x of [-12, 24]) g += `<rect x="${x - 7}" y="-78" width="14" height="18" fill="#3a2a20"/><rect x="${x - 5}" y="-76" width="10" height="14" fill="#ffd27a" opacity=".85"/><rect x="${x - 9}" y="-60" width="18" height="3" fill="${beam}"/>`;
  // სახურავი სარკმლით და საკვამურით
  g += `<polygon points="-64,-86 0,-136 64,-86" fill="${roof}"/><polygon points="0,-136 64,-86 0,-86" fill="${roofShade}"/>` +
    `<rect x="30" y="-132" width="12" height="26" fill="#9a8a78"/><rect x="28" y="-134" width="16" height="5" fill="#7d6f60"/>` +
    `<polygon points="-14,-98 -2,-114 10,-98" fill="${plaster}"/><rect x="-8" y="-106" width="10" height="9" fill="#ffd27a"/><polygon points="-17,-97 -2,-117 13,-97 10,-97 -2,-113 -14,-97" fill="${roofShade}"/>`;
  // ჩამოკიდებული ფირნიში მონეტით და ფარანი
  g += `<path d="M56,-58 h22" stroke="${beam}" stroke-width="3"/><line x1="64" y1="-58" x2="64" y2="-52" stroke="${STONE.dark}"/><line x1="76" y1="-58" x2="76" y2="-52" stroke="${STONE.dark}"/>` +
    `<rect x="58" y="-52" width="24" height="18" rx="3" fill="${beam}"/><circle cx="70" cy="-43" r="7" fill="${STONE.gold}" stroke="#a0741e" stroke-width="2"/><circle cx="70" cy="-43" r="3" fill="none" stroke="#a0741e" stroke-width="1.5"/>` +
    `<line x1="-56" y1="-50" x2="-64" y2="-50" stroke="${STONE.dark}" stroke-width="2"/><rect x="-69" y="-50" width="10" height="13" rx="2" fill="#ffcf5a" stroke="${STONE.dark}" stroke-width="1.5"/>`;
  // დახლი მარჯვნივ: ლურჯი ფარდული, ყუთები ხილით
  g += `<g transform="translate(84,0)"><rect x="-16" y="-14" width="32" height="14" fill="#8a6038"/><line x1="-14" y1="-30" x2="-14" y2="0" stroke="${beam}" stroke-width="2.5"/><line x1="14" y1="-30" x2="14" y2="0" stroke="${beam}" stroke-width="2.5"/>` +
    `<polygon points="-20,-30 20,-30 24,-22 -24,-22" fill="#2f6fc0"/><path d="M-24,-22 q8,5 16,0 q8,5 16,0 q8,5 16,0" fill="#2f6fc0"/>` +
    `<circle cx="-8" cy="-17" r="4" fill="#d63a2f"/><circle cx="0" cy="-18" r="4" fill="#ffcf3a"/><circle cx="8" cy="-17" r="4" fill="#7fcb68"/></g>`;
  return g;
}

// კოლეჯები (ავტორის თხოვნა): ორივე კოლეჯის შთაბეჭდილებას ტოვებს — დიდი დარბაზი, ბევრი განათებული ფანჯარა, გერბი, ბაირაღები,
// კიბე შესასვლელთან — მაგრამ სხვადასხვა არქიტექტურით და ფერებით
const steps = (w, col = '#cfc4ad') => [0, 1, 2].map(i => `<rect x="${-w / 2 - i * 6}" y="${-6 + i * 3}" width="${w + i * 12}" height="3.4" fill="${col}" stroke="#8f8573" stroke-width=".6"/>`).join('');
const crest = (y, col, icon) => `<path d="M-11,${y} H11 V${y + 12} Q11,${y + 22} 0,${y + 27} Q-11,${y + 22} -11,${y + 12} Z" fill="${col}" stroke="${STONE.gold}" stroke-width="2"/>${icon}`;
const banner = (x, y, h, col, mark) => `<path d="M${x - 6},${y} H${x + 6} V${y + h} L${x},${y + h - 6} L${x - 6},${y + h} Z" fill="${col}"/><rect x="${x - 7}" y="${y - 2}" width="14" height="3" fill="${STONE.gold}"/>` +
  `<text x="${x}" y="${y + h / 2 + 3}" font-size="9" font-weight="800" font-family="Georgia, serif" fill="${STONE.gold}" text-anchor="middle">${mark}</text>`;

// ენების კოლეჯი — გოთიკური: დიდი დარბაზი წვეტიანი ფანჯრებით, შუაში საათიანი კოშკი შპილით, ვარდისებრი ვიტრაჟი შესასვლელზე,
// იისფერი ბაირაღები სხვადასხვა ანბანის ასოებით (A · ა · Я), გერბი ღია წიგნით, გვერდებზე შპილიანი კოშკები
function academy() {
  const stone = '#a3a5b5', shade = '#80839a', roof = '#3a4466', roofShade = '#2a3250', glow = '#ffd27a', purple = '#5b3f99';
  const lancet = (x, y, w, h) => `<path d="M${x},${y + h} V${y + w * .6} Q${x + w / 2},${y - w * .5} ${x + w},${y + w * .6} V${y + h} Z" fill="${glow}" stroke="#4a4f66" stroke-width="1.2"/>` +
    `<line x1="${x + w / 2}" y1="${y + 2}" x2="${x + w / 2}" y2="${y + h}" stroke="#4a4f66" stroke-width=".9"/>`;
  const spireTower = (cx, base, w, h, spire, flag) => wall(cx - w / 2, base - h, w, h, stone, shade) +
    `<polygon points="${cx - w / 2 - 4},${base - h} ${cx},${base - h - spire} ${cx + w / 2 + 4},${base - h}" fill="${roof}"/><polygon points="${cx},${base - h - spire} ${cx + w / 2 + 4},${base - h} ${cx},${base - h}" fill="${roofShade}"/>` +
    lancet(cx - 4, base - h + 18, 8, 18) + lancet(cx - 4, base - h + 50, 8, 18) + pennant(cx, base - h - spire, flag);
  let g = shadow(104);
  g += spireTower(-82, 0, 26, 118, 62, '#c8392b') + spireTower(82, 0, 26, 118, 62, '#2f6fc0');
  // საათიანი კოშკი
  g += wall(-20, -176, 40, 110, stone, shade) + `<polygon points="-25,-176 0,-250 25,-176" fill="${roof}"/><polygon points="0,-250 25,-176 0,-176" fill="${roofShade}"/>` +
    `<line x1="0" y1="-250" x2="0" y2="-264" stroke="${STONE.gold}" stroke-width="2.4"/><circle cx="0" cy="-266" r="3" fill="${STONE.gold}"/>` +
    `<circle cx="0" cy="-146" r="12" fill="#f4efe0" stroke="${STONE.gold}" stroke-width="2.4"/><path d="M0,-146 V-154 M0,-146 L6,-143" stroke="#2a3250" stroke-width="1.8" stroke-linecap="round"/>` +
    lancet(-5, -124, 10, 26);
  // დიდი დარბაზი
  g += wall(-68, -74, 136, 74, stone, shade) + `<polygon points="-74,-74 0,-112 74,-74" fill="${roof}"/><polygon points="0,-112 74,-74 0,-74" fill="${roofShade}"/>`;
  for (let x = -66; x < 64; x += 11) g += `<rect x="${x}" y="-80" width="6" height="7" fill="${stone}"/>`;
  for (const x of [-60, -44, 30, 46]) g += lancet(x, -62, 12, 40);
  // ვარდისებრი ვიტრაჟი
  g += `<circle cx="0" cy="-92" r="13" fill="#2a3250"/>` + ['#c8392b', '#2f6fc0', '#e0ad3e', '#7b4fc2', '#2f9a4c', '#c8392b', '#2f6fc0', '#e0ad3e'].map((c, i) => {
    const a0 = i * Math.PI / 4, a1 = a0 + Math.PI / 4;
    return `<path d="M0,-92 L${P(11 * Math.cos(a0))},${P(-92 + 11 * Math.sin(a0))} A11,11 0 0 1 ${P(11 * Math.cos(a1))},${P(-92 + 11 * Math.sin(a1))} Z" fill="${c}" opacity=".9"/>`;
  }).join('') + `<circle cx="0" cy="-92" r="3.5" fill="${STONE.gold}"/>`;
  // ბაირაღები ასოებით
  g += banner(-26, -66, 30, purple, 'A') + banner(26, -66, 30, purple, 'Я');
  // შესასვლელი, გერბი ღია წიგნით, კიბე
  g += `<path d="M-13,0 V-26 Q0,-44 13,-26 V0 Z" fill="${STONE.dark}"/><path d="M-13,-26 Q0,-44 13,-26" fill="none" stroke="${STONE.gold}" stroke-width="1.6"/>`;
  g += crest(-72, purple, `<path d="M-7,-60 Q-3.5,-63 0,-60 Q3.5,-63 7,-60 V-53 Q3.5,-56 0,-53 Q-3.5,-56 -7,-53 Z" fill="#f4efe0"/><line x1="0" y1="-60" x2="0" y2="-53" stroke="${purple}" stroke-width="1"/>` +
    `<text x="0" y="-64" font-size="6" font-weight="800" fill="${STONE.gold}" text-anchor="middle">ა</text>`);
  return g + steps(34);
}

// გეოგრაფიის კოლეჯი — კლასიკური, ობსერვატორიით: ღია ქვის შენობა სვეტებით და ფრონტონით, მწვანე სპილენძის გუმბათი,
// თავზე გლობუსი ოქროს რკალებით, ცალკე ობსერვატორიის კოშკი ტელესკოპით, ბიბლიოთეკის მაღალი ფანჯრები, ბაირაღები ქარის ვარდით
function geoCastle() {
  const stone = '#ecdfc3', shade = '#cbbb96', copper = '#4f9a86', copperShade = '#3c7a69', glow = '#ffd27a', blue = '#2f6fc0';
  const arched = (x, y, w, h) => `<path d="M${x},${y + h} V${y + w / 2} A${w / 2},${w / 2} 0 0 1 ${x + w},${y + w / 2} V${y + h} Z" fill="${glow}" stroke="#8a7a5a" stroke-width="1.1"/>` +
    `<line x1="${x}" y1="${y + h * .55}" x2="${x + w}" y2="${y + h * .55}" stroke="#8a7a5a" stroke-width=".8"/>`;
  let g = shadow(104);
  // ობსერვატორიის კოშკი მარჯვნივ: თეთრი გუმბათი ჭრილით და ტელესკოპით
  g += wall(56, -120, 30, 120, stone, shade) + `<rect x="52" y="-124" width="38" height="6" fill="${shade}"/>` +
    `<path d="M52,-124 A19,19 0 0 1 90,-124 Z" fill="#f2f4f6" stroke="#b8bec6" stroke-width="1.2"/><rect x="68" y="-142" width="4" height="18" fill="#3a4466" transform="rotate(28 70 -124)"/>` +
    `<line x1="72" y1="-128" x2="94" y2="-152" stroke="#5a6070" stroke-width="4.5" stroke-linecap="round"/>` + arched(63, -100, 16, 30) + arched(63, -54, 16, 30);
  // ცენტრალური დოლი, გუმბათი, ფანარი, გლობუსი ოქროს რკალებით
  g += wall(-26, -96, 52, 34, stone, shade);
  for (const x of [-20, -6, 8]) g += arched(x, -92, 10, 22);
  g += `<path d="M-30,-96 Q-30,-136 0,-140 Q30,-136 30,-96 Z" fill="${copper}"/><path d="M0,-140 Q30,-136 30,-96 H10 Q12,-128 0,-140 Z" fill="${copperShade}"/>` +
    [-18, -6, 6, 18].map(x => `<path d="M${x},-97 Q${x * .4},-128 0,-139" fill="none" stroke="#7fc0ac" stroke-width="1.1"/>`).join('') +
    `<rect x="-6" y="-152" width="12" height="13" fill="${stone}"/><path d="M-8,-152 H8 L0,-160 Z" fill="${copper}"/>` +
    `<line x1="0" y1="-160" x2="0" y2="-170" stroke="${STONE.dark}" stroke-width="2"/><circle cx="0" cy="-186" r="16" fill="#3f93d0" stroke="${STONE.gold}" stroke-width="2.4"/>` +
    `<path d="M-9,-195 q6,-3 10,1 q4,5 -1,9 q-7,2 -9,-10 Z M4,-180 q6,-4 9,-1 q-1,6 -9,1 Z" fill="#7fcb68"/>` +
    `<ellipse cx="0" cy="-186" rx="21" ry="7" fill="none" stroke="${STONE.gold}" stroke-width="2" transform="rotate(-20 0 -186)"/>` +
    `<ellipse cx="0" cy="-186" rx="6.5" ry="16" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.3"/>`;
  // ძირითადი შენობა: ბიბლიოთეკის მაღალი ფანჯრები, კარნიზი, ბალუსტრადა
  g += wall(-74, -62, 136, 62, stone, shade) + `<rect x="-78" y="-66" width="144" height="6" fill="${shade}"/>`;
  for (let x = -76; x < 64; x += 7) g += `<rect x="${x}" y="-72" width="3" height="6" fill="${stone}"/>`;
  g += `<rect x="-78" y="-74" width="144" height="3" fill="${stone}"/>`;
  for (const x of [-68, -54, 36, 50]) g += arched(x, -54, 11, 34);
  // პორტიკი: ფრონტონი გლობუსის ემბლემით, ოთხი სვეტი
  g += `<polygon points="-34,-58 0,-80 34,-58" fill="${stone}" stroke="${shade}" stroke-width="1.5"/><circle cx="0" cy="-66" r="6" fill="none" stroke="${blue}" stroke-width="1.6"/>` +
    `<path d="M-6,-66 H6 M0,-72 V-60" stroke="${blue}" stroke-width="1"/><rect x="-36" y="-58" width="72" height="5" fill="${shade}"/>`;
  for (const x of [-28, -12, 6, 22]) g += `<rect x="${x}" y="-53" width="6" height="46" fill="#fbf6ea"/><rect x="${x - 1}" y="-53" width="8" height="3" fill="${shade}"/><rect x="${x + 4}" y="-50" width="2" height="43" fill="${shade}" opacity=".5"/>`;
  g += `<path d="M-6,-7 V-26 A6,6 0 0 1 6,-26 V-7 Z" fill="${STONE.dark}"/>`;
  // ბაირაღები ქარის ვარდით და გერბი
  g += banner(-46, -54, 30, blue, '✦') + banner(30, -54, 30, blue, '✦');
  return g + steps(62);
}

// არმია: შუაგული — დიდი ბაირაღი, ცხენოსანი სარდალი, ორი რაზმი მწყობრში
function armyCamp() {
  // მხოლოდ ბაირაღი (ცხენოსანი სარდალი და ჩრდილი ამოღებულია — ავტორის თხოვნა); რაზმები გარშემო — მიწის ფენაში
  return `<line x1="0" y1="-30" x2="0" y2="-100" stroke="${STONE.dark}" stroke-width="3"/><path d="M0,-100 h30 l-7,8 l7,8 h-30 Z" fill="#c8392b"/><circle cx="13" cy="-92" r="4" fill="${STONE.gold}"/>`;
}

// გალავნის კარიბჭის ფასადი: კედელი კბილანებით, თაღი ცხაურით (ლოკალურ კოორდინატებში, ზემოთ = −y)
function gateFacade() {
  let g = wall(-36, -76, 72, 76, C.wallFace, C.wallLine);
  for (let x = -36; x < 34; x += 12) g += `<rect x="${x}" y="-85" width="7" height="9" fill="${C.wallFace}" stroke="${C.wallDark}" stroke-width=".8"/>`;
  g += `<path d="M-17,0 V-30 A17,17 0 0 1 17,-30 V0 Z" fill="${STONE.dark}"/>`;
  for (let x = -13; x <= 13; x += 6.5) g += `<line x1="${x}" y1="-44" x2="${x}" y2="0" stroke="#6b5a40" stroke-width="1.8"/>`;
  return g;
}
// კარიბჭე მიმართულებით [dx, dy] — ფასადი ამ ხაზის გასწვრივ, სიმაღლე სწორად ზემოთ (გვერდითი კოშკები ამოღებულია — ავტორის თხოვნა)
function gateAt([dx, dy]) {
  if (dx < 0) { dx = -dx; dy = -dy; }                       // ფასადი სარკისებურად რომ არ ამობრუნდეს
  return `<g transform="matrix(${P(dx)},${P(dy)},0,1,0,0)">${gateFacade()}</g>`;
}
// კარიბჭე გალავანზე: ფასადი კედლის გასწვრივ (ან gateDir-ით — კომპიუტერზე 3/4-ით მობრუნებული), სიმაღლე — სწორად ზემოთ;
// ფასადი ბრძოლის ველისკენ იყურება. გვერდითი კოშკები ამოღებულია (ავტორის თხოვნა) — რჩება თაღი ცხაურით
function gateOn(L, p) {
  const i = L.wall.findIndex(q => q[0] === p.x && q[1] === p.y);
  const a = L.wall[Math.max(0, i - 2)], b = L.wall[Math.min(L.wall.length - 1, i + 2)];
  let [dx, dy] = L.gateDir || unitV([b[0] - a[0], b[1] - a[1]]);
  if (dx < 0) { dx = -dx; dy = -dy; }                       // ფასადი სარკისებურად რომ არ ამობრუნდეს
  const [ux, uy] = UPRIGHT;
  return `<ellipse cx="6" cy="8" rx="50" ry="14" fill="#1d3a20" opacity=".22"/>` +
    `<g transform="matrix(${P(dx)},${P(dy)},${P(-ux)},${P(-uy)},0,0)">${gateFacade()}</g>`;
}

// ციხესიმაგრის („პროფილი“) გალავანი: მთელ სიგანეზე, კოშკებით, შუაში — კარიბჭე (გზა გადის)
// წერტილები კოშკებს შორის (კედლის ხაზზე, შუაში) — თითო მცველისთვის
// + თითო მცველი კიდეებზეც (პირველი / ბოლო კოშკიდან ხილული კედლის ბოლომდე — ავტორის თხოვნა)
const betweenTowers = (pts, towers, view) => {
  const idx = q => pts.reduce((b, p, k) => Math.hypot(p[0] - q[0], p[1] - q[1]) < Math.hypot(pts[b][0] - q[0], pts[b][1] - q[1]) ? k : b, 0);
  const ix = towers.map(idx).sort((a, b) => a - b);
  const inView = k => !view || (pts[k][0] > view.x && pts[k][0] < view.x + view.w);
  let lo = 0, hi = pts.length - 1; while (lo < ix[0] && !inView(lo)) lo++; while (hi > ix.at(-1) && !inView(hi)) hi--;
  const mids = ix.slice(1).map((v, k) => pts[Math.round((v + ix[k]) / 2)]);
  // კიდეებზე: თითო მცველი გარე კოშკის მიღმა — ~150 ერთეულზე კედლის გასწვრივ (კოშკის უკან რომ არ დაიმალოს) (ან ხილული ბოლოს შუაში, თუ უფრო ახლოა)
  const step = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]) || 1, off = Math.max(3, Math.round(150 / step));
  if (ix[0] - Math.max(0, lo - off) > 2) mids.unshift(pts[Math.max(0, Math.min(ix[0] - off, Math.round((lo + ix[0]) / 2)))]);
  if (Math.min(pts.length - 1, hi + off) - ix.at(-1) > 2) mids.push(pts[Math.min(pts.length - 1, Math.max(ix.at(-1) + off, Math.round((hi + ix.at(-1)) / 2)))]);
  return mids;
};
const citadelGate = L => nearestOn(L.citadel, L.citadelGateNear);
const keepAngle = L => { if (!L.keepAlongWall) return 0; const k = L.spots.find(q => q.id === 'castle'), [dx, dy] = dirAt(L.citadel, nearestOn(L.citadel, [k.x, k.y])); return P(Math.atan2(dy, dx) * 180 / Math.PI); };
// კარიბჭის ახლოს მდგარი კოშკები ამოიღება (კარიბჭის გვერდითები ცვლის) — დანარჩენი, მათ შორის კიდის კოშკი, რჩება
function withFlank(t, pts, gate, r = 170) {
  return t.filter(q => Math.hypot(q[0] - gate[0], q[1] - gate[1]) > r).concat(gateFlank(pts, gate));
}
// კომპიუტერი (ავტორის ესკიზი): ზედა კიდის კოშკი + კარიბჭის ორი გვერდითი + თითო კოშკი კარიბჭიდან მოცემულ მანძილზე კედლის გასწვრივ
const citadelTowers = L => L.citadelTowerPlan ? (() => {
  const g = citadelGate(L), base = towersAlong(L, L.citadel, L.towerCount || 4, g);
  const top = base.reduce((b, q) => q[1] < b[1] ? q : b);
  return [top, ...gateFlank(L.citadel, g), ...L.citadelTowerPlan.map(d => gateFlank(L.citadel, g, Math.abs(d))[d < 0 ? 0 : 1])];
})() : citadelTowersDefault(L);
const citadelTowersDefault = L => L.gateFlank ? withFlank(towersAlong(L, L.citadel, L.towerCount || 4, citadelGate(L)), L.citadel, citadelGate(L)) : towersAlong(L, L.citadel, L.towerCount || 4, citadelGate(L));      // ციხესიმაგრის გალავანიც — 4 კოშკი
const CASTLE_STONE = { wallTop: C.wallTop, wallFace: C.wallFace, wallDark: C.wallDark, wallLine: C.wallLine };   // ორივე გალავანი ერთი სტილისაა
function citadelWall(L) {
  const g = citadelGate(L), saved = { wallTop: C.wallTop, wallFace: C.wallFace, wallDark: C.wallDark, wallLine: C.wallLine };
  Object.assign(C, CASTLE_STONE);                       // გალავანი — სასახლის ქვით, რომ ერთი ციხესიმაგრე იყოს
  try {
    return wallBand(L.citadel, L.citadelUp || UPRIGHT, 96, 50, { depth: L.citadelDepth, guardsAt: L.citadelGuards ? betweenTowers(L.citadel, citadelTowers(L), L.focus) : null }) + citadelTowers(L).map(q => wallTower(L.citadel, q, L.citadelUp || UPRIGHT, 96, 136, 50, L.citadelDepth || L.citadelUp || UPRIGHT)).join('') +
      `<g transform="translate(${g[0]},${g[1]})">${gateAt(L.citadelGateDir || [1, 0])}</g>`;
  } finally { Object.assign(C, saved); }
}

// ჩაძირული გემები (მხოლოდ ნახატი): წყლიდან ამოსული გადახრილი ანძები დახეული იალქნებით, ნაფოტები
function wrecks() {
  const wreck = (x, a, s) => `<g transform="translate(${x},0) rotate(${a}) scale(${s})"><ellipse cx="0" cy="2" rx="40" ry="8" fill="#e6f7ff" opacity=".35"/>` +
    `<path d="M-34,0 Q-30,-14 -6,-16 L30,-10 Q36,-4 32,0 Z" fill="#5a3418"/><path d="M-30,-6 L30,-6" stroke="#3e2410" stroke-width="2"/>` +
    `<line x1="-4" y1="-14" x2="-4" y2="-70" stroke="#4a2c14" stroke-width="3"/><line x1="-18" y1="-56" x2="12" y2="-56" stroke="#4a2c14" stroke-width="2"/>` +
    `<path d="M-16,-54 L10,-54 L6,-36 L-2,-42 L-8,-30 L-14,-40 Z" fill="#d8ccb0" opacity=".9"/><ellipse cx="0" cy="2" rx="38" ry="5" fill="${C.sea}" opacity=".85"/></g>`;
  return wreck(-40, -16, .9) + wreck(40, 12, .75) +
    `<rect x="-6" y="10" width="14" height="5" rx="2" fill="#7a4a26" transform="rotate(12)"/><circle cx="16" cy="18" r="5" fill="#8a6038"/><ellipse cx="16" cy="19" rx="9" ry="3" fill="none" stroke="#e6f7ff" stroke-opacity=".5"/>`;
}

// მეგობრების ფლოტი (ტელეფონზე, ავტორის რეფერენსით — დიდი არმადა): სამანძიანი გალეონები კრემისფერი იალქნებით, ქვემეხების
// სარკმლებით და ფერადი დროშებით, მჭიდრო მწყობრში; ეკრანის მარცხენა კიდიდან შემოდიან და ნაპირისკენ (მარჯვნივ) მიცურავენ
const FLEET_FLAGS = ['#2f9a4c', '#c8392b', '#2f6fc0', '#e0ad3e', '#f4ecd8', '#7b4fc2'];
function galleon(x, y, s, flag) {
  const sail = (mx, top, w, h) => `<path d="M${mx - w / 2},${top} H${mx + w / 2} Q${mx + w / 2 + 5},${top + h / 2} ${mx + w / 2},${top + h} H${mx - w / 2} Q${mx - w / 2 + 3},${top + h / 2} ${mx - w / 2},${top} Z" fill="#efe4c8" stroke="#bfae86" stroke-width="1"/>` +
    `<path d="M${mx + w / 4},${top + 1} Q${mx + w / 2 + 4},${top + h / 2} ${mx + w / 4},${top + h - 1}" fill="none" stroke="#d6c7a0" stroke-width="3"/>`;
  const mast = (mx, h, w) => `<line x1="${mx}" y1="-12" x2="${mx}" y2="${-12 - h}" stroke="#4a2c14" stroke-width="2.4"/>` +
    sail(mx, -12 - h + 8, w * .72, 14) + sail(mx, -12 - h + 24, w * .9, 18) + sail(mx, -12 - h + 44, w, 20);
  let g = `<g transform="translate(${P(x)},${P(y)}) scale(${s})"><g class="game__ship-bob" style="animation-delay:-${((x * 13 + y * 7) % 34) / 10}s">`;
  g += `<path d="M-56,4 q-16,-3 -30,2 M-54,10 q-20,-2 -38,4" fill="none" stroke="#e6f7ff" stroke-opacity=".6" stroke-width="2.6" stroke-linecap="round"/>`;
  g += `<ellipse cx="0" cy="8" rx="54" ry="7" fill="#123f5e" opacity=".35"/>`;
  g += mast(-24, 64, 30) + mast(22, 58, 28) + mast(0, 80, 34);
  g += `<line x1="46" y1="-16" x2="74" y2="-32" stroke="#4a2c14" stroke-width="2"/><path d="M48,-20 L72,-32 L60,-10 Z" fill="#efe4c8" stroke="#bfae86" stroke-width="1"/>`;
  g += `<path d="M-50,-16 L42,-16 Q54,-18 60,-26 L52,2 Q48,10 36,10 L-40,10 Q-50,8 -52,-4 Z" fill="#6b4024"/>` +
    `<path d="M-54,-30 H-30 V-16 H-52 Z" fill="#7a4a28"/><rect x="-55" y="-33" width="27" height="4" fill="#4a2c14"/>` +
    `<rect x="-50" y="-9" width="96" height="3.5" fill="#e0ad3e"/><rect x="-48" y="1" width="90" height="2.5" fill="#4a2c14" opacity=".6"/>`;
  for (let gx = -42; gx < 44; gx += 9) g += `<rect x="${gx}" y="-4" width="4" height="3.5" fill="#24150b"/>`;
  g += `<line x1="0" y1="-92" x2="0" y2="-104" stroke="#4a2c14" stroke-width="2"/><path d="M0,-104 l20,4 l-20,5 Z" fill="${flag}"/>` +
    `<path d="M-52,-33 l-12,-6 l2,9 Z" fill="${flag}"/>`;
  return g + '</g></g>';
}
// გალეონი წინიდან: მიცურავს ქვემოთ (მაყურებლისკენ) — ცხვირი და ბუშპრიტი ქვემოთ, კვალი უკან (ზემოთ), იალქნები მაყურებლისკენ გაბერილი
function galleonDown(x, y, s, flag) {
  const sail = (top, w, h) => `<path d="M${-w / 2},${top} H${w / 2} Q${w / 2 + 2},${top + h * .6} ${w / 2 - 3},${top + h} Q0,${top + h + 7} ${-w / 2 + 3},${top + h} Q${-w / 2 - 2},${top + h * .6} ${-w / 2},${top} Z" fill="#efe4c8" stroke="#bfae86" stroke-width="1"/>` +
    `<path d="M${-w / 2 + 5},${top + h * .55} Q0,${top + h + 2} ${w / 2 - 5},${top + h * .55}" fill="none" stroke="#d6c7a0" stroke-width="2.5"/>`;
  let g = `<g transform="translate(${P(x)},${P(y)}) scale(${s})"><g class="game__ship-bob" style="animation-delay:-${((x * 13 + y * 7) % 34) / 10}s">`;
  g += `<path d="M-14,-40 q-6,-24 -20,-40 M14,-40 q6,-24 20,-40 M-6,-44 q-2,-20 -8,-34 M6,-44 q2,-20 8,-34" fill="none" stroke="#e6f7ff" stroke-opacity=".6" stroke-width="2.6" stroke-linecap="round"/>`;
  g += `<ellipse cx="0" cy="6" rx="30" ry="9" fill="#123f5e" opacity=".35"/>`;
  // კორპუსი (წინიდან): უკანა ამაღლებული გემბანი, მომრგვალებული ცხვირი, ოქროს ზოლი, ქვემეხების სარკმლები
  g += `<path d="M-30,-40 H30 L26,-26 H-26 Z" fill="#7a4a28"/><rect x="-31" y="-43" width="62" height="4" fill="#4a2c14"/>`;
  g += `<path d="M-27,-26 H27 Q27,-2 0,10 Q-27,-2 -27,-26 Z" fill="#6b4024"/>` +
    `<path d="M-25,-17 Q0,-11 25,-17" fill="none" stroke="#e0ad3e" stroke-width="3"/>` +
    [-18, -9, 0, 9, 18].map(gx => `<rect x="${gx - 2}" y="${-13 + Math.abs(gx) * .12}" width="4" height="3.4" fill="#24150b"/>`).join('') +
    `<path d="M0,-6 V10" stroke="#4a2c14" stroke-width="2"/>`;
  // ანძები ერთმანეთის უკან: უკანა (მაღალი) → შუა → წინა (დაბალი); იალქნები გაბერილი მაყურებლისკენ
  g += `<line x1="0" y1="-30" x2="0" y2="-128" stroke="#4a2c14" stroke-width="2.6"/>`;
  g += sail(-120, 30, 14) + sail(-104, 40, 18) + sail(-84, 48, 20);
  g += sail(-70, 36, 14) + sail(-54, 46, 18);
  g += `<line x1="0" y1="-128" x2="0" y2="-138" stroke="#4a2c14" stroke-width="2"/><path d="M0,-138 l18,4 l-18,5 Z" fill="${flag}"/>`;
  // ბუშპრიტი და ფოკი — წინ, ქვემოთ
  g += `<line x1="0" y1="4" x2="0" y2="24" stroke="#4a2c14" stroke-width="2.2"/><path d="M0,-34 L-12,-6 L0,20 Z" fill="#efe4c8" stroke="#bfae86" stroke-width="1"/>`;
  return g + '</g></g>';
}
// არმადა: დიაგონალური რიგები, უკანა (ზემოთ) — პატარა, წინა — დიდი; ზოგი კიდეს მიღმაა
const FLEET = [[-40, -210, .64], [44, -190, .62], [-70, -120, .7], [14, -100, .68], [-30, -24, .76], [56, -6, .74],
  [-80, 60, .82], [8, 78, .8], [-40, 150, .88], [-100, 220, .94]].map(([x, y, s]) => [x - 95, y, s]);   // 10 გემი, უკან — კიდისკენ
const fleetOf = L => L.fleetTurn ? FLEET.map(([x, y, s]) => [-y, x + 75, s]) : FLEET;   // კომპიუტერზე — ზემოდან შემოდის
const fleet = L => [...fleetOf(L)].sort((a, b) => a[1] - b[1]).map(([x, y, s], i) => (L.fleetTurn ? galleonDown : galleon)(x, y, s, FLEET_FLAGS[i % FLEET_FLAGS.length])).join('');

// მეგობრების სამეფო (კომპიუტერზე): პატარა ციხე კუნძულზე (ლურჯი სახურავებით — სხვა სამეფოა)
const FRIENDS = { ...STONE, roof: '#3f6fb5', roofShade: '#2f5590', slate: '#3f6fb5', slateShade: '#2f5590', flag: '#2f9a4c' };

const ART = { shop, academy, geography: geoCastle, army: armyCamp, wrecks, battlefield: () => battleVariant().focal() };
const LABEL_Y = { castle: 98, friends: 22, battlefield: 26 };

// ყურეში გემი (ირხევა)
const ship = ([x, y]) => `<g class="game__ship" transform="translate(${x},${y})" pointer-events="none"><g class="game__ship-bob">` +
  `<path d="M-34,-6 L34,-6 L24,12 L-26,12 Z" fill="#7a4a26"/><rect x="-30" y="-8" width="60" height="4" fill="#5a3418"/>` +
  `<line x1="0" y1="-6" x2="0" y2="-62" stroke="#4a2c14" stroke-width="3"/><path d="M2,-58 Q26,-40 2,-14 Z" fill="#f4ecd8"/><path d="M-2,-54 Q-22,-38 -2,-18 Z" fill="#e8dcc0"/>` +
  `<path d="M0,-62 l16,4 l-16,4 Z" fill="#d63a2f"/></g></g>`;

// ზედა ფენა: ადგილები (<g class="spot"> — დასაჭერი; წარწერას game.js ამატებს .spot__label-ში), დროშები, გემი; decor — მხოლოდ ნახატი
export function drawOverlay(id, L) {
  let s = `<defs><radialGradient id="${id}-glow"><stop offset="0" stop-color="#fff3b0" stop-opacity=".9"/><stop offset="1" stop-color="#ffd25a" stop-opacity="0"/></radialGradient></defs>`;
  if (L.ship) s += ship(L.ship);
  takeAnim();   // საერთო ბუფერი (fx.js) — სცენის ნარჩენი, თუ დარჩა
  const items = [...L.spots];
  if (L.citadel) items.push({ id: 'citadel', decor: true, x: 0, y: L.citadelFront ? Math.max(...L.citadel.map(q => q[1])) : -1e4 });   // კომპიუტერზე — ციხის უკან
  for (const p of items.sort((a, b) => a.y - b.y)) {
    if (p.id === 'citadel') { s += `<g class="decor" pointer-events="none">${citadelWall(L)}</g>`; continue; }
    let art;
    if (p.id === 'castle') art = L.castleArt === 'keep' ? `<g transform="rotate(${keepAngle(L)})">` + shadow(170) + fortress(0, 0, L.keepScale || .5, { ...STONE, ground: '#8fcb6c', type: 'georgian', id }) + '</g>' : palace(id);
    else if (p.id === 'friends') art = L.friendsArt === 'fleet' ? fleet(L) : fortress(0, 0, .2, { ...FRIENDS, ground: C.grass, type: 'round', id });
    else if (p.id === 'wall') art = gateOn(L, p);
    else art = ART[p.id]();
    const moving = takeAnim();                                 // ციხის დროშა (ფრიალებს) — იმავე ადგილზე
    const fx = moving ? `<g class="game__fx" pointer-events="none">${moving}</g>` : '';
    if (p.decor) { s += `<g class="decor" transform="translate(${p.x},${p.y})" pointer-events="none">${art}${fx}</g>`; continue; }
    const glow = p.ready && p.id !== 'castle' ? `<ellipse class="spot__glow" cx="0" cy="-8" rx="90" ry="42" fill="url(#${id}-glow)"/>` : '';
    s += `<g class="spot${p.ready ? '' : ' is-locked'}" data-spot="${p.id}" tabindex="0" role="button" transform="translate(${p.x},${p.y})">` +
      `${glow}<g class="spot__art">${art}</g>${fx}<g class="spot__label" transform="translate(${(L.labelAt?.[p.id] || [0, LABEL_Y[p.id] ?? 28]).join(',')})"></g></g>`;
  }
  return s;
}

// ღამის შუქები (game.js — ღამის რეჟიმი): ჩირაღდნები გზებზე და კოშკებზე, ფანჯრები სახლებში, ციხეებსა და ბანაკში
export function drawLights(id, L) {
  const { roads, houses, inner, units, towers } = planOf(L);
  // ავტორის თხოვნით — ზომიერად: გზაზე იშვიათი ჩირაღდნები, ყოველი მესამე სახლი, ყოველი მეორე კოშკი, ბანაკში რამდენიმე კოცონი
  const lamp = (x, y, r = 14) => `<circle cx="${P(x)}" cy="${P(y)}" r="${r}" fill="url(#${id}-lamp)"/><circle cx="${P(x)}" cy="${P(y)}" r="${P(r * .12)}" fill="#ffe9b0"/>`;
  const every = (list, n) => list.filter((_, i) => i % n === 0);
  const torch = (x, y) => lamp(x, y - 4, 16) + `<path d="M${P(x - 2.6)},${P(y)} Q${P(x - 3)},${P(y - 6)} ${P(x)},${P(y - 10)} Q${P(x + 3)},${P(y - 6)} ${P(x + 2.6)},${P(y)} Z" fill="#ffb347"/><path d="M${P(x - 1.2)},${P(y)} Q${P(x)},${P(y - 5)} ${P(x + 1.2)},${P(y)} Z" fill="#fff1b8"/>`;
  // კოშკის სიმაღლე (იგივე, რითაც იხატება — rampart / citadelWall)
  const outerH = (L.wallH || WALL_H) + 40, citH = 136;          // = wallTower-ის სიმაღლე          // = squareTower-ის სიმაღლე (ზედა მოედნის წინა კიდე)
  // კარიბჭე: ორი ჩირაღდანი თაღის ორივე მხარეს
  const gateTorches = ([gx, gy], [dx, dy]) => { if (dx < 0) { dx = -dx; dy = -dy; } return torch(gx - dx * 26, gy - dy * 26 - 38) + torch(gx + dx * 26, gy + dy * 26 - 38); };
  let s = `<defs><radialGradient id="${id}-lamp"><stop offset="0" stop-color="#ffd27a" stop-opacity=".7"/><stop offset=".35" stop-color="#ffb347" stop-opacity=".28"/><stop offset="1" stop-color="#ff9a2e" stop-opacity="0"/></radialGradient></defs>`;
  for (const road of roads) for (const t of [.33, .66]) { const [x, y] = bez(road, t); s += lamp(x + 12, y - 6, 11); }
  s += every([...houses, ...inner], 3).map(([x, y]) => lamp(x - 1, y - 8, 12)).join('');
  if (L.citadel) { s += citadelTowers(L).map(([x, y]) => torch(x, y - citH - 4)).join(''); s += gateTorches(citadelGate(L), L.citadelGateDir || [1, 0]); }
  const [ux, uy] = L.wallUp;
  s += towers.map(([x, y]) => torch(x, y - outerH - 4)).join('');
  { const g = L.spots.find(q => q.id === 'wall'), i = L.wall.findIndex(q => q[0] === g.x && q[1] === g.y), a = L.wall[Math.max(0, i - 2)], b = L.wall[Math.min(L.wall.length - 1, i + 2)];
    s += gateTorches([g.x, g.y], L.gateDir || unitV([b[0] - a[0], b[1] - a[1]])); }
  s += every(units, 3).map(([x, y]) => lamp(x + 6, y - 2, 18)).join('');
  for (const p of L.spots) {
    const sc = (L.keepScale || .5) / .5;
    const pts = { castle: [[-40 * sc, -40 * sc], [40 * sc, -40 * sc]], academy: [[0, -146], [-50, -40], [50, -40]], geography: [[0, -100], [-60, -36], [70, -80]], shop: [[-20, -14], [-64, -44]],
      army: [[-30, -10], [40, -8]], friends: L.friendsArt === 'fleet' ? every(fleetOf(L), 3).map(([fx, fy, fs]) => [fx - 40 * fs, fy - 26 * fs]) : [[0, -30]], battlefield: [[-60, -10], [50, 10], [0, -40]] }[p.id] || [];
    s += pts.map(([dx, dy]) => lamp(p.x + dx, p.y + dy, 15)).join('');
  }
  return s;
}
