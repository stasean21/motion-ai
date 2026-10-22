# Коктейльные Reels

Вертикальные ролики 1080×1920 (9:16) для YouTube Shorts, Instagram Reels и TikTok.
Один ролик — одна папка `NN-название/`.

Стиль серии: ар-деко, барное меню 1920-х. Шрифты Poiret One (тонкий геометричный) и Great Vibes (вывеска), оба с кириллицей, лежат в `fonts/` каждого ролика.

## Структура папки ролика

| Файл | Что это |
|---|---|
| `index.html` | сцена, открывается в браузере |
| `scene.js` | вся анимация; каждый кадр считается от времени в `window.seek(t)` |
| `audio.js` | музыка и звуки, синтез в Web Audio (OfflineAudioContext) |
| `beats.mjs` | один кадр на каждый удар → `out/storyboard.jpg` |
| `render.mjs` | рендер 60 fps, 3 подкадра на кадр (tmix) + звук → `out/<имя>.mp4` |
| `fonts/` | шрифты ролика |
| `README.md` | рецепт и раскадровка |

## Как собрать

```
npm i                      # один раз в папке cocktails/
cd 01-aperol-spritz
node beats.mjs             # проверить кадры по ударам
node render.mjs aperol-spritz          # русская версия
node beats.mjs 0.35 en
node render.mjs aperol-spritz-en en    # английская версия
```

Язык переключается параметром `?lang=en` в `index.html`; все тексты лежат в словаре `TX` в начале `scene.js`.

Нужны Chromium (`/opt/pw-browsers/chromium`) и ffmpeg.

## Ролики

| № | Коктейль | Тип | Языки |
|---|---|---|---|
| 01 | [Апероль Шприц](01-aperol-spritz/) · Aperol Spritz | алкогольный | RU, EN |
| 02 | [Негрони](02-negroni/) · Negroni | алкогольный | RU, EN |
| 03 | [Мохито](03-mojito/) · Mojito | алкогольный | RU, EN |
| 04 | [Margarita](04-margarita/) · kinetic type | алкогольный | EN |
| 05 | [Espresso Martini](05-espresso-martini/) · 3D type | алкогольный | EN |
| 06 | [Margarita · photo](06-margarita-photo/) · анимация фото | алкогольный | EN |
