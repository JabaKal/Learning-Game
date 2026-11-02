# ისწავლე. ააშენე. იმეფე.

სასწავლო სტრატეგიული თამაში ბრაუზერისთვის (მობილური პირველ რიგში): მოთამაშე სწავლობს ენებს (ინგლისური, ესპანური, გერმანული, ფრანგული) და გეოგრაფიას **ტესტების ფორმით**, აშენებს სამეფოს და იბრძვის — **ოფლაინ** ბოტთან ან **ონლაინ** მეგობრებთან და სხვა მოთამაშეებთან. სწავლების ენები: ქართული, English, Türkçe, Հայերեն, Azərbaycanca, Русский, Қазақша, Oʻzbekcha.

## გაშვება

```bash
npm run dev          # → http://localhost:5173
```

ან VS Code-ის **Live Server**-ით (`index.html` → „Open with Live Server“).
`index.html`-ის პირდაპირ გახსნა (file://) არ იმუშავებს — კომპონენტები სერვერიდან იტვირთება.
საჭიროა მხოლოდ Node.js 18+; დამატებითი პაკეტები არ არის.

## სტრუქტურა

```
index.html                  გვერდის ჩონჩხი: სად დგას რომელი კომპონენტი
public/                     სტატიკური ფაილები (logo.svg, favicon.svg — ლოგო; მომავალში — სურათები, ხმები)
src/
  main.js                   კომპონენტების ჩამტვირთავი
  core/                     state.js (საერთო მდგომარეობა), i18n.js (თარგმანები), geo.js (სტუმრის ქვეყანა IP-ით → ენა), prefs.js (სტუმრის პარამეტრები)
  i18n/                     languages.js (ენები, თარგმანები, ქვეყანა → ენა), ka/en/tr/hy/az/ru/kk/uz.js — რვავე ენის ტექსტები
  styles/                   tokens.css (ფერები, შრიფტები), base.css, buttons.css
  components/
    scene/                  ფონის ნახატი ორ ფენად: უძრავი — canvas-ზე, მოძრავი — SVG (draw/ — რელიეფი, ციხეები, ჯარი, ხმალი, fx.js — ფენების გამყოფი)
    site-header/            ზედა ზოლი: ლოგო, შესვლა
    lang-switcher/          ენის არჩევა
    hero/                   მთავარი ტექსტი და „რას ვასწავლით“
    start-button/           „დაიწყე“ ღილაკი სცენაზე
content/                    ტესტები (JSON) და მათი ფორმატი
database/                   PostgreSQL სქემა და საწყისი მონაცემები
docs/                       GAME_DESIGN.md (იდეები, გადაწყვეტილებები), ARCHITECTURE.md (კოდის აგებულება)
design/archive/             ძველი, ერთფაილიანი პროტოტიპი (მხოლოდ ისტორიისთვის)
tools/                      dev-server.mjs, gen-logo.mjs (ლოგოს და favicon-ის გენერატორი)
```

დეტალები: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · ტესტების ფორმატი: [content/README.md](content/README.md) · ბაზა: [database/README.md](database/README.md)
