import type { ReactNode } from 'react';

export type SourceKind = 'repo' | 'artifact' | 'external' | 'live';
export type MetricTone = 'accent' | 'success' | 'warning' | 'neutral';
export type AssetKind = 'image' | 'json' | 'text' | 'link';

export interface SourceLink {
  label: string;
  href?: string;
  kind: SourceKind;
  note?: string;
}

export interface MetricCard {
  label: string;
  value: string;
  note?: string;
  tone?: MetricTone;
}

export interface CodeExcerpt {
  label: string;
  filePath: string;
  language: 'ts' | 'tsx' | 'mjs' | 'json' | 'bash' | 'txt';
  excerpt: string;
  highlights?: string[];
}

export interface EvidenceAsset {
  kind: AssetKind;
  label: string;
  description: string;
  src?: string;
  href?: string;
  note?: string;
}

export interface WaterfallRequest {
  resourceType: string;
  url: string;
  method: string;
}

export interface WaterfallDataset {
  title: string;
  requests: WaterfallRequest[];
  highlight?: string[];
}

export interface ManifestDiffRow {
  scope: string;
  before: string;
  after: string;
  restored?: string;
}

export interface ManifestDiffDataset {
  title: string;
  note: string;
  rows: ManifestDiffRow[];
}

export interface RspackSummary {
  reportUrl: string;
  manifestPath: string;
  files: string[];
  warnings: string[];
  notes: string[];
}

export interface ExperimentResult {
  hypothesis: string;
  temporaryChanges: string[];
  touchedAreas: string[];
  expectation: string[];
  observed: string[];
  restoration: string[];
  artifacts: EvidenceAsset[];
  metrics?: MetricCard[];
  codeExcerpts?: CodeExcerpt[];
  waterfall?: WaterfallDataset;
  manifestDiff?: ManifestDiffDataset;
}

export interface PresentationSection {
  id: string;
  navLabel: string;
  eyebrow: string;
  title: string;
  lead: string;
  paragraphs: string[];
  bullets?: string[];
  metrics?: MetricCard[];
  sources?: SourceLink[];
  codeExcerpts?: CodeExcerpt[];
  visual?: ReactNode;
  experiment?: ExperimentResult;
}
