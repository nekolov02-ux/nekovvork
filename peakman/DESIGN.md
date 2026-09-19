---
name: Peakman — Топокарта
description: Барбершоп как вершина на топографическом листе — горизонтали сходятся к отметке «Герцена, 90А», сигнально-красный тригопункт ведёт к записи.
colors:
  moss: "#232B21"
  moss-deep: "#1A2019"
  moss-up: "#2C3729"
  sand: "#C9B28A"
  sand-line: "rgba(201,178,138,0.34)"
  bone: "#EFE8D8"
  bone-dim: "#AEAB95"
  sheet: "#E4D9BE"
  ink: "#1C221B"
  ink-dim: "#5B5A45"
  grid: "rgba(28,34,27,0.09)"
  red: "#E0392B"
  red-deep: "#B92A1F"
typography:
  display:
    fontFamily: "'Sofia Sans Extra Condensed', 'Arial Narrow', sans-serif"
    fontSize: "clamp(3.4rem, 12vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "0.01em"
    textTransform: uppercase
  numeral:
    fontFamily: "'Sofia Sans Extra Condensed', 'Arial Narrow', sans-serif"
    fontSize: "clamp(2.5rem, 9vw, 4rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "0.01em"
    fontFeature: "tabular-nums"
  headline:
    fontFamily: "'Sofia Sans Extra Condensed', 'Arial Narrow', sans-serif"
    fontSize: "clamp(1.7rem, 6vw, 2.4rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "0.01em"
    textTransform: uppercase
  label:
    fontFamily: "'Sofia Sans Extra Condensed', 'Arial Narrow', sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.08em"
    textTransform: uppercase
  lede:
    fontFamily: "Geologica, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 4.4vw, 1.75rem)"
    fontWeight: 300
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Geologica, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  caption:
    fontFamily: "Geologica, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.02em"
rounded:
  none: "0"
spacing:
  pad: "clamp(20px, 5vw, 72px)"
  block: "clamp(4.5rem, 12vw, 8rem)"
  gap: "12px"
  gap-desktop: "20px"
  header: "56px"
components:
  btn-red:
    backgroundColor: "{colors.red}"
    textColor: "{colors.bone}"
    rounded: "{rounded.none}"
    padding: "0.55em 1.5em"
    height: "56px"
    clipPath: "polygon(0 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%)"
  btn-red-hover:
    backgroundColor: "{colors.red-deep}"
    textColor: "{colors.bone}"
  btn-line:
    backgroundColor: "transparent"
    textColor: "{colors.bone}"
    borderColor: "{colors.sand}"
    rounded: "{rounded.none}"
    padding: "0.55em 1.5em"
    height: "56px"
  sheet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    padding: "{spacing.block} {spacing.pad}"
  legend-card:
    backgroundColor: "{colors.moss}"
    textColor: "{colors.bone}"
    borderColor: "{colors.sand-line}"
    padding: "clamp(1.2rem,4vw,2rem)"
    shadow: "0 18px 40px -20px rgba(0,0,0,0.6)"
  top-bar:
    backgroundColor: "rgba(35,43,33,0.82)"
    textColor: "{colors.bone}"
    height: "{spacing.header}"
    blur: "12px"
---

## Overview

Мир — генштабовская топографическая карта, прочитанная ночью. Ground — мох
(`moss`), всё линейное — песок (`sand`) на низкой непрозрачности, текст —
кость (`bone`). Одна светлая «вклейка листа» (`sheet`) несёт цены: единственная
светлая зона на странице и потому самая читаемая. Сигнально-красный (`red`) —
только тригопункт (знак вершины) и действие «Записаться»; больше он нигде
не появляется. Полная палитра из четырёх ролей, цвет полями, а не акцентами.

Словомарка PEAKMAN — авторский геометрический гребень из SVG-полигонов: буквы
A и M поднимаются пиками над кап-высотой, на первом пике стоит тригопункт с
отметкой «ГЕРЦЕНА 90А». Это единственный логотип; текстовой версии нет.

## Colors

### Primary
- `moss` #232B21 — земля страницы; `moss-up` — приподнятые зоны (легенда),
  `moss-deep` — шапка-панель, контакты, футер.
- `bone` #EFE8D8 — основной текст на мхе; `bone-dim` — вторичный (≥6:1).

### Secondary
- `sand` #C9B28A — горизонтали, надписи-подписи, рамки, шкала; `sand-line` —
  все hairline-границы. Никаких серых линий: на мхе линия всегда песочная.

### Tertiary
- `sheet` #E4D9BE + `ink` #1C221B — светлый лист карты (цены); `ink-dim` —
  вторичный текст на листе (≥5:1); `grid` — координатная сетка листа.

### Signal
- `red` #E0392B — тригопункт, кнопки записи, звёзды рейтинга, знак собаки;
  `red-deep` — hover.

### Named Rules
- Красный — знак действия и вершины. Не украшение, не рамка, не текст.
- На цветной поверхности вторичный текст тонируется её оттенком (`bone-dim`,
  `ink-dim`), никогда не нейтрально-серый.
- Тёмная тема одна; светлая зона — только «лист» с ценами.

## Typography

Дисплей — Sofia Sans Extra Condensed 800 капителью (кириллица есть; знака ₽
нет — рубль берётся из Geologica 700 на 0.5em). Текст — Geologica 300–700.

