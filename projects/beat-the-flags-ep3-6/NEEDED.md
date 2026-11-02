# Beat the Flags · части 3–6: что нужно для рендера

## Уже есть, генерировать не нужно
- **Флаги на карточках.** Все 36 (по 9 на выпуск) уже есть в открытом наборе с точными пропорциями. Я их проверил: Непал вымпелом, Монголия с соёмбо, Черногория с гербом и золотой каймой, Египет с орлом, Мексика с гербом, ЮАР и Великобритания не зеркальные.
- **Белый шар.** Все кадры уже есть: взгляды во все стороны, прищур, анфас, моргание, довольный, прыжок. Это 24 кадра из основного листа плюс W1–W6.
- **Оформление, анимация, музыка и звуки.** Делаю сам по шаблону первых двух выпусков: веер карточек, замки, таймер, стопка, счёт, ранги, петля. Изменения по сценарию:
  - сверху PART N;
  - в конце WHICH COUNTRY?;
  - новые реплики на плашках.

## Что нужно от тебя

### 1. Озвучка: 4 файла EN
Один файл на выпуск, реплики подряд с паузами. Разрежу сам. Девятую страну не произносить.

| Часть | Хук | Средний уровень | Счёт / FOLLOW | Финальный босс |
|---|---|---|---|---|
| 3 | Nine flags. Start easy. Finish as a geography legend? | Medium unlocked. Watch the details. | Four down. How many did you get? Follow for more! | Final boss. Can you name this country? |
| 4 | You know the famous flags. What about the last two? | Medium unlocked. Still getting them all? | Halfway check. Your score out of four? Follow for more! | Final flag. The answer is yours. |
| 5 | Five seconds. One flag. How long can you stay perfect? | Medium level. Keep that streak going. | Four flags done. Still a perfect score? Follow for more! | Final boss. No reveal this time. |
| 6 | Easy flags first. A mystery flag last. Ready to play? | Medium unlocked. Take a closer look. | Four down. Keep your score. Follow for the next quiz! | One last flag. What's your guess? |

Общие реплики, одинаковые во всех выпусках: «Five seconds each. Keep your score!», «Hard level. Stay focused.», «Expert unlocked. Two flags left. Can you finish strong?», «Know it?», «Comment your score and the final country. Follow for the next challenge!». Плюс 8 названий стран.

### 2. Флаговые шары: 32 листа, 80 кадров
Один PNG на страну, кадры в ряд, подписи A/B/C/D под шарами, белый или прозрачный фон. Стиль и общий промпт как в прошлый раз (`beat-the-flags-ep2/ball_prompts.md`). В генератор прикладывай референс: белый шар анфас (кадр 05) и любой готовый флаговый шар.

Кадры у всех выпусков одинаковые:
- **A** — анфас, глаза открыты, смотрит на зрителя;
- **B** — довольный, глаза-дуги (^ ^);
- **страна 2:** ещё **C** (вытянут вертикально, глаза на зрителя) и **D** (сплющен, довольный);
- **страна 5:** ещё **C** (удивление, широкие круглые глаза, маленькие зрачки);
- **страна 8:** ещё **C** (уверенный взгляд, полуприкрытые веки).

Девятую страну не генерировать.

| Часть | Шары (A, B + доп.) |
|---|---|
| 3 | Japan · **Germany +C,D** · Italy · Argentina · **South Africa +C** · Morocco · Vietnam · **Nepal +C** |
| 4 | United States · **France +C,D** · Norway · Türkiye · **Mexico +C** · Georgia · Lebanon · **Azerbaijan +C** |
| 5 | United Kingdom · **Australia +C,D** · Finland · China · **Portugal +C** · Pakistan · Uruguay · **Croatia +C** |
| 6 | Spain · **South Korea +C,D** · Belgium · Israel · **Chile +C** · Indonesia · Ghana · **Egypt +C** |

### Описание флагов для промпта (добавлять после общего)
- **Japan:** white ball with a red disc in the centre (below the eyes).
- **Germany:** horizontal black, red, gold stripes, top to bottom.
- **Italy:** vertical green, white, red stripes, green on the left.
- **Argentina:** light blue, white, light blue horizontal stripes, small golden sun with a face in the centre.
- **South Africa:** green horizontal Y shape with white and gold borders, black triangle on the left (hoist), red top band, blue bottom band.
- **Morocco:** red field, green interlaced five-pointed star outline in the centre.
- **Vietnam:** red field, large yellow five-pointed star.
- **Nepal:** a NORMAL ROUND ball painted crimson with a blue border band, white crescent moon in the upper part and white sun in the lower part (the flag's two-pennant shape is NOT the ball's shape).
- **United States:** red and white horizontal stripes, blue canton top-left with small white stars.
- **France:** vertical blue, white, red stripes, blue on the left.
- **Norway:** red field, blue Nordic cross with white border, vertical bar shifted left.
- **Türkiye:** red field, white crescent and star (star to the right of the crescent).
- **Mexico:** vertical green, white, red stripes, small eagle-on-cactus emblem in the white centre (below the eyes).
- **Georgia:** white field, large red cross, four small red crosses in the corners.
- **Lebanon:** red, white, red horizontal stripes (white band wide), green cedar tree in the centre.
- **Azerbaijan:** horizontal light blue, red, green stripes, white crescent and eight-pointed star in the red stripe.
- **United Kingdom:** Union Flag, correct asymmetric red diagonals, not mirrored.
- **Australia:** dark blue field, Union Flag in the top-left, large white seven-pointed star below it, Southern Cross stars on the right.
- **Finland:** white field, blue Nordic cross, vertical bar shifted left.
- **China:** red field, one large and four small yellow stars in the top-left.
- **Portugal:** green on the left (about 2/5), red on the right, coat of arms on an armillary sphere at the border.
- **Pakistan:** dark green field with a white vertical band on the left, white crescent and star.
- **Uruguay:** white and blue horizontal stripes, golden sun with a face in the white top-left square.
- **Croatia:** horizontal red, white, blue stripes, red-white checkerboard shield with a small crown in the centre.
- **Spain:** red, yellow (wide), red horizontal stripes, coat of arms on the left side of the yellow band.
- **South Korea:** white field, red-blue taegeuk circle in the centre, four black trigrams in the corners.
- **Belgium:** vertical black, yellow, red stripes, black on the left.
- **Israel:** white field, two blue horizontal stripes, blue Star of David in the centre.
- **Chile:** white top half, red bottom half, blue square top-left with one white star.
- **Indonesia:** red top half, white bottom half (not Poland: red is on TOP).
- **Ghana:** horizontal red, gold, green stripes, black five-pointed star in the centre.
- **Egypt:** horizontal red, white, black stripes, small golden eagle in the white band.

## Проверь перед отправкой
- Флаг не зеркальный: кресты Норвегии и Финляндии, канты Уругвая и Чили, герб Испании, Португалия зелёным слева.
- Индонезия красным сверху, Германия чёрным сверху, Египет красным сверху.
- Шар Непала круглый, не вымпел.
- Нет рта, рук, подписей на шаре; глаза на том же месте и того же размера, что у белого анфаса.
