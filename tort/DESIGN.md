---
name: Крем и Корж — Витрина
description: Конструктор торта на кремовой бумаге; карамель подписывает и считает, малина — единственный цвет действия, торт на экране — фотокомпозит из выбора клиента.
colors:
  paper: "#F7EFE3"
  paper-deep: "#EFE3D0"
  cream: "#FFF9F0"
  caramel: "#B8742E"
  caramel-deep: "#8A5420"
  berry: "#B4304F"
  berry-deep: "#8F2440"
  berry-soft: "#F3DCE2"
  cocoa: "#3B2418"
  cocoa-deep: "#2A1810"
  cocoa-soft: "#6B4A3A"
  line: "rgba(59,36,24,0.14)"
typography:
  display:
    fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif"
    fontSize: "clamp(2.35rem, 9.2vw, 4.9rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif"
    fontSize: "clamp(1.9rem, 5.6vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif"
    fontSize: "clamp(1.45rem, 4.6vw, 1.9rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title-card:
    fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif"
    fontSize: "clamp(1.7rem, 5.5vw, 2.3rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  numeral:
    fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif"
    fontSize: "clamp(1.7rem, 6vw, 2.3rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "normal"
    fontFeature: "tabular-nums"
  phone:
    fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif"
    fontSize: "clamp(1.7rem, 7vw, 2.6rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "0.01em"
  step-numeral:
    fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif"
    fontSize: "1.1em"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
    fontStyle: italic
  mark:
    fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif"
    fontSize: "1.35rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.005em"
  plaque:
    fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif"
    fontSize: "3.5cqw"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "0.005em"
    fontStyle: italic
  lead:
    fontFamily: "Manrope, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(1.05rem, 1rem + 0.4vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  body:
    fontFamily: "Manrope, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  ui:
    fontFamily: "Manrope, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "normal"
  option-name:
    fontFamily: "Manrope, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1.05rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.005em"
  label:
    fontFamily: "Manrope, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.92rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "normal"
    fontFeature: "tabular-nums"
  caption:
    fontFamily: "Manrope, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.88rem"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "normal"
rounded:
  focus: "6px"
  thumb: "12px"
  inner: "14px"
  row: "16px"
  card: "22px"
  view: "24px"
  pill: "999px"
  circle: "50%"
spacing:
  pad: "clamp(18px, 5vw, 64px)"
  sec: "clamp(3.4rem, 9vw, 6.5rem)"
  wrap: "1180px"
  top: "88px"
  top-desktop: "110px"
  steps-gap: "2.4rem"
  opts-gap: "0.6rem"
  col-gap: "3rem"
  bar-reserve: "76px"
components:
  btn-berry:
    backgroundColor: "{colors.berry}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "0 1.5rem"
    height: "54px"
  btn-berry-hover:
    backgroundColor: "{colors.berry-deep}"
    textColor: "#FFFFFF"
  btn-line:
    backgroundColor: "transparent"
    textColor: "{colors.cocoa}"
    rounded: "{rounded.pill}"
    padding: "0 1.5rem"
    height: "54px"
  btn-line-hover:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.cocoa}"
  btn-line-dark:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    rounded: "{rounded.pill}"
    padding: "0 1.5rem"
    height: "54px"
  btn-cream:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.cocoa}"
    rounded: "{rounded.pill}"
    padding: "0 1.5rem"
    height: "54px"
  btn-compact:
    backgroundColor: "{colors.berry}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "0 1.1rem"
    height: "46px"
  opt:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.cocoa}"
    rounded: "{rounded.row}"
    padding: "0.55rem 0.75rem 0.55rem 0.55rem"
    height: "84px"
  opt-checked:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.cocoa}"
    rounded: "{rounded.row}"
  input:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.cocoa}"
    rounded: "{rounded.thumb}"
    padding: "0 0.9rem"
    height: "48px"
  card:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.cocoa}"
    rounded: "{rounded.card}"
    padding: "clamp(1.1rem, 3.5vw, 1.8rem)"
  view-desktop:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.cocoa}"
    rounded: "{rounded.view}"
    padding: "1rem 1rem 1.2rem"
  bar:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.cocoa}"
    padding: "0.6rem {spacing.pad}"
  dialog:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.cocoa}"
    rounded: "{rounded.card}"
    padding: "1.1rem 1.1rem 1.2rem"
    width: "min(92vw, 520px)"
  section-result:
    backgroundColor: "{colors.paper-deep}"
    textColor: "{colors.cocoa}"
    padding: "{spacing.sec} {spacing.pad}"
  section-contact:
    backgroundColor: "{colors.cocoa}"
    textColor: "{colors.cream}"
    padding: "{spacing.sec} {spacing.pad}"
  foot:
    backgroundColor: "{colors.cocoa-deep}"
    textColor: "#C9B3A2"
    padding: "1.4rem {spacing.pad}"
