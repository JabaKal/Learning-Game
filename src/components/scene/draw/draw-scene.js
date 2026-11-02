// მთელი სცენის აწყობა: ყველა ფენა სწორი რიგით.
// აბრუნებს ორ ნაწილს: bg — უძრავი ნახატი (სურათად იხატება), fx — მოძრავი ელემენტები (პატარა SVG ზემოდან), იხ. fx.js და scene.js
import { W, H, SPLIT, FORK_Y } from './config.js';
import { P, rng, mix, hazed, fog, bez, normal, trail } from './utils.js';
import { THEME } from './palettes.js';
import { anim, within, takeAnim } from './fx.js';
import { hills, ridge, summit, lip, mound, crags, cloud, birds, tree, forest, deadTree, deadForest, smoke, volcano, embers, ruin, road } from './nature.js';
import { fortress, darkCitadel, obsidianZiggurat, STONE, EVIL } from './buildings.js';
import { soldier, giant, banner, marchColumn, GOOD_ARMY, EVIL_ARMY, GIANT, hazeAll } from './army.js';
import { swordInStone } from './sword.js';

export function defs(id) {
  return `<defs>
    <radialGradient id="${id}-glow"><stop offset="0" stop-color="#ffb35c" stop-opacity=".85"/><stop offset="1" stop-color="#ffb35c" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}-sunglow"><stop offset="0" stop-color="#fff1c9" stop-opacity=".85"/><stop offset=".3" stop-color="#ffc56b" stop-opacity=".4"/><stop offset="1" stop-color="#ff9a4a" stop-opacity="0"/></radialGradient>
    <filter id="${id}-blur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="${id}-soft" x="-20%" y="-80%" width="140%" height="260%"><feGaussianBlur stdDeviation="5"/></filter>
    <linearGradient id="${id}-beam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff6c8" stop-opacity=".75"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></linearGradient>
    <radialGradient id="${id}-cglow"><stop offset="0" stop-color="#d8f4ff" stop-opacity=".9"/><stop offset=".45" stop-color="#7ab8ff" stop-opacity=".35"/><stop offset="1" stop-color="#7ab8ff" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}-evilglow"><stop offset="0" stop-color="#ff3a1a" stop-opacity=".85"/><stop offset=".4" stop-color="#d0201a" stop-opacity=".35"/><stop offset="1" stop-color="#a0101a" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}-lava" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd25a"/><stop offset=".5" stop-color="#ff8a1a"/><stop offset="1" stop-color="#ff4a10"/></linearGradient>
    <linearGradient id="${id}-fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${THEME.fog}" stop-opacity="0"/><stop offset=".55" stop-color="${THEME.fog}" stop-opacity=".6"/><stop offset="1" stop-color="${THEME.fog}" stop-opacity="0"/></linearGradient>
    <linearGradient id="${id}-rim" gradientUnits="userSpaceOnUse" x1="-200" y1="0" x2="${SPLIT + 40}" y2="0"><stop offset="0" stop-color="#fff3cc"/><stop offset=".6" stop-color="#fff3cc" stop-opacity=".7"/><stop offset="1" stop-color="#fff3cc" stop-opacity="0"/></linearGradient>
    <linearGradient id="${id}-rimEvil" gradientUnits="userSpaceOnUse" x1="${SPLIT}" y1="0" x2="1800" y2="0"><stop offset="0" stop-color="#ff7a3a" stop-opacity="0"/><stop offset=".5" stop-color="#ff7a3a" stop-opacity=".6"/><stop offset="1" stop-color="#ff7a3a" stop-opacity=".3"/></linearGradient>
    <radialGradient id="${id}-baseglow"><stop offset="0" stop-color="#fffbe6" stop-opacity=".95"/><stop offset=".22" stop-color="#ffe7a0" stop-opacity=".6"/><stop offset=".55" stop-color="#ffc06a" stop-opacity=".2"/><stop offset="1" stop-color="#ffb35c" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}-bladeLight" gradientUnits="userSpaceOnUse" x1="0" y1="-80" x2="0" y2="-260"><stop offset="0" stop-color="#fffbe6" stop-opacity=".9"/><stop offset=".45" stop-color="#fffbe6" stop-opacity=".25"/><stop offset="1" stop-color="#fffbe6" stop-opacity="0"/></linearGradient>
    <linearGradient id="${id}-bladeLightEvil" gradientUnits="userSpaceOnUse" x1="0" y1="-80" x2="0" y2="-260"><stop offset="0" stop-color="#ffb070" stop-opacity=".6"/><stop offset=".5" stop-color="#ff8a4a" stop-opacity=".15"/><stop offset="1" stop-color="#ff8a4a" stop-opacity="0"/></linearGradient>
    <pattern id="${id}-stone" width="26" height="14" patternUnits="userSpaceOnUse"><path d="M0,7 H26 M0,14 H26 M8,0 V7 M21,7 V14" stroke="#3a2a1a" stroke-opacity=".18" stroke-width="1" fill="none"/></pattern>
  </defs>`;
}

