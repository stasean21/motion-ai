# YOUR COUNTRY'S HALLOWEEN FORM — пакет на генерацию

## Порядок работы (обязательно)

1. Ты генерируешь картинки по этому списку.
2. Я собираю из слоёв **статичные макеты** всех ключевых кадров и раскадровку с таймингом.
3. Ты утверждаешь макеты (или просишь правки).
4. **Только после утверждения** я анимирую и собираю видео. Без одобрения макетов видео не делаем.

---

## Технические требования ко всем картинкам

- Формат **9:16**, минимум **1080×1920**, лучше **2160×3840**. PNG.
- В каждой генерации прикладывай как референс стиля свой утверждённый кадр этой сцены
  (`assets/keyframes/*.png`) — так сохранится тот же рисунок, неон и шрифты.
- **Персонажи и предметы** — на ровном хромакее, без теней, без свечения, без отражения
  (свет, свечение и отражение я добавлю сам — так ничего не исказится):
  - зелёный **#00FF00** — для всех;
  - маджента **#FF00FF** — для тех, где есть зелёный цвет: Бразилия, Земля, зелёная тыква, Египет (зелёные глаза).
- **Надписи и светящиеся карты** — на **чисто чёрном #000000** (я накладываю их режимом «экран»).
- **Фоны (сцена)** — без персонажа, без надписи, без карты: только небо, туман, частицы, глянцевый пол, свечение горизонта.
- У одного персонажа во всех состояниях одинаковые размер, ракурс и положение: шар по центру, диаметр около 55% ширины кадра,
  снизу запас 10%. Свет сверху слева.
- Если генератор умеет PNG с прозрачностью — можно прозрачный фон вместо хромакея.

### Общий стиль (добавляй в конец каждого промпта)

```
countryball style, polished 2D cartoon illustration with soft 3D shading, thick clean black outline,
glossy sphere highlight top-left, flag clearly recognizable, countryball eyes (white, bold black outline),
vibrant neon halloween palette, high detail, crisp edges, no text unless specified, no watermark
```

### Как называть файлы

`<сцена>__<слой>.png`, например `01_brazil__char_wolf.png`. Названия — в списке ниже, по ним я соберу всё автоматически.

---

## 00 · ВСТУПЛЕНИЕ

| Файл | Промпт |
|---|---|
| `00_intro__bg.png` | `empty dark halloween night stage, black-purple sky with subtle fog and tiny glowing particles, wet glossy black reflective floor in the lower third, warm orange glow along the horizon line, no objects, no text, vertical 9:16` |
| `00_intro__title.png` | `text "YOUR COUNTRY'S" on first line and "HALLOWEEN FORM" on second line, bold heavy rounded sans-serif, white letters with thick green neon glow, slight 3D extrusion, centered, on pure black background, nothing else` |
| `00_intro__pumpkin_orange.png` | `single cute evil jack-o'-lantern, orange, carved glowing face, green stem, front view, centered, on flat #00FF00 green background, no shadow, no glow` |
| `00_intro__pumpkin_yellow.png` | то же, `yellow pumpkin` |
| `00_intro__pumpkin_green.png` | то же, `acid green pumpkin`, фон `#FF00FF magenta` |
| `00_intro__pumpkin_blue.png` | то же, `ice blue pumpkin` |
| `00_intro__pumpkin_purple.png` | то же, `purple pumpkin` |
| `00_intro__pumpkin_purple_eye.png` | то же, `purple pumpkin with one realistic glowing eye inside the carved eye hole` |
| `00_intro__pumpkin_red.png` | то же, `red pumpkin` |

---

## 01 · BRAZIL · WEREWOLF (жёлто-зелёный)

