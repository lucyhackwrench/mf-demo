import experiment1Baseline from '../../../../research/artifacts/experiment-1-baseline.json';
import experiment1NewsCheck from '../../../../research/artifacts/experiment-1-news-check.json';
import experiment2BaselineRestored from '../../../../research/artifacts/experiment-2-baseline-restored.json';
import experiment2UiRemote from '../../../../research/artifacts/experiment-2-ui-remote.json';
import experiment3NoEager from '../../../../research/artifacts/experiment-3-no-eager-react.json';
import experiment5AfterManifest from '../../../../research/artifacts/experiment-5-after-manifest.json';
import experiment5BeforeManifest from '../../../../research/artifacts/experiment-5-before-manifest.json';
import experiment5RestoredManifest from '../../../../research/artifacts/experiment-5-restored-manifest.json';
import experiment6DefinePlugin from '../../../../research/artifacts/experiment-6-define-plugin.json';
import finalBaseline from '../../../../research/artifacts/final-baseline.json';
import runtimeBlocker from '../../../../research/artifacts/runtime-blocker.json';
import experiment1BaselinePng from '../../../../research/artifacts/experiment-1-baseline.png';
import experiment2BaselineRestoredPng from '../../../../research/artifacts/experiment-2-baseline-restored.png';
import experiment2UiRemotePng from '../../../../research/artifacts/experiment-2-ui-remote.png';
import experiment3NoEagerPng from '../../../../research/artifacts/experiment-3-no-eager-react.png';
import experiment6DefinePluginPng from '../../../../research/artifacts/experiment-6-define-plugin.png';
import runtimeBlockerPng from '../../../../research/artifacts/runtime-blocker.png';
import experiment4RsdoctorBuild from '../../../../research/artifacts/experiment-4-rsdoctor-build.txt';
import experiment4RsdoctorFiles from '../../../../research/artifacts/experiment-4-rsdoctor.txt';
import experiment6DefinePluginTxt from '../../../../research/artifacts/experiment-6-define-plugin.txt';
import rsdoctorTileGraphUrl from '../../../../libs/ui/dist/.rsdoctor/rsdoctor-tile-graph.html';
import type { EvidenceAsset, ManifestDiffDataset, MetricCard, RspackSummary, WaterfallDataset } from '../types';

interface CaptureMessage {
  type: string;
  text: string;
}

interface CaptureRequest {
  method: string;
  url: string;
  resourceType: string;
}

interface CaptureState {
  found: boolean;
  text?: string;
  bodyText?: string;
}

interface CaptureArtifact {
  url: string;
  bodyText?: string;
  consoleMessages: CaptureMessage[];
  requests: CaptureRequest[];
  failedRequests: Array<{ url: string; errorText?: string }>;
  state?: CaptureState;
}

interface ManifestAssetEntry {
  name: string;
  assets: {
    js: {
      sync: string[];
      async: string[];
    };
  };
}

interface ManifestArtifact {
  id: string;
  shared?: ManifestAssetEntry[];
  exposes?: ManifestAssetEntry[];
}

const baselineCapture = experiment1Baseline as CaptureArtifact;
const newsCapture = experiment1NewsCheck as CaptureArtifact;
const uiRemoteCapture = experiment2UiRemote as CaptureArtifact;
const restoredCapture = experiment2BaselineRestored as CaptureArtifact;
const noEagerCapture = experiment3NoEager as CaptureArtifact;
const definePluginCapture = experiment6DefinePlugin as CaptureArtifact;
const finalBaselineCapture = finalBaseline as CaptureArtifact;
const runtimeBlockerCapture = runtimeBlocker as CaptureArtifact;

const beforeManifest = experiment5BeforeManifest as ManifestArtifact;
const afterManifest = experiment5AfterManifest as ManifestArtifact;
const restoredManifest = experiment5RestoredManifest as ManifestArtifact;

const countMessages = (capture: CaptureArtifact, needle: string) =>
  capture.consoleMessages.filter((message) => message.text.includes(needle)).length;

