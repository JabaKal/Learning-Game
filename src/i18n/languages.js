// სწავლების (ინტერფეისის) ენები — რა ენაზე უხსნის თამაში მოთამაშეს.
// code — ISO 639-1, short — მოკლე წარწერა ღილაკზე, name — ენის სახელი თავისივე ენაზე
import ka from './ka.js';
import en from './en.js';
import tr from './tr.js';
import hy from './hy.js';
import az from './az.js';
import ru from './ru.js';
import kk from './kk.js';
import uz from './uz.js';

export const LANGUAGES = [
  { code: 'ka', short: 'ქარ', name: 'ქართული' },
  { code: 'en', short: 'ENG', name: 'English' },
  { code: 'tr', short: 'TUR', name: 'Türkçe' },
  { code: 'hy', short: 'HYE', name: 'Հայերեն' },
  { code: 'az', short: 'AZE', name: 'Azərbaycanca' },
  { code: 'ru', short: 'RUS', name: 'Русский' },
  { code: 'kk', short: 'KAZ', name: 'Қазақша' },
  { code: 'uz', short: 'UZB', name: 'Oʻzbekcha' }
];

// მზა თარგმანები — რვავე ენა. ახალი ენა: src/i18n/<code>.js (ka.js-ის ასლი, თარგმნილი) + აქ დამატება + LANGUAGES + COUNTRY_LANG.
// მხოლოდ ამ ენებს ირჩევს საიტი ავტომატურად (IP-ით); დანარჩენზე სტუმარს ინგლისური დახვდება
export const DICTS = { ka, en, tr, hy, az, ru, kk, uz };

export const DEFAULT_LANG = 'ka';     // საბოლოო სარეზერვო: თუ გასაღები არც არჩეულ ენაზეა, არც ინგლისურად
export const FALLBACK_LANG = 'en';    // თუ სტუმრის ქვეყნის ენა ჯერ არ გვაქვს (ან ქვეყანა ვერ დადგინდა)

// ქვეყანა (ISO 3166-1, IP-ით დადგენილი) → სწავლების ენა. სიაში არ მყოფი ქვეყანა → ინგლისური
export const COUNTRY_LANG = {
  GE: 'ka', TR: 'tr', AM: 'hy', AZ: 'az', RU: 'ru', BY: 'ru', KZ: 'kk', UZ: 'uz'
};

// ენების სია, სადაც სტუმრის „სახლის“ ენა (IP-ით დადგენილი) პირველია
export const orderLanguages = home => [...LANGUAGES].sort((a, b) => (b.code === home) - (a.code === home));
