-- საწყისი მონაცემები: სწავლების ენები და საგნები
INSERT INTO languages (code, native_name, is_active, sort_order) VALUES
  ('ka', 'ქართული',      true,  1),
  ('en', 'English',      true,  2),
  ('tr', 'Türkçe',       true,  3),
  ('hy', 'Հայերեն',      true,  4),
  ('az', 'Azərbaycanca', true,  5),
  ('ru', 'Русский',      true,  6),
  ('kk', 'Қазақша',      true,  7),
  ('uz', 'Oʻzbekcha',    true,  8);

INSERT INTO subjects (slug, kind, target_lang, sort_order) VALUES
  ('english',   'language',  'en', 1),
  ('spanish',   'language',  'es', 2),
  ('german',    'language',  'de', 3),
  ('french',    'language',  'fr', 4),
  ('geography', 'geography', NULL, 5);