---

# Design System: Крем и Корж

## Overview

**Creative North Star: «Витрина»**

Страница — стеклянная витрина кондитерской, положенная на кремовую бумагу.
Бумага (`paper`) с зерном на весь экран — фон; предметы на ней — сливочные
карточки (`cream`); подписи, цены и орнамент карточки — карамель;
единственное, что «нажимается», — малина. Шоколад (`cocoa`) — цвет текста и
тёмной ленты контактов внизу, как подложка под витриной. Между лентами —
волнистая «кремовая кайма».

Торт на экране не иллюстрация, а фотокомпозит: один мастер-снимок среза,
разложенный на слои корж/начинка/декор, каждый вариант — свой WebP с альфой.
Слои складываются абсолютным позиционированием, и торт собирается на глазах
у клиента, пока он нажимает варианты. Единственное авторское движение —
проявление слоя (opacity + scale .985→1, декор падает сверху на 1.4%).

Это шаблон: копия `index.html` под другого кондитера меняет объект `CONFIG`
(имя, коржи, начинки, декор, цены, контакты, галерею) и блок `/* БРЕНД */`
в `:root` (палитра, гарнитуры). Всё ниже токенов — компонентная система, она
не правится.

**Key Characteristics:**
- Три материала: бумага (фон), сливки (предмет), шоколад (текст и подвал).
- Карамель — подписи и цены, малина — действие; больше акцентов нет.
- Playfair Display — заголовки, цены, номера шагов курсивом, надпись на
  табличке; Manrope — весь остальной текст и кнопки.
- Торт — стопка `<img>` с альфой 1400×1138; hero, sticky-превью и карточка
  используют один и тот же элемент `.cake`.
- Пилюли 54px, строки-опции 16px с фото 72px, карточка 22px с двойной
  карамельной рамкой.
- Одна кривая `cubic-bezier(.16,1,.3,1)`; hover — подъём на 1–2px.

## Colors

Палитра — четыре пищевых материала (бумага/сливки, карамель, малина, шоколад),
у каждого «глубокий» тон; нейтрального серого нет, вторичный текст — разбавленный
шоколад.

### Primary
- `berry` — единственный цвет действия: `btn--berry`, обводка и галочка
  выбранной опции, галочка выполненного шага, курсивное слово в h1, обводка
  фокуса, каретка, знак в шапке и фавиконе. `berry-deep` — hover кнопки,
  текст «Выбрано» и имя выбранного варианта в подсказке шага.
  `berry-soft` — `::selection`, свечение фокуса поля ввода, крем на знаке.
- `caramel` — крупное и декоративное: номера шагов курсивом, точки-разделители
  в строке состава, иконки в контактах, пунктир подсказки «Начните с коржа»,
  ползунок скроллбара; на бумаге даёт 3.3:1, поэтому для мелкого текста не
  используется. `caramel-deep` (≥5.4:1 на бумаге и сливках) — цены в опциях,
  цена в строке состава, имя кондитерской и ключи списка на карточке, счётчик
  символов, заметка hero. Рамки карточки — `caramel` на .28/.35/.45.

### Neutral
- `paper` — фон страницы, шапки, конструктора, галереи; `theme-color`;
  «занавес» sticky-превью. `paper-deep` — лента результата, подложка под
  фото до загрузки, заливка разделителя `.edge`.
