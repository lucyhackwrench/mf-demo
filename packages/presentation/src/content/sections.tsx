import { DecisionMatrix, RspackSummaryCard, SharedFlowDiagram, TopologyDiagram, conclusionMetrics, experimentArtifacts, experimentMetrics, experimentWaterfalls, liveLinks, manifestDiff, overviewMetrics, pitfallsMetrics, rootCauseMetrics, rsdoctorSummary, semanticsMetrics, topologyMetrics, transientRuntimeEvidence } from '../evidence';
import type { PresentationSection } from '../types';

const repo = '/Users/oleksii/Sites/mf-demo';

const runtimeDecisionRows = [
  {
    combination: 'Shared UI + eager host',
    benefits: [
      'Один ThemeContext и одна React identity на critical path.',
      'Baseline уже подтверждён зелёными capture-артефактами и clean rerun.',
      'Remote consumer получает `crimson`, а не дефолтный fallback color.',
    ],
    negatives: [
      'Host берёт на себя роль точки инициализации share scope.',
      'Нужно дисциплинированно сохранять `import:false` у consuming remote.',
    ],
    evidence: {
      label: 'experiment 1 + final baseline',
      tone: 'accent' as const,
      detail: 'Один ThemeContext, working card и подтверждённый rollback-free baseline.',
    },
    status: {
      label: 'recommended',
      tone: 'success' as const,
      detail: 'verified green state',
    },
    verdict: 'Baseline fit',
    verdictTone: 'success' as const,
    recommendation:
      'Это текущий verified baseline и единственная комбинация, которая в этом репо одновременно стабильна, объяснима и полностью воспроизводима.',
    note: 'Опирается на experiment 1, final-baseline capture и архитектурный контракт shared `@demo/ui`.',
  },
  {
    combination: 'Shared UI + no eager host',
    benefits: [
      'Меньше синхронной инициализации на первом шаге runtime.',
      'Теоретически лучше подходит для архитектур, где React публикуется позже и осознанно асинхронно.',
    ],
    negatives: [
      'В текущем приложении эксперимент дал `loadShareSync failed` вместо зелёного UI.',
      'Требует пересмотра bootstrap assumptions, а не только удаления одного флага.',
    ],
    evidence: {
      label: 'experiment 3',
      tone: 'warning' as const,
      detail: '`loadShareSync failed` после удаления `eager` в текущем async bootstrap.',
    },
    status: {
      label: 'conditional',
      tone: 'warning' as const,
      detail: 'needs redesign',
    },
    verdict: 'Not drop-in',
    verdictTone: 'warning' as const,
    recommendation:
      'Комбинация не запрещена теоретически, но в текущем коде она не является drop-in заменой baseline и требует отдельного redesign bootstrap path.',
    note: 'Статус условный, а не красный, потому что проблема лежит в текущем bootstrap contract, а не в самой идее late publishing как таковой.',
  },
  {
    combination: 'Remote UI + eager host',
    benefits: [
      'Standalone UI remote удобно развивать и отлаживать изолированно на `:5001`.',
      'Легче демонстрировать controlled regression и независимый dist/manifest UI-пакета.',
    ],
    negatives: [
      'ThemeContext дублируется, и remote consumer теряет provider identity.',
      'Shared contract для `@demo/ui` размывается: библиотека начинает жить как второй runtime owner.',
    ],
    evidence: {
      label: 'experiment 2',
      tone: 'danger' as const,
      detail: 'Два ThemeContext log entries, broken state и fallback color `#888`.',
    },
    status: {
      label: 'avoid',
      tone: 'danger' as const,
      detail: 'context duplication',
    },
    verdict: 'Regression only',
    verdictTone: 'danger' as const,
    recommendation:
      'Для baseline-приложения это плохая комбинация: она полезна как учебная мутация, но не как рабочая архитектура.',
    note: 'Главный минус не в extra request к `:5001`, а в потере identity между provider и consumer.',
  },
  {
    combination: 'Remote UI + no eager host',
    benefits: [
      'Максимально независимое развёртывание UI remote и потенциально более тонкий host shell.',
      'Может быть интересна как отдельная архитектура, если весь bootstrap и ownership пересобраны под remote-first модель.',
    ],
    negatives: [
      'Комбинирует два уже проблемных фактора: duplicate context и несинхронную доступность share dependencies.',
      'В этом репо нет зелёного воспроизведения и нет evidence, что такая схема вообще стоит операционного риска.',
    ],
    evidence: {
      label: 'inference from experiments 2 + 3',
      tone: 'neutral' as const,
      detail: 'Отдельного зелёного capture нет; вывод сделан по совокупности already observed failures.',
    },
    status: {
      label: 'theoretical',
      tone: 'neutral' as const,
      detail: 'not directly verified',
    },
    verdict: 'Research track only',
    verdictTone: 'neutral' as const,
    recommendation:
      'Рассматривать только как отдельный исследовательский трек. Для текущего sandbox это не рабочая цель и не кандидат на baseline.',
    note: 'Мы честно не выдаём inference за факт: это комбинация без собственного successful capture.',
  },
];

