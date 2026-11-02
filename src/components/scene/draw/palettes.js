// ფერების ნაკრებები (vivid — ნათელი, soft — რბილი)
// ფერების ორი ნაკრები: vivid — ნათელი, გაჯერებული (ავტორის ნიმუშის მიხედვით), soft — წინა, რბილი.
// ძველის სანახავად გახსენი გვერდი მისამართის ბოლოში ?soft-ით (მაგ. http://localhost:5173/?soft)
export const PALETTES = {
  vivid: {
    sky: 'linear-gradient(180deg,#191c66 0%,#3d2c94 20%,#8e3fa6 38%,#e8607a 52%,#ff8c42 64%,#ffbe55 76%,#ffd978 100%)',
    sun: '#fff4b8', cloud: '#ff9f86', cloud2: '#ffb98e', fog: '#ffd2b8',
    back: '#8a7fdc', backHaze: '#c7b8f2', mid: '#5d6fd0', midHaze: '#a5b0ee',
    g1: '#55c25a', g2: '#3fa84a', forest: '#2e9a4c', forestShade: '#22803c', tree: '#1f8040', treeShade: '#15612c',
    road: '#f0cf8e', farRoad: '#e8d2a6', birds: '#3a2a6a'
  },
  soft: {
    sky: 'linear-gradient(180deg,#34437f 0%,#7a6aa6 26%,#e8998a 50%,#ffcf98 68%,#ffe2b0 100%)',
    sun: '#fff0c4', cloud: '#ffd6c4', cloud2: '#ffd6c4', fog: '#fff3e6',
    back: '#b8afd8', backHaze: '#d9cde6', mid: '#98a6cd', midHaze: '#bcc6de',
    g1: '#7db285', g2: '#6aa77a', forest: '#4f8f62', forestShade: '#417a52', tree: '#2a6340', treeShade: '#1f4f33',
    road: '#e2c592', farRoad: '#d8c8a8', birds: '#5a4a6a'
  }
};

export const THEME = PALETTES[/[?&]soft\b/.test(location.search) ? 'soft' : 'vivid'];