- `cream` — карточка, строки-опции, поле надписи, sticky-превью на ≥900px,
  нижняя панель, диалог, hover контурной кнопки; текст на шоколаде.
  Чистый `#fff` — только фон выбранной опции, поля ввода и hover `btn--cream`.
- `cocoa` — основной текст, контурные кнопки, лента контактов;
  `cocoa-deep` — футер, backdrop диалога `rgba(42,24,16,.55)`;
  `cocoa-soft` — лиды, описания опций, подсказки, даты, примечания (≥6.9:1).
- `line` — hairline: «подчерк» строки-опции (`0 1px 0`), обводка кружка
  галочки, рамка поля ввода, верх нижней панели, рамка картинки в диалоге.

### Named Rules
**Правило одной малины.** Малина — только там, где есть действие или его
результат: кнопка, выбранный вариант, выполненный шаг, слово-акцент в h1.
Заголовков, фонов и рамок малиной нет.
**Правило двух карамелей.** Крупное и декоративное — `caramel`; всё, что
читается как текст мельче заголовка, — `caramel-deep`.
**Правило разбавленного шоколада.** Вторичный текст — `cocoa-soft`, на
шоколаде — светлые тона той же гаммы; серого в системе нет.

## Typography

Playfair Display 400–900 (прямой и курсив) и Manrope 200–800, оба variable,
самохост из `fonts/`, split cyrillic/latin, `font-display: swap`. Знак ₽ у
обеих гарнитур отдаётся из отдельного подмножества (`unicode-range: U+20BD`,
вес 600), чтобы цена не собиралась из двух шрифтов. Все `h1–h3` —
`text-wrap: balance`, абзацы — `pretty`.

### Hierarchy
- display 4.9rem max/1.02, −.02em, ≤12ch — h1; `<em>` в нём — курсив малиной
  (единственный курсив в тексте).
- headline 3rem max/1.08, ≤18ch — h2 секций; на шоколаде — `cream`.
- title 1.9rem max/1.15 — h3 шага с курсивным номером `step-numeral` 1.1em
  карамелью; title-card 2.3rem max/1.05 — «Ваш торт»; 1.4rem — заголовок
  диалога.
- numeral 2.3rem max/1 — сумма на карточке, `tabular-nums`; phone 2.6rem
  max/1.1 — телефон в контактах; 1.05rem — цена в строке состава.
- mark 1.35rem — имя кондитерской в шапке; 1rem `caramel-deep` — на карточке.
- plaque — курсив 600 на шоколадной табличке, цвет `#F4E2C8`, кегль
  3.5cqw и далее по JS от .034 до .016 ширины торта, пока не поместится.
- lead ≤54ch, `cocoa-soft` — вводный абзац секции; hero — `margin-top .25rem`.
- body 17px/1.55.
- ui 600 1rem/1 — кнопки; .95rem — строка состава и кнопка панели; .9rem —
  текст панели и подсказка на торте.
- option-name 600 1.05rem/1.2 — имя варианта.
- label 600 .92rem `caramel-deep` `tabular-nums` — цена варианта; .85rem
  .02em — ключи списка на карточке; .72rem .02em `berry-deep` — «Выбрано».
- caption .88rem/1.3 — описание варианта; .92 — подписи галереи, подсказки,
  контакты; .85 — примечание к цене, футер, поле надписи; .8/.78 — дата на
  карточке и вторая строка панели (clamp 2 строки).

### Named Rules
**Правило засечек.** Playfair — заголовки, цены, номера, имя кондитерской и
надпись на торте. Кнопки, подписи, описания — только Manrope.
**Правило курсива.** Курсив Playfair несёт три роли: слово-акцент в h1,
номер шага, надпись на табличке. Курсива Manrope нет.
**Правило капса.** `text-transform: uppercase` в системе отсутствует;
надзаголовков над h2 нет — заголовки стоят голыми.

## Layout

Mobile-first, одна колонка, контейнер 1180px с полями `spacing.pad`, секции
`spacing.sec` сверху и снизу. Шапка абсолютная (88px на телефоне, 110px от
900px), hero — grid с зазором 1.25rem, торт ограничен `52svh` по высоте.

