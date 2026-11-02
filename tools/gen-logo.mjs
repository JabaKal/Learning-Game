// ლოგოს გენერატორი: ჰორიზონტალური ხმალი (public/logo.svg) და კვადრატული favicon (public/favicon.svg).
// წარწერა იგივე ანბანით იხატება, რაც სცენის ხმალზე (src/components/scene/draw/runes.js).
// გაშვება: node tools/gen-logo.mjs  (ლოგოს შეცვლის შემდეგ — თავიდან გაუშვი)
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { GLYPHS } = await import(pathToFileURL(resolve(root, 'src/components/scene/draw/runes.js')).href);

let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
const pick = () => Math.floor(rnd() * GLYPHS.length);
// ჩაჭრილი წარწერა ჯვარედინასთან, მჭიდრო ასოებით, სიტყვებად (როგორც სცენის ხმალზე)
const runeRow = (x0, x1, y, k) => { const u = []; for (let x = x0, n = 4; x <= x1; x += 7 * k + (--n ? 0 : (n = 3 + Math.floor(rnd() * 3), 5 * k))) u.push(`<use href="#g${pick()}" transform="translate(${x.toFixed(2)},${y}) scale(${k}) skewX(-10)"/>`); return u.join(''); };
const top = runeRow(54, 82, 17.7, .25), bottom = runeRow(36, 70, 22.3, .25);

const defs = `<defs>
    <linearGradient id="silver" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#e6edf5"/><stop offset="1" stop-color="#b9c8da"/></linearGradient>
    <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d2f46"/><stop offset="1" stop-color="#140d18"/></linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0a8"/><stop offset=".5" stop-color="#f2c44e"/><stop offset="1" stop-color="#b8801e"/></linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <radialGradient id="halo"><stop offset="0" stop-color="#ffd27a" stop-opacity=".38"/><stop offset="1" stop-color="#ffb35c" stop-opacity="0"/></radialGradient>
    ${GLYPHS.map((d, i) => `<path id="g${i}" d="${d}"/>`).join('\n    ')}
  </defs>`;

