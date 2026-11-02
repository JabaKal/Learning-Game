-- საწყისი მონაცემები: სწავლების ენები და საგნები
INSERT INTO languages (code, native_name, is_active, sort_order) VALUES
  ('ka', 'ქართული',      true,  1),
  ('en', 'English',      false, 2),
  ('tr', 'Türkçe',       false, 3),
  ('hy', 'Հայերեն',      false, 4),
  ('az', 'Azərbaycanca', false, 5),
  ('ru', 'Русский',      false, 6),
  ('kk', 'Қазақша',      false, 7),
  ('uz', 'Oʻzbekcha',    false, 8);

INSERT INTO subjects (slug, kind, target_lang, sort_order) VALUES
  ('english',   'language',  'en', 1),
  ('spanish',   'language',  'es', 2),
  ('german',    'language',  'de', 3),
  ('french',    'language',  'fr', 4),
  ('geography', 'geography', NULL, 5);