| Файл | Промпт |
|---|---|
| `01_brazil__bg.png` | `empty dark night stage, black sky with yellow-green smoke and glowing particles, wet glossy reflective black floor in lower third, bright yellow horizon glow, no moon, no text, no objects, vertical 9:16` |
| `01_brazil__moon.png` | `large full moon, pale yellow, detailed craters, soft halo, centered, on pure black background` |
| `01_brazil__map.png` | `silhouette map of Brazil filled with bright neon green, glowing edges, flat, centered, on pure black background` |
| `01_brazil__title.png` | `text "BRAZIL" huge bold heavy sans-serif, bright yellow with yellow glow, and below it small brush-script word "WEREWOLF" in yellow, slightly overlapping the bottom-left of BRAZIL, on pure black background` |
| `01_brazil__char_normal.png` | `Brazil countryball, Brazilian flag on the sphere, neutral happy countryball eyes, no costume, front view, centered, on flat #FF00FF magenta background, no shadow` |
| `01_brazil__char_blink.png` | то же, `eyes closed (blinking)` |
| `01_brazil__char_wolf.png` | `Brazil countryball as a werewolf: furry brown wolf ears on top, small white fangs, angry narrowed countryball eyes, front view, centered, on flat #FF00FF magenta background, no shadow` |
| `01_brazil__char_howl.png` | то же, но `head tilted back, eyes closed, mouth wide open howling, fangs visible` |

---

## 02 · USA · JACK-O'-LANTERN (оранжево-золотой)

| Файл | Промпт |
|---|---|
| `02_usa__bg.png` | `empty dark night stage, black sky with warm orange particles and light smoke, glossy reflective black floor in lower third, golden-orange horizon glow, no text, no objects, vertical 9:16` |
| `02_usa__map.png` | `silhouette map of the contiguous USA filled with glowing orange fire texture, bright edges, on pure black background` |
| `02_usa__title.png` | `text "USA" huge bold heavy sans-serif, golden orange with glow, below it "JACK-O'-LANTERN" in smaller bold letters, centered, on pure black background` |
| `02_usa__smoke.png` | `big puffy cloud of orange smoke, soft volumetric, on pure black background` |
| `02_usa__char_normal.png` | `USA countryball, American flag on the sphere (stars top-left, stripes), neutral countryball eyes, front view, centered, on flat #00FF00 green background, no shadow` |
| `02_usa__char_blink.png` | то же, `eyes closed` |
| `02_usa__char_pumpkin_off.png` | `USA countryball turned into a pumpkin: pumpkin ribs on the sphere, green stem on top, American flag still clearly visible, carved triangle eyes and grin are dark (not lit yet), front view, centered, on flat #00FF00 green background` |
| `02_usa__char_pumpkin_lit.png` | то же, `carved triangle eyes and toothy grin glowing bright yellow-orange from inside` |
| `02_usa__char_pumpkin_wink.png` | то же, `glowing face, right eye winking (crescent), big glowing grin` |

---

## 03 · UNITED KINGDOM · GHOST (ледяной голубой)

| Файл | Промпт |
|---|---|
| `03_uk__bg.png` | `empty dark night stage, deep blue-black starry sky with ice blue mist, glossy reflective black floor in lower third, cold blue horizon glow, no text, no objects, vertical 9:16` |
| `03_uk__map.png` | `silhouette map of Great Britain and Northern Ireland, glowing ice blue, on pure black background` |
| `03_uk__title.png` | `text "UNITED" first line and "KINGDOM" second line, huge bold heavy sans-serif, ice blue with glow, below small white word "GHOST", left aligned block, on pure black background` |
| `03_uk__char_normal.png` | `United Kingdom countryball, Union Jack flag on the sphere, neutral countryball eyes, front view, centered, on flat #00FF00 green background, no shadow` |
| `03_uk__sheet.png` | `white translucent bedsheet fabric flying and twirling in the air, soft folds, on flat #00FF00 green background` |
| `03_uk__char_ghost.png` | `UK countryball as a cute ghost: translucent white sheet with Union Jack printed on it covering the ball, wavy bottom edge, floating, round countryball eyes with small pupils, front view, centered, on flat #00FF00 green background, no glow` |
| `03_uk__char_ghost_boo.png` | то же, но `huge round eyes, small open "boo" mouth, leaning toward the viewer` |

---

