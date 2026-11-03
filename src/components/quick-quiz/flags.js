// დროშები „სწრაფი გამოწვევისთვის“ (viewBox 0 0 30 20). მარტივი, ცნობადი დროშები — ენისგან დამოუკიდებელი კითხვები
const h3 = (a, b, c) => `<rect width="30" height="7" fill="${a}"/><rect y="6.7" width="30" height="6.7" fill="${b}"/><rect y="13.3" width="30" height="6.7" fill="${c}"/>`;
const v3 = (a, b, c) => `<rect width="10" height="20" fill="${a}"/><rect x="10" width="10" height="20" fill="${b}"/><rect x="20" width="10" height="20" fill="${c}"/>`;
const bolnur = (x, y) => `<path d="M${x - 1.6},${y} H${x + 1.6} M${x},${y - 1.6} V${y + 1.6}" stroke="#e8112d" stroke-width="1.2"/>`;

export const FLAGS = {
  FR: v3('#0055a4', '#fff', '#ef4135'),
  DE: h3('#1a1a1a', '#dd0000', '#ffce00'),
  IT: v3('#009246', '#fff', '#ce2b37'),
  JP: '<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#bc002d"/>',
  GE: '<rect width="30" height="20" fill="#fff"/><path d="M15,0 V20 M0,10 H30" stroke="#e8112d" stroke-width="4"/>' +
      bolnur(6.5, 4.5) + bolnur(23.5, 4.5) + bolnur(6.5, 15.5) + bolnur(23.5, 15.5),
  UA: '<rect width="30" height="10" fill="#0057b7"/><rect y="10" width="30" height="10" fill="#ffd700"/>',
  AM: h3('#d90012', '#0033a0', '#f2a800'),
  PL: '<rect width="30" height="10" fill="#fff"/><rect y="10" width="30" height="10" fill="#dc143c"/>',
  NL: h3('#ae1c28', '#fff', '#21468b'),
  SE: '<rect width="30" height="20" fill="#006aa7"/><path d="M11,0 V20 M0,10 H30" stroke="#fecc02" stroke-width="3.6"/>'
};

export const flagSvg = code => `<svg viewBox="0 0 30 20" aria-hidden="true">${FLAGS[code]}</svg>`;
