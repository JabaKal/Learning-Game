// ცენტრალური ობიექტი: ხმალი ქვაში, გვირგვინით
import { P } from './utils.js';
import { embers } from './nature.js';

// ---------- ცენტრალური ობიექტი (მთავარი ციხის ნაცვლად) ----------
// ხმალი ქვაში: ძველი სვეტების წრე, შუაში ქვაში ჩარჭობილი ორმხრივი ხმალი
export function swordInStone(x, y, s, c, id) {
  const pillar = (a, h, broken) => {
    const px = P(205 * Math.cos(a * Math.PI / 180)), py = P(-16 + 32 * Math.sin(a * Math.PI / 180));
    let g = `<rect x="${px - 11}" y="${py - h}" width="22" height="${h}" fill="${c.wall}"/><rect x="${px + 3}" y="${py - h}" width="8" height="${h}" fill="${c.shade}"/>`;
    g += broken ? `<polygon points="${px - 11},${py - h} ${px - 4},${py - h - 12} ${px + 3},${py - h - 4} ${px + 11},${py - h - 16} ${px + 11},${py - h}" fill="${c.wall}"/>`
                : `<rect x="${px - 15}" y="${py - h - 8}" width="30" height="8" fill="${c.wall2}"/>`;
    return g;
  };
  let g = `<polygon points="-40,-200 40,-200 130,-900 -130,-900" fill="url(#${id}-beam)" opacity=".55"/>`;
  g += `<ellipse cx="0" cy="0" rx="262" ry="46" fill="${c.rockShade}"/><ellipse cx="0" cy="-10" rx="232" ry="38" fill="${c.shade}"/><ellipse cx="0" cy="-22" rx="192" ry="30" fill="${c.wall}"/>`;
  g += `<ellipse cx="0" cy="-22" rx="150" ry="22" fill="none" stroke="#9fe0ff" stroke-width="4" opacity=".85" class="pulse"/>`;
  g += pillar(200, 130) + pillar(250, 100, true) + pillar(290, 140) + pillar(340, 110, true);
  // ხმალი ქვაში: მარცხენა ნახევარი — სიკეთის (ვერცხლი, ოქრო, ლურჯი თვალი), მარჯვენა — ბოროტების (შავი ფოლადი, წითელი ბზარები)
  g += `<circle cx="-40" cy="-240" r="140" fill="url(#${id}-cglow)" class="pulse"/><circle cx="40" cy="-232" r="125" fill="url(#${id}-evilglow)" class="pulse"/>`;
  g += '<g transform="translate(0,-84) scale(1.1) translate(0,84)">';   // ხმლის ზომა; ქვაში ჩარჭობილი წერტილი უცვლელია
  g += `<polygon points="-20,-332 0,-332 0,-80 -13,-80" fill="#eef3f9"/><polygon points="-20,-332 -13,-332 -9,-80 -13,-80" fill="#c9d6e6"/>` +
    `<line x1="-4" y1="-322" x2="-3" y2="-92" stroke="#9fb4cf" stroke-width="2"/>`;
  g += `<polygon points="0,-332 20,-332 13,-80 0,-80" fill="#2a2030"/><line x1="4" y1="-322" x2="3" y2="-92" stroke="#120c14" stroke-width="2"/>`;
  const cracks = 'M2,-304 L9,-284 L5,-266 L11,-244 M3,-214 L8,-194 L4,-174 M2,-144 L9,-124 L6,-104';
  g += `<path d="${cracks}" stroke="#ff3a1a" stroke-width="6" fill="none" opacity=".35"/><path d="${cracks}" stroke="#ff7a2a" stroke-width="2.2" fill="none"/>`;
  // ოქროს გვირგვინი, დახრილად ჩამოკიდებული ჯვარედინის მარცხენა (სიკეთის) მკლავზე: უკანა ნაწილი მკლავის უკან, წინა — წინ
  // ჩამოკიდების წერტილი მკლავზეა (-58,-342): გვირგვინის უკანა ნაპირი მკლავს ეყრდნობა, სხეული ქვემოთ ეკიდება და ოდნავ ქანაობს
  const crownAt = inner => `<g transform="translate(-58,-342)"><g class="swing"><g transform="rotate(-22) scale(1.2) translate(0,23)">${inner}</g></g></g>`;
  const yTop = cx => P(-16 + 7 * Math.sqrt(1 - (cx / 28) ** 2));
  const tipList = [[-24, 16], [-18, 5], [-12, 20], [-6, 6], [0, 24], [6, 6], [12, 20], [18, 5], [24, 16]];
  const tipPts = list => list.map(([tx, th]) => `${tx},${P(yTop(tx) - th)}`).join(' ');
  g += crownAt(`<circle cx="0" cy="-14" r="44" fill="url(#${id}-glow)" opacity=".55"/><ellipse cx="0" cy="-16" rx="28" ry="7" fill="#8a5a1a"/>` +
    `<polygon points="-16,-21 -12,-34 -8,-22" fill="#c8952e"/><polygon points="8,-22 12,-34 16,-21" fill="#c8952e"/>`);
  const crownFront = crownAt(
    `<polygon points="-28,${yTop(-28)} ${tipPts(tipList)} 28,${yTop(28)}" fill="#f2c44e"/>` +
    `<polygon points="0,${yTop(0)} ${tipPts(tipList.filter(([tx]) => tx >= 0))} 28,${yTop(28)}" fill="#d9a23a" opacity=".55"/>` +
    `<path d="M-28,0 A28,7 0 0 0 28,0 L28,-16 A28,7 0 0 1 -28,-16 Z" fill="#f2c44e"/><path d="M0,7 A28,7 0 0 0 28,0 L28,-16 A28,7 0 0 1 0,-9 Z" fill="#d9a23a" opacity=".55"/>` +
    `<path d="M-28,-4 A28,7 0 0 0 28,-4" stroke="#b8862a" stroke-width="2" fill="none"/>` +
    [[-24, 16], [-12, 20], [0, 24], [12, 20], [24, 16]].map(([tx, th]) => `<circle cx="${tx}" cy="${P(yTop(tx) - th - 2)}" r="3.2" fill="#ffe27a"/>`).join('') +
    `<circle cx="0" cy="-2" r="5.5" fill="#e0302a"/><circle cx="-1.5" cy="-3.5" r="1.6" fill="#fff" opacity=".8"/>` +
    `<circle cx="-16" cy="-3" r="3.6" fill="#4aa8ff"/><circle cx="16" cy="-3" r="3.6" fill="#4aa8ff"/>`);
  g += `<path d="M0,-346 L-58,-350 Q-74,-352 -82,-368 Q-70,-356 -58,-334 L0,-330 Z" fill="#e8b84a"/><path d="M0,-339 L-60,-343" stroke="#fff3c0" stroke-width="2" opacity=".7"/>`;
  g += `<path d="M0,-346 L58,-350 Q74,-352 84,-370 Q72,-356 58,-334 L0,-330 Z" fill="#1e1820"/>` +
    `<polygon points="18,-347 24,-362 30,-348" fill="#1e1820"/><polygon points="40,-349 46,-364 52,-350" fill="#1e1820"/><path d="M0,-331 L58,-335" stroke="#ff4a2a" stroke-width="1.6" opacity=".8"/>`;
  g += `<path d="M0,-348 A10,10 0 0 0 0,-328 Z" fill="#4aa8ff"/><path d="M0,-348 A10,10 0 0 1 0,-328 Z" fill="#ff3a2a"/>`;
  g += crownFront + `<rect x="-7" y="-402" width="7" height="54" fill="#7a4a2a"/><rect x="0" y="-402" width="7" height="54" fill="#151018"/>`;
  for (let gy = -396; gy < -350; gy += 9) g += `<line x1="-7" y1="${gy}" x2="0" y2="${gy + 4}" stroke="#e8b84a" stroke-width="1.6"/><line x1="0" y1="${gy + 4}" x2="7" y2="${gy}" stroke="#a02a1a" stroke-width="1.6"/>`;
  g += `<path d="M0,-426 A13,13 0 0 0 0,-400 Z" fill="#e8b84a"/><path d="M0,-426 A13,13 0 0 1 0,-400 Z" fill="#1e1820"/><polygon points="6,-422 17,-434 12,-415" fill="#1e1820"/>` +
    `<circle cx="-4" cy="-413" r="3.5" fill="#4aa8ff"/><circle cx="4" cy="-413" r="3.5" fill="#ff3a2a"/>`;
  for (const [sx, sy, r] of [[-40, -380, 3], [-60, -300, 2.5], [-30, -230, 2], [-70, -350, 2]]) g += `<circle cx="${sx}" cy="${sy}" r="${r}" fill="#fff" class="flicker"/>`;
  g += embers(20, 90, -380, -160, 8, 113) + '</g>';
  // ქვა, რომელშიც ხმალია ჩარჭობილი
  g += `<polygon points="-62,-18 -52,-70 -22,-88 26,-84 58,-64 64,-18" fill="${c.rock}"/><polygon points="26,-84 58,-64 64,-18 10,-18 4,-70" fill="${c.rockShade}"/>` +
    `<polygon points="-52,-70 -22,-88 -10,-62 -40,-42" fill="${c.rockLight}" opacity=".6"/><path d="M-30,-60 L-20,-40 L-28,-24 M30,-70 L22,-50" stroke="${c.rockDark}" stroke-width="2" fill="none" opacity=".6"/>`;
  g += pillar(20, 120) + pillar(160, 95, true);
  return `<g transform="translate(${x},${y}) scale(${s})">${g}</g>`;
}
