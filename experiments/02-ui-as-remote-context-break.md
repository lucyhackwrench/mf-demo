# Эксперимент 02: ui как Remote — ломается ThemeContext

## Цель

Показать, что если `@demo/ui` загружается как MF Remote вместо shared-библиотеки,
`ThemeContext` создаётся дважды в разных модульных scope. Результат:
`ThemeProvider` в host устанавливает значение в один объект контекста,
а `useTheme()` в components читает из другого — возвращается дефолт `#888`,
фон блока становится красным.

**Ключевой индикатор**: `console.log('[ui] ThemeContext создан', ...)` в `ThemeContext.tsx`
выведется **два раза** — по одному на каждый экземпляр модуля.

---

## Механизм поломки

```
Baseline (shared):              После изменений (remote):

app bundle                      app bundle
  └─ ThemeProvider              app → loads ui-remote
       └─ ThemeContext [A]        └─ ThemeProvider
                                       └─ ThemeContext [A]
components remote               components remote
  └─ shared scope → [A]           └─ own copy of ui
       └─ useTheme() → crimson         └─ ThemeContext [B]
                                            └─ useTheme() → #888 ❌
```

React Context работает только если Provider и Consumer используют **один и тот же объект**,
полученный из одного вызова `createContext`. Два вызова — два объекта — нет связи.

---

## Изменения в коде

### 1. `packages/app/rspack.config.ts`

Добавить `@demo/ui` в `remotes`, убрать из `shared`:

```diff
 remotes: {
+  '@demo/ui': 'demo_ui@http://localhost:5001/mf-manifest.json',
   '@demo/common': 'demo_common@http://localhost:5002/mf-manifest.json',
   '@demo/components': 'demo_components@http://localhost:5003/mf-manifest.json',
 },
 shared: {
   react: { singleton: true, eager: true, requiredVersion: '^18.2.0' },
   'react-dom': { singleton: true, eager: true, requiredVersion: '^18.2.0' },
-  '@demo/ui': { singleton: true },
   effector: { singleton: true, requiredVersion: '^22.4.0' },
   'effector-react': { singleton: true, requiredVersion: '^22.3.0' },
 },
```

### 2. `libs/components/rspack.config.ts`

Убрать `import: false` — теперь components попытается самостоятельно разрешить `@demo/ui`:

```diff
-  '@demo/ui': { singleton: true, import: false },
+  '@demo/ui': { singleton: true },
```

`import: false` — инструкция только для shared scope: «не включай свою копию в бандл, бери экземпляр из shared scope».
Без него components пытается сам предоставить `@demo/ui` в shared scope.
Но app зарегистрировал его в `remotes` (а не в `shared`) — shared scope для `@demo/ui` пуст.
MF не находит factory-функцию → `getter is not a function`.

---

## Шаги воспроизведения

```bash
# Терминал 1 — ui standalone remote (нужен только для этого эксперимента)
npm run start -w @demo/ui

# Терминал 2 — остальные сервисы
npm run start
```

Открыть http://localhost:5000.

---

## Ожидаемый результат

1. **Консоль браузера** — два сообщения:
   ```
   [ui] ThemeContext создан
   [ui] ThemeContext создан
   ```
   Первое — при инициализации host (ui загружен как remote с порта 5001).
   Второе — когда components загружает свою копию `@demo/ui` из workspace.

2. **Виджет ThemedCounter** — фон **красный**, надпись:
   ```
   ❌ Context сломан — @demo/ui загружен дважды
   ```
   Цвет темы: `#888` (дефолт из `createContext`), а не `crimson`.

3. **Счётчик работает** — кнопки `+`, `−`, `reset` меняют значение.
   Effector store (`$counter`) по-прежнему общий (через remote). Сломан только Context, не весь MF.

4. **Страница News** — заголовок **crimson**, кнопка из `@demo/ui` рендерится корректно.
   News — code split, часть app-бандла: использует тот же экземпляр `@demo/ui` что и host,
   поэтому `useTheme()` возвращает правильный `crimson`. Context работает.

   Это ключевой контраст с ThemedCounter: один и тот же `@demo/ui`, но в разных контекстах:
   - `NewsPage` (code split, внутри app) → тот же ThemeContext → `crimson` ✅
   - `ThemedCounter` (MF Remote) → свой ThemeContext → `#888` ❌

   Это изолирует проблему: Context ломается именно на Remote boundary, а не везде.

---

## Откат к baseline

```diff
# packages/app/rspack.config.ts
 remotes: {
-  '@demo/ui': 'demo_ui@http://localhost:5001/mf-manifest.json',
   '@demo/common': 'demo_common@http://localhost:5002/mf-manifest.json',
   '@demo/components': 'demo_components@http://localhost:5003/mf-manifest.json',
 },
 shared: {
   react: { singleton: true, eager: true, requiredVersion: '^18.2.0' },
   'react-dom': { singleton: true, eager: true, requiredVersion: '^18.2.0' },
+  '@demo/ui': { singleton: true },
   effector: { singleton: true, requiredVersion: '^22.4.0' },
   'effector-react': { singleton: true, requiredVersion: '^22.3.0' },
 },

# libs/components/rspack.config.ts
-  '@demo/ui': { singleton: true },
+  '@demo/ui': { singleton: true, import: false },
```

После отката: `[ui] ThemeContext создан` — одно сообщение, фон зелёный.