### Hierarchy
- display 6rem max — заголовки секций, адрес.
- numeral — цены, телефон; tabular-nums.
- headline — пункты легенды, имена в журнале.
- label — шапка записи журнала, подписи вклеек, маргиналии листа, альтиметр.
- lede 300 — подзаголовок hero, цитаты, вводный абзац секции.
- body 17px/1.55, мера ≤44ch.

### Named Rules
- Заголовок несёт секцию сам: никаких кикеров и надзаголовков.
- Капитель только в дисплейной гарнитуре; Geologica — всегда строчными.
- Над заголовком больше воздуха, чем под ним (`spacing.block` сверху,
  1.6–2.6rem снизу).

## Layout

Mobile-first, один столбец до 720px; 720+ — двухколонные сетки (легенда,
контакты, «атмосфера»: заголовок + абзац рядом); 1080+ — фиксированный
альтиметр справа (64px) и `wrap` с правым отступом +40px. Контейнер 1240px,
боковые поля `spacing.pad`. Секции — `spacing.block` сверху и снизу.

## Elevation & Depth

Плоско. Единственная тень — у карточки «Можно с собакой» (смещение + мягкое
размытие). Шапка и нижняя панель — полупрозрачный мох с blur 12px.
Границы — 1px `sand-line`; 2px `ink` — верх таблицы цен на листе.

## Shapes

Углы 0 везде. Красная кнопка срезана по правому нижнему углу на 10px
(clip-path) — «уголок листа». Край листа с ценами — рамка карты: линия 3px
`ink` с делениями 1px через 64px (шаг координатной сетки), сверху и снизу.

## Components

### Buttons
`btn-red` — единственная primary, всегда с текстом «Записаться…»; ведёт на
Dikidi. `btn-line` — вторичная (телефон, маршрут). Обе 56px, дисплейной
гарнитурой 1.45rem, капителью, трекинг 0.04em. В шапке — 40px/1.25rem.

### Sheet (лист с ценами)
Светлый фон + сетка 64px, рамка с делениями сверху и снизу, маргиналия «Лист
90А · Альметьевск · 1:1» в правом нижнем углу. Строка цены: название
(Geologica 500) → точечный лидер → цена (numeral).

### Legend (условные обозначения)
Список «знак 64px + заголовок + абзац». Ведущий пункт — карточка
`legend-card` со знаком 72–120px красным.

### Journal (журнал вершины)
Запись: строка label «дата · ИМЯ» → цитата lede в «ёлочках», дословно с
Яндекс Карт → звёзды красные 15px. Две колонки на 720+, выравнивание по
верху. Под списком — источник и ссылка на все отзывы.

### Photo inset (вклейка)
Кадр с внутренней рамкой `sand-line`, подпись label «Вклейка 0N» + caption.

### Navigation
Sticky-шапка 56px в потоке (hero = `100svh − 56px`): мини-словомарка,
показание высоты (mobile), кнопка (720+). Нижняя фиксированная панель (до 720px) появляется, когда кнопки
hero ушли из вида: «Записаться» + телефон-иконка.

### Wordmark (signature)
Инлайновый SVG в hero (viewBox `0 -96 688 196`), символ `#wordmark`
(`0 -44 688 144`) для шапки. Fill — `bone`, тригопункт — `red`.

### Contour field (signature)
Два слоя горизонталей (`.cl1`, `.cl2`), каждая пятая — индексная (2px, .6).
Вершина поля (820,430 в координатах карты) при загрузке и ресайзе
сдвигается JS ровно под точку тригопункта на словомарке — кольца всегда
сходятся к «Герцена 90А». Прорисовка stroke-dashoffset один раз при
загрузке; параллакс −6% / −12% от scrollY в пределах hero. Подписи высот
вдоль колец через textPath. Та же вершина повторяется в контактах: пять
внутренних колец `.rings` за адресом, центр — на красном знаке-пине.

### Altimeter (signature)
Шкала 0→90А по вертикали (1080+); бегунок-тригопункт и красная линия
заполнения растут по прогрессу скролла. На мобиле — только показание в шапке.

## Do's and Don'ts

### Do:
- Держать красный только на действии и на знаке вершины.
- Линии — песочные, тонкие; каждая пятая горизонталь плотнее.
- Иконки — заливные силуэты из простых геометрических форм, один вес;
  собака, звезда, календарь, тригопункт — одна семья.
- Цены — всегда числом, дисплейной гарнитурой, с ₽ из Geologica.

### Don't:
- Ножницы, полосатые столбы, дерево, латунь, серифы — ни в каком виде.
- Скруглять углы, добавлять градиентный текст, стеклянные карточки.
- Кикеры над заголовками (единственный маргинальный текст — на листе, в
  углу, ниже контента).
- Вторая светлая секция: лист один.

## Происхождение направления

Раунд направления (impeccable, node недоступен → жребий python): выпала
«Перевальная табличка»; пользователь выбрал «Топокарта» (Impeccable's pick)
против канона жанра. Список из семи: табличка, топокарта, база-лагерь,
нефтяные вышки, маркировка трасс, журнал вершины, альтиметр.

## Не является системой

Подпись «· образец» у фото — временная маркировка стоковых заготовок,
удаляется вместе с ними. Стоковые фото не задают
колорит: реальные кадры интерьера ставятся без пересъёмки под грейд.