const shortRequestList = (capture: CaptureArtifact, highlights: string[]): WaterfallDataset => ({
  title: 'Network/request evidence',
  requests: capture.requests.slice(0, 12).map((request) => ({
    method: request.method,
    resourceType: request.resourceType,
    url: request.url,
  })),
  highlight: highlights,
});

const exposeMap = (manifest: ManifestArtifact) => {
  const result = new Map<string, string>();

  for (const item of manifest.shared ?? []) {
    const syncAsset = item.assets?.js?.sync?.[0];
    if (syncAsset) {
      result.set(`shared:${item.name}`, syncAsset);
    }
  }

  for (const item of manifest.exposes ?? []) {
    const syncAsset = item.assets?.js?.sync?.[0];
    if (syncAsset) {
      result.set(`expose:${item.name}`, syncAsset);
    }
  }

  return result;
};

const beforeMap = exposeMap(beforeManifest);
const afterMap = exposeMap(afterManifest);
const restoredMap = exposeMap(restoredManifest);

const sortedScopes = [...new Set([...beforeMap.keys(), ...afterMap.keys(), ...restoredMap.keys()])].sort();

export const manifestDiff: ManifestDiffDataset = {
  title: 'Manifest diff for contenthash experiment',
  note: 'Сравнение идёт по активным путям из mf-manifest.json, а не по raw ls dist. Именно manifest определяет, какие asset names реально выдаются remote consumer-у.',
  rows: sortedScopes.map((scope) => ({
    scope,
    before: beforeMap.get(scope) ?? '—',
    after: afterMap.get(scope) ?? '—',
    restored: restoredMap.get(scope) ?? '—',
  })),
};

const parseRsdoctorWarnings = () =>
  experiment4RsdoctorBuild
    .split('\n')
    .filter((line) => line.startsWith('WARNING in'))
    .map((line) => line.replace(/^WARNING in\s*/, ''));

const parseRsdoctorFiles = () =>
  experiment4RsdoctorFiles
    .split('\n')
    .filter((line) => line.startsWith('libs/ui/dist/.rsdoctor/'));

export const rsdoctorSummary: RspackSummary = {
  reportUrl: rsdoctorTileGraphUrl,
  manifestPath: 'libs/ui/dist/mf-manifest.json',
  files: parseRsdoctorFiles(),
  warnings: parseRsdoctorWarnings(),
  notes: [
    'Rsdoctor build подтвердил генерацию federated types.',
    'В отчёте surfaced E1004 warnings: output modern JS exceeds ES5 baseline.',
    'Для самой презентации мы используем build log и список report artifacts, а не парсим opaque `.rsdoctor/*/0` файлы.',
  ],
};

export const overviewMetrics: MetricCard[] = [
  { label: 'Workspace packages', value: '6', note: 'app, news, common, components, ui, presentation', tone: 'accent' },
  { label: 'Verified experiments', value: '6 / 6', note: 'baseline, regressions, rollback', tone: 'success' },
  { label: 'Key ports', value: '5000 / 5002 / 5003', note: '5001 only for standalone UI experiment', tone: 'warning' },
];

export const topologyMetrics: MetricCard[] = [
  { label: 'Host role', value: '@demo/app', note: 'publishes shared scope', tone: 'accent' },
  { label: 'State remote', value: '@demo/common', note: 'effector singleton', tone: 'success' },
  { label: 'UI consumer', value: '@demo/components', note: 'import:false for ui/common', tone: 'warning' },
];

export const semanticsMetrics: MetricCard[] = [
  { label: 'singleton', value: 'identity', note: 'one React, one ThemeContext, one store', tone: 'accent' },
  { label: 'eager', value: 'host-only', note: 'React published synchronously', tone: 'warning' },
  { label: 'import:false', value: 'no fallback copy', note: 'remote must consume external shared instance', tone: 'success' },
];

