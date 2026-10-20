# Версия 2 — текст говорит суть видео (как у референсов)

Формула референсов:
- **маленькая белая строка сверху** задаёт тему;
- **огромная красная строка снизу** даёт панчлайн;
- **плашка с цифрой** на карте объясняет, ЧТО сравниваем.

В первой версии было «= 1 INDIA?», а непонятно, что с чем сравнивается. Теперь метрика (люди или электричество) всегда видна в плашке и в тексте.

**Шрифт.** Как у референсов: пиксельный аркадный (Pixelify Sans Bold / Silkscreen / Press Start 2P). Белая строка, под ней красная строка (#FF2E3A) с тёмно-бордовой обводкой и 3D-тенью вниз.

**Компоновка:**
- сверху по центру — огромная страна-персонаж с эмоцией;
- вокруг — карта мира со странами-персонажами и маленькими плашками-числами;
- текст — по центру снизу на 40% высоты кадра.

| Выпуск | Плашка (сверху над текстом) | Белая строка | Красная строка |
|---|---|---|---|
| 01 Индия | 👥 1.46 BILLION PEOPLE | 1 INDIA = | 26 COUNTRIES?! |
| 02 Китай (население) | 👥 1.42 BILLION PEOPLE | CHINA vs | 25 COUNTRIES! |
| 03 Китай (электричество) | ⚡ 10,025 TWh A YEAR | CHINA’S ELECTRICITY | vs 25 COUNTRIES! |

Запасные панчлайны (для теста A/B):
- 01 — белая «26 COUNTRIES TO MATCH», красная «INDIA?!»;
- 02 — белая «STILL SHORT AT», красная «92.5%!»;
- 03 — белая «ONLY THE USA CAN», красная «BEAT CHINA?» (на обложке США и Китай).

## 01 — промпт
```
[STYLE ANCHOR] — Top center: a huge India-shaped cartoon character filled with the Indian flag, smug confident half-closed eyes with a raised eyebrow, slightly overlapping the top edge. Around it on the world map: small flag-filled country characters (Uruguay, Norway, Brazil, USA, Japan, Germany) with worried eyes, each with a tiny rounded label pill showing a population number like "3.4M", "212.8M", "347.3M". Above the text a dark rounded pill with a yellow-orange border reading "👥 1.46 BILLION PEOPLE". Bottom center, big pixel arcade font: white line "1 INDIA =" and below it a huge red line "26 COUNTRIES?!" with dark maroon outline and 3D drop shadow.
```
```
[ЯКОРЬ СТИЛЯ] — Сверху по центру огромный мультяшный персонаж в форме Индии, залит индийским флагом, самоуверенный прищур с поднятой бровью, слегка выходит за верхний край. Вокруг на карте маленькие страны-персонажи с флагами (Уругвай, Норвегия, Бразилия, США, Япония, Германия) с обеспокоенными глазами, у каждой крошечная скруглённая плашка с населением: «3.4M», «212.8M», «347.3M». Над текстом тёмная скруглённая плашка с жёлто-оранжевой рамкой: «👥 1.46 BILLION PEOPLE». Внизу по центру крупный пиксельный аркадный шрифт: белая строка «1 INDIA =», под ней огромная красная «26 COUNTRIES?!» с тёмно-бордовой обводкой и 3D-тенью.
```

## 02 — промпт
```
[STYLE ANCHOR] — Top center: a huge China-shaped cartoon character filled with the Chinese flag, big angry-determined red eyes with thick black brows, yellow stars on its body. Around it: flag-filled country characters (Nigeria, Japan, Bangladesh, Germany, Philippines) with tense eyes and tiny label pills "237.5M", "123.1M", "175.7M", "116.8M". Above the text a dark rounded pill with orange border reading "👥 1.42 BILLION PEOPLE". Bottom center, big pixel arcade font: white line "CHINA vs" and below a huge red line "25 COUNTRIES!" with dark maroon outline and 3D drop shadow.
```
```
[ЯКОРЬ СТИЛЯ] — Сверху по центру огромный мультяшный Китай, залит китайским флагом, большие сердито-решительные красные глаза с толстыми чёрными бровями, жёлтые звёзды на теле. Вокруг страны-персонажи с флагами (Нигерия, Япония, Бангладеш, Германия, Филиппины) с напряжёнными глазами и крошечными плашками «237.5M», «123.1M», «175.7M», «116.8M». Над текстом тёмная скруглённая плашка с оранжевой рамкой: «👥 1.42 BILLION PEOPLE». Внизу по центру крупный пиксельный аркадный шрифт: белая строка «CHINA vs», под ней огромная красная «25 COUNTRIES!» с тёмно-бордовой обводкой и 3D-тенью.
```

## 03 — промпт
```
[STYLE ANCHOR] — Top center: a huge China-shaped cartoon character filled with the Chinese flag, glowing angry eyes, small yellow lightning bolts crackling around its outline, wearing a tiny hard hat. Around it: flag-filled country characters (USA big and excited, Japan, Brazil, Canada, France) with little cartoon generator icons (circle with a sine wave) and tiny label pills "4,391 TWh", "1,015 TWh", "751 TWh". Above the text a dark rounded pill with yellow border reading "⚡ 10,025 TWh A YEAR". Bottom center, big pixel arcade font: white line "CHINA’S ELECTRICITY" and below a huge red line "vs 25 COUNTRIES!" with dark maroon outline and 3D drop shadow. No batteries, no green eco symbols.
```
```
[ЯКОРЬ СТИЛЯ] — Сверху по центру огромный мультяшный Китай, залит китайским флагом, светящиеся сердитые глаза, по контуру потрескивают маленькие жёлтые молнии, на голове крошечная каска. Вокруг страны-персонажи с флагами (большие восторженные США, Япония, Бразилия, Канада, Франция) с мультяшными значками генератора (круг с синусоидой) и крошечными плашками «4,391 TWh», «1,015 TWh», «751 TWh». Над текстом тёмная скруглённая плашка с жёлтой рамкой: «⚡ 10,025 TWh A YEAR». Внизу по центру крупный пиксельный аркадный шрифт: белая строка «CHINA’S ELECTRICITY», под ней огромная красная «vs 25 COUNTRIES!» с тёмно-бордовой обводкой и 3D-тенью. Без батареек и «зелёных» эко-символов.
```

---

# Версия 1 (первая подача)

# Промпты для превью — Map by Map, выпуски 01–03

Стиль взят со скрина работающих обложек:
- карта мира с голубым океаном;
- страны залиты своими флагами, у них мультяшные глаза и эмоции;
- огромные короткие слова в 1–2 строки, толстая чёрная обводка и тень;
- штампы, ленты и печати;
- насыщенные цвета;
- один крупный «герой» в центре.

Такая обложка читается и ребёнком, и взрослым за полсекунды.

**Как пользоваться:**
- Промпты универсальные: Nano Banana / Gemini, GPT-image, Midjourney (`--ar 16:9 --v 6.1`), Ideogram.
- Текст на обложке лучше наложить потом в редакторе (Canva/Figma), шрифт Luckiest Guy / Lilita One / Bangers с чёрной обводкой 12–16 px. Генераторы часто портят буквы. Если генератор хорошо пишет текст (Ideogram, GPT-image, Nano Banana), оставьте фразу в кавычках как есть.
- Блок «Якорь стиля» вставляйте в начало каждого промпта: так все три обложки будут из одной серии.

---

## Якорь стиля (вставлять первым)

```
Bold YouTube thumbnail, 16:9, flat 2D cartoon vector illustration, world map with bright turquoise-blue ocean and soft white clouds, countries drawn as chunky rounded shapes filled with their national flag patterns, each country has big expressive cartoon eyes (glossy, thick black outlines), thick dark outlines on every shape, highly saturated colors, strong contrast, one huge hero element in the center, clean composition readable at small size, playful but not childish
```

```
Яркое превью для YouTube, 16:9, плоская мультяшная 2D-векторная иллюстрация, карта мира с ярко-бирюзовым океаном и мягкими белыми облаками, страны — округлые пухлые фигуры, залитые узорами своих флагов, у каждой страны большие выразительные мультяшные глаза (глянцевые, с толстой чёрной обводкой), толстый тёмный контур у всех фигур, очень насыщенные цвета, сильный контраст, один огромный главный элемент по центру, чистая композиция, читаемая в маленьком размере, игриво, но не по-детски
```

**Негатив (для SD/ComfyUI/Ideogram):**
```
photorealistic, 3D render, gradients mush, blurry, tiny unreadable text, misspelled text, extra letters, cluttered background, watermark, logo, real people, flags with wrong symbols, distorted country shapes
```

---

## Выпуск 01 — How many countries does it take to match India?

### Вариант A (основной) — «великан против толпы»
**Текст на обложке:** `26 COUNTRIES` (сверху) и `= 1 INDIA?` (снизу, оранжевым)

```
[STYLE ANCHOR] — In the center-right, a giant India-shaped character filled with the Indian flag (saffron, white, green, navy Ashoka wheel), smug confident eyes, arms crossed, towering over the scene. On the left, a crowd of 26 tiny country characters with flag patterns (Uruguay, Norway, Finland, Brazil, USA, Japan, Germany, France, UK and others) stacked on each other's shoulders in a wobbly tower, sweating, determined eyes, trying to reach India's height. A big orange progress bar at the bottom almost full. Huge chunky white text with thick black outline and drop shadow: "26 COUNTRIES" at the top and "= 1 INDIA?" below in bright orange.
```
```
[ЯКОРЬ СТИЛЯ] — Справа по центру огромный персонаж в форме Индии, залитый индийским флагом (шафран, белый, зелёный, тёмно-синее колесо Ашоки), самоуверенный взгляд, руки скрещены, возвышается над сценой. Слева толпа из 26 маленьких стран-персонажей с флагами (Уругвай, Норвегия, Финляндия, Бразилия, США, Япония, Германия, Франция, Великобритания и другие) стоят друг у друга на плечах шаткой башней, потеют, решительные глаза, пытаются дотянуться до роста Индии. Внизу большая оранжевая шкала прогресса, почти полная. Огромный пухлый белый текст с толстой чёрной обводкой и тенью: «26 COUNTRIES» сверху и «= 1 INDIA?» снизу ярко-оранжевым.
```

### Вариант B — «весы»
**Текст:** `INDIA vs 26 COUNTRIES`
```
[STYLE ANCHOR] — A giant cartoon balance scale in the center over the world map. On one pan sits a single big India character (Indian flag fill, calm smiling eyes). On the other pan, a pile of 26 small flag-filled country characters with nervous eyes, the scale perfectly balanced. Sparkles around the pivot. Huge chunky text with thick black outline: "INDIA" in orange on the left, "vs" small, "26 COUNTRIES" in turquoise on the right.
```
```
[ЯКОРЬ СТИЛЯ] — По центру над картой мира огромные мультяшные весы. На одной чаше сидит одна большая Индия (залита флагом, спокойная улыбка). На другой — куча из 26 маленьких стран с флагами и нервными глазами, весы в идеальном равновесии. Искры вокруг оси. Огромный пухлый текст с толстой чёрной обводкой: «INDIA» оранжевым слева, маленькое «vs», «26 COUNTRIES» бирюзовым справа.
```

---

## Выпуск 02 — How many countries does it take to match China's population?

### Вариант A (основной) — «дракон-Китай и команда»
**Текст:** `25 COUNTRIES` / `vs CHINA?`
```
[STYLE ANCHOR] — A huge China-shaped character in the right half, filled with the Chinese flag (red with yellow stars), confident grinning eyes, one eyebrow raised. Facing it on the left, a team of 25 small country characters with flag fills (Nigeria, Japan, Bangladesh, Germany, Philippines, France, UK and others) lined up like a sports team in turquoise jerseys, determined eyes, the Philippines character in front holding a turquoise flag. A glowing "VS" badge in the middle. Huge chunky white text with thick black outline: "25 COUNTRIES" at the top and "vs CHINA?" below with "CHINA" in bright red-orange.
```
```
[ЯКОРЬ СТИЛЯ] — В правой половине огромный персонаж в форме Китая, залитый китайским флагом (красный с жёлтыми звёздами), уверенная ухмылка, одна бровь поднята. Напротив, слева — команда из 25 маленьких стран с флагами (Нигерия, Япония, Бангладеш, Германия, Филиппины, Франция, Великобритания и др.), выстроены как спортивная команда в бирюзовых футболках, решительные глаза, впереди Филиппины с бирюзовым флажком. Посередине светящийся значок «VS». Огромный пухлый белый текст с толстой чёрной обводкой: «25 COUNTRIES» сверху и «vs CHINA?» снизу, слово «CHINA» ярко-красно-оранжевое.
```

### Вариант B — «почти!» (интрига 92.5%)
**Текст:** `92.5%` + штамп `STILL SHORT!`
```
[STYLE ANCHOR] — World map background with China glowing orange. A giant chunky progress bar across the image filled to about 92 percent in turquoise, with a tiny empty gap before an orange finish flag with the Chinese flag. Cartoon country characters (Nigeria, Japan, Bangladesh, Germany) pushing the bar forward with sweaty, strained faces; a small Philippines character running in from the right edge with a "?" above its head. A red rubber-stamp style badge tilted across the corner reading "STILL SHORT!". Huge chunky number "92.5%" with thick black outline in turquoise.
```
```
[ЯКОРЬ СТИЛЯ] — Фон — карта мира, Китай светится оранжевым. Через всё изображение огромная пухлая шкала прогресса, заполненная бирюзовым примерно на 92%, перед оранжевым финишным флажком с китайским флагом остаётся крошечный пустой зазор. Мультяшные страны (Нигерия, Япония, Бангладеш, Германия) толкают шкалу вперёд, потные напряжённые лица; маленькие Филиппины вбегают с правого края, над головой «?». По углу наискосок красный штамп-печать «STILL SHORT!». Огромное пухлое число «92.5%» бирюзовым с толстой чёрной обводкой.
```

---

## Выпуск 03 — How many countries generate as much electricity as China?

### Вариант A (основной) — «перетягивание тока»
**Текст:** `25 COUNTRIES` / `vs CHINA ⚡`
```
[STYLE ANCHOR] — China character in the right half, filled with the Chinese flag, wearing a cartoon hard hat, holding a giant glowing power plug, confident eyes. On the left, a team of country characters (United States big in front, Japan, Brazil, Canada, France, Germany behind) pulling a thick glowing electric cable like tug-of-war, energetic eyes, little lightning sparks along the cable, cartoon generator icons (circle with a sine wave) floating around. A giant electric meter dial in the center with the needle near the red zone. Huge chunky white text with thick black outline: "25 COUNTRIES" top, "vs CHINA" bottom in bright orange, a yellow lightning bolt next to it.
```
```
[ЯКОРЬ СТИЛЯ] — В правой половине Китай, залит китайским флагом, в мультяшной каске, держит огромную светящуюся вилку, уверенный взгляд. Слева команда стран (впереди большие США, за ними Япония, Бразилия, Канада, Франция, Германия) тянут толстый светящийся электрический кабель, как канат, энергичные глаза, вдоль кабеля маленькие искры молний, вокруг парят мультяшные значки генератора (круг с синусоидой). По центру огромный циферблат счётчика, стрелка у красной зоны. Огромный пухлый белый текст с толстой чёрной обводкой: «25 COUNTRIES» сверху, «vs CHINA» снизу ярко-оранжевым, рядом жёлтая молния.
```

### Вариант B — «США переворачивают игру»
**Текст:** `110%!` + лента `WHO TIPS IT OVER?`
```
[STYLE ANCHOR] — A giant turquoise progress bar bursting past an orange finish line with the Chinese flag, the overflow segment glowing light turquoise with electric sparks. A United States character (US flag fill, star-spangled, excited wide eyes) crashing through the finish line like a superhero, cape made of a power cable. Smaller Japan, Brazil and Canada characters cheering behind. Diagonal caution-tape ribbon across the bottom corner reading "WHO TIPS IT OVER?". Huge chunky number "110%!" in turquoise with thick black outline and a lightning bolt.
```
```
[ЯКОРЬ СТИЛЯ] — Огромная бирюзовая шкала прогресса пробивает оранжевую финишную линию с китайским флагом, перелёт светится светло-бирюзовым с электрическими искрами. Персонаж США (залит американским флагом, восторженные широкие глаза) пробивает финиш, как супергерой, плащ из силового кабеля. Позади ликуют маленькие Япония, Бразилия и Канада. По нижнему углу наискосок лента-ограждение «WHO TIPS IT OVER?». Огромное пухлое число «110%!» бирюзовым с толстой чёрной обводкой и молнией.
```

> Для выпуска 03 не стоит рисовать батарейку с зарядом (бриф запрещает: это «запасённое» электричество) и делать всё зелёным/«чистым» — это не про чистую энергию.

---

## Советы по серии
- **Единый цветовой код** на всех трёх обложках: «цель» (Индия/Китай) оранжевая, команда стран бирюзовая. Зритель запомнит формат канала.
- **Не больше 3–4 слов** крупного текста. Число или вопрос («92.5%», «110%!», «= 1 INDIA?») цепляет сильнее длинной фразы.
- **Эмоции глаз.** У «цели» самоуверенность, у команды напряжение и решимость. Это и даёт историю на обложке, как на ваших примерах с HATE и BANNED.
- **Две версии.** Для каждого выпуска сделайте A и B и запустите тест обложек в YouTube Studio («Test & Compare»).