- **600px** — варианты в два столбца.
- **640px** — у кнопки «Позвонить» в шапке появляется текст.
- **700px** — галерея из scroll-snap ряда (`min(72vw,300px)`, вынесена на
  поля отрицательными отступами) становится сеткой 3×; контакты — две
  колонки 1.1fr/.9fr, кнопки в ряд.
- **900px** — hero 7fr/8fr (торт справа); конструктор 1.05fr/1fr с зазором
  3rem: слева sticky-превью (`top: 24px`, сливочная карточка 24px), справа
  шаги в один столбец; лента результата — две колонки (карточка / действия);
  нижняя панель скрыта, у футера снимается резерв 76px.

До 900px превью — `position: sticky; top: 0` на всю ширину (отрицательные
поля `−pad`), торт ≤ `36svh` по высоте, под ним строка состава; заголовок
шага получает `scroll-margin-top: 36svh + 64px`, чтобы автопрокрутка не
уводила его под превью. `::before` высотой 260px над превью — «занавес»
цвета бумаги, включается классом `is-stuck` (JS сравнивает top сетки и
превью), чтобы шапка секции не просвечивала над прилипшим торцом.

Ритм внутри конструктора: шаги 2.4rem, варианты .6rem, действия результата
.7rem. Строки-опции — grid `72px 1fr auto` с зазором .9rem, `min-height`
84px.

## Elevation & Depth

Гибрид: тональные ленты (бумага → глубокая бумага → бумага → шоколад →
тёмный шоколад) плюс зерно бумаги на всём экране — `body::before` с
SVG-шумом `feTurbulence` (baseFrequency .9, 2 октавы, плитка 220px) в
`multiply` на .55. Предметы лежат на бумаге: тени мягкие, вниз, с
отрицательным spread; малиновая кнопка отбрасывает малиновую тень. Торт
стоит на радиальном пятне `cake__shadow` (12–88% ширины, blur 6px).

### Shadow Vocabulary
- **Кнопка** `0 14px 28px -16px rgba(180,48,79,.75)`, hover
  `0 18px 30px -16px rgba(143,36,64,.8)` — только `btn--berry`; контурные
  кнопки без тени.
- **Выбранная опция** `0 14px 30px -20px rgba(180,48,79,.55)`; в покое —
  hairline `0 1px 0 var(--line)`.
- **Sticky-превью** телефон `0 18px 20px -22px rgba(59,36,24,.45)` +
  градиентный подхват 18px снизу; десктоп `0 30px 60px -40px rgba(59,36,24,.55)`.
- **Подсказка на торте** `0 10px 24px -14px rgba(59,36,24,.5)`.
- **Нижняя панель** `0 -14px 30px -20px rgba(59,36,24,.5)` — тень вверх.
- **Диалог** `0 40px 80px -30px rgba(42,24,16,.6)`; backdrop
  `rgba(42,24,16,.55)`.
- **Поле ввода в фокусе** `0 0 0 3px var(--berry-soft)`.

### Named Rules
**Правило предмета на бумаге.** Тень — вниз, blur ≥ 20px, spread ≤ −14px.
Плоских смещённых теней, свечения и стекла нет.
**Правило малиновой тени.** Цветная тень бывает только у малинового: кнопка
и выбранная опция. Всё остальное отбрасывает шоколад на прозрачности.

## Shapes

Скругления от мягкого к мягкому: 6px — обводка фокуса; 12px — фото-миниатюра
72px и поле ввода; 14px — внутренняя рамка карточки, картинка в диалоге,
сообщение-превью в контактах; 16px — строка-опция, поле надписи, фото
галереи (4/5); 22px — карточка и диалог; 24px — sticky-превью на десктопе;
пилюля — все кнопки и подсказка на торте; круг — галочки, кнопка закрытия.

Карточка результата несёт двойную линию: внешняя 1px `caramel` .28 по краю,
внутренняя 1px .35 на `inset: 10px`; строки состава разделены пунктиром 1px
.35, итог отбит 1.5px .45. Пунктир 1.5px `caramel` — также подсказка
«Начните с коржа». Выбранная опция — сплошная обводка 2px `berry`; hover —
2px `caramel` .45.

