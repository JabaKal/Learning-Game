-- მონაცემთა ბაზის სქემა (PostgreSQL 15+)
-- ნაწილები: 1) ენები და მომხმარებლები  2) სასწავლო შინაარსი (ტესტები)  3) პროგრესი
--           4) სამეფო (რესურსები, შენობები, ჯარი)  5) მეგობრები და ბრძოლები (ოფლაინ / ონლაინ)
-- გაშვება: psql -d learning_game -f database/schema.sql && psql -d learning_game -f database/seed.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()

-- =========================================================
-- 1. ენები და მომხმარებლები
-- =========================================================

-- სწავლების (ინტერფეისის) ენები: რა ენაზე უხსნის თამაში მოთამაშეს
CREATE TABLE languages (
  code        varchar(5)  PRIMARY KEY,              -- ISO 639-1: ka, en, tr, hy, az, ru, kk, uz
  native_name text        NOT NULL,                 -- ენის სახელი თავისივე ენაზე
  is_active   boolean     NOT NULL DEFAULT false,   -- თარგმანი მზადაა და ჩანს საიტზე
  sort_order  smallint    NOT NULL DEFAULT 0
);

CREATE TABLE users (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  username       varchar(32) NOT NULL UNIQUE,
  email          text        UNIQUE,                       -- ბავშვებისთვის შეიძლება იყოს მშობლის ელფოსტა
  password_hash  text,                                     -- NULL, თუ შესვლა მხოლოდ Google / Apple-ით ხდება
  interface_lang varchar(5)  NOT NULL DEFAULT 'ka' REFERENCES languages(code),
  birth_year     smallint,                                 -- ასაკობრივი წესებისთვის (ბავშვების დაცვა)
  avatar         text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  last_seen_at   timestamptz
);

-- გარე ანგარიშით შესვლა (Google, Apple, ...)
CREATE TABLE user_identities (
  user_id     uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider    varchar(20) NOT NULL,
  provider_id text        NOT NULL,
  PRIMARY KEY (provider, provider_id)
);

-- =========================================================
-- 2. სასწავლო შინაარსი: საგანი → თემა → კითხვა (ფორმატი: content/README.md)
-- =========================================================

CREATE TYPE subject_kind  AS ENUM ('language', 'geography', 'math', 'chemistry', 'other');
CREATE TYPE question_type AS ENUM (
  'single_choice', 'multiple_choice', 'true_false', 'fill_blank', 'match_pairs',
  'order_words', 'listen_choose', 'flag_pick', 'map_pick', 'image_choice'
);

CREATE TABLE subjects (
  id          smallserial  PRIMARY KEY,
  slug        varchar(32)  NOT NULL UNIQUE,            -- english, spanish, german, french, geography
  kind        subject_kind NOT NULL,
  target_lang varchar(5),                              -- შესასწავლი ენა (kind = 'language'), მაგ. 'en'
  is_active   boolean      NOT NULL DEFAULT true,
  sort_order  smallint     NOT NULL DEFAULT 0
);

-- ტექსტები ყველა ენაზე ერთი სახით: { "ka": "...", "en": "..." } (ქართული სავალდებულოა)
CREATE TABLE topics (
  id          serial      PRIMARY KEY,
  subject_id  smallint    NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  slug        varchar(64) NOT NULL,                     -- მაგ. capitals-europe
  level       smallint    NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 10),
  title       jsonb       NOT NULL CHECK (title ? 'ka'),
  sort_order  smallint    NOT NULL DEFAULT 0,
  UNIQUE (subject_id, slug)
);

CREATE TABLE questions (
  id             serial        PRIMARY KEY,
  topic_id       integer       NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  slug           varchar(64)   NOT NULL,
  type           question_type NOT NULL,
  prompt         jsonb         NOT NULL CHECK (prompt ? 'ka'),
  explanation    jsonb,
  media          jsonb,                                   -- { image, audio, flag }
  options        jsonb,                                   -- [{ id, text, image, country }]
  answer         jsonb         NOT NULL,                  -- ფორმა დამოკიდებულია type-ზე
  accept         jsonb,                                   -- fill_blank: დასაშვები ვარიანტები
  time_limit_sec smallint,
  points         smallint      NOT NULL DEFAULT 10,
  is_active      boolean       NOT NULL DEFAULT true,
  UNIQUE (topic_id, slug)
);

-- =========================================================
-- 3. პროგრესი: ტესტის გავლა და თემის ათვისება
-- =========================================================

CREATE TYPE play_mode AS ENUM ('practice', 'bot', 'friend', 'online');

-- ერთი ტესტის გავლა (ვარჯიში ან ბრძოლის ნაწილი)
CREATE TABLE test_sessions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id     integer     NOT NULL REFERENCES topics(id),
  mode         play_mode   NOT NULL DEFAULT 'practice',
  battle_id    uuid,                                      -- თუ ბრძოლაში გაიარა (FK ქვემოთ)
  started_at   timestamptz NOT NULL DEFAULT now(),
  finished_at  timestamptz,
  correct      smallint    NOT NULL DEFAULT 0,
  total        smallint    NOT NULL DEFAULT 0,
  score        integer     NOT NULL DEFAULT 0
);