## 04 · JAPAN · FOX MASK (красный + голубое пламя)

| Файл | Промпт |
|---|---|
| `04_japan__bg.png` | `empty dark night stage, black sky with red smoke and red particles, glossy reflective black floor in lower third, red horizon glow, no text, no objects, vertical 9:16` |
| `04_japan__map.png` | `silhouette map of Japan, glowing red, on pure black background` |
| `04_japan__title.png` | `text "JAPAN" huge bold heavy sans-serif, bright red with glow, below it brush-script "FOX MASK" in light pink-red, on pure black background` |
| `04_japan__flame.png` | `stylized blue spirit flame (hitodama), bright cyan with white core, single flame, on pure black background` |
| `04_japan__char_normal.png` | `Japan countryball, white sphere with red circle, neutral countryball eyes, front view, centered, on flat #00FF00 green background, no shadow` |
| `04_japan__mask_left.png` | `left half of a white kitsune fox mask with red markings, flying, on flat #00FF00 green background` |
| `04_japan__mask_right.png` | `right half of a white kitsune fox mask with red markings, flying, on flat #00FF00 green background` |
| `04_japan__char_mask_dark.png` | `Japan countryball wearing a white kitsune fox mask with red markings over the lower front, red circle visible above the mask, eye slits are dark, front view, centered, on flat #00FF00 green background` |
| `04_japan__char_mask_glow.png` | то же, `glowing red eyes in the mask slits` |
| `04_japan__char_mask_turn.png` | то же, `head turned 3/4 to the right, glowing red eyes` |

---

## 05 · EGYPT · MUMMY (песочное золото + ядовито-зелёный)

| Файл | Промпт |
|---|---|
| `05_egypt__bg.png` | `empty dark night stage, black sky with golden-yellow smoke and particles, distant pyramids silhouettes, glossy reflective black floor in lower third, golden horizon glow, no text, no characters, vertical 9:16` |
| `05_egypt__map.png` | `silhouette map of Egypt with Nile line, glowing golden yellow, on pure black background` |
| `05_egypt__title.png` | `text "EGYPT" huge bold heavy sans-serif, golden yellow with glow, below it brush-script "MUMMY" in yellow, on pure black background` |
| `05_egypt__char_normal.png` | `Egypt countryball, Egyptian flag (red, white with golden eagle, black) on the sphere, neutral countryball eyes, front view, centered, on flat #FF00FF magenta background, no shadow` |
| `05_egypt__char_half.png` | `Egypt countryball half wrapped in mummy bandages (bandages on the bottom half only), neutral eyes, front view, centered, on flat #FF00FF magenta background` |
| `05_egypt__char_mummy.png` | `Egypt countryball fully wrapped in beige mummy bandages, gap for eyes showing the flag, angry glowing green countryball eyes, loose bandage end flowing to the right, front view, centered, on flat #FF00FF magenta background` |
| `05_egypt__bandage.png` | `long loose beige mummy bandage strip flowing in a wave, on flat #FF00FF magenta background` |

---

## 06 · ROMANIA · VAMPIRE (фиолетовый + кроваво-красный)

| Файл | Промпт |
|---|---|
| `06_romania__bg.png` | `empty dark night stage, black-purple sky with magenta smoke and red particles, glossy reflective black floor in lower third, purple-pink horizon glow, no moon, no text, no objects, vertical 9:16` |
| `06_romania__moon.png` | `large full moon tinted lavender purple, craters, soft halo, on pure black background` |
| `06_romania__map.png` | `silhouette map of Romania filled with Romanian flag colors (blue, yellow, red vertical), glowing edges, on pure black background` |
| `06_romania__title.png` | `text "ROMANIA" huge bold heavy sans-serif, bright violet with glow, below it red brush-script "VAMPIRE", on pure black background` |
| `06_romania__char_cocoon.png` | `Romania countryball completely wrapped in a black vampire cape with red lining, only the top of the flag sphere and eyes visible, front view, centered, on flat #00FF00 green background` |
| `06_romania__char_vampire.png` | `Romania countryball as a vampire, Romanian flag on the sphere, black cape with red lining and high collar behind, smug narrowed countryball eyes, two small fangs, front view, centered, on flat #00FF00 green background` |
| `06_romania__char_open.png` | то же, `cape spread wide open like wings, grinning with fangs` |
| `06_romania__bats.png` | `three black bat silhouettes in different flying poses (wings up, wings down, gliding), spaced apart, on flat #00FF00 green background` |