Разделитель лент `.edge` — SVG-волна 1200×28 (`preserveAspectRatio: none`),
заливка цветом нижней ленты (`paper-deep`, `cocoa`), фон — верхней.
Иконки — inline SVG `<symbol>`, штрих 2, скруглённые концы, 1.2em (1.25em в
кнопках, 1.3em в контактах карамелью); галочки — штрих 3.

## Components

### Buttons
Пилюли `min-height` 54px, Manrope 600 1rem, `padding: 0 1.5rem`, рамка 1.5px
(прозрачная у заливных), иконка 1.25em слева, зазор .55rem; hover —
подъём 2px за .35s `--ease`, `:active` — обратно; `[disabled]` — opacity .55,
без тени и подъёма.
- **btn--berry** — малина с белым текстом и малиновой тенью; hover
  `berry-deep`. CTA hero, «Сохранить картинку», WhatsApp в контактах,
  кнопка панели, «Скачать» в диалоге.
- **btn--line** — контур `cocoa`, hover заливка `cream`; в `.dark` —
  контур и текст `cream`, hover `rgba(255,249,240,.1)`. «Позвонить» в
  шапке, мессенджеры, «Поделиться».
- **btn--cream** — сливки с рамкой `line`, hover `#fff` (объявлена, в
  разметке сейчас не используется).
- Компактные 46px (`padding 0 1rem/1.1rem`) — шапка и нижняя панель;
  48px — ряд в диалоге.

### Option row (`.opt`) — radio
`<button role="radio" aria-checked>` в `role="radiogroup"`; стрелки
переключают выбор внутри группы. Grid `72px 1fr auto`: фото 72×72 (12px,
`object-fit: cover`, подложка `paper-deep`, 320/640 webp), имя + описание
`cocoa-soft`, справа цена `caramel-deep` (`+` у всех шагов, кроме коржа) и
кружок 26px с рамкой `line`. Hover — рамка карамелью .45, подъём 1px.
`aria-checked="true"` — рамка `berry`, фон `#fff`, малиновая тень, кружок
заливается малиной с галочкой, в углу появляется «Выбрано» .72rem.

### Step header
`h3` = курсивный номер карамелью + название + круг 1.35rem `berry` с
галочкой (scale 0→1 за .35s при `is-done`). Под ним `step__hint`
`cocoa-soft`; после выбора — «Выбрано: <имя `berry-deep`> — можно поменять».

### Inscription field (`.inscr`)
Появляется под шагом «Декор» при варианте с `text: true`: блок `cream` 16px,
метка с иконкой карандаша, input 48px 12px на `#fff` с рамкой `line`, фокус —
рамка `berry` + кольцо `berry-soft`; справа счётчик `n/26` `caramel-deep`.

### Cake stack (`.cake`) — signature
`aspect-ratio: 1400/1138`, `container-type: inline-size`, `role="img"` с
`aria-label` из состава. Внутри: пятно тени, четыре `<img>` слоя
(`base`, `sponge-*`, `fill-*`, `decor-*` из `img/cake/`, `object-fit:
contain`), HTML-табличка `.cake__text` (left 50.6%, top 10.9%, 28.7%×12.6%,
поворот −2.5°, кегль подбирает JS) и подсказка `.cake__hint` (пилюля
`cream` с пунктиром карамелью) — только в live-превью, пока не выбран корж.
Слой без класса `is-on` — opacity 0, scale .985; при включении — opacity
.55s, transform .7s `--ease`; декор дополнительно из `translateY(−1.4%)`.
Смена варианта на уже включённом слое: выключить, через 180ms сменить src,
включить по `onload`. Остальные слои подгружаются через 600ms после `load`.
Один и тот же элемент — hero (`showcase` из CONFIG), sticky-превью и
карточка.

### Composition line (`.line`)
Под превью, `aria-live="polite"`, Manrope 600 .95rem по центру: выбранные
имена жирно, между ними `·` карамелью, «осталось: …» `cocoa-soft` 500,
при полном составе — `≈ сумма` Playfair `caramel-deep`.

