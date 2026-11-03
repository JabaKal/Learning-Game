// Türkçe metinler (ka.js ile aynı anahtarlar)
export default {
  meta: {
    title: 'Öğren. İnşa Et. Hükmet.',
    description: 'Eğitici strateji oyunu: oynayarak dil ve coğrafya öğren, ücretsiz.'
  },
  header: {
    home: 'Ana sayfa',
    login: 'Giriş',
    language: 'Dil',
    changeLanguage: 'Dili değiştir',
    closeLanguages: 'Dil listesini kapat'
  },
  hero: {
    eyebrow: '⚔️ Eğitici strateji oyunu',
    title: 'Öğren. İnşa Et. <span>Hükmet.</span>',
    lead: 'Oynayarak dil ve coğrafya öğren — <strong>tamamen ücretsiz</strong>.',
    lead2: 'Her doğru cevap krallığını güçlendirir.',
    subjectsLabel: 'Ne öğreneceksin',
    teachLabel: 'Ne öğretiyoruz',
    teachInLabel: 'Hangi dillerde öğretiyoruz',
    subjects: ['İngilizce', 'İspanyolca', 'Almanca', 'Fransızca', 'Coğrafya'],
    foreignLanguages: 'Yabancı diller',
    flags: [
      { country: 'Birleşik Krallık', language: 'İngilizce' },
      { country: 'İspanya', language: 'İspanyolca' },
      { country: 'Almanya', language: 'Almanca' },
      { country: 'Fransa', language: 'Fransızca' }
    ],
    geographyTitle: 'Coğrafya',
    geographyLabel: 'Coğrafyada',
    geography: ['Ülkeler ve başkentler', 'Ülkelerin konumu', 'Bayraklar', 'Haritalar', 'Simge yapılar'],
    modesLabel: 'Nasıl oynayacaksın',
    modes: [
      { icon: 'test', text: 'Testlerle' },
      { icon: 'offline', text: 'Çevrimdışı — bota karşı' },
      { icon: 'online', text: 'Çevrimiçi — arkadaşlarla ve diğer oyuncularla' }
    ],
    modesShort: ['Testler', 'Çevrimdışı', 'Çevrimiçi'],
    modesDesc: ['Sorularla öğren', 'Botla savaş', 'Arkadaşlarla savaş'],
    languagesLabel: 'Öğretim dilleri',
    chips: ['Kayıt ücretsiz', 'Telefonda çalışır']
  },
  start: {
    label: 'Başla'
  },
  footer: {
    privacy: 'Gizlilik',
    terms: 'Kurallar',
    parents: 'Ebeveynler için'
  },
  game: {
    title: 'Krallığın',
    guest: 'Misafir',
    soon: 'Yakında',
    soonText: 'henüz yapım aşamasında, yakında açılıyor!',
    castleText: 'Sarayın — yakında krallığını burada büyüteceksin',
    profileSoon: 'Kayıt yakında açılıyor',
    night: 'Gece',
    day: 'Gündüz',
    spots: {
      castle: 'Saray',
      profile: 'Profil',
      shop: 'Dükkân',
      academy: 'Diller',
      geography: 'Coğrafya',
      army: 'Ordu',
      wall: 'Sur',
      battlefield: 'Savaş Alanı',
      friends: 'Arkadaşlar',
      wrecks: 'Batık gemiler'
    },
    nav: { kingdom: 'Krallık', learn: 'Öğren', battle: 'Savaş', profile: 'Profil' }
  },
  // „სწრაფი გამოწვევა“ — დროშების მინი-თამაში („დაიწყე“ ხსნის); {n}, {total} — რიცხვები
  quiz: {
    title: 'Hızlı meydan okuma',
    intro: 'Üç soru — krallığın için altın kazan!',
    find: 'Bayrağı bul:',
    correct: 'Doğru! +10 altın',
    wrong: 'Yanlış. Doğru cevap:',
    next: 'Sonraki',
    question: 'Soru {n} / {total}',
    result: 'Kazandığın',
    gold: 'altın',
    score: '{total} sorudan {n} doğru',
    again: 'Tekrar oyna',
    save: 'Krallığını kaydet',
    soon: 'Kayıt yakında açılıyor — bu bir deneme turu.',
    close: 'Kapat',
    countries: { FR: 'Fransa', DE: 'Almanya', IT: 'İtalya', JP: 'Japonya', GE: 'Gürcistan', UA: 'Ukrayna', AM: 'Ermenistan', PL: 'Polonya', NL: 'Hollanda', SE: 'İsveç' }
  }
};
