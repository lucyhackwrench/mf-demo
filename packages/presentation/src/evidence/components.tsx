import type { CodeExcerpt, EvidenceAsset, ManifestDiffDataset, MetricCard, RspackSummary, SourceLink, WaterfallDataset } from '../types';

interface MetricGridProps {
  cards: MetricCard[];
}

export function MetricGrid({ cards }: MetricGridProps) {
  return (
    <div className="metric-grid">
      {cards.map((card) => (
        <article className={`metric-card tone-${card.tone ?? 'neutral'}`} key={`${card.label}-${card.value}`}>
          <p className="metric-card__label">{card.label}</p>
          <p className="metric-card__value">{card.value}</p>
          {card.note ? <p className="metric-card__detail">{card.note}</p> : null}
        </article>
      ))}
    </div>
  );
}

interface SourceLinksProps {
  links: SourceLink[];
}

export function SourceLinks({ links }: SourceLinksProps) {
  return (
    <div className="source-list">
      {links.map((link) =>
        link.href && (link.kind === 'external' || link.kind === 'live') ? (
          <a
            className="source-pill"
            href={link.href}
            key={`${link.kind}-${link.label}-${link.href}`}
            rel="noreferrer"
            target="_blank"
          >
            <span>{link.label}</span>
            {link.note ? <small>{link.note}</small> : null}
          </a>
        ) : (
          <span className="source-pill source-pill--local" key={`${link.kind}-${link.label}-${link.href ?? 'inline'}`}>
            <strong>{link.label}</strong>
            {link.href ? <code>{link.href}</code> : null}
            {link.note ? <small>{link.note}</small> : null}
          </span>
        ),
      )}
    </div>
  );
}

interface CodeExcerptCardProps {
  code: CodeExcerpt;
}

export function CodeExcerptCard({ code }: CodeExcerptCardProps) {
  return (
    <article className="code-callout">
      <div className="code-callout__meta">
        <div>
          <span className="code-callout__title">{code.label}</span>
          <code className="code-callout__path">{code.filePath}</code>
        </div>
        <span className="code-callout__language">{code.language}</span>
      </div>
      <pre className="code-callout__code">
        <code>{code.excerpt}</code>
      </pre>
      {code.highlights?.length ? (
        <ul className="section-bullets">
          {code.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

interface EvidenceGalleryProps {
  assets: EvidenceAsset[];
  onImageClick: (src: string, alt: string) => void;
}

export function EvidenceGallery({ assets, onImageClick }: EvidenceGalleryProps) {
  return (
    <div className="section-paragraphs">
      <h3>Artifacts</h3>
      <div className="visual-grid">
        {assets.map((asset) => (
          <article key={`${asset.label}-${asset.kind}`}>
            {asset.kind === 'image' && asset.src ? (
              <div className="artifact-frame">
                <img
                  alt={asset.label}
                  className="artifact-frame__image"
                  loading="lazy"
                  onClick={() => onImageClick(asset.src!, asset.label)}
                  src={asset.src}
                />
                <div className="artifact-frame__caption">
                  <strong>{asset.label}</strong>
                  <div>{asset.description}</div>
                  {asset.note ? <div>{asset.note}</div> : null}
                </div>
              </div>
            ) : (
              <div className="visual-card">
                <h3>{asset.label}</h3>
                <p>{asset.description}</p>
                {asset.href ? (
                  <a className="button button--ghost" href={asset.href} rel="noreferrer" target="_blank">
                    Open artifact
                  </a>
                ) : null}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

interface RequestWaterfallProps {
  dataset: WaterfallDataset;
}

const emphasize = (value: string, highlights: string[]) => {
  if (!highlights.length) {
    return value;
  }

  let output = value;

  for (const token of highlights) {
    output = output.replaceAll(token, `@@${token}@@`);
  }

  return output.split('@@').map((chunk, index) =>
    highlights.includes(chunk) ? <mark key={`${chunk}-${index}`}>{chunk}</mark> : chunk,
  );
};

export function RequestWaterfall({ dataset }: RequestWaterfallProps) {
  return (
    <article className="visual-card">
      <h3>{dataset.title}</h3>
      <div className="waterfall">
        {dataset.requests.map((request) => (
          <div className="waterfall__row" key={`${request.method}-${request.url}`}>
            <span className="waterfall__host">{request.resourceType}</span>
            <div className="waterfall__bar">
              <span />
            </div>
            <span className="waterfall__url">
              <strong>{request.method}</strong> {emphasize(request.url, dataset.highlight ?? [])}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

interface ManifestDiffTableProps {
  dataset: ManifestDiffDataset;
}

export function ManifestDiffTable({ dataset }: ManifestDiffTableProps) {
  return (
    <article className="visual-card">
      <h3>{dataset.title}</h3>
      <p>{dataset.note}</p>
      <table className="manifest-table">
        <thead>
          <tr>
            <th>Scope</th>
            <th>Before</th>
            <th>After</th>
            <th>Restored</th>
          </tr>
        </thead>
        <tbody>
          {dataset.rows.map((row) => (
            <tr key={row.scope}>
              <td>{row.scope}</td>
              <td><code>{row.before}</code></td>
              <td><code>{row.after}</code></td>
              <td><code>{row.restored ?? '—'}</code></td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}

interface RspackSummaryCardProps {
  summary: RspackSummary;
}

export function RspackSummaryCard({ summary }: RspackSummaryCardProps) {
  return (
    <article className="visual-card">
      <h3>Rsdoctor / Rspack evidence</h3>
      <MetricGrid
        cards={[
          {
            label: 'Report URL',
            value: 'HTML',
            note: summary.reportUrl,
            tone: 'accent',
          },
          {
            label: 'Warnings',
            value: String(summary.warnings.length),
            note: 'ECMA version checks surfaced by Rsdoctor build',
            tone: 'warning',
          },
          {
            label: 'Manifest path',
            value: 'mf-manifest.json',
            note: summary.manifestPath,
            tone: 'success',
          },
        ]}
      />
      <ul className="bullet-list">
        {summary.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
      <h3>Warnings</h3>
      <ul className="bullet-list">
        {summary.warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
      <h3>Generated report files</h3>
      <ul className="bullet-list">
        {summary.files.map((file) => (
          <li key={file}><code>{file}</code></li>
        ))}
      </ul>
      <a className="button button--ghost" href={summary.reportUrl} rel="noreferrer" target="_blank">
        Open tile graph
      </a>
    </article>
  );
}
