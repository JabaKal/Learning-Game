# მონაცემთა ბაზა

**PostgreSQL** (15+) — სანდო, უფასო, კარგად ინახავს როგორც ცხრილებს (მომხმარებლები, ბრძოლები), ისე JSON-ს (თარგმნილი ტექსტები, კითხვების ვარიანტები).

| ფაილი | რა არის |
|---|---|
| `schema.sql` | ცხრილები და კავშირები |
| `seed.sql` | საწყისი მონაცემები: სწავლების ენები, საგნები |

## ცხრილები მოკლედ

```
languages ─┐
users ─────┼── user_identities (Google / Apple)
           ├── user_progress ──── topics ──── subjects
           ├── test_sessions ─── test_answers ──── questions ──── topics
           ├── kingdoms ─── buildings, units
           ├── friendships
           └── battle_players ─── battles  (ოფლაინ: ბოტი, ონლაინ: მეგობარი / სხვა მოთამაშე)
```

- **სასწავლო შინაარსი** (`subjects → topics → questions`) ივსება `content/subjects/*.json` ფაილებიდან (ფორმატი: `content/README.md`).
- **ტექსტები** ყველა ენაზე ერთ ველშია: `{"ka": "...", "en": "..."}`; ქართული სავალდებულოა.
- **ოფლაინ რეჟიმი** (ბოტთან) მუშაობს ინტერნეტის გარეშეც: თემები ინახება მოწყობილობაზე, შედეგები ბაზაში იგზავნება ინტერნეტის დაბრუნებისას.

## ლოკალურად გაშვება

```bash
createdb learning_game
psql -d learning_game -f database/schema.sql
psql -d learning_game -f database/seed.sql
```

## შემდეგი ნაბიჯები

- სერვერი (API): `server/` — Node.js (Fastify), რეგისტრაცია / შესვლა, პროგრესის შენახვა.
- ონლაინ ბრძოლა: WebSocket (მაგ. Colyseus) — `battles`, `battle_players` ცხრილებით.
- მიგრაციები: სქემის ცვლილებები ცალკე ფაილებად (`database/migrations/`), როცა ბაზა რეალურად გაეშვება.