export function drawScene(id) {
  takeAnim();                                   // მოძრავი ფენის ბუფერი სუფთაა
  const RIM = `url(#${id}-rim)`, RIM_EVIL = `url(#${id}-rimEvil)`;   // თხემების განათება: მზისგან (მარცხნივ) ღია, ლავისგან (მარჯვნივ) წითელი
  let clipDefs = '';                            // clip-path-ები, რომლებიც ორივე ფენას სჭირდება
  let s = defs(id);
  // ხეობის ფერები: მარცხნივ — დილის; მარჯვნივ — დამწვარი, ბნელი
  const lg = (gid, a, b, x0, x1) => `<linearGradient id="${id}-${gid}" gradientUnits="userSpaceOnUse" x1="${x0}" y1="0" x2="${x1}" y2="0"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  // მიწის ყველა ფენა ერთ ადგილას და რბილად გადადის: მწვანე → ზეთისხილისფერი → დამწვარი ყავისფერი → მუქი
  // (ერთნაირი დიაპაზონი, რომ ფენების კიდეები გადასვლის ზოლში არ გამოჩნდეს)
  const BURN_X = [SPLIT - 70, SPLIT + 70];   // გადასვლა სიმეტრიულია ხმლის (ცენტრის) გარშემო
  const burn = (gid, green, dark) => `<linearGradient id="${id}-${gid}" gradientUnits="userSpaceOnUse" x1="${BURN_X[0]}" y1="0" x2="${BURN_X[1]}" y2="0">` +
    `<stop offset="0" stop-color="${green}"/><stop offset=".42" stop-color="${mix(green, '#8a8a4a', .55)}"/>` +
    `<stop offset=".58" stop-color="${mix(dark, '#6a4a32', .55)}"/><stop offset="1" stop-color="${dark}"/></linearGradient>`;
  s += `<defs>${lg('back', THEME.back, '#3a2838', SPLIT - 90, SPLIT + 110)}${lg('mid', THEME.mid, '#2a1c28', SPLIT - 90, SPLIT + 110)}${burn('g1', THEME.g1, '#2e1e22')}${burn('g2', THEME.g2, '#261a1c')}
    <linearGradient id="${id}-night" gradientUnits="userSpaceOnUse" x1="${SPLIT + 420}" y1="0" x2="${SPLIT - 30}" y2="0"><stop offset="0" stop-color="#12050e" stop-opacity=".8"/><stop offset=".55" stop-color="#12050e" stop-opacity=".5"/><stop offset="1" stop-color="#12050e" stop-opacity="0"/></linearGradient></defs>`;

  // მზე — მარცხნივ, სიკეთის ციხის უკან
  s += `<circle cx="690" cy="470" r="400" fill="url(#${id}-sunglow)"/><circle cx="690" cy="470" r="62" fill="${THEME.sun}"/>`;
  // დილის ღრუბლების ზოლები: მზის მხარეს ზემოდან ღია კიდე, ბოროტების მხარეს — ბნელი ზოლი
  s += cloud(430, 205, 260, THEME.cloud, .42, id, THEME.sun) + cloud(860, 290, 200, THEME.cloud2, .32, id, THEME.sun) + cloud(1300, 255, 280, '#3a2430', .7, id);
  s += birds(520, 300, 6, 19, THEME.birds);

  // ვულკანი ბოროტების მხარეს
  // ვულკანი შორს დგას: პატარა, უკანა ქედის უკან ღრმად ჩამჯდარი, ბურუსით მკრთალი
  const VOLCANO = [1490, 600, 190, 395];
  s += smoke(1490, 400, 280, '#1a1014', .6, id) + volcano(...VOLCANO, id, 'cone');

  // ციხე ქედის თხემზე, ქვეშ პატარა ჩრდილით (როგორც ანძა შენს ნიმუშზე)
  const onRidge = (h, cx, sc, haze, fill, type) =>
    `<ellipse cx="${cx}" cy="${P(h.y(cx) + 3)}" rx="${P(300 * sc)}" ry="${P(Math.max(2, 14 * sc))}" fill="#2a2350" opacity=".18"/>` +
    fortress(cx, P(h.y(cx) + 2), sc, { ...hazed(STONE, haze, Math.max(.15, .3 + (.2 - sc) * 2.2)), ground: fill, type, id });

  // უკანა ქედი — ყველაზე შორს: პატარა და მკრთალი ციხეები
  const back = hills(560, [[420, 60, 240], [820, 90, 210], [1180, 70, 200], [1560, 78, 220]], 6, 95, `url(#${id}-back)`, [[RIM, .22]]);
  s += back.svg;
  s += onRidge(back, 420, .065, THEME.backHaze, THEME.back, 'round') + onRidge(back, 820, .085, THEME.backHaze, THEME.back, 'keep');
  // შორეული ციხეებიდან გამომავალი ჯარი: სერპანტინით (სწორი მონაკვეთები, მომრგვალებული მოსახვევები) ჩამოდის ფერდობზე
  // და შუა ქედის უკან იმალება; წყვილ-წყვილად, თანაბარი მანძილით — შორიდან მოწესრიგებულ ხაზად იკითხება
  const FAR = { files: 2, gap: 30, tMax: .98 };
  const farGood = trail([[790, 600], [860, 566], [778, 532], [842, 500], [820, P(back.y(820) + 2)]], 10);
  s += road(farGood, 7, 3, THEME.farRoad);
  s += marchColumn(farGood, hazeAll(GOOD_ARMY, '#c9c3e0', .35), id, 85,
    { ...FAR, s0: .15, s1: .08, flag: ['#5a7cc0', '#f2e6d0', 'ring'] });
  const farRound = trail([[395, 612], [460, 586], [388, 558], [446, 530], [420, P(back.y(420) + 2)]], 10);
  s += road(farRound, 6, 3, THEME.farRoad);
  s += marchColumn(farRound, hazeAll(GOOD_ARMY, '#c9c3e0', .4), id, 89,
    { ...FAR, s0: .13, s1: .07, flag: ['#5a7cc0', '#f2e6d0', 'ring'] });
  s += fog(470, 130, .9, id);

  // შუა ქედი — სიკეთის ციხე მარცხნივ, ბნელი ციტადელი მარჯვნივ
  const mid = hills(628, [[250, 60, 220], [690, 85, 190], [1340, 90, 200]], 5, 96, `url(#${id}-mid)`, [[RIM, .32]]);
  s += mid.svg;
  // შუა ციხეები კლდოვან მწვერვალებზე დგას — მთის ნაწილია
  const midFill = `url(#${id}-mid)`;
  const gSum = summit(mid, 690, 72, 30, midFill, 121);
  s += gSum.svg;
  s += fortress(690, gSum.top + 3, .22, { ...hazed(STONE, THEME.midHaze, .25), ground: THEME.mid, type: 'georgian', id }) + lip(690, gSum.top + 3, 72, [midFill], 122, 'good');
  // შორეული ბილიკი ციხიდან: ზიგზაგით ჩამოდის და წინა ბორცვის უკან იმალება (ბორცვის ამ მხარეს ახლო გზა გრძელდება)
  const farG = trail([[775, 662], [640, 628], [760, 594], [655, 560], [700, 530], [681, gSum.top + 3]], 14);
  s += road(farG, 14, 5, THEME.farRoad) + marchColumn(farG, hazeAll(GOOD_ARMY, '#bcc6de', .2), id, 91,
    { ...FAR, gap: 28, s0: .3, s1: .14, bannerEvery: 5, flag: ['#2f62b8', '#f2d27a', 'ring'] });
  s += fog(545, 110, .7, id);

  // ბოროტების მხარე: ღამე და წითელი ნათება ჰორიზონტზე
  s += `<rect x="-200" y="-1400" width="2000" height="3200" fill="url(#${id}-night)"/>`;
  // ვულკანის ლავა — ღამის ჩრდილის ზემოთ (რომ ანათებდეს), მხოლოდ უკანა ქედის ზემოთ (ქედი მას ფარავს)
  let behindBack = '1150,-200';
  for (let x = 1150; x <= 1800; x += 10) behindBack += ` ${x},${P(back.y(x))}`;
  clipDefs += `<clipPath id="${id}-volcano"><polygon points="${behindBack} 1800,-200"/></clipPath>`;
  const volcanoClip = `<g clip-path="url(#${id}-volcano)">`;
  s += volcanoClip.replace('>', ' opacity=".82">') + within(volcanoClip, () => volcano(...VOLCANO, id, 'lava')) + '</g>';
  // ვარსკვლავები — მხოლოდ ბოროტების (ღამის) ნახევარში, ხმლის მარჯვნივ; ყოველი მეოთხე ციმციმებს (მოძრავ ფენაში), დანარჩენი უძრავია
  // (ყოველი მოძრავი ელემენტი ყოველ კადრზე სტილის გადათვლას ითხოვს — ამიტომ მათი რაოდენობა შეზღუდულია)
  const sr = rng(105);
  for (let k = 0; k < 90; k++) {
    const star = cls => `<circle${cls} cx="${P(SPLIT + 30 + sr() * 700)}" cy="${P(-1000 + sr() * 1300)}" r="${P(.7 + sr() * 1.1)}" fill="#fff" style="animation-delay:-${(sr() * 3).toFixed(2)}s"/>`;
    s += k % 4 ? star('') : anim(star(' class="twinkle"'));
  }
  s += `<ellipse cx="1320" cy="620" rx="400" ry="230" fill="url(#${id}-evilglow)" opacity=".5"/>`;
  s += smoke(1180, 490, 240, '#140c10', .55, id) + smoke(1340, 540, 300, '#140c10', .4, id);
  s += `<ellipse cx="1180" cy="${P(back.y(1180) + 3)}" rx="36" ry="2" fill="#000" opacity=".3"/>` +
    obsidianZiggurat(1180, P(back.y(1180) + 4), .15, { ...hazed(EVIL, '#5a4458', .3), id });
  // შორეული ციტადელიდან გამომავალი ლაშქარი — ჩანს მხოლოდ შუა ქედის და ბნელი ციტადელის მთის ზემოთ (ორივეს უკან იმალება)
  const eSum = summit(mid, 1340, 80, 36, `url(#${id}-crag)`, 123);
  let above = '960,0';
  for (let x = 960; x <= 1420; x += 5) above += ` ${x},${P(Math.min(mid.y(x), eSum.edge(x) + 2))}`;
  clipDefs += `<clipPath id="${id}-farEvil"><polygon points="${above} 1420,0"/></clipPath>`;
  const farEvil = trail([[1220, 610], [1135, 580], [1232, 548], [1150, 516], [1195, 494], [1180, P(back.y(1180) + 4)]], 10);
  const farOrcs = hazeAll(EVIL_ARMY, '#5a4458', .3), farGiant = hazed(GIANT, '#5a4458', .3);
  const farEvilClip = `<g clip-path="url(#${id}-farEvil)">`;
  s += farEvilClip + within(farEvilClip, () => road(farEvil, 7, 3, '#4a3438') +
    marchColumn(farEvil, farOrcs, id, 87,
      { ...FAR, s0: .16, s1: .08, torchEvery: 3, flag: ['#1a1418', '#e0402a', 'tri'] })) + '</g>';
  // ბნელი ციტადელი შავ კლდოვან მწვერვალზე, რომელიც ქვემოთ ქედში გადადის
  s += `<defs><linearGradient id="${id}-crag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1218"/><stop offset=".55" stop-color="#1c1218" stop-opacity=".9"/><stop offset="1" stop-color="#1c1218" stop-opacity="0"/></linearGradient></defs>`;
  s += eSum.svg + darkCitadel(1340, eSum.top + 4, .3, { ...EVIL, id }) + lip(1340, eSum.top + 3, 80, ['#1c1218'], 124, 'evil');
  const farE = trail([[1245, 668], [1405, 628], [1262, 590], [1390, 552], [1325, 520], [1340, eSum.top + 3]], 14);
  s += road(farE, 14, 5, '#3a2a2c') + marchColumn(farE, farOrcs, id, 93,
    { ...FAR, gap: 28, s0: .3, s1: .14, torchEvery: 3, giant: 11, giantC: farGiant, bannerEvery: 5, flag: ['#1a1418', '#e0402a', 'tri'] });

  // ბორცვები: მარცხნივ — მწვანე ტყე, მარჯვნივ — ეკლიანი კლდეები და დამწვარი ხეები
  s += `<g transform="translate(1600,0) scale(-1,1)">${crags(-200, 1600 - SPLIT - 60, 655, 70, 101, '#1e141a')}</g>`;
  // წინა ბორცვი — ორი თხემით, რომლებზეც ახლო გზები გადადის; თხემი მზისგან ანათებს, ლავისგან წითლდება
  const near = hills(640, [[760, 26, 150], [1260, 26, 150]], 4, 91, `url(#${id}-g1)`, [[RIM, .5], [RIM_EVIL, .45]]);
  s += near.svg;
  s += forest(-50, 1180, 628, 662, 60, .32, .46, THEME.forest, THEME.forestShade, 97, [[715, 805], [800, 1220]], .3);
  s += deadForest(SPLIT + 70, 1660, 630, 664, 26, .3, .45, 103);
  s += ridge(672, 12, 93, `url(#${id}-g2)`, 8, [[RIM, .35], [RIM_EVIL, .3]]);
  s += `<rect x="-200" y="890" width="2000" height="800" fill="url(#${id}-g2)"/>`;   // მიწის გაგრძელება ქვემოთ (ტელეფონზე ჩანს)
  s += ruin(1250, 698, .8, id) + ruin(1440, 690, .75, id) + ruin(1645, 700, .85, id);

  // ცენტრში — ხმალი ქვაში, გვირგვინით
  s += mound(1010, 712, 360, 100, `url(#${id}-g2)`);   // იგივე ფერი, რაც მიწას — გადასვლის ზოლში კიდე არ ჩანს
  s += swordInStone(1010, 640, .6, STONE, id);

  // ლავის მდინარე: ბორცვს მიღმიდან გამოედინება — ზემოთ ვიწროა და ბორცვის ხაზთან იმალება, ქვემოთ ფართოვდება
  const lavaP = [[1488, 598], [1515, 700], [1585, 790], [1705, 950]];
  let lavaEdge = '';
  for (let x = -200; x <= 1800; x += 10) lavaEdge += ` ${x},${P(near.y(x))}`;
  s += `<defs><clipPath id="${id}-lavaClip"><polygon points="-200,${H + 800}${lavaEdge} 1800,${H + 800}"/></clipPath></defs>`;
  s += `<g clip-path="url(#${id}-lavaClip)">`;
  const lavaW = y => Math.max(3, 200 * (y - 628) / (950 - 628));   // სიგანე სიღრმის მიხედვით: ბორცვთან ვიწრო, ახლოს ფართო
  s += road(lavaP, lavaW, 0, '#ff5a14').replace('/>', ` filter="url(#${id}-blur)" opacity=".9"/>`) + road(lavaP, lavaW, 0, `url(#${id}-lava)`);
  for (const t of [.26, .42, .57, .71, .85]) {                 // გაცივებული ქერქის ლაქები
    const [x, y] = bez(lavaP, t), rx = lavaW(y) * .22;
    s += `<ellipse cx="${P(x)}" cy="${P(y)}" rx="${P(rx)}" ry="${P(rx * .22)}" fill="#3a1810" opacity=".75"/>`;
  }
  const shine = [];                                              // ნათელი ნაკადი შუაში
  for (let t = .12; t <= 1; t += .04) { const [x, y] = bez(lavaP, t), [nx, ny] = normal(lavaP, t), o = -lavaW(y) * .18; shine.push(`${P(x + nx * o)},${P(y + ny * o)}`); }
  s += `<polyline points="${shine.join(' ')}" stroke="#fff2a8" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/></g>`;
  const cracks = 'M1220,720 L1250,732 L1272,726 L1290,742 M1420,750 L1446,762 L1470,756 M1230,800 L1262,812 L1280,806 L1300,822 M1450,850 L1478,842 L1500,858';
  s += `<path d="${cracks}" stroke="#ff5a14" stroke-width="7" fill="none" opacity=".35" stroke-linejoin="round"/><path d="${cracks}" stroke="#ffb43a" stroke-width="2.4" fill="none" stroke-linejoin="round"/>`;
  s += embers(SPLIT + 30, 1650, 440, 880, 34, 107);

  // ახლო გზები Y-ს ფორმით: ქვემოდან ერთი ფართო გზა მოდის, შეერთების წერტილში (FORK) ორად იყოფა
  // და ორივე განშტოება ბორცვზე ადის, თხემზე იკარგება. ყველა ნაწილს ერთი ფერი აქვს (სიკეთის მხარეს ქვიშა, ბოროტების — მუქი)
  const FORK = [SPLIT, FORK_Y];
  const roadW = y => Math.max(8, 140 * (y - 596) / 220);          // სიგანე სიღრმის მიხედვით
  const goodPath = [FORK, [905, 806], [782, 716], [760, P(near.y(760) + 3)]];
  const evilPath = [FORK, [1115, 806], [1238, 716], [1260, P(near.y(1260) + 3)]];
  const roadFill = `url(#${id}-trunk)`;
  s += `<defs><linearGradient id="${id}-trunk" gradientUnits="userSpaceOnUse" x1="${SPLIT - 120}" y1="0" x2="${SPLIT + 120}" y2="0">` +
    `<stop offset="0" stop-color="${THEME.road}"/><stop offset=".5" stop-color="#a6876a"/><stop offset="1" stop-color="#5a4038"/></linearGradient></defs>`;
  // ბორცვის ხაზი: ქვემოთ — ბორცვზე (გზა), ზემოთ — ბორცვს მიღმა (თხემს გადაღმა ჩამავალი ჯარი)
  let nearLine = '';
  for (let x = -200; x <= 1800; x += 10) nearLine += ` ${x},${P(near.y(x))}`;
  s += `<defs><clipPath id="${id}-onNear"><polygon points="-200,${H + 400}${nearLine} 1800,${H + 400}"/></clipPath></defs>`;
  clipDefs += `<clipPath id="${id}-overNear"><polygon points="-200,-400${nearLine} 1800,-400"/></clipPath>`;
  // გზა თხემს გადაღმა გრძელდება და ზუსტად ბორცვის ხაზთან იმალება
  const goodRoad = [goodPath[0], goodPath[1], goodPath[2], [757, P(near.y(757) - 14)]];
  const evilRoad = [evilPath[0], evilPath[1], evilPath[2], [1263, P(near.y(1263) - 14)]];
  s += `<g clip-path="url(#${id}-onNear)">${road(goodRoad, roadW, 0, roadFill)}${road(evilRoad, roadW, 0, roadFill)}</g>`;
  s += `<g stroke="${roadFill}" stroke-width="2" stroke-linejoin="round">${road([[SPLIT, 1650], [SPLIT, 1200], [SPLIT, 960], [SPLIT, 840]], roadW, 0, roadFill)}</g>`;   // stroke ფარავს ნაკერს
  s += `<ellipse cx="${SPLIT}" cy="770" rx="40" ry="11" fill="${roadFill}"/>`;   // განშტოებებს შორის კუთხეს არბილებს
  // გარე კუთხეების მომრგვალება იქ, სადაც განშტოება ფართო გზიდან გამოდის (dir: -1 — სიკეთის მხარე, 1 — ბოროტების)
  const fillet = (p, dir) => {
    const edge = t => {
      const [x, y] = bez(p, t), [nx, ny] = normal(p, t), w = roadW(y) / 2, a = [x + nx * w, y + ny * w], b = [x - nx * w, y - ny * w];
      return dir * (a[0] - SPLIT) > dir * (b[0] - SPLIT) ? a : b;                  // გარე კიდე
    };
    let tc = 0;
    while (tc < .6 && dir * (edge(tc)[0] - SPLIT) <= roadW(edge(tc)[1]) / 2) tc += .005;   // სად გამოდის კიდე ფართო გზიდან
    const C = edge(tc), B = edge(Math.min(1, tc + .16)), ay = C[1] + 70, A = [SPLIT + dir * roadW(ay) / 2, ay];
    return `<path d="M${P(A[0])},${P(A[1])} L${P(C[0])},${P(C[1])} L${P(B[0])},${P(B[1])} Q${P(C[0])},${P(C[1])} ${P(A[0])},${P(A[1])} Z" fill="${roadFill}" stroke="${roadFill}" stroke-width="2" stroke-linejoin="round"/>`;   // stroke ფარავს ნაკერს
  };
  s += fillet(goodPath, -1) + fillet(evilPath, 1);
  // თხემს გადაღმა ჩამავალი რიგები: ყოველი შემდეგი უფრო დაბლაა ჩასული — ჯერ თავები ჩანს, მერე მხოლოდ შუბის წვერები
  const overNearClip = `<g clip-path="url(#${id}-overNear)">`;
  const overCrest = (cx, dir, colors, seed, o) => overNearClip + within(overNearClip, () => {
    const r = rng(seed), cy = near.y(cx); let g = '';
    for (let k = 4; k >= 1; k--) {
      const sc = .42 * (1 - k * .05), by = cy + 2 + k * 8, bx = cx + dir * k * 3;
      if (o.giant && k === 3) g += giant(bx, by, sc, GIANT, id);     // გოლიათის თავი და კეტი თხემს მიღმიდან მოჩანს
      else for (const side of [-1, 0, 1]) g += soldier(bx + side * 17 * sc, by, sc, colors[Math.floor(r() * colors.length)], r() < .7 ? 'spear' : 'shield', false, o.torch && r() < o.torch, id);
      if (k === 2) g += banner(bx + 22 * sc, by, 74 * sc, ...o.flag, sc * .75);
    }
    return g;
  }) + '</g>';
  s += overCrest(760, -1, GOOD_ARMY, 95, { flag: ['#2f62b8', '#f2d27a', 'ring'] });
  s += overCrest(1260, 1, EVIL_ARMY, 97, { torch: .2, giant: true, flag: ['#1a1418', '#e0402a', 'tri'] });
  s += marchColumn(goodPath, GOOD_ARMY, id, 81,
    { s0: 1.25, s1: .42, tMin: .14, tMax: .97, flag: ['#2f62b8', '#f2d27a', 'ring'] });
  s += marchColumn(evilPath, EVIL_ARMY, id, 83,
    { s0: 1.25, s1: .42, tMin: .14, tMax: .97, torch: .12, giant: 8, flag: ['#1a1418', '#e0402a', 'tri'] });

  for (const [x, y, sc] of [[470, 880, 1.7], [540, 910, 2.1], [380, 905, 1.6]]) s += tree(x, y, sc, THEME.tree, THEME.treeShade);
  for (const [x, y, sc] of [[1480, 900, 2], [1560, 880, 1.7]]) s += deadTree(x, y, sc);

  // clip-path-ები (ჯარი ქედის / თხემის უკან) ორივე ფენას სჭირდება
  return { bg: s + `<defs>${clipDefs}</defs>`, fx: defs(id) + `<defs>${clipDefs}</defs>` + takeAnim() };
}