### Result card (`.card`)
Лента `paper-deep`, показывается только при полном составе (`display: none`
иначе). Карточка `cream` 22px с двойной карамельной рамкой: имя кондитерской
Playfair `caramel-deep` и дата слева/справа, «Ваш торт» title-card, торт
≤460px, список `5.6rem 1fr` с ключами `caramel-deep` и пунктиром, итог
numeral + примечание ≤28ch справа, футер — телефон и сайт. Это же
поддерево снимает html2canvas на фоне `--cream`. Справа — колонка
действий: `btn--berry` «Сохранить картинку», два `btn--line`, подсказка
.92rem по центру; на ≥900px кнопки `min-width 16rem`.

### Bottom bar (`.bar`)
Только до 900px: fixed снизу, `cream`, hairline сверху, тень вверх,
safe-area; слева две строки (состав / «Осталось: …», вторая clamp 2
строки), справа `btn--berry` 46px с текстом следующего шага или
«Заказать». Выезжает `translateY(110%) → 0` за .45s, когда hero ушёл вверх
и до того, как контакты вошли на 85% высоты окна. `?nobar` прячет.

### Dialog (`dialog.pic`)
`cream` 22px, ≤520px, `max-height: 100dvh − 1.5rem`, тень и тёмный backdrop;
крест 40px на `paper` в углу, заголовок 1.4rem, картинка ≤52dvh с рамкой
`line` 14px, подсказка `cocoa-soft`, ряд «Скачать»/«Поделиться» 48px.
Закрывается крестом и кликом по backdrop.

### Gallery (`.gal`)
Фото 4/5 16px на `paper-deep`, подпись .92rem: имя `cocoa` 600 отдельной
строкой, состав `cocoa-soft`. До 700px — scroll-snap ряд, далее сетка 3×.

### Contacts band (`.contact.dark`)
Лента `cocoa`, текст `cream`; лид и подписи `#D9C4B3`; телефон phone
Playfair, hover `#F1D9C0`; кнопки `btn--berry` + `btn--line` (светлый);
превью сообщения — блок `rgba(255,249,240,.08)` с рамкой .16, 14px, текст
`#E8D8C8`; справа список с иконками `caramel` 1.3em. Футер `cocoa-deep`,
текст `#C9B3A2`, ссылки `#E8D8C8`.

### Edge divider (`.edge`)
SVG-волна 28px между лентами: перед результатом (`paper-deep` на `paper`),
перед контактами (`cocoa` на `paper`). Скрывается в режиме `?og`.

### Navigation
Шапка абсолютная: знак 28px (малиновый квадрат 8px, торт `cream`/`berry-soft`)
+ имя mark, справа `btn--line` 46px «Позвонить». Навигация страницы —
автопрокрутка: выбор варианта прокручивает к следующему шагу, полный состав
— к результату, CTA hero — к первому шагу; `behavior: auto` при
`prefers-reduced-motion`.

### States
- **Пусто** — торт только `base.webp`, подсказка «Начните с коржа» на
  live-превью, строка «осталось: корж, начинка, декор», панель «Соберите
  свой торт», результат скрыт.
- **Частично** — включённые слои, `is-done` у шагов, «осталось: …»,
  панель ведёт к следующему шагу.
- **Полный** — цена в строке и панели («Готово · ≈ …»), лента результата
  `is-on`, автопрокрутка к карточке, состояние в URL `?b=&f=&d=&t=`.
- **Stuck** — `is-stuck` на превью: занавес 260px над ним.
- **Disabled** — `btn[disabled]` во время рендера картинки; текст кнопки
  меняется на «Готовим картинку…» / «Готово» / ошибку.

### Motion grammar
Одна кривая `--ease: cubic-bezier(.16,1,.3,1)`. Слой торта .55s/.7s,
табличка и подсказка .4s, галочка шага .35s, кнопки и опции .35s
(цвета .25s), панель .45s. `prefers-reduced-motion` снимает все переходы
перечисленных элементов, `scroll-behavior: auto`, смена слоя без паузы.

## Do's and Don'ts

### Do:
- Класть новый предмет на бумагу как `cream` со скруглением 16–22px и
  тенью вниз с отрицательным spread; фон секции — `paper`, `paper-deep`
  или `cocoa`, между ними `.edge`.
- Подписывать и считать карамелью: мелкий текст — `caramel-deep`, крупное
  и орнамент — `caramel`.
