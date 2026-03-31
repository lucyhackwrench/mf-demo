# Эксперимент 01: Базовая сборка — dev и prod

## Цель

Убедиться, что baseline-конфигурация проекта собирается и работает корректно в обоих режимах. Зафиксировать поведение, которое считается эталонным для всех последующих экспериментов.

---

## Dev-режим

### Шаги воспроизведения

```bash
npm install
npm run start
```

Дождаться сообщений вида:

```
[common]     Rspack compiled successfully
[components] Rspack compiled successfully
[app]        Rspack compiled successfully
```

Открыть http://localhost:5000.

### Ожидаемый результат

1. **Страница Home (вкладка по умолчанию)**
   - Виджет `ThemedCounter` загружается после паузы (lazy + MF Remote).
   - Фон блока **зелёный**, надпись: `✅ Context работает — color: crimson`.
   - Счётчик показывает `0`, кнопки `+`, `−`, `reset` меняют значение.

2. **Context не дублируется**
   - Цвет темы — `crimson`, не `#888`.
   - `#888` означает что `@demo/ui` загружен дважды (Context сломан).

3. **Страница News (вторая вкладка)**
   - `NewsPage` загружается после паузы (lazy).
   - Заголовок окрашен в `crimson`.
   - Счётчик совпадает со значением на странице Home — оба читают один `$counter` из `@demo/common`.
   - Кнопка из `@demo/ui` отрисовывается корректно.

4. **Консоль браузера**
   - Нет `Uncaught` ошибок.
   - `mf-manifest.json` с портов 5002 и 5003 отвечает `200`.

5. **Терминал**
   - Нет `[error]` или `ERROR` строк после завершения компиляции.
   - `[ Module Federation DTS ] Federated types created correctly` — для `common` и `components`.

---

## Prod-режим

### Шаги воспроизведения

```bash
npm run build
```

Дождаться завершения сборки всех трёх пакетов:

```
Rspack compiled successfully
```

Затем поднять статику. Для каждого пакета запустить отдельный HTTP-сервер в соответствующем `dist/`:

```bash
# Терминал 1
npx serve -p 5002 libs/common/dist

# Терминал 2
npx serve -p 5003 libs/components/dist

# Терминал 3
npx serve -p 5000 --single packages/app/dist
```

Открыть http://localhost:5000.

### Ожидаемый результат

1. **Структура `dist/`** — после `npm run build` созданы:
   - `libs/common/dist/` — содержит `remoteEntry.js`, `mf-manifest.json`, чанки с хешами
   - `libs/components/dist/` — аналогично
   - `packages/app/dist/` — содержит `index.html`, `main.[hash].js`, чанки

2. **Поведение в браузере** — идентично dev-режиму:
   - Зелёный блок, `✅ Context работает — color: crimson`
   - Счётчик работает, состояние синхронизировано между Home и News
   - Нет `Uncaught` ошибок в консоли

3. **Файлы с content hash**
   - Имена чанков содержат хеш: `main.a1b2c3d4.js` (не `main.js`)
   - Перезапуск `npm run build` без изменений кода — хеши остаются теми же

4. **`mf-manifest.json` доступен**
   - `http://localhost:5002/mf-manifest.json` — возвращает JSON с описанием remote
   - `http://localhost:5003/mf-manifest.json` — аналогично
