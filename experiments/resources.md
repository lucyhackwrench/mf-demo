# Module Federation: shared для `@vkph/ui` — источники и выводы

Документ фиксирует результаты исследования: почему `@vkph/ui` (и аналоги) разумно держать в **shared** с **singleton**, как это согласуется с монорепо, и как связаны **версия в `package.json`**, **MF runtime** и **кеш браузера** (content hash).

---

## Источники, подтверждающие подход shared для `@vkph/ui`

### 1. Официальная документация Module Federation v2 — FAQ «When to use shared»

**Ссылка:** [module-federation.io/configure/shared.html#faq](https://module-federation.io/configure/shared.html#faq)

Цитаты (смысл):

- «The third-party packages used in the modules provided by the producer have singleton requirements, such as **react**»
- «The third-party packages used… are used in the consumer, have a large dependency volume, support tree shaking, but the exposed modules are all used, such as **antd**»

Прямо называются кандидаты в shared, релевантные нашему стеку: синглтон-подобные зависимости (React) и крупная UI-библиотека (antd).

### 2. Официальная документация webpack — Module Federation

**Ссылка:** [webpack.js.org/concepts/module-federation](https://webpack.js.org/concepts/module-federation/)  
(альтернативный путь: [guides](https://webpack.js.org/guides/module-federation/))

В разделе best practices / описании singleton:

- «Use **singleton: true** for libraries that must have only one instance (like React, Vue, or global state managers).»
- По смыслу singleton: только одна версия shared-модуля в рантайме приложения.

### 3. Nx — Single Version Policy

**Ссылка:** [nx.dev/docs/technologies/module-federation/concepts/manage-library-versions-with-module-federation](https://nx.dev/docs/technologies/module-federation/concepts/manage-library-versions-with-module-federation)

Ключевые тезисы:

- При интеграции federated-модулей в host/remotes каждый модуль может тащить свои зависимости → риск **нескольких копий** одной библиотеки.
- Последствия: конфликты, неожиданное поведение, раздувание бандла.
- **Single Version Policy (SVP):** в рамках одного приложения — одна версия библиотеки.
- **Singleton libraries:** React, Angular, Redux и т.п. должны существовать в **одном экземпляре**; несколько версий ломают поведение или дают runtime-ошибки.

### 4. Официальный репозиторий примеров MF — `shared-context`

**Ссылка:** [github.com/module-federation/module-federation-examples/tree/master/shared-context](https://github.com/module-federation/module-federation-examples/tree/master/shared-context)

Официальный пример: **React Context между host и remote** через механизм **shared**, а не через отдельный remote «библиотеки контекста».

### 5. Stack Overflow — контекст не шарится между micro-frontends

**Ссылка:** [stackoverflow.com/questions/74206519](https://stackoverflow.com/questions/74206519)

Суть вопроса: host рендерит Provider, remote видит дефолтное значение контекста.

Принятый ответ (идея): контексты нужно включать в **shared** в конфигурации Module Federation.

### 6. MF v2 — `allowNodeModulesSuffixMatch`

**Ссылка:** [module-federation.io/configure/shared.html#allowNodeModulesSuffixMatch](https://module-federation.io/configure/shared.html#allowNodeModulesSuffixMatch)

Цитата (смысл):

- Включать, когда host и remote резолвят **один и тот же пакет** через **разные абсолютные пути** (pnpm hoisting, symlinks, кастомные лоадеры), но в рантайме это должен быть **один** shared-модуль.

Релевантно для **npm workspaces** и symlink’ов в монорепо.

### Итог по источникам

Четыре авторитетных направления (документация MF v2, webpack, Nx, официальные примеры MF) согласуются с подходом **shared + singleton** для:

- библиотек с **React Context** / провайдерами;
- крупных UI-слоёв (**antd** и аналоги);
- синглтон-зависимостей в **монорепо**.

---

## Проекты с аналогичной архитектурой

### 1. `erkylima/react-microapps` (принят в официальные примеры MF, 2024)

**Репозиторий:** [github.com/erkylima/react-microapps](https://github.com/erkylima/react-microapps)  
(мердж в `module-federation-examples`, PR [#3761](https://github.com/module-federation/module-federation-examples/pull/3761))

**Стек:** React 18, Rspack + Webpack 5, несколько remotes (Shell, Dashboard, Nav, FAQ, Team). **Material UI** как UI-библиотека.

**Паттерн:** MUI и связанные пакеты в **shared** как **singleton** на хосте (и тот же набор дублируется на remotes). Отдельного MF remote для MUI нет — только shared.

Пример фрагмента конфига хоста (`root/webpack.config.js`):

```js
shared: {
  react: { singleton: true, requiredVersion: dependencies.react },
  'react-dom': { singleton: true, requiredVersion: dependencies['react-dom'] },
  'react-router-dom': { singleton: true, requiredVersion: dependencies['react-router-dom'] },
  '@mui/material': { singleton: true, requiredVersion: dependencies['@mui/material'] },
  '@mui/icons-material': { singleton: true, requiredVersion: dependencies['@mui/icons-material'] },
  '@emotion/react': { singleton: true, requiredVersion: dependencies['@emotion/react'] },
}
```

### 2. `module-federation-examples/shared-context`

**Ссылка:** [github.com/module-federation/module-federation-examples/tree/master/shared-context](https://github.com/module-federation/module-federation-examples/tree/master/shared-context)

**Идея:** три части — app1 (host + Provider), app2 (remote + consumer), shared-library (общий провайдер контекста).

**Вывод:** библиотека с провайдером контекста — в **shared**, не в remotes; это официальный паттерн для такой задачи.

### 3. `module-federation-examples` — issue #2906 (MUI Theme / кастомная lib)

**Ссылка:** [github.com/module-federation/module-federation-examples/issues/2906](https://github.com/module-federation/module-federation-examples/issues/2906)

Кейс: кастомная библиотека поверх MUI, тема не пробрасывается в remote.

Рекомендация Zach Jackson (ScriptedAlchemy): шарить MUI с **trailing slash** для подпакетов и связанные emotion-пакеты; кастомная lib — как **singleton** (аналог `@vkph/ui`):

```js
shared: {
  'custom-lib': { singleton: true, requiredVersion: deps['custom-lib'] },
  '@mui/material': { singleton: true, requiredVersion: deps['@mui/material'] },
  '@emotion/react': { singleton: true, requiredVersion: deps['@emotion/react'] },
  '@emotion/styled': { singleton: true, requiredVersion: deps['@emotion/styled'] },
}
```

### 4. `module-federation/core` — issue #3672 (Share local monorepo library, 2025)

**Ссылка:** [github.com/module-federation/core/issues/3672](https://github.com/module-federation/core/issues/3672)

Проблема: `singleton: true` на весь пакет не срабатывает как ожидается при импортах **по подпутям** (`@repo/ui/Button`).

Идеи из обсуждения:

- MF шарит то, что приложение **реально импортирует**; неиспользуемое может «выпасть» из графа.
- Для библиотек с subpath imports — **prefix share с trailing slash**: `"@repo/ui/"` вместо точного `"@repo/ui"`.

Пример:

```js
shared: {
  '@repo/ui/': { singleton: true },
}
```

**Для VKPH:** если доминируют импорты вида `@vkph/ui/...` — имеет смысл рассмотреть `"@vkph/ui/"`; если только корень `@vkph/ui` — достаточно ключа без слеша.

### 5. `farhoudshapouran/micro-frontends` — Next.js + Turborepo + Yarn Workspaces

**Репозиторий:** [github.com/farhoudshapouran/micro-frontends](https://github.com/farhoudshapouran/micro-frontends)

Несколько Next.js-приложений, пакеты `@repo/ui`, `@repo/utils`, `@repo/data-context`.

**Альтернатива MF shared:** `transpilePackages` для UI-библиотеки, когда не нужен независимый деплой библиотеки как remote. Показывает, что «шаринг» UI в монорепо — типовая задача с несколькими устоявшимися подходами.

### Сводка паттерна по примерам

| Компонент                                          | Подход                                     |
| -------------------------------------------------- | ------------------------------------------ |
| `react`, `react-dom`                               | `shared` + `singleton` в каждом приложении |
| UI-библиотека (`@mui/material`, `antd`, кастомная) | `shared` + `singleton` в каждом приложении |
| Emotion / styled-components (если используются)    | `shared` + `singleton` в каждом приложении |
| Бизнес-фичи (Dashboard, Nav, …)                    | MF Remote с `exposes`                      |

В рассмотренных примерах **UI-библиотека с контекстными провайдерами не выносится в отдельный MF Remote** — она остаётся в **shared**.

---

## Версионирование, кеш и `requiredVersion`

### Источник 1: webpack — issue про кеширование shared-чанков

**Ссылка:** [github.com/webpack/webpack/issues/12351](https://github.com/webpack/webpack/issues/12351)

Ответ Tobias Koppers (создатель webpack): обычные настройки `output` применимы и к shared-чанкам, в т.ч.:

```js
output: {
  filename: '[contenthash].js',
}
```

**Смысл для нас:** имя файла shared-чанка в проде определяется **content hash** в `output`, а не строкой версии из `package.json`. Изменился код `@vkph/ui` → изменился hash → браузер тянет новый файл. Версия в `package.json` сама по себе не переименовывает чанк.

### Источник 2: Nx — откуда берётся версия workspace-библиотеки в shared

**Ссылка:** [nx.dev/docs/technologies/module-federation/concepts/manage-library-versions-with-module-federation](https://nx.dev/docs/technologies/module-federation/concepts/manage-library-versions-with-module-federation)

Nx описывает: для workspace-библиотеки версия для MF часто берётся из **`package.json` проекта-потребителя** — это участвует в **runtime-регистрации** совместимости (кто с кем может сшиться), а не заменяет механизм имён файлов с hash.

Иллюстративный фрагмент генерируемого конфига:

```js
shared: {
  react: { singleton: true, eager: true, version: '18.2.0' },
  'acme/utils': { singleton: true, eager: true, version: '1.0.0' },
  // version — для MF runtime / совместимости
  // HTTP-кеш браузера — по имени файла с content hash
}
```

### Что это значит для `@vkph/ui` (пример)

В `package.json`: `"version": "0.2.0"`.

После перехода на **shared**:

1. **Деплой A:** в `@vkph/ui` только синяя кнопка → Rspack отдаёт, например, `ui.abc123.js` → браузер кеширует по URL/hash.
2. **Деплой B:** менялся только app, **код `@vkph/ui` не менялся** → тот же `ui.abc123.js` → cache hit, лишней загрузки нет.
3. **Деплой C:** изменили UI (например, цвет кнопки) → новый hash → `ui.xyz789.js` → cache miss, скачивается новый файл.

При этом **`0.2.0` в `package.json` можно не менять** на каждый деплой: инвалидация кеша через **content hash**; MF runtime по-прежнему видит согласованную версию для **singleton**-политики (пока конфиги host/remotes согласованы).

---

## Краткий чеклист для команды

- Держать **React**, **antd** (или эквивалент), **@vkph/ui** в **shared** + **singleton** на host и remotes, где они реально используются.
- **Не** выносить «библиотеку с контекстом» в отдельный remote ради контекста — ориентир: **shared-context** и практика MUI/custom-lib в issues.
- В монорепо следить за **одним физическим инстансом** пакета (symlinks/pnpm) — при необходимости **allowNodeModulesSuffixMatch** (см. доку MF v2).
- При массовых **subpath**-импортах (`@vkph/ui/...`) рассмотреть **prefix share** с **`/`** в конце ключа.
- **Кеш пользователя:** опираться на **hash в имени чанка** (`output.filename` / политика CDN); **версия в package.json** — про совместимость и договорённости MF, а не про имя файла в проде.