- Отдавать малину только действию и его результату.
- Набирать цены Playfair 600 с `tabular-nums`; ₽ придёт из рублёвого
  подмножества.
- Новый вариант — запись в `CONFIG.steps[].options` + слой
  `img/cake/<layer>.webp` 1400×1138 с альфой + миниатюры `<thumb>-320/640.webp`.
- Иконки — inline SVG-символы одной семьи, штрих 2, `currentColor`.

### Don't:
- Серый текст: вторичный — `cocoa-soft`, на шоколаде — светлые тона гаммы.
- Малиновые заголовки, фоны, рамки секций; вторая кнопка `btn--berry`
  в одном ряду.
- `caramel` для текста мельче заголовка (3.3:1 на бумаге).
- Капс, надзаголовки над h2, курсив Manrope.
- Иллюстративный SVG-торт вместо фотокомпозита; торт как статичная витринная
  картинка, не зависящая от выбора.
- Вторая входная анимация: проявление слоя — весь бюджет движения.

## Перекраска под клиента

Меняются только значения в блоке `/* БРЕНД */` `:root` и `theme-color` в
`<head>`; знак в шапке берёт `--berry` через `var()`, а data-URI фавикона
несёт литералы #B4304F/#F7EFE3 и правится вручную. Инварианты:

- `cocoa` на `paper` и `cream` — ≥ 7:1; `cocoa-soft` — ≥ 4.5:1 на обоих.
- `caramel-deep` — ≥ 4.5:1 на `paper` и `cream` (цены, ключи карточки);
  `caramel` достаточно ≥ 3:1 (крупный курсивный номер, орнамент).
- Белый на `berry` — ≥ 4.5:1; `berry` на `paper` — ≥ 3:1 (обводка выбора,
  фокус); `berry-deep` — ≥ 4.5:1 на `cream` («Выбрано»).
- `cream` на `cocoa` — ≥ 7:1; `berry` на `cocoa` должен оставаться
  различим как кнопка (тень и белый текст держат её).
- Тени кнопки и выбранной опции записаны литералами `rgba(180,48,79,…)`
  и `rgba(143,36,64,…)`; при смене `berry` их нужно пересчитать вручную,
  как и `rgba(184,116,46,…)` карамельных рамок и `rgba(59,36,24,…)`
  шоколадных теней.
- `--fd`/`--ft` меняются вместе с файлами в `fonts/` и `@font-face`;
  новая дисплейная гарнитура должна иметь кириллицу, курсив и ₽ (иначе —
  отдельное подмножество для U+20BD).
- Слои торта не перекрашиваются токенами: под другой рецепт делаются новые
  WebP по конвейеру мастер-снимок → маски → luminance-ramp.

## Происхождение направления

По PRODUCT.md: «Витрина» выбрана заказчиком из трёх предложенных
(«Шоколатье» и «Слоями» отклонены) через структурированный вопрос;
`concept-seed` не запускался — в среде нет node. Снимки финиш-ревью —
`.impeccable/review/` (desktop, desktop-built, mobile, mobile-built,
mobile-bar).

## Не является системой

- `--radius: 18px` объявлен в `:root`, но ни разу не используется; реальная
  шкала — 12/14/16/22/24px литералами. Не ссылаться, при чистке удалить или
  привести компоненты к нему.
- Светлые тона на шоколаде (`#D9C4B3`, `#E8D8C8`, `#C9B3A2`, `#F1D9C0`) и
  цвет надписи на табличке `#F4E2C8` заданы литералами в компонентах, в
  токены не выведены.
- `btn--cream` объявлена в CSS, в разметке не встречается.
- Демо-данные «Крем и Корж» (телефон, мессенджеры, цены, галерея с пометкой
  «(образец)» в `alt`) — плейсхолдеры CONFIG, не часть системы.
- `?og`, `?nobar` — режимы для снимков; html2canvas с cdnjs — внешняя
  зависимость сохранения картинки, а не визуальное правило.
- Цветовое кодирование вариантов (миниатюры, слои) — фотографии, не
  палитра; новые варианты не получают «своего цвета» в токенах.
