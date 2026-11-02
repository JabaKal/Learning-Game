// ციხე-სიმაგრეები: სიკეთის ციხეები და ბოროტების ციტადელები
import { P } from './utils.js';
import { anim } from './fx.js';

// ---------- გალავნიანი ციხე-სიმაგრე (X–XV საუკუნე) ----------
export function fortress(x, y, s, c) {
  const tf = `<g transform="translate(${x},${y}) scale(${s})">`;
  const tex = el => c.texture ? el.replace(/fill="[^"]*"/, `fill="url(#${c.id}-stone)"`) : '';
  const block = (x1, y1, w, h, fill = c.wall) => { const r = `<rect x="${x1}" y="${y1}" width="${w}" height="${h}" fill="${fill}"/>`; return r + tex(r); };
  const cren = (x1, x2, top) => { let g = ''; for (let cx = x1; cx <= x2 - 7; cx += 13) g += `<rect x="${cx}" y="${top - 9}" width="7.5" height="9.5" fill="${c.wall}"/>`; return g; };
  const slit = (sx, sy) => `<rect x="${P(sx - 1.8)}" y="${sy}" width="3.6" height="13" rx="1.5" fill="${c.dark}"/>`;
  const pennant = (px, py) =>   // ტარი უძრავია, დროშა ფრიალებს მოძრავ ფენაში
    `<line x1="${px}" y1="${py}" x2="${px}" y2="${py - 50}" stroke="${c.dark}" stroke-width="3"/>` +
    anim(`<g class="flag" style="animation-delay:-${(Math.random() * 2).toFixed(2)}s"><path d="M${px},${py - 50} L${px + 38},${py - 44} L${px + 34},${py - 37} L${px},${py - 32} Z" fill="${c.flag}"/></g>`, tf);

  // კვადრატული კოშკი სათოფურებით
  const sqTower = (cx, base, w, h, o = {}) => {
    const x1 = cx - w / 2, top = base - h;
    let g = block(x1, top, w, h) + `<rect x="${P(x1 + w * .6)}" y="${top}" width="${P(w * .4)}" height="${h}" fill="${c.shade}"/>`;
    g += `<rect x="${x1 - 4}" y="${top - 7}" width="${w + 8}" height="8" fill="${c.wall}"/><rect x="${P(x1 + w * .6)}" y="${top - 7}" width="${P(w * .4 + 4)}" height="8" fill="${c.shade}"/>`;
    for (let k = x1 - 2; k < x1 + w + 2; k += 8) g += `<rect x="${k}" y="${top + 1}" width="4" height="4" fill="${c.dark}" opacity=".35"/>`;
    if (o.roof) {
      g += `<polygon points="${x1 - 6},${top - 7} ${cx},${top - 7 - o.roof} ${x1 + w + 6},${top - 7}" fill="${c.roof}"/><polygon points="${cx},${top - 7 - o.roof} ${x1 + w + 6},${top - 7} ${cx},${top - 7}" fill="${c.roofShade}"/>`;
    } else g += cren(x1 - 4, x1 + w + 4, top - 7);
    for (let sy = top + 20; sy < base - 26; sy += 36) g += slit(cx - w * .15, sy);
    if (o.flag) g += pennant(cx, top - 7 - (o.roof || 9));
    return g;
  };

  // მრგვალი კუთხის კოშკი
  const roundTower = (cx, base, w, h) => {
    const x1 = cx - w / 2, top = base - h;
    let g = block(x1, top, w, h) + `<rect x="${P(x1 + w * .62)}" y="${top}" width="${P(w * .38)}" height="${h}" fill="${c.shade}"/>` +
      `<rect x="${P(x1 + w * .1)}" y="${top}" width="${P(w * .12)}" height="${h}" fill="#fff" opacity=".1"/>`;
    g += `<rect x="${x1 - 5}" y="${top - 9}" width="${w + 10}" height="10" fill="${c.wall}"/><rect x="${P(x1 + w * .62)}" y="${top - 9}" width="${P(w * .38 + 5)}" height="10" fill="${c.shade}"/>`;
    g += cren(x1 - 5, x1 + w + 5, top - 9);
    g += `<polygon points="${x1 - 7},${base} ${x1},${base - 24} ${x1 + w},${base - 24} ${x1 + w + 7},${base}" fill="${c.shade}"/>`;
    for (let sy = top + 22; sy < base - 40; sy += 40) g += slit(cx - w * .12, sy);
    return g;
  };

  // ჯვარ-გუმბათოვანი ეკლესია
  const church = (cx, base) => {
    let g = block(cx - 55, base - 62, 110, 62, c.wall2) + `<rect x="${cx + 12}" y="${base - 62}" width="43" height="62" fill="${c.shade}"/>`;
    g += `<polygon points="${cx - 61},${base - 62} ${cx},${base - 94} ${cx + 61},${base - 62}" fill="${c.roof2}"/><polygon points="${cx},${base - 94} ${cx + 61},${base - 62} ${cx},${base - 62}" fill="${c.roofShade2}"/>`;
    g += block(cx - 16, base - 134, 32, 44, c.wall2) + `<rect x="${cx + 4}" y="${base - 134}" width="12" height="44" fill="${c.shade}"/>`;
    g += `<rect x="${cx - 8}" y="${base - 124}" width="5" height="14" rx="2.5" fill="${c.dark}"/><rect x="${cx + 4}" y="${base - 124}" width="5" height="14" rx="2.5" fill="${c.dark}"/>`;
    g += `<polygon points="${cx - 20},${base - 134} ${cx},${base - 166} ${cx + 20},${base - 134}" fill="${c.roof2}"/><polygon points="${cx},${base - 166} ${cx + 20},${base - 134} ${cx},${base - 134}" fill="${c.roofShade2}"/>`;
    g += `<rect x="${cx - 1.3}" y="${base - 182}" width="2.6" height="16" fill="${c.gold}"/><rect x="${cx - 5.5}" y="${base - 177}" width="11" height="2.6" fill="${c.gold}"/>`;
    return g;
  };

  // სხვადასხვა ტიპის ციხე — რომ ყველა ციხე ერთნაირი არ იყოს
  const cone = (cx, top, w, h, red) =>
    `<polygon points="${cx - w / 2 - 6},${top} ${cx},${top - h} ${cx + w / 2 + 6},${top}" fill="${red ? c.roof : c.slate}"/><polygon points="${cx},${top - h} ${cx + w / 2 + 6},${top} ${cx},${top}" fill="${red ? c.roofShade : c.slateShade}"/>`;
  const gate = (gx, gy, w) => `<path d="M${gx - w},${gy} V${P(gy - w * 2.6)} A${w},${w} 0 0 1 ${gx + w},${P(gy - w * 2.6)} V${gy} Z" fill="${c.dark}"/>`;
  const hilltop = (w, d) => `<polygon points="${-w},12 ${-w + 110},${-d} ${w - 110},${-d} ${w},12" fill="${c.ground}"/>`;
  const wrap = g => tf + g + '</g>';

  if (c.type === 'keep') {          // ნორმანული დონჟონი: დიდი კვადრატული კოშკი კუთხის ბურჯებით
    let g = hilltop(260, 60) + sqTower(0, -40, 170, 250);
    for (const tx of [-71, 71]) g += block(tx - 14, -340, 28, 50) + `<rect x="${tx + 2}" y="-340" width="12" height="50" fill="${c.shade}"/>` + cone(tx, -340, 28, 36);
    g += pennant(0, -306);
    g += block(-220, -74, 440, 74) + `<rect x="-220" y="-16" width="440" height="16" fill="${c.shade}" opacity=".55"/>` + cren(-220, 220, -74) + gate(0, 0, 17);
    g += roundTower(-220, 0, 54, 120) + roundTower(220, 0, 54, 120);
    return wrap(g);
  }
  if (c.type === 'round') {         // მრგვალი კოშკები მაღალი კონუსური სახურავებით
    let g = hilltop(300, 70) + block(-170, -134, 340, 60) + cren(-170, 170, -134);
    g += roundTower(-170, -74, 54, 150) + cone(-170, -233, 54, 70) + roundTower(170, -74, 54, 130) + cone(170, -213, 54, 62);
    g += roundTower(0, -50, 100, 250) + cone(0, -309, 100, 120) + pennant(0, -429);
    g += block(-240, -92, 480, 92) + `<rect x="-240" y="-18" width="480" height="18" fill="${c.shade}" opacity=".55"/>` + cren(-240, 240, -92);
    g += roundTower(-38, 0, 46, 132) + cone(-38, -141, 46, 50) + roundTower(38, 0, 46, 132) + cone(38, -141, 46, 50) + gate(0, 0, 16);
    g += roundTower(-240, 0, 66, 165) + cone(-240, -174, 66, 84) + roundTower(240, 0, 66, 165) + cone(240, -174, 66, 84);
    return wrap(g);
  }
  if (c.type === 'georgian') {      // ქართული ციხე: საფეხურებიანი გალავანი, მაღალი კოშკები, გუმბათოვანი ეკლესია
    let g = hilltop(300, 90);
    g += sqTower(-160, -70, 72, 250, { roof: 62, flag: true }) + church(50, -96) + sqTower(190, -60, 62, 175, { roof: 52 });
    const wallP = `<polygon points="-270,0 -270,-84 -120,-84 -120,-112 130,-112 130,-84 270,-84 270,0" fill="${c.wall}"/>`;
    g += wallP + tex(wallP) + `<rect x="-270" y="-18" width="540" height="18" fill="${c.shade}" opacity=".55"/>`;
    g += cren(-270, -120, -84) + cren(-120, 130, -112) + cren(130, 270, -84) + gate(-40, 0, 18);
    g += roundTower(-270, 0, 48, 118) + roundTower(270, 0, 48, 118);
    return wrap(g);
  }
  return '';
}

// ---------- ბოროტების მხარე ----------
// ბნელი ციტადელი: წვეტიანი კოშკები, ეკლიანი გვირგვინი, წითლად მანათობელი ფანჯრები
export function darkCitadel(x, y, s, c) {
  const glowWin = (wx, wy) => `<circle cx="${wx}" cy="${wy + 8}" r="16" fill="url(#${c.id}-glow)" opacity=".8"/><rect x="${wx - 2.5}" y="${wy}" width="5" height="16" fill="${c.win}"/>`;
  const spire = (cx, base, w, h, crown) => {
    const tw = w * .62, top = base - h;
    let g = `<polygon points="${cx - w / 2},${base} ${P(cx - tw / 2)},${top} ${P(cx + tw / 2)},${top} ${cx + w / 2},${base}" fill="${c.stone}"/>`;
    g += `<polygon points="${P(cx + w * .08)},${base} ${P(cx + tw * .08)},${top} ${P(cx + tw / 2)},${top} ${cx + w / 2},${base}" fill="${c.shade}"/>`;
    g += `<polygon points="${cx - w / 2},${base} ${P(cx - tw / 2)},${top} ${P(cx - tw / 2 + 4)},${top} ${cx - w / 2 + 7},${base}" fill="${c.rim}" opacity=".6"/>`;
    g += `<polygon points="${cx - w / 2 - 14},${base} ${cx - w / 2},${P(base - h * .35)} ${cx - w / 2 + 2},${base}" fill="${c.stone}"/><polygon points="${cx + w / 2 + 14},${base} ${cx + w / 2},${P(base - h * .35)} ${cx + w / 2 - 2},${base}" fill="${c.shade}"/>`;
    if (crown) {
      let pts = `${P(cx - tw / 2 - 8)},${top + 6}`;
      for (let i = 0; i < 5; i++) {
        const sx = cx - tw / 2 + tw * (i + .5) / 5, sw = tw / 5 * .45, sh = i === 2 ? h * .32 : (i % 2 ? h * .12 : h * .18);
        pts += ` ${P(sx - sw)},${top} ${P(sx)},${P(top - sh)} ${P(sx + sw)},${top}`;
      }
      g += `<circle cx="${cx}" cy="${top - 10}" r="${w * 1.1}" fill="url(#${c.id}-evilglow)"/>`;
      g += `<polygon points="${pts} ${P(cx + tw / 2 + 8)},${top + 6}" fill="${c.stone}"/>`;
      g += `<path d="M${P(cx - tw / 2)},${top + 14} Q${P(cx - tw / 2 - w * .7)},${P(top - h * .02)} ${P(cx - tw / 2 - w * .55)},${P(top - h * .2)} Q${P(cx - tw / 2 - w * .35)},${P(top - h * .02)} ${P(cx - tw / 2 + 2)},${top + 30} Z" fill="${c.stone}"/>`;
      g += `<path d="M${P(cx + tw / 2)},${top + 14} Q${P(cx + tw / 2 + w * .7)},${P(top - h * .02)} ${P(cx + tw / 2 + w * .55)},${P(top - h * .2)} Q${P(cx + tw / 2 + w * .35)},${P(top - h * .02)} ${P(cx + tw / 2 - 2)},${top + 30} Z" fill="${c.shade}"/>`;
    } else {
      g += `<polygon points="${P(cx - tw / 2 - 5)},${top} ${cx},${P(top - h * .45)} ${P(cx + tw / 2 + 5)},${top}" fill="${c.stone}"/><polygon points="${cx},${P(top - h * .45)} ${P(cx + tw / 2 + 5)},${top} ${cx},${top}" fill="${c.shade}"/>`;
    }
    for (let wy = top + 26; wy < base - 40; wy += 48) g += glowWin(cx, wy);
    return g;
  };
  let g = `<polygon points="-260,14 -220,-30 -150,-20 -120,-48 120,-48 160,-24 230,-34 260,14" fill="${c.rock}"/>`; // კლდოვანი საძირკველი
  g += spire(-150, -30, 50, 210) + spire(150, -30, 50, 180);
  g += spire(0, -40, 96, 420, true);                                                                           // მთავარი კოშკი
  let teeth = '';
  for (let tx = -190; tx < 190; tx += 19) teeth += `${tx},-120 ${tx + 9.5},-142 `;
  g += `<rect x="-190" y="-120" width="380" height="96" fill="${c.stone}"/><rect x="20" y="-120" width="170" height="96" fill="${c.shade}"/>`;
  g += `<polygon points="-190,-119 ${teeth}190,-120 190,-119" fill="${c.stone}"/>`;                           // კედელი სამკუთხა კბილებით
  g += `<circle cx="0" cy="-55" r="70" fill="url(#${c.id}-evilglow)"/><path d="M-26,-24 L-26,-70 Q-26,-96 0,-112 Q26,-96 26,-70 L26,-24 Z" fill="#12080a"/>`;
  g += `<path d="M-18,-24 V-80 M-6,-24 V-98 M6,-24 V-98 M18,-24 V-80" stroke="${c.win}" stroke-width="2" opacity=".55"/>`; // კარიბჭე
  g += spire(-205, -20, 44, 150) + spire(205, -20, 44, 140);
  for (let k = -240; k <= 240; k += 22) g += `<polygon points="${k - 4},-14 ${k + 8},-46 ${k + 6},-12" fill="${c.shade}"/>`; // ეკლები
  return `<g transform="translate(${x},${y}) scale(${s})">${g}</g>`;
}

// ბნელი ციტადელის მეორე ტიპი: ობსიდიანის საფეხურებიანი პირამიდა (ზიკურატი) ლავის ღარით და ცეცხლით თავზე
export function obsidianZiggurat(x, y, s, c) {
  const tf = `<g transform="translate(${x},${y}) scale(${s})">`;
  const flame = (fx, fy, k) => `<circle cx="${fx}" cy="${fy - 8}" r="${22 * k}" fill="url(#${c.id}-glow)"/>` +   // ნათება უძრავია, ალი — მოძრავ ფენაში
    anim(`<path d="M${fx - 7 * k},${fy} Q${fx - 9 * k},${fy - 14 * k} ${fx},${fy - 28 * k} Q${fx + 9 * k},${fy - 14 * k} ${fx + 7 * k},${fy} Z" fill="#ff8a2a" class="flicker"/>`, tf);
  let g = `<polygon points="-290,14 -250,-14 250,-14 290,14" fill="${c.rock}"/>`;
  const tiers = [[440, 0], [340, -70], [240, -140], [140, -210]];
  for (const [w, base] of tiers) {
    const top = base - 70, hw = w / 2;
    g += `<polygon points="${-hw},${base} ${-hw + 14},${top} ${hw - 14},${top} ${hw},${base}" fill="${c.stone}"/>`;
    g += `<polygon points="${P(hw * .35)},${base} ${P(hw * .35)},${top} ${hw - 14},${top} ${hw},${base}" fill="${c.shade}"/>`;
    g += `<rect x="${-hw + 14}" y="${top}" width="${w - 28}" height="4" fill="${c.rim}" opacity=".5"/>`;
    for (let sx = -hw + 22; sx < hw - 20; sx += 22) g += `<polygon points="${sx - 5},${top} ${sx},${top - 11} ${sx + 5},${top}" fill="${c.stone}"/>`;
    g += flame(-hw + 20, top, .8) + flame(hw - 20, top, .8);
  }
  // კიბე და ლავის ღარი შუაში
  g += `<rect x="-26" y="-280" width="52" height="280" fill="${c.shade}"/>`;
  for (let sy = -270; sy < 0; sy += 14) g += `<rect x="-26" y="${sy}" width="52" height="3" fill="${c.stone}"/>`;
  g += `<rect x="-9" y="-280" width="18" height="280" fill="#ff5a14" filter="url(#${c.id}-blur)" opacity=".7"/><rect x="-5" y="-280" width="10" height="280" fill="url(#${c.id}-lava)"/>`;
  // სალოცავი რქებით და უზარმაზარი ცეცხლი თავზე
  g += `<rect x="-40" y="-340" width="80" height="62" fill="${c.stone}"/><rect x="8" y="-340" width="32" height="62" fill="${c.shade}"/>`;
  g += `<path d="M-40,-334 Q-80,-370 -66,-420 Q-58,-376 -30,-352 Z M40,-334 Q80,-370 66,-420 Q58,-376 30,-352 Z" fill="${c.stone}"/>`;
  g += `<circle cx="0" cy="-380" r="90" fill="url(#${c.id}-evilglow)"/>` + flame(0, -340, 2.6);
  // კარიბჭე ძირში
  g += `<circle cx="0" cy="-30" r="60" fill="url(#${c.id}-evilglow)"/><path d="M-30,0 V-44 L0,-66 L30,-44 V0 Z" fill="#12080a"/><path d="M-20,0 V-46 M0,0 V-60 M20,0 V-46" stroke="${c.win}" stroke-width="2.4" opacity=".6"/>`;
  return tf + g + '</g>';
}

export const EVIL = { stone: '#2c2230', shade: '#1a141e', rim: '#d0502a', rock: '#1c1418', win: '#ff6a2a' };

export const STONE = {
  wall: '#dccdb0', shade: '#b5a484', wall2: '#e8dcc4', roof: '#a5513f', roofShade: '#84402f', slate: '#5d6c8c', slateShade: '#4a5672',
  rock: '#8c8174', rockShade: '#6f655b', rockLight: '#a89d8f', rockDark: '#4f473f',
  roof2: '#8f8a78', roofShade2: '#757060', dark: '#4a3a30', gold: '#e0ad3e', flag: '#d63a2f', ground: '#5f9d69'
};