CREATE TABLE test_answers (
  session_id  uuid     NOT NULL REFERENCES test_sessions(id) ON DELETE CASCADE,
  question_id integer  NOT NULL REFERENCES questions(id),
  answer      jsonb    NOT NULL,
  is_correct  boolean  NOT NULL,
  time_ms     integer,                                    -- რამდენ ხანში უპასუხა (ბრძოლაში მნიშვნელოვანია)
  PRIMARY KEY (session_id, question_id)
);

-- თემის ათვისება — ჯამური მაჩვენებელი (ითვლება test_answers-იდან)
CREATE TABLE user_progress (
  user_id      uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id     integer     NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  mastery      smallint    NOT NULL DEFAULT 0 CHECK (mastery BETWEEN 0 AND 100),
  xp           integer     NOT NULL DEFAULT 0,
  best_score   integer     NOT NULL DEFAULT 0,
  last_played  timestamptz,
  PRIMARY KEY (user_id, topic_id)
);

-- =========================================================
-- 4. სამეფო: რესურსები, შენობები, ჯარი
-- =========================================================

CREATE TYPE army_side AS ENUM ('good', 'evil');                       -- სიკეთე / ბოროტება
CREATE TYPE unit_type AS ENUM ('human', 'elf', 'dwarf', 'orc', 'giant');

CREATE TABLE kingdoms (
  user_id    uuid      PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name       text,
  side       army_side NOT NULL DEFAULT 'good',
  level      smallint  NOT NULL DEFAULT 1,
  gold       integer   NOT NULL DEFAULT 0 CHECK (gold  >= 0),
  wood       integer   NOT NULL DEFAULT 0 CHECK (wood  >= 0),
  stone      integer   NOT NULL DEFAULT 0 CHECK (stone >= 0)
);

-- 💡 იდეა (GAME_DESIGN.md): ყოველ საგანს თავისი შენობა — დონე = ამ საგნის ცოდნა
CREATE TABLE buildings (
  id         serial     PRIMARY KEY,
  user_id    uuid       NOT NULL REFERENCES kingdoms(user_id) ON DELETE CASCADE,
  type       varchar(32) NOT NULL,                      -- castle, tower, library, map_hall, ...
  subject_id smallint   REFERENCES subjects(id),
  level      smallint   NOT NULL DEFAULT 1,
  pos_x      smallint, pos_y smallint,                   -- ადგილი სამეფოს რუკაზე
  UNIQUE (user_id, type, subject_id)
);

CREATE TABLE units (
  user_id uuid      NOT NULL REFERENCES kingdoms(user_id) ON DELETE CASCADE,
  type    unit_type NOT NULL,
  count   integer   NOT NULL DEFAULT 0 CHECK (count >= 0),
  PRIMARY KEY (user_id, type)
);

-- =========================================================
-- 5. მეგობრები და ბრძოლები (ოფლაინ — ბოტთან, ონლაინ — მეგობართან ან სხვა მოთამაშესთან)
-- =========================================================

CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'blocked');

CREATE TABLE friendships (
  user_id    uuid              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id  uuid              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status     friendship_status NOT NULL DEFAULT 'pending',
  created_at timestamptz       NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, friend_id),
  CHECK (user_id <> friend_id)
);

CREATE TYPE battle_status AS ENUM ('waiting', 'active', 'finished', 'cancelled');

CREATE TABLE battles (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  mode        play_mode     NOT NULL CHECK (mode IN ('bot', 'friend', 'online')),
  topic_id    integer       REFERENCES topics(id),        -- რომელი თემის კითხვებით
  status      battle_status NOT NULL DEFAULT 'waiting',
  winner_id   uuid          REFERENCES users(id),         -- NULL — ფრე ან ბოტმა მოიგო
  created_at  timestamptz   NOT NULL DEFAULT now(),
  started_at  timestamptz,
  finished_at timestamptz
);

CREATE TABLE battle_players (
  battle_id uuid      NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  user_id   uuid      REFERENCES users(id),               -- NULL — ბოტი
  is_bot    boolean   NOT NULL DEFAULT false,
  side      army_side NOT NULL,
  score     integer   NOT NULL DEFAULT 0,
  rating_change smallint,                                 -- ონლაინ რეიტინგის ცვლილება
  PRIMARY KEY (battle_id, side)
);

ALTER TABLE test_sessions ADD CONSTRAINT test_sessions_battle_fk FOREIGN KEY (battle_id) REFERENCES battles(id) ON DELETE SET NULL;

-- =========================================================
-- ინდექსები ხშირი მოთხოვნებისთვის
-- =========================================================
CREATE INDEX questions_topic_idx     ON questions (topic_id) WHERE is_active;
CREATE INDEX topics_subject_idx      ON topics (subject_id, sort_order);
CREATE INDEX sessions_user_idx       ON test_sessions (user_id, started_at DESC);
CREATE INDEX friendships_friend_idx  ON friendships (friend_id, status);
CREATE INDEX battles_waiting_idx     ON battles (mode, created_at) WHERE status = 'waiting';   -- მოწინააღმდეგის ძებნა
CREATE INDEX battle_players_user_idx ON battle_players (user_id);
