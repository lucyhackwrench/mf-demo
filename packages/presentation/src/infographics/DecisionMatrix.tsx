export type DecisionMatrixTone = 'accent' | 'success' | 'warning' | 'danger' | 'neutral';

export interface DecisionMatrixBadge {
  label: string;
  tone?: DecisionMatrixTone;
  detail?: string;
}

export interface DecisionMatrixRow {
  combination: string;
  benefits: string[];
  negatives: string[];
  evidence?: DecisionMatrixBadge;
  status?: DecisionMatrixBadge;
  recommendation: string;
  verdict?: string;
  verdictTone?: DecisionMatrixTone;
  note?: string;
}

export interface DecisionMatrixProps {
  title: string;
  intro: string;
  rows: DecisionMatrixRow[];
  caption?: string;
  note?: string;
  emptyState?: string;
}

const cellLabels = {
  combination: 'Combination',
  benefits: 'Benefits',
  negatives: 'Negatives',
  evidence: 'Evidence / Status',
  verdict: 'Recommendation / Verdict',
} as const;

function renderList(items: string[]) {
  if (!items.length) {
    return <p className="decision-matrix__empty-copy">No items recorded.</p>;
  }

  return (
    <ul className="decision-matrix__list">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

function Badge({ badge, className }: { badge: DecisionMatrixBadge; className?: string }) {
  return (
    <span className={`decision-matrix__badge tone-${badge.tone ?? 'neutral'} ${className ?? ''}`.trim()}>
      <strong>{badge.label}</strong>
      {badge.detail ? <small>{badge.detail}</small> : null}
    </span>
  );
}

export function DecisionMatrix({
  title,
  intro,
  rows,
  caption,
  note,
  emptyState = 'No comparison rows were provided for this matrix.',
}: DecisionMatrixProps) {
  const aside = caption ?? note;

  return (
    <article className="visual-card decision-matrix">
      <div className="decision-matrix__header">
        <div>
          <h3>{title}</h3>
          <p>{intro}</p>
        </div>
        {aside ? <p className="decision-matrix__caption">{aside}</p> : null}
      </div>

      {rows.length ? (
        <div aria-label={title} className="decision-matrix__table" role="table">
          <div className="decision-matrix__legend" role="row">
            <span role="columnheader">{cellLabels.combination}</span>
            <span role="columnheader">{cellLabels.benefits}</span>
            <span role="columnheader">{cellLabels.negatives}</span>
            <span role="columnheader">{cellLabels.evidence}</span>
            <span role="columnheader">{cellLabels.verdict}</span>
          </div>

          {rows.map((row, index) => (
            <article className="decision-matrix__row" key={`${row.combination}-${index}`} role="row">
              <section className="decision-matrix__cell decision-matrix__cell--label" role="cell">
                <span className="decision-matrix__eyebrow">{cellLabels.combination}</span>
                <strong className="decision-matrix__label">{row.combination}</strong>
                {row.note ? <p className="decision-matrix__note">{row.note}</p> : null}
              </section>

              <section className="decision-matrix__cell decision-matrix__cell--benefits" role="cell">
                <span className="decision-matrix__eyebrow">{cellLabels.benefits}</span>
                {renderList(row.benefits)}
              </section>

              <section className="decision-matrix__cell decision-matrix__cell--negatives" role="cell">
                <span className="decision-matrix__eyebrow">{cellLabels.negatives}</span>
                {renderList(row.negatives)}
              </section>

              <section className="decision-matrix__cell decision-matrix__cell--evidence" role="cell">
                <span className="decision-matrix__eyebrow">{cellLabels.evidence}</span>
                <div className="decision-matrix__badge-stack">
                  {row.evidence ? <Badge badge={row.evidence} className="decision-matrix__badge--wide" /> : null}
                  {row.status ? <Badge badge={row.status} /> : null}
                </div>
                {!row.evidence && !row.status ? (
                  <p className="decision-matrix__empty-copy">No evidence badge attached.</p>
                ) : null}
              </section>

              <section className="decision-matrix__cell decision-matrix__cell--verdict" role="cell">
                <span className="decision-matrix__eyebrow">{cellLabels.verdict}</span>
                {row.verdict ? (
                  <p className={`decision-matrix__verdict tone-${row.verdictTone ?? 'neutral'}`}>
                    {row.verdict}
                  </p>
                ) : null}
                <p className="decision-matrix__recommendation">{row.recommendation}</p>
              </section>
            </article>
          ))}
        </div>
      ) : (
        <p className="decision-matrix__empty-copy">{emptyState}</p>
      )}
    </article>
  );
}