// ხმალი: 128×40 ბადეში, ცენტრი y=20. ზედა ნახევარი — სიკეთის (ვერცხლი, ოქრო, ლურჯი), ქვედა — ბოროტების (შავი ფოლადი, წითელი)
const sword = `
  <!-- ბურთულა: ზემოთ ოქრო და ლურჯი თვალი, ქვემოთ შავი ეკლით და წითელი თვალი -->
  <path d="M2,20 A5,5 0 0 1 12,20 Z" fill="url(#gold)"/><path d="M2,20 A5,5 0 0 0 12,20 Z" fill="#1c1420"/>
  <polygon points="8.5,24.4 11,29 10.8,23.4" fill="#1c1420"/>
  <circle cx="7" cy="17.8" r="1.4" fill="#4aa8ff"/><circle cx="7" cy="22.2" r="1.4" fill="#ff3a2a"/>
  <!-- ტარი შემოხვეული ოქროს და წითელი ზონრით -->
  <rect x="12" y="17.4" width="14.5" height="2.6" fill="#7a4a2a"/><rect x="12" y="20" width="14.5" height="2.6" fill="#151018"/>
  <path d="M13,17.4 L14.6,20 M16.5,17.4 L18.1,20 M20,17.4 L21.6,20 M23.5,17.4 L25.1,20" stroke="#e8b84a" stroke-width=".9"/>
  <path d="M14.6,20 L13,22.6 M18.1,20 L16.5,22.6 M21.6,20 L20,22.6 M25.1,20 L23.5,22.6" stroke="#b8322a" stroke-width=".9"/>
  <!-- ჯვარედინა: ზედა მკლავი ოქროსი, ბურთულისკენ მოხრილი; ქვედა — შავი, ეკლებით -->
  <path d="M26.5,20 L26.5,8.5 Q26.5,4.6 22.6,2.4 Q30.6,3.4 30.6,8.5 L30.6,20 Z" fill="url(#gold)"/>
  <path d="M28,18 L28,8.8" stroke="#fff6c8" stroke-width=".8" opacity=".75"/>
  <path d="M26.5,20 L26.5,31.5 Q26.5,35.4 22.6,37.6 Q30.6,36.6 30.6,31.5 L30.6,20 Z" fill="#1e1820"/>
  <polygon points="30.6,24.5 34,26 30.6,27.5" fill="#1e1820"/><polygon points="30.6,29.5 33.6,31.4 30.4,32.5" fill="#1e1820"/>
  <path d="M30.2,21.5 L30.2,31" stroke="#ff4a2a" stroke-width=".7" opacity=".85"/>
  <!-- პირი: ზედა ნახევარი ვერცხლი, ქვედა შავი ფოლადი; ბზინვარება კიდეზე -->
  <path d="M30.6,15 L110,15.9 L125.5,20 L30.6,20 Z" fill="url(#silver)"/>
  <path d="M30.6,20 L125.5,20 L110,24.1 L30.6,25 Z" fill="url(#steel)"/>
  <path d="M32,15.7 L109,16.5" stroke="url(#shine)" stroke-width=".9"/>
  <!--runes--><!-- კალიგრაფიული წარწერა (იგივე ანბანი, რაც სცენის ხმალზე): ზემოთ ოქროს ჩაჭედილი, ქვემოთ ცეცხლოვანი -->
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <g stroke="#fff" stroke-width="1.3" transform="translate(.12,.15)" opacity=".8">${top}</g>
    <g stroke="#9a6e1e" stroke-width="1.1">${top}</g>
    <g stroke="#ff3a1a" stroke-width="2.4" opacity=".4">${bottom}</g>
    <g stroke="#ffa040" stroke-width="1">${bottom}</g>
  </g>
  <!--/runes--><!-- შუა თვალი: ზემოთ ლურჯი, ქვემოთ წითელი -->
  <path d="M25.7,20 A2.9,2.9 0 0 1 31.5,20 Z" fill="#4aa8ff"/><path d="M25.7,20 A2.9,2.9 0 0 0 31.5,20 Z" fill="#ff3a2a"/>
  <circle cx="27.6" cy="19" r=".7" fill="#fff" opacity=".85"/>
  <!-- ოქროს გვირგვინი, დახრილად დადებული პირზე, ჯვარედინასთან ახლოს -->
  <g transform="translate(44,14.6) rotate(-8)">
    <path d="M-6.5,0 L-7,-6.5 L-3.5,-3 L0,-8.5 L3.5,-3 L7,-6.5 L6.5,0 Z" fill="url(#gold)"/>
    <path d="M0,-8.5 L3.5,-3 L7,-6.5 L6.5,0 L0,0 Z" fill="#b8801e" opacity=".35"/>
    <rect x="-7" y="-1.6" width="14" height="2.6" rx=".8" fill="#f2c44e"/><rect x="0" y="-1.6" width="7" height="2.6" fill="#b8801e" opacity=".35"/>
    <circle cx="-7" cy="-6.8" r="1" fill="#ffe27a"/><circle cx="0" cy="-8.8" r="1.1" fill="#ffe27a"/><circle cx="7" cy="-6.8" r="1" fill="#ffe27a"/>
    <circle cx="0" cy="-.3" r="1.1" fill="#e0302a"/><circle cx="-3.8" cy="-.3" r=".75" fill="#4aa8ff"/><circle cx="3.8" cy="-.3" r=".75" fill="#4aa8ff"/>
  </g>
  <!-- ციმციმი წვერზე -->
  <path d="M118,13.2 l.6,1.6 1.6,.6 -1.6,.6 -.6,1.6 -.6,-1.6 -1.6,-.6 1.6,-.6 Z" fill="#fff" opacity=".9"/>`;

const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 40">
  <!-- ლოგო: ჰორიზონტალური ხმალი (სცენის „ხმალი ქვაში“), გვირგვინით. დროებითია, სანამ თამაშის სახელი აირჩევა.
       გენერირებულია კალიგრაფიის ანბანიდან (src/components/scene/draw/runes.js) -->
  ${defs}
  <ellipse cx="70" cy="20" rx="54" ry="11" fill="url(#halo)"/>${sword}
</svg>
`;

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <!-- favicon: იგივე ჰორიზონტალური ხმალი მუქ კვადრატზე, წარწერის გარეშე (პატარა ზომაზე ხმაურია); ლოგო — public/logo.svg -->
  ${defs.replace('<defs>', `<defs>
    <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#232a86"/><stop offset="1" stop-color="#3a1640"/></linearGradient>`)}
  <rect width="64" height="64" rx="14" fill="url(#tile)"/>
  <ellipse cx="32" cy="34" rx="30" ry="14" fill="url(#halo)"/>
  <g transform="translate(0,21) scale(.5)">${sword.split('<!--runes-->')[0] + sword.split('<!--/runes-->')[1]}
  </g>
</svg>
`;

writeFileSync(resolve(root, 'public/logo.svg'), logo.split('<!--runes-->').join('').split('<!--/runes-->').join(''));
writeFileSync(resolve(root, 'public/favicon.svg'), favicon);
console.log('written', logo.length, favicon.length);