export const rootCauseMetrics: MetricCard[] = [
  { label: 'Broken layer', value: 'pre-runtime', note: 'config loading failed before any remote init', tone: 'warning' },
  { label: 'Node version', value: '22.13.1', note: 'below current TS config native comfort zone', tone: 'accent' },
  { label: 'Fix', value: 'rspack.config.mjs', note: 'explicit ESM config + explicit --config/--mode', tone: 'success' },
];

export const pitfallsMetrics: MetricCard[] = [
  { label: 'HMR noise', value: 'real', note: 'console duplication can fake context issues', tone: 'warning' },
  { label: 'dist drift', value: 'real', note: 'old contenthash files remain in dist', tone: 'accent' },
  { label: 'Transient capture', value: 'runtime-blocker', note: 'historical artifact, not final baseline', tone: 'neutral' },
];

export const conclusionMetrics: MetricCard[] = [
  {
    label: 'Baseline after rollback',
    value: 'green',
    note: finalBaselineCapture.state?.found ? 'verified by final capture' : 'manual follow-up required',
    tone: 'success',
  },
  { label: 'ThemeContext logs', value: String(countMessages(finalBaselineCapture, 'ThemeContext')), note: 'final clean rerun', tone: 'accent' },
  { label: 'Failed requests', value: String(finalBaselineCapture.failedRequests.length), note: 'presentation evidence says none', tone: 'success' },
];

export const experimentArtifacts = {
  experiment1: [
    {
      kind: 'image',
      label: 'Baseline screenshot',
      description: 'Зелёный сценарий: один ThemeContext и crimson в remote consumer.',
      src: experiment1BaselinePng,
      note: baselineCapture.state?.text,
    },
    {
      kind: 'json',
      label: 'News page capture',
      description: 'News route подтверждает, что local code split наследует тему и общий store.',
      href: newsCapture.url,
      note:
        newsCapture.state?.bodyText ??
        newsCapture.bodyText ??
        'Capture подтверждает маршрут News, но без bodyText snapshot.',
    },
  ] as EvidenceAsset[],
  experiment2: [
    {
      kind: 'image',
      label: 'Broken context screenshot',
      description: 'После превращения `@demo/ui` в remote цвет падает до `#888`.',
      src: experiment2UiRemotePng,
      note: uiRemoteCapture.state?.text,
    },
    {
      kind: 'image',
      label: 'Baseline restored screenshot',
      description: 'Rollback возвращает исходный зелёный baseline.',
      src: experiment2BaselineRestoredPng,
      note: restoredCapture.state?.text,
    },
  ] as EvidenceAsset[],
  experiment3: [
    {
      kind: 'image',
      label: 'No eager screenshot',
      description: 'При отсутствии eager runtime не доходит до рабочего UI.',
      src: experiment3NoEagerPng,
      note: noEagerCapture.consoleMessages.find((message) => message.type === 'error')?.text,
    },
  ] as EvidenceAsset[],
  experiment4: [
    {
      kind: 'link',
      label: 'Open Rsdoctor tile graph',
      description: 'Полный HTML отчёт со связями чанков и модулей.',
      href: rsdoctorTileGraphUrl,
      note: 'Bundled as static asset in presentation build',
    },
  ] as EvidenceAsset[],
  experiment5: [
    {
      kind: 'text',
      label: 'Manifest diff',
      description: 'Сравнение before / after / restored активных asset names в mf-manifest.json.',
      note: 'Главный источник правды для cache busting — manifest, а не список файлов в dist.',
    },
  ] as EvidenceAsset[],
  experiment6: [
    {
      kind: 'image',
      label: 'DefinePlugin screenshot',
      description: 'Временный UI probe показывает подставленный API URL.',
      src: experiment6DefinePluginPng,
      note: definePluginCapture.state?.text,
    },
    {
      kind: 'text',
      label: 'Compile-time substitution log',
      description: 'Сводка по временной проверке DefinePlugin.',
      note: experiment6DefinePluginTxt.trim(),
    },
  ] as EvidenceAsset[],
};

