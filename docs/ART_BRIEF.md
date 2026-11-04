# თამაშის რუკის სურათები — დავალება გრაფიკის AI-სთვის

მიზანი: სამეფოს რუკა „ნახატის“ სტილში (ავტორის 3 რეფერენსი, 2026-11-04). სურათს AI ხატავს, კოდი კი მასზე სვამს
დასაჭერ ადგილებს და წარწერებს 8 ენაზე. ამიტომ **სურათზე ტექსტი არ უნდა იყოს** — ყველა წარწერა, ღილაკი და ხატულა კოდისაა.

## ⭐ საბოლოო გეგმა (2026-11-04) — ასე ვაკეთებთ

### რა ვისწავლეთ ცდებიდან
- ❌ **ეკრანის ანაბეჭდი (screenshot)** — დაბალი გარჩევადობა (~700 px), ეკრანზე ბუნდოვანია. ✅ ყოველთვის **ჩამოტვირთვის ღილაკით (⬇)** გადმოწერე.
- ❌ **შენობა ცალკე სურათად** (ვარდისფერ ფონზე) → რუკაზე „სტიკერივით“ ჩანს: სხვა კამერის კუთხე, სხვა ზომა (ხეებთან შედარებით),
  სხვა განათება და ფერი, მიწას არ ეხება (`demo-map-layers.html`, ციხე). ✅ **შენობა Gemini-მ პირდაპირ რუკაზე დახატოს** (რედაქტირებით).
- ❌ კოდით აწყობილი 3D (`demo-3d.html`, `demo-3d-map.html`) — მუშაობს, მაგრამ „სათამაშო“ სტილია, ნახატის ხარისხს ვერ აღწევს.
- ✅ ავტორს უნდა **2.5D, ფიქსირებული ხედი** — ზუმი, ტრიალი, თაგვით მართვა არ სჭირდება. ამიტომ მზა ნახატი საკმარისია.

### ნაბიჯები (ავტორი — Gemini-ში)
1. **ცარიელი რუკა** — უკვე გაქვს (ზღვა, მდინარე, ტყე, მინდვრები, მთები; შენობების გარეშე). ჩამოტვირთე ⬇ ორიგინალი.
2. **შენობები სათითაოდ, იმავე სურათზე** — ატვირთე ბოლო ვერსია და დაამატე ერთი შენობა (პრომპტი ქვემოთ, `[...]` შეცვალე).
   ყოველი ნაბიჯის შემდეგ ჩამოტვირთე ⬇ და შემდეგი შენობა **ამ ახალ სურათზე** დაამატე. რიგი:
   - ციხე → *on the right bank of the river, in the upper middle area*
   - ეკლესია (ენები) → *to the right of the castle*
   - ცისფერგუმბათიანი სასახლე (გეოგრაფია) → *below the church, on the right bank*
   - მაღაზია (ხის კოჭებიანი სახლი) → *on the left bank, near the coast*
   - გალავანი კოშკებით → *diagonally across the lower left, from the coast downward* (ბრძოლის ველი — მის გარეთ)
   - ფლოტი (გემები) → *on the sea, upper left*
3. თუ რამე ცუდად გამოვიდა — **იმავე სურათზე** სთხოვე გასწორება, თავიდან ნუ დაახატვინებ.
4. **ღამის ვერსია** — საბოლოო დღის სურათის რედაქტირებით (პრომპტი №2 ქვემოთ).
5. ფაილები ჩააგდე `public/game/version 5/`-ში (ან ჩატში გამომიგზავნე ორიგინალი ფაილი).

### შენობის დამატების პრომპტი
```
Edit this image: add [a medieval stone castle with red roofs and towers] [on the right bank of the river,
in the upper middle area]. It must match the image exactly: same camera angle, same scale (small, seen from
far away, the trees around it stay the same size), same lighting from the left, same colors and painting style.
The building stands on the ground with its own path and shadow. Keep everything else unchanged. No text.
```