---

## 07 · ONE MORE GUEST (тревожный красный)

| Файл | Промпт |
|---|---|
| `07_guests__bg.png` | `empty dark stage, deep red-black sky with red smoke, glossy reflective dark floor in lower half, dim red horizon glow, ominous, no text, no characters, vertical 9:16` |
| `07_guests__title.png` | `text "ONE MORE" first line and "GUEST..." second line, huge bold heavy sans-serif, red with fiery glow, on pure black background` |
| `07_guests__sheet_happy.png` | `character sheet, six countryballs in halloween costumes standing in one row with wide gaps between them: Brazil werewolf, USA jack-o'-lantern, UK ghost, Japan with fox mask on the side of the head, Egypt mummy, Romania vampire, happy party expressions, front view, same size, on flat #FF00FF magenta background, no shadows` |
| `07_guests__sheet_scared.png` | то же, но `all looking up in fear, big round eyes with tiny pupils, small sweat drops` |

---

## 08 · EARTH (зелёный + красный контровой)

| Файл | Промпт |
|---|---|
| `08_earth__bg.png` | `empty dark stage, black sky with toxic green and red smoke, glossy reflective dark floor in lower quarter, green horizon glow, no text, no characters, vertical 9:16` |
| `08_earth__title.png` | `text "EARTH" huge bold heavy sans-serif, toxic neon green with glow, on pure black background` |
| `08_earth__subtitle.png` | `text "NO COSTUME." white brush-script, slightly tilted, on pure black background` |
| `08_earth__char_friendly.png` | `Earth ball (planet Earth as a countryball, blue oceans, green continents), calm friendly face, eyes closed, gentle smile, front view, centered, on flat #FF00FF magenta background, no glow` |
| `08_earth__char_eyes.png` | то же, `eyes open, glowing unnatural green, angry, no mouth` |
| `08_earth__char_grin.png` | то же, `glowing green angry eyes, huge sharp toothy grin across the bottom half` |
| `08_earth__char_wink.png` | то же, `huge toothy grin, one eye winking` |

Маленьких персонажей для сцены Земли беру из `07_guests__sheet_scared.png`.

---

## 09 · WHICH ONE ARE YOU?

| Файл | Промпт |
|---|---|
| `09_final__bg.png` | `empty dark cosmic stage, purple-blue nebula sky with multicolor glowing particles, glossy reflective floor in lower third, purple horizon glow, no text, no characters, vertical 9:16` |
| `09_final__title.png` | `text "WHICH ONE ARE YOU?" one line, huge bold heavy condensed sans-serif, white with purple glow, on pure black background` |
| `09_final__sheet_flee.png` | `character sheet, the same six halloween countryballs (Brazil werewolf, USA pumpkin, UK ghost, Japan fox mask, Egypt mummy, Romania vampire) running away in panic, dynamic poses, spaced apart, on flat #FF00FF magenta background` |

Тыквы для финала беру из вступления, Землю — `08_earth__char_wink.png`.

---

## Что я делаю сам (генерировать не нужно)

Следы когтей, дым-переход, искры и частицы, свечение и отражения на полу, тени, вспышки, следы полёта тыкв,
дрожь и прыжки персонажей.

## Итого: 72 картинки

| Сцена | Кол-во |
|---|---|
| 00 Вступление | 9 |
| 01 Brazil | 8 |
| 02 USA | 9 |
| 03 UK | 7 |
| 04 Japan | 10 |
| 05 Egypt | 7 |
| 06 Romania | 8 |
| 07 Guests | 4 |
| 08 Earth | 7 |
| 09 Final | 3 |