export const experimentMetrics = {
  experiment1: [
    { label: 'ThemeContext logs', value: String(countMessages(baselineCapture, 'ThemeContext')), note: 'baseline clean console', tone: 'success' },
    { label: 'Requests', value: String(baselineCapture.requests.length), note: 'host + common + components', tone: 'accent' },
    { label: 'Failed requests', value: String(baselineCapture.failedRequests.length), note: 'none in recorded run', tone: 'success' },
  ] satisfies MetricCard[],
  experiment2: [
    { label: 'ThemeContext logs', value: String(countMessages(uiRemoteCapture, 'ThemeContext')), note: 'duplicated as expected', tone: 'warning' },
  { label: 'Extra remote', value: '5001', note: 'standalone UI remote now enters runtime', tone: 'accent' },
    { label: 'Rollback result', value: 'green again', note: 'baseline restored screenshot recorded', tone: 'success' },
  ] satisfies MetricCard[],
  experiment3: [
    { label: 'Main outcome', value: 'loadShareSync failed', note: 'related runtime error, not old wording from README', tone: 'warning' },
    { label: 'Rendered UI', value: noEagerCapture.state?.found ? 'partial' : 'none', note: 'recorded capture sees no stable card', tone: 'accent' },
    { label: 'Async bootstrap caveat', value: 'important', note: 'current app already has import(\"./bootstrap\")', tone: 'neutral' },
  ] satisfies MetricCard[],
  experiment4: [
    { label: 'Warnings', value: String(rsdoctorSummary.warnings.length), note: 'ECMA version checks surfaced by Rsdoctor', tone: 'warning' },
    { label: 'Report files', value: String(rsdoctorSummary.files.length), note: 'artifacts listed in experiment txt', tone: 'accent' },
    { label: 'Types build', value: 'created', note: 'federated types logged as success', tone: 'success' },
  ] satisfies MetricCard[],
  experiment5: [
    { label: 'Tracked scopes', value: String(manifestDiff.rows.length), note: 'shared + exposes rows compared', tone: 'accent' },
    { label: 'Signal source', value: 'mf-manifest.json', note: 'not raw ls output', tone: 'success' },
    { label: 'Rollback status', value: 'restored', note: 'restored manifest recorded separately', tone: 'warning' },
  ] satisfies MetricCard[],
  experiment6: [
    { label: 'API URL visible', value: definePluginCapture.state?.found ? 'yes' : 'no', note: 'temporary UI probe proved substitution', tone: 'success' },
    { label: 'Compile-time nature', value: 'build-time', note: 'DefinePlugin replaces tokens during bundling', tone: 'accent' },
    { label: 'Rollback', value: 'done', note: 'probe removed after validation', tone: 'warning' },
  ] satisfies MetricCard[],
};

export const experimentWaterfalls = {
  experiment1: shortRequestList(baselineCapture, ['mf-manifest.json', 'remoteEntry.js', 'libs_ui_src_index_ts']),
  experiment2: shortRequestList(uiRemoteCapture, ['mf-manifest.json', 'remoteEntry.js', 'ui_src_index_ts']),
  experiment3: shortRequestList(noEagerCapture, ['main.js', 'remoteEntry.js', 'libs_ui_src_index_ts']),
};

export const transientRuntimeEvidence: EvidenceAsset[] = [
  {
    kind: 'image',
    label: 'Transient runtime blocker screenshot',
    description: 'Исторический capture, полученный во время churn-а временных правок/HMR.',
    src: runtimeBlockerPng,
    note:
      runtimeBlockerCapture.state?.bodyText ??
      runtimeBlockerCapture.bodyText ??
      'Transient runtime artifact without stable baseline status.',
  },
];

export const liveLinks: EvidenceAsset[] = [
  {
    kind: 'link',
    label: 'Open live demo',
    description: 'Опционально посмотреть working runtime на localhost:5000.',
    href: 'http://localhost:5000',
    note: 'Presentation does not require this server to be running.',
  },
];
