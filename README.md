# MF Demo

Sandbox-проект для исследования Module Federation на Rspack.

## Архитектура

```text
packages/app       (host,    порт 5000)
  ├── shared lib:  @demo/ui          -> бандлится в host, публикуется в shared scope
  ├── remote:      @demo/common      -> localhost:5002
  └── remote:      @demo/components  -> localhost:5003

libs/ui            (shared-библиотека, НЕ remote в штатной схеме)
libs/common        (remote, порт 5002)
libs/components    (remote, порт 5003)
packages/news      (часть app-бандла, НЕ remote; code split через ~news alias)
```

Ключевая идея: `@demo/ui` не должен быть обычным remote, потому что в нём живёт `ThemeContext`,
а контекст не переносит дублирование экземпляров.

## Запуск

### Dev-режим

```bash
npm install
npm start
```

Поднимает три dev-сервера параллельно:

| Сервис            | URL                     |
|-------------------|-------------------------|
| host app          | http://localhost:5000   |
| common remote     | http://localhost:5002   |
| components remote | http://localhost:5003   |

Для просмотра `mf-manifest.json` любого remote:

```
http://localhost:<порт>/mf-manifest.json
```

### Production-сборка

```bash
npm run build
```

Собирает последовательно: `@demo/common` → `@demo/components` → `@demo/app`.
Артефакты попадают в `dist/` каждого пакета.

## Структура проекта

```text
mf-demo/
├── libs/
│   ├── ui/           shared-библиотека (ThemeContext, Button)
│   ├── common/       remote — Effector-сторы
│   └── components/   remote — ThemedCounter
└── packages/
    ├── app/          host
    ├── news/         обычный пакет (не remote)
```