const infrastructureDecisionRows = [
  {
    combination: '.mjs + explicit --config',
    benefits: [
      'Снимает двусмысленность между Node ESM semantics и загрузкой Rspack config.',
      'Именно эта комбинация сегодня стабильно поднимает build/start во всех ключевых пакетах.',
      'Хорошо сочетается с ESM import для Rsdoctor и явным `--mode`.',
    ],
    negatives: [
      'Скрипты становятся чуть более явными и многословными.',
      'Нужно поддерживать единый шаблон вызова во всех workspace-пакетах.',
    ],
    evidence: {
      label: 'root-cause fix',
      tone: 'accent' as const,
      detail: 'Именно эта комбинация закреплена в репо после устранения pre-runtime failure.',
    },
    status: {
      label: 'recommended',
      tone: 'success' as const,
      detail: 'current infra baseline',
    },
    verdict: 'Stable default',
    verdictTone: 'success' as const,
    recommendation:
      'Это инфраструктурный baseline: он не просто работает, а ещё и лучше всего объясняет, почему проект больше не падает pre-runtime.',
    note: 'Это лучший компромисс между прозрачностью запуска, ESM-consistency и воспроизводимостью исследования.',
  },
  {
    combination: '.mjs + implicit loader',
    benefits: [
      'ESM-формат остаётся согласованным с `type: module`.',
      'Меньше CLI-шума, если команда и среда гарантированно выбирают нужный config без явного указания.',
    ],
    negatives: [
      'В этом исследовании такая схема не была отдельным verified baseline.',
      'Неявный выбор config повышает риск “оно запускалось локально, но непонятно почему”.',
    ],
    evidence: {
      label: 'docs-supported, repo-untested',
      tone: 'warning' as const,
      detail: 'Формат допустим, но baseline evidence зафиксирован не на нём, а на explicit path.',
    },
    status: {
      label: 'conditional',
      tone: 'warning' as const,
      detail: 'less deterministic',
    },
    verdict: 'Possible but softer',
    verdictTone: 'warning' as const,
    recommendation:
      'Возможный вариант, если хочется сократить CLI, но для исследовательского стенда мы предпочитаем более проверяемую явную конфигурацию.',
    note: 'Комбинация выглядит разумно только там, где окружение жёстко контролируется и implicit resolution не станет источником дрейфа.',
  },
  {
    combination: '.ts + explicit --config',
    benefits: [
      'TypeScript-синтаксис в конфиге может быть приятнее для authoring и локальных типов.',
    ],
    negatives: [
      'Именно этот класс конфигурации воспроизвёл `ERR_UNKNOWN_FILE_EXTENSION` на текущем Node.',
      'Проблема случалась до любого runtime-анализа remotes и маскировала реальную архитектурную картину.',
    ],
    evidence: {
      label: 'pre-runtime failure',
      tone: 'danger' as const,
      detail: '`ERR_UNKNOWN_FILE_EXTENSION` возникал именно на `rspack.config.ts`.',
    },
    status: {
      label: 'avoid',
      tone: 'danger' as const,
      detail: 'reproduced failure',
    },
    verdict: 'Known bad path',
    verdictTone: 'danger' as const,
    recommendation:
      'Для этого репо комбинация уже дисквалифицирована практикой: она породила стартовую поломку и больше не является надёжной опцией.',
    note: 'Здесь важно не путать удобство authoring с реальной надёжностью запуска на текущем Node/Rspack пути.',
  },
  {
    combination: '.ts + implicit loader',
    benefits: [
      'Существенных operational-плюсов по сравнению с явным `.ts` здесь не появилось.',
    ],
    negatives: [
      'Сохраняет проблему с расширением и одновременно делает выбор загрузчика менее явным.',
      'Наименее детерминированный путь для репо, где исследование и так чувствительно к условиям запуска.',
    ],
    evidence: {
      label: 'same failure class, more ambiguity',
      tone: 'danger' as const,
      detail: 'Сохраняет `.ts` risk и добавляет неявность loader resolution.',
    },
    status: {
      label: 'avoid',
      tone: 'danger' as const,
      detail: 'worst determinism',
    },
    verdict: 'Reject first',
    verdictTone: 'danger' as const,
    recommendation:
      'Комбинация несёт максимум двусмысленности и минимум ценности. Для исследовательского окружения её стоит исключать первой.',
    note: 'Это не просто “ещё один плохой вариант”, а самый слабый по explainability и reproducibility режим.',
  },
];