### ჩემი ნაწილი (ფაილების მიღების შემდეგ)
- სურათი → საიტის რუკის ფონი (WebP, რამდენიმე ზომა, ეკრანს ავსებს ბუნდოვანი ზოლების გარეშე);
- ყოველ შენობაზე — დასაჭერი ადგილი, წარწერა 8 ენაზე, „მალე“ საკეტი, მიტანისას ნათება;
- დღე / ღამე, ანიმაცია (კვამლი, წყლის ციმციმი, ფანჯრების შუქი ღამით).

## რა ფაილები გვჭირდება

| ფაილი | ზომა | რა არის |
|---|---|---|
| `public/game/map-phone-day.png` | 1440 × 2560 (ვერტიკალური) | ტელეფონის რუკა, დღე — **აუცილებელი** |
| `public/game/map-phone-night.png` | 1440 × 2560 | იგივე სურათი ღამით — სასურველი |
| `public/game/map-desktop-day.png` | 2560 × 1440 (ჰორიზონტალური) | კომპიუტერის რუკა, დღე — აუცილებელი |
| `public/game/map-desktop-night.png` | 2560 × 1440 | იგივე ღამით — სასურველი |

PNG ან JPG — სულერთია, ზომას და ფორმატს (WebP) მე დავაყენებ. ზუსტი ზომა არ არის აუცილებელი, მთავარია პროპორცია (9:16 და 16:9).

## წესები (ყველა სურათზე)

1. **ტექსტი, წარწერები, ასოები, ღილაკები, ხატულები — არა.** (AI ქართულს ამახინჯებს, და წარწერა 8 ენაზე უნდა ითარგმნოს.)
2. ყოველი შენობა **ცალკე, მკაფიოდ** დგას, ირგვლივ თავისუფალი ადგილით — ზემოდან წარწერის აბი უნდა დაჯდეს.
3. კიდეებზე (ზემოთ ~8%, ქვემოთ ~6%, გვერდებზე ~5%) — მხოლოდ ბუნება (მთები, ტყე, ზღვა): ეკრანის ფორმის მიხედვით კიდეები შეიძლება მოიჭრას,
   ზემოთ კი თამაშის ზოლი დგას (მთვარის ღილაკი, ოქრო, პროფილი).
4. ღამის ვერსია — **იგივე სურათის რედაქტირებით** (არა ახალი სურათი), რომ ყველა შენობა ზუსტად იმავე ადგილას დარჩეს.
5. სტილი ოთხივე სურათზე ერთი უნდა იყოს — ყოველ ჯერზე იგივე რეფერენსი ატვირთე.

## პრომპტები

### 1. ტელეფონი, დღე (ატვირთე რეფერენსი, რომელიც ყველაზე მოგწონს)

```
Create a vertical 9:16 game map illustration (1440x2560) in the exact painterly style of the attached reference:
semi-realistic fantasy kingdom seen from a high 3/4 isometric angle, rich saturated colors, warm golden afternoon sunlight
from the upper right, soft shadows, detailed stone textures, dense pine forest.

Composition from top to bottom (keep this layout):
- Top edge: snowy mountain range under a blue sky with a few soft clouds (this area may be covered by UI, keep it simple).
- Top, full width: a large stone fortress — long crenellated wall with square towers, red banners with a white cross,
  an arched gate in the middle; inside, a royal castle with tall towers and red conical roofs.
- Upper right: a gothic college with dark slate spires, a clock tower and glowing windows (the "Languages" academy).
- Middle left: a half-timbered two-storey shop/trading house with a red tiled roof, smoke from the chimney, market stalls.
- Middle right, below the academy: a classical domed building with blue domes, columns and a golden globe on top (the "Geography" hall).
- A river crosses the map horizontally below them and flows into the sea on the left, with a wooden bridge.
- Left side, from the middle down: deep blue sea with a rocky coastline; a fleet of 6-8 white-sailed galleons near the left edge.
- Lower middle: a military camp with soldiers in formation and red banners.
- Bottom: a second stone defensive wall with square towers and a gate; beyond it, at the very bottom right, a battlefield area.
- Cobblestone roads connect: fortress gate -> shop and academy; academy -> geography hall; shop -> camp -> lower wall gate -> battlefield.
- Fill all remaining space with forest, small villages with red and blue roofs, golden wheat fields.

Every building must stand clearly apart with empty space around it (a text label will be placed under each one by the game).
IMPORTANT: no text, no letters, no labels, no signs with writing, no buttons, no icons, no UI elements anywhere in the image.
```

