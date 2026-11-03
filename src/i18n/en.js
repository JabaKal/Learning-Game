// English texts (same keys as ka.js). Also the fallback when a key is missing in another language
export default {
  meta: {
    title: 'Learn. Build. Rule.',
    description: 'An educational strategy game: learn languages and geography by playing, for free.'
  },
  header: {
    home: 'Home',
    login: 'Log in',
    language: 'Language',
    changeLanguage: 'Change language',
    closeLanguages: 'Close language list'
  },
  hero: {
    eyebrow: '⚔️ Educational strategy game',
    title: 'Learn. Build. <span>Rule.</span>',
    lead: 'Learn languages and geography by playing — <strong>completely free</strong>.',
    lead2: 'Every correct answer makes your kingdom stronger.',
    subjectsLabel: 'What you will learn',
    teachLabel: 'What we teach',
    teachInLabel: 'Languages we teach in',
    subjects: ['English', 'Spanish', 'German', 'French', 'Geography'],
    foreignLanguages: 'Foreign languages',
    flags: [
      { country: 'United Kingdom', language: 'English' },
      { country: 'Spain', language: 'Spanish' },
      { country: 'Germany', language: 'German' },
      { country: 'France', language: 'French' }
    ],
    geographyTitle: 'Geography',
    geographyLabel: 'In geography',
    geography: ['Countries and capitals', 'Where countries are', 'Flags', 'Maps', 'Landmarks'],
    modesLabel: 'How you will play',
    modes: [
      { icon: 'test', text: 'Through quizzes' },
      { icon: 'offline', text: 'Offline — against a bot' },
      { icon: 'online', text: 'Online — with friends and other players' }
    ],
    modesShort: ['Quizzes', 'Offline', 'Online'],
    modesDesc: ['Learn by answering', 'Battle a bot', 'Battle your friends'],
    languagesLabel: 'Languages of instruction',
    chips: ['Sign-up is free', 'Works on your phone']
  },
  start: {
    label: 'Start'
  },
  footer: {
    privacy: 'Privacy',
    terms: 'Terms',
    parents: 'For parents'
  },
  game: {
    title: 'Your kingdom',
    guest: 'Guest',
    soon: 'Soon',
    soonText: 'still being built, opening soon!',
    castleText: 'Your palace — soon you will build up your kingdom here',
    profileSoon: 'Sign-up opens soon',
    night: 'Night',
    day: 'Day',
    spots: {
      castle: 'Palace',
      profile: 'Profile',
      shop: 'Shop',
      academy: 'Languages',
      geography: 'Geography',
      army: 'Army',
      wall: 'Rampart',
      battlefield: 'Battlefield',
      friends: 'Friends',
      wrecks: 'Sunken ships'
    },
    nav: { kingdom: 'Kingdom', learn: 'Learn', battle: 'Battle', profile: 'Profile' }
  },
  // „სწრაფი გამოწვევა“ — დროშების მინი-თამაში („დაიწყე“ ხსნის); {n}, {total} — რიცხვები
  quiz: {
    title: 'Quick challenge',
    intro: 'Three questions — win gold for your kingdom!',
    find: 'Find the flag:',
    correct: 'Correct! +10 gold',
    wrong: 'Not quite. The answer:',
    next: 'Next',
    question: 'Question {n} of {total}',
    result: 'You won',
    gold: 'gold',
    score: '{n} of {total} correct',
    again: 'Play again',
    save: 'Save your kingdom',
    soon: 'Sign-up opens soon — this is a demo round.',
    close: 'Close',
    countries: { FR: 'France', DE: 'Germany', IT: 'Italy', JP: 'Japan', GE: 'Georgia', UA: 'Ukraine', AM: 'Armenia', PL: 'Poland', NL: 'Netherlands', SE: 'Sweden' }
  }
};