export const sections: PresentationSection[] = [
  {
    id: 'overview',
    navLabel: 'Overview',
    eyebrow: 'Section 01',
    title: 'Что это за проект и почему он интересен',
    lead: 'Этот sandbox не просто показывает Module Federation в happy path. Он позволяет на одном небольшом монорепо увидеть, где shared runtime действительно держится на identity, а где конфиги ломают всё ещё до старта браузера.',
    paragraphs: [
      'В репозитории сосуществуют host, два рабочих remote-пакета, standalone UI remote для controlled regressions и локальный code-split page. Это делает проект удобным учебным стендом: можно отдельно говорить о topology, shared scope, boot order, contenthash и compile-time substitution, не притворяясь, что все проблемы сводятся к “не тот URL у remote”.',
      'Презентация собрана как самостоятельный мини-сайт. Она не зависит от того, подняты ли сейчас `localhost:5000`, `:5002` и `:5003`: narrative и evidence уже зафиксированы в JSON/PNG/TXT-артефактах, а live demo остаётся лишь вспомогательной ссылкой.',
    ],
    bullets: [
      'Нарратив и выводы берутся из `docs/` и root README.',
      'Все 6 экспериментов описаны единым шаблоном: hypothesis, mutation, observed result, rollback.',
      'Rspack evidence показывается через manifest snapshots, build warnings, Rsdoctor artifacts и network captures.',
    ],
    metrics: overviewMetrics,
    sources: [
      { label: 'Root README', href: `${repo}/README.md`, kind: 'repo', note: 'summary of current verified baseline' },
      { label: 'Research index', href: `${repo}/docs/README.md`, kind: 'repo', note: 'map of longer-form investigation' },
      { label: 'Live demo', href: liveLinks[0].href!, kind: 'live', note: 'optional, not required for presentation' },
    ],
  },
  {
    id: 'topology',
    navLabel: 'Topology',
    eyebrow: 'Section 02',
    title: 'Топология host/remotes/shared',
    lead: 'Вся дальнейшая аргументация опирается на правильную карту зависимостей. Ошибиться здесь — значит лечить не ту систему.',
    paragraphs: [
      'Host `@demo/app` на порту 5000 собирает локальную библиотеку `@demo/ui`, публикует shared scope и грузит два рабочих remote-контейнера: `@demo/common` и `@demo/components`. Отдельный `packages/news` при этом вообще не remote: это локальный code split внутри host.',
      'Критическая деталь: `@demo/ui` существует и как standalone remote на 5001, но этот режим нужен для изолированной UI-разработки и controlled regressions. В штатной архитектуре host не должен потреблять его как обычный remote.',
    ],
    bullets: [
      '`@demo/common` держит effector state и должен жить как singleton.',
      '`@demo/components` потребляет shared UI и shared state, а не тащит fallback-копии.',
      '`packages/news` полезен как контрольный пример: code split работает без MF semantics.',
    ],
    metrics: topologyMetrics,
    visual: <TopologyDiagram />,
    sources: [
      { label: 'Architecture and sharing', href: `${repo}/docs/ARCHITECTURE-AND-SHARING.md`, kind: 'repo' },
      { label: 'Host config', href: `${repo}/packages/app/rspack.config.mjs`, kind: 'repo' },
      { label: 'UI remote config', href: `${repo}/libs/ui/rspack.config.mjs`, kind: 'repo' },
    ],
  },
  {
    id: 'shared-semantics',
    navLabel: 'Shared Runtime',
    eyebrow: 'Section 03',
    title: 'Что здесь реально делают singleton, eager, import:false и mf-manifest.json',
    lead: 'В этом проекте shared-конфиг — не декоративная метка, а описание того, кто имеет право владеть identity конкретного модуля.',
    paragraphs: [
      '`singleton` здесь означает не просто “меньше дубликатов”, а сохранение идентичности для React, ThemeContext и effector store. Если `ThemeProvider` и `useTheme()` смотрят на разные Context instances, то цвет до remote consumer уже не доходит.',
      '`eager` используется адресно только для `react` и `react-dom` на стороне host. Это делает React доступным синхронно на критическом пути. Всё остальное остаётся асинхронным и зависит от корректного async bootstrap.',
      '`import:false` в `libs/components` говорит: remote не должен подстраховываться собственной копией `@demo/ui` или `@demo/common`; он обязан взять их из уже опубликованного share scope. Это и есть причина, почему перевод `@demo/ui` в normal remote ломает baseline.',
      'Матрицы ниже читаются как decision aid, а не как абстрактная теория. В каждой строке мы отдельно показываем выгоды, цену решения, evidence layer и итоговый verdict: `recommended` означает verified green baseline, `conditional` требует явных оговорок, `avoid` уже опровергнут практикой, а `theoretical` честно помечает непроверенный, но логически выводимый сценарий.',
      'Важно, что здесь две ортогональные плоскости. Первая отвечает за runtime ownership `@demo/ui` и React publishing, вторая — за инфраструктурную загрузку конфигов Rspack. `RSDOCTOR`, `DefinePlugin`, contenthash и похожие build-time probes не меняют verdict по этим осям: они лишь добавляют наблюдаемость поверх уже выбранной runtime/infra комбинации.',
    ],
    metrics: semanticsMetrics,
    visual: (
      <div className="matrix-stack">
        <SharedFlowDiagram />
        <DecisionMatrix
          intro="Эта матрица сравнивает именно runtime contract: кто владеет `@demo/ui`, когда React становится доступным и почему один вариант держит Context identity, а другой ломает её."
          note="Практическое чтение простое: зелёная строка — verified baseline, янтарная — возможна только с дополнительным redesign, красная — уже сломала рабочий сценарий, серая — пока лишь вывод по совокупности evidence."
          rows={runtimeDecisionRows}
          title="Матрица 1. Runtime combinations для shared UI"
        />
        <DecisionMatrix
          intro="Эта матрица отвечает на другой класс вопросов: какой формат Rspack config и способ его выбора дают воспроизводимый старт, а какие комбинации снова возвращают pre-runtime ambiguity."
          note="Build-time toggles вроде `RSDOCTOR=true`, `dts` и contenthash orthogonal к этой плоскости: они не меняют базовый verdict по загрузке конфига, а лишь добавляют дополнительные наблюдения поверх стабильного baseline."
          rows={infrastructureDecisionRows}
          title="Матрица 2. Infrastructure combinations для Rspack config loading"
        />
      </div>
    ),
    codeExcerpts: [
      {
        label: 'Host shared config',
        filePath: 'packages/app/rspack.config.mjs',
        language: 'mjs',
        excerpt: `shared: {\n  react: { singleton: true, eager: true },\n  'react-dom': { singleton: true, eager: true },\n  '@demo/ui': { singleton: true },\n  effector: { singleton: true },\n  'effector-react': { singleton: true },\n},`,
        highlights: [
          'React eagerly published only by host.',
          '`@demo/ui` published as one shared library instance.',
        ],
      },
      {
        label: 'Remote consumption contract',
        filePath: 'libs/components/rspack.config.mjs',
        language: 'mjs',
        excerpt: `shared: {\n  react: { singleton: true, requiredVersion: '^18.2.0' },\n  'react-dom': { singleton: true, requiredVersion: '^18.2.0' },\n  '@demo/ui': { singleton: true, import: false },\n  '@demo/common': { singleton: true, import: false },\n},`,
        highlights: [
          '`import:false` prevents fallback copies inside the consumer remote.',
          'The remote assumes host/runtime already seeded the shared scope.',
        ],
      },
    ],
    sources: [
      { label: 'Architecture and sharing', href: `${repo}/docs/ARCHITECTURE-AND-SHARING.md`, kind: 'repo' },
      { label: 'Module Federation shared config', href: 'https://module-federation.io/configure/shared.html', kind: 'external' },
      { label: 'Module Federation manifest', href: 'https://module-federation.io/configure/manifest.html', kind: 'external' },
    ],
  },
  {
    id: 'root-cause',
    navLabel: 'Root Cause',
    eyebrow: 'Section 04',
    title: 'Pre-runtime root cause: почему понадобился rspack.config.mjs',
    lead: 'Самая важная инженерная развилка исследования: проект был сломан не в shared runtime, а ещё до старта браузера. Это меняет и диагностику, и приоритеты фикса.',
    paragraphs: [
      'Исходная комбинация `\"type\": \"module\"` в `libs/*` и `rspack.config.ts` приводила к `ERR_UNKNOWN_FILE_EXTENSION` на текущем Node 22.13.1. То есть dev/build команду ломал слой config loading, а не сами remotes, share scope или React bootstrap.',
      'Переход на `rspack.config.mjs`, явный `--config rspack.config.mjs --mode ...`, ESM import для Rsdoctor и отключение dev dts worker убрали двусмысленность формата и стабилизировали старт. Это честный infrastructure fix, а не косметическое переименование файлов.',
    ],
    bullets: [
      'Проблема проявлялась до любых network requests к `mf-manifest.json`.',
      'Выбор `.mjs` согласуется с текущей документацией Rspack и модульной семантикой Node.',
      'После фикса baseline build/start стал детерминированным, и только потом имело смысл запускать experiments 1–6.',
    ],
    metrics: rootCauseMetrics,
    codeExcerpts: [
      {
        label: 'Old failure mode',
        filePath: 'README + root-cause docs',
        language: 'txt',
        excerpt: `TypeError [ERR_UNKNOWN_FILE_EXTENSION]:\nUnknown file extension ".ts" for .../libs/common/rspack.config.ts`,
        highlights: [
          'This is a pre-runtime loader failure, not a share-scope bug.',
        ],
      },
      {
        label: 'Current explicit build entry',
        filePath: 'packages/*/package.json',
        language: 'bash',
        excerpt: `rspack serve --config rspack.config.mjs --mode development\nrspack build --config rspack.config.mjs --mode production`,
        highlights: [
          'Config file selection is explicit now.',
          'Mode is no longer injected through shell-only syntax.',
        ],
      },
    ],
    sources: [
      { label: 'Root cause and fix', href: `${repo}/docs/ROOT-CAUSE-AND-FIX.md`, kind: 'repo' },
      { label: 'Rspack config docs', href: 'https://rspack.rs/config/', kind: 'external' },
      { label: 'Node packages docs', href: 'https://nodejs.org/api/packages.html', kind: 'external' },
    ],
  },
  {
    id: 'experiment-1',
    navLabel: 'Experiment 1',
    eyebrow: 'Section 05',
    title: 'Experiment 1: baseline validation',
    lead: 'Сначала нужно доказать, что normal working state вообще существует и стабилен. Иначе все последующие regressions неинтерпретируемы.',
    paragraphs: [
      'Baseline подтверждает две вещи одновременно: `ThemeContext` создаётся один раз, а remote consumer реально получает `crimson`, а не дефолтный `#888`. Дополнительный News capture показывает, что local code split не ломает theme/store семантику.',
    ],
    experiment: {
      hypothesis: 'Если host публикует `@demo/ui` один раз, а `@demo/components` потребляет shared instance, то ThemedCounter остаётся зелёным и лог ThemeContext печатается один раз.',
      temporaryChanges: [
        'Никаких сознательных мутаций в baseline не вносилось.',
        'Проверка выполнялась после clean rerun и чистой консоли.',
      ],
      touchedAreas: [
        'packages/app/src/App.tsx',
        'libs/ui/src/ThemeContext.tsx',
        'libs/components/src/ThemedCounter.tsx',
      ],
      expectation: [
        'Один лог `[ui] ThemeContext создан`.',
        'Зелёный текстовый индикатор и `crimson` в remote consumer.',
        'News page наследует тему и shared store.',
      ],
      observed: [
        'Capture показывает один ThemeContext log и отсутствие failed requests.',
        'Body text фиксирует `Context работает — color: crimson`.',
        'Requests идут к host, common и components, без лишнего UI remote на 5001.',
      ],
      restoration: [
        'Rollback не требовался, это канонический baseline.',
        'Финальный `final-baseline.json` снова подтверждает тот же working state.',
      ],
      artifacts: experimentArtifacts.experiment1,
      metrics: experimentMetrics.experiment1,
      waterfall: experimentWaterfalls.experiment1,
    },
    sources: [
      { label: 'Experiment methodology', href: `${repo}/docs/EXPERIMENTS-AND-PITFALLS.md`, kind: 'repo' },
      { label: 'Baseline capture JSON', href: `${repo}/research/artifacts/experiment-1-baseline.json`, kind: 'artifact' },
      { label: 'Final baseline capture', href: `${repo}/research/artifacts/final-baseline.json`, kind: 'artifact' },
    ],
  },
  {
    id: 'experiment-2',
    navLabel: 'Experiment 2',
    eyebrow: 'Section 06',
    title: 'Experiment 2: превращаем @demo/ui в remote и ломаем Context',
    lead: 'Это главный controlled regression: он показывает, почему UI library с React Context нельзя бездумно переводить в “обычный remote”, даже если на бумаге всё выглядит как reuse.',
    paragraphs: [
      'Эксперимент нарочно заставляет runtime загрузить `@demo/ui` как отдельный remote на 5001 и убрать ключевую защиту `import:false` у `@demo/components`. Визуальный эффект получается очень наглядным: remote consumer больше не видит provider instance и падает к дефолтному `#888`.',
    ],
    experiment: {
      hypothesis: 'Если `@demo/ui` войдёт в runtime как отдельный remote вместо shared library instance, то ThemeContext продублируется и remote consumer потеряет provider state.',
      temporaryChanges: [
        'Host временно получает remote `@demo/ui`.',
        'В `libs/components` для `@demo/ui` убирается `import:false`.',
      ],
      touchedAreas: [
        'packages/app/rspack.config.mjs',
        'libs/components/rspack.config.mjs',
        'libs/ui/rspack.config.mjs',
      ],
      expectation: [
        'В консоли появится два лога ThemeContext.',
        'Текстовый индикатор переключится на broken state.',
        'В requests появится `http://localhost:5001/mf-manifest.json`.',
      ],
      observed: [
        'Зафиксированы два ThemeContext log entries.',
        'Body text показывает `Context сломан — @demo/ui загружен дважды` и цвет `#888`.',
        'Rollback-скриншот после отката снова зелёный.',
      ],
      restoration: [
        'Remote `@demo/ui` убран из host config.',
        'Для `@demo/ui` возвращён `import:false` на стороне consumer remote.',
        'Clean rerun после rollback дал baseline-restored capture.',
      ],
      artifacts: experimentArtifacts.experiment2,
      metrics: experimentMetrics.experiment2,
      waterfall: experimentWaterfalls.experiment2,
    },
    sources: [
      { label: 'Experiment 2 capture', href: `${repo}/research/artifacts/experiment-2-ui-remote.json`, kind: 'artifact' },
      { label: 'Baseline restored capture', href: `${repo}/research/artifacts/experiment-2-baseline-restored.json`, kind: 'artifact' },
      { label: 'Shared config docs', href: 'https://module-federation.io/configure/shared.html', kind: 'external' },
    ],
  },
  {
    id: 'experiment-3',
    navLabel: 'Experiment 3',
    eyebrow: 'Section 07',
    title: 'Experiment 3: убираем eager и получаем related runtime error',
    lead: 'Этот эксперимент полезен именно как уточнение README. Он показывает, что в текущем коде ошибка формулируется иначе, потому что приложение уже использует async bootstrap.',
    paragraphs: [
      'Старое популярное описание про eager-consumption слишком грубое для текущего baseline. Здесь `index.ts` уже делает `import(\'./bootstrap\')`, поэтому при временном удалении `eager` мы фиксируем связанный runtime error `loadShareSync failed`, а не один в один старую формулировку из упрощённых туториалов.',
    ],
    experiment: {
      hypothesis: 'Если снять eager-публикацию React у host, share scope больше не сможет дать synchronously available React в момент, когда runtime этого ожидает.',
      temporaryChanges: [
        'В host-конфиге временно убран `eager: true` у `react` и `react-dom`.',
        'Experiment трактуется через текущий async bootstrap, а не как чистая копия старого tutorial scenario.',
      ],
      touchedAreas: [
        'packages/app/rspack.config.mjs',
        'packages/app/src/index.ts',
        'packages/app/src/bootstrap.tsx',
      ],
      expectation: [
        'UI перестанет доходить до working card.',
        'В консоли появится related runtime message про `loadShareSync failed`.',
      ],
      observed: [
        'Capture действительно фиксирует `loadShareSync failed` и не находит stable working card.',
        'Requests к remote остаются, но React уже не публикуется синхронно как ожидалось runtime.',
      ],
      restoration: [
        'Host shared config возвращён к исходному eager baseline.',
        'После rollback последующие captures снова зелёные.',
      ],
      artifacts: experimentArtifacts.experiment3,
      metrics: experimentMetrics.experiment3,
      waterfall: experimentWaterfalls.experiment3,
      codeExcerpts: [
        {
          label: 'Async bootstrap caveat',
          filePath: 'packages/app/src/index.ts',
          language: 'ts',
          excerpt: `import('./bootstrap');`,
          highlights: [
            'This existing async boundary changes how the eager experiment manifests.',
          ],
        },
      ],
    },
    sources: [
      { label: 'Experiment 3 capture', href: `${repo}/research/artifacts/experiment-3-no-eager-react.json`, kind: 'artifact' },
      { label: 'Webpack MF troubleshooting', href: 'https://webpack.js.org/concepts/module-federation/', kind: 'external' },
      { label: 'Experiment methodology', href: `${repo}/docs/EXPERIMENTS-AND-PITFALLS.md`, kind: 'repo' },
    ],
  },
  {
    id: 'experiment-4',
    navLabel: 'Experiment 4',
    eyebrow: 'Section 08',
    title: 'Experiment 4: Rsdoctor и данные из Rspack',
    lead: 'Здесь мы не гадаем по bundle names вслепую, а смотрим на build log, generated report files и tile graph HTML, который пришёл из Rsdoctor build.',
    paragraphs: [
      'После перехода на ESM-конфиг подключение Rsdoctor стало чище: плагин импортируется как ESM и не конфликтует с модульной семантикой самого Rspack-конфига. В recorded build видны сразу три полезных сигнала: успешная генерация federated types, реальный адрес analyze server и предупреждения про modern JS output.',
      'Для презентации важно не переусложнить это место. Мы не парсим opaque `.rsdoctor/*/0` файлы, а показываем summary-карточки, список generated report files и даём прямую ссылку на tile graph HTML.',
    ],
    experiment: {
      hypothesis: 'Если собрать standalone UI remote с `RSDOCTOR=true`, то Rspack сгенерирует inspectable report и покажет bundle-level warnings/metadata без влияния на baseline runtime.',
      temporaryChanges: [
        'Временная мутация кода не нужна; включается только env flag `RSDOCTOR=true`.',
      ],
      touchedAreas: [
        'libs/ui/rspack.config.mjs',
        'research/artifacts/experiment-4-rsdoctor-build.txt',
        'libs/ui/dist/.rsdoctor/*',
      ],
      expectation: [
        'Build пройдёт и создаст `.rsdoctor` artifact tree.',
        'Появятся анализ-ссылки и tile graph HTML.',
        'Можно будет увидеть build warnings про emitted JS level.',
      ],
      observed: [
        'Build log зафиксировал analyze server URL и 6 ECMA-version warnings.',
        'Tile graph HTML существует и пригоден как локальный linked artifact.',
        'Federated types created correctly — дополнительный sanity signal из build output.',
      ],
      restoration: [
        'Rollback не требовался: это isolated build-time experiment.',
      ],
      artifacts: experimentArtifacts.experiment4,
      metrics: experimentMetrics.experiment4,
    },
    visual: <RspackSummaryCard summary={rsdoctorSummary} />,
    sources: [
      { label: 'Rsdoctor build log', href: `${repo}/research/artifacts/experiment-4-rsdoctor-build.txt`, kind: 'artifact' },
      { label: 'Rsdoctor artifact list', href: `${repo}/research/artifacts/experiment-4-rsdoctor.txt`, kind: 'artifact' },
      { label: 'Use Rsdoctor', href: 'https://rspack.rs/guide/optimization/use-rsdoctor', kind: 'external' },
    ],
  },
  {
    id: 'experiment-5',
    navLabel: 'Experiment 5',
    eyebrow: 'Section 09',
    title: 'Experiment 5: contenthash, manifest и cache busting',
    lead: 'Ключевая мысль этого опыта: смотреть нужно не только на имена файлов в dist. Для Module Federation consumer важнее то, куда указывает активный mf-manifest.json.',
    paragraphs: [
      'В recorded sequence сначала снимался baseline manifest, потом временно менялся `libs/ui/src/Button.tsx`, затем делался rebuild и сравнивались before/after/restored snapshots. Это позволяет показать, что cache busting действительно завязан на содержимое и отражается в активных путях expose/shared assets.',
    ],
    experiment: {
      hypothesis: 'Если изменить код в UI remote и пересобрать его, то активные asset names в manifest изменятся по content hash, а после rollback вернутся к исходному состоянию.',
      temporaryChanges: [
        'В `libs/ui/src/Button.tsx` временно меняется код ради отличимого content delta.',
        'После rebuild снимаются before/after/restored manifest snapshots.',
      ],
      touchedAreas: [
        'libs/ui/src/Button.tsx',
        'libs/ui/dist/mf-manifest.json',
        'research/artifacts/experiment-5-*.json',
      ],
      expectation: [
        'Expose и shared asset filenames в active manifest должны поменяться.',
        'Raw dist listing может вводить в заблуждение из-за накопленных старых файлов.',
      ],
      observed: [
        'Manifest diff действительно показывает смену active asset names.',
        'Rollback manifest отдельно доказывает, что возврат baseline завершён.',
      ],
      restoration: [
        'Код Button возвращён к baseline.',
        'После финального rebuild записан restored manifest snapshot.',
      ],
      artifacts: experimentArtifacts.experiment5,
      metrics: experimentMetrics.experiment5,
      manifestDiff,
    },
    sources: [
      { label: 'Manifest before', href: `${repo}/research/artifacts/experiment-5-before-manifest.json`, kind: 'artifact' },
      { label: 'Manifest after', href: `${repo}/research/artifacts/experiment-5-after-manifest.json`, kind: 'artifact' },
      { label: 'Rspack output docs', href: 'https://rspack.rs/config/output', kind: 'external' },
    ],
  },
  {
    id: 'experiment-6',
    navLabel: 'Experiment 6',
    eyebrow: 'Section 10',
    title: 'Experiment 6: DefinePlugin и compile-time substitution',
    lead: 'Этот эксперимент специально показывает разницу между “сервер стартует” и “значение действительно подставилось в bundle”. Без временного UI probe он вообще был бы ненаблюдаем.',
    paragraphs: [
      'README-идея про `process.env.API_URL` сама по себе недостаточна: нужно либо искать строку в bundle, либо временно вывести её в UI. В recorded run использован второй путь: кратковременный probe-поле в UI, после чего признак зафиксирован в capture и изменения откатили.',
    ],
    experiment: {
      hypothesis: 'Если добавить DefinePlugin substitution, bundle получит строковое значение на build time, и временный probe сможет показать его в UI.',
      temporaryChanges: [
        'В host-конфиг временно добавляется DefinePlugin entry для `process.env.API_URL`.',
        'Во временный UI probe выводится значение API URL.',
      ],
      touchedAreas: [
        'packages/app/rspack.config.mjs',
        'packages/app/src/App.tsx',
        'research/artifacts/experiment-6-define-plugin.*',
      ],
      expectation: [
        'В body text появится `API URL из DefinePlugin: https://api.example.com`.',
        'Это будет compile-time substitution, а не runtime env lookup.',
      ],
      observed: [
        'Capture body text действительно содержит `https://api.example.com`.',
        'После rollback probe удалён, baseline продолжает быть зелёным.',
      ],
      restoration: [
        'DefinePlugin probe убран после записи артефактов.',
        'Финальный baseline-capture подтверждает отсутствие side effects.',
      ],
      artifacts: experimentArtifacts.experiment6,
      metrics: experimentMetrics.experiment6,
    },
    sources: [
      { label: 'DefinePlugin capture', href: `${repo}/research/artifacts/experiment-6-define-plugin.json`, kind: 'artifact' },
      { label: 'Rspack DefinePlugin docs', href: 'https://rspack.rs/plugins/webpack/define-plugin', kind: 'external' },
      { label: 'Experiment note', href: `${repo}/docs/EXPERIMENTS-AND-PITFALLS.md`, kind: 'repo' },
    ],
  },
  {
    id: 'pitfalls',
    navLabel: 'Pitfalls',
    eyebrow: 'Section 11',
    title: 'Подводные камни: HMR, stale share scope, dist drift и transient captures',
    lead: 'Это не просто “заметки на полях”. Именно эти caveats объясняют, почему MF-исследования часто дают ложные выводы и почему нужен disciplined rollback/clean rerun.',
    paragraphs: [
      'HMR и старый share scope способны удерживать состояние, которое уже не соответствует текущему коду. Поэтому любые выводы про Context duplication и runtime errors должны делаться только после clean rerun, а не после случайного набора hot updates.',
      'Накопление старых файлов в `dist` делает поверхностный `ls` плохим инструментом для экспериментов про contenthash. Источником правды должен быть текущий `mf-manifest.json`. Отдельно historical `runtime-blocker` capture стоит трактовать как transient observation во время серии временных правок, а не как финальный baseline статус.',
    ],
    bullets: [
      'Сначала подтверждаем infrastructure baseline, потом делаем controlled mutation.',
      'После каждого mutating experiment обязателен rollback и отдельный re-check baseline.',
      'Не смешиваем experiment 2/3/6 в один прогон: каждое изменение должно быть изолированным.',
    ],
    metrics: pitfallsMetrics,
    experiment: {
      hypothesis: 'Если не контролировать HMR, stale runtime и dist drift, то можно принять transient symptom за настоящий architectural bug.',
      temporaryChanges: [
        'Это не отдельный code experiment, а section с operational caveats.',
        'В evidence добавлен только historical runtime-blocker capture как explicitly non-authoritative artifact.',
      ],
      touchedAreas: [
        'research/artifacts/runtime-blocker.json',
        'research/artifacts/runtime-blocker.png',
        'docs/EXPERIMENTS-AND-PITFALLS.md',
      ],
      expectation: [
        'Пользователь должен явно увидеть разницу между final baseline status и transient observation.',
      ],
      observed: [
        'Historical runtime-blocker capture существует, но финальный clean rerun его не подтвердил.',
        'Final baseline artifact снова зелёный, поэтому статус зафиксирован как restored/working.',
      ],
      restoration: [
        'В документации runtime-blocker помечен как transient/intermediate observation.',
        'Presentation повторяет это ограничение и не трактует capture как current blocker.',
      ],
      artifacts: transientRuntimeEvidence,
    },
    sources: [
      { label: 'Pitfalls doc', href: `${repo}/docs/EXPERIMENTS-AND-PITFALLS.md`, kind: 'repo' },
      { label: 'Historical runtime blocker JSON', href: `${repo}/research/artifacts/runtime-blocker.json`, kind: 'artifact' },
      { label: 'Final baseline capture', href: `${repo}/research/artifacts/final-baseline.json`, kind: 'artifact' },
    ],
  },
  {
    id: 'conclusions',
    navLabel: 'Conclusions',
    eyebrow: 'Section 12',
    title: 'Финальные выводы и список источников',
    lead: 'Главный итог исследования не в том, что “Module Federation иногда ломается”, а в том, что разные классы проблем требуют разной модели диагностики: config loading, runtime sharing, build metadata и experiment hygiene нельзя сваливать в одну корзину.',
    paragraphs: [
      'Сейчас baseline рабочий, а все шесть экспериментов воспроизведены и документированы. Самая ценная инженерная часть — способность отделять permanent baseline facts от временных артефактов процесса, вроде HMR noise или transient runtime blocker captures.',
      'Презентация сознательно сделана отдельно от demo app: объект исследования и среда рассказа не должны ломать друг друга. Именно поэтому microsite может оставаться полезным даже если `localhost`-сервисы сейчас не запущены.',
    ],
    bullets: [
      'Pre-runtime fix с `.mjs` был необходим до любых MF runtime discussions.',
      '`@demo/ui` должен жить как shared library instance, а не как normal remote в baseline.',
      'Manifest snapshots и build logs дают более надёжную evidence base, чем интуиция по dist-папке.',
    ],
    metrics: conclusionMetrics,
    sources: [
      { label: 'Research index', href: `${repo}/docs/README.md`, kind: 'repo' },
      { label: 'Sources and evidence', href: `${repo}/docs/SOURCES-AND-EVIDENCE.md`, kind: 'repo' },
      { label: 'Rspack docs', href: 'https://rspack.rs/config/', kind: 'external' },
      { label: 'Module Federation docs', href: 'https://module-federation.io/configure/shared.html', kind: 'external' },
      { label: 'Node TypeScript docs', href: 'https://nodejs.org/api/typescript.html', kind: 'external' },
    ],
  },
];