### 2. ტელეფონი, ღამე (ატვირთე **შენივე** დღის სურათი და დაწერე)

```
Edit this exact image into a night scene. Keep the composition, every building, road, ship and tree in exactly the same
position and size — change only the lighting: deep blue moonlit night, starry sky, torches lit along the walls and towers,
warm glowing windows in all buildings, campfires in the military camp, lanterns on the ships, moonlight reflections on the
sea and river. No text, no labels, no UI.
```

### 3. კომპიუტერი, დღე (ატვირთე რეფერენსი + შენი ტელეფონის სურათი)

```
Create a horizontal 16:9 game map illustration (2560x1440) of the SAME kingdom as the attached vertical map, in exactly the
same painterly style, lighting and colors, rearranged for a landscape screen:
- Right side, full height: the large stone fortress with the royal castle inside (wall with square towers, red banners, gate facing left).
- Center right: the gothic "Languages" academy (upper) and the domed "Geography" hall (lower).
- Center top: the half-timbered shop with market stalls.
- A river runs from the top edge down through the center to the bottom, with two wooden bridges.
- Top left: deep blue sea with a rocky coastline and the fleet of white-sailed galleons.
- Left: the outer stone wall running diagonally from the coast downward, with square towers and a gate; the military camp
  just inside it; the battlefield outside the wall at the bottom left.
- Roads, forest, villages and fields as in the vertical map.
Every building must stand clearly apart with empty space around it.
IMPORTANT: no text, no letters, no labels, no buttons, no icons, no UI elements anywhere in the image.
```

### 4. კომპიუტერი, ღამე — იგივე, რაც მე-2 (კომპიუტერის დღის სურათის რედაქტირებით).

## რჩევები

- სამი რეფერენსიდან **ერთი** აირჩიე და ყოველთვის ის ატვირთე — სამივე ცოტათი განსხვავდება (პირველი ორი ნათელი და ფერადია, მესამე — რბილი, ბუნებრივი).
- თუ სურათზე მაინც გამოჩნდა ტექსტი ან წარწერის აბები — სთხოვე: „Remove all text and labels, keep everything else identical“.
- თუ შენობები ერთმანეთს ეხება ან სადმე აკლია — სთხოვე გასწორება იმავე სურათზე, თავიდან ნუ დაახატვინებ.
- შეამოწმე ხელსაწყოს პირობები: სურათის კომერციული გამოყენება (საიტზე, რეკლამით) უნდა იყოს დაშვებული.

## შემდეგ (ჩემი ნაწილი)

ფაილებს ჩადებ `public/game/` საქაღალდეში (ან ჩატში გამომიგზავნი). მე:
- სურათს ვაქცევ რუკის ფონად (ტელეფონზე — ვერტიკალური, კომპიუტერზე — ჰორიზონტალური), ეკრანის ფორმაზე მოვარგებ;
- ყოველ შენობაზე დავსვამ დასაჭერ ადგილს და წარწერას (8 ენაზე, „მალე“ საკეტით) — კოორდინატებს სურათიდან ავიღებ;
- დღე / ღამე ღილაკი სურათებს შორის რბილად გადართავს; ღამის სურათის გარეშე — დღის სურათი ჩაბნელდება;
- სურათებს შევკუმშავ (WebP), რომ ტელეფონზე სწრაფად ჩაიტვირთოს; კოდით დახატული რუკა დარჩება სარეზერვოდ.
