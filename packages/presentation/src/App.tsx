import { useEffect, useMemo, useState } from 'react';
import { sections } from './content';
import {
  CodeExcerptCard,
  EvidenceGallery,
  ManifestDiffTable,
  MetricGrid,
  RequestWaterfall,
  SourceLinks,
} from './evidence';
import { Lightbox } from './shell/Lightbox';
import { SectionNav } from './shell/SectionNav';
import { SectionPanel } from './shell/SectionPanel';

const heroBullets = [
  '12 секций: topology, root cause, 6 экспериментов, pitfalls и conclusions',
  'Артефакты из JSON / PNG / TXT / Rsdoctor HTML, без зависимости от live remotes',
  'Фокус на reproducible evidence, manifest diff и shared-runtime semantics',
];

const heroMetrics = [
  { label: 'Sections', value: '12', note: 'full narrative arc', tone: 'accent' as const },
  { label: 'Experiments', value: '6', note: 'baseline + regressions + rollback', tone: 'success' as const },
  { label: 'Evidence files', value: '20+', note: 'JSON / PNG / TXT / HTML', tone: 'warning' as const },
];

export default function App() {
  const [currentId, setCurrentId] = useState(sections[0]?.id ?? 'overview');
  const [lightbox, setLightbox] = useState<{ alt: string; src: string } | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        const nextId = visible?.target.getAttribute('data-section-id');
        if (nextId) {
          setCurrentId(nextId);
        }
      },
      { rootMargin: '-24% 0px -48% 0px', threshold: [0.15, 0.45, 0.75] },
    );

    const nodes = [...document.querySelectorAll<HTMLElement>('[data-section-id]')];
    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  const navItems = useMemo(
    () => sections.map((section) => ({ id: section.id, label: section.navLabel })),
    [],
  );

  return (
    <div className="app-shell">
      <SectionNav currentId={currentId} items={navItems} />

      <main className="app-main">
        <section className="hero-card" data-testid="hero">
          <div className="hero-card__layout">
            <div>
              <span className="hero-card__eyebrow">Rspack + Module Federation Research Microsite</span>
              <h1>MF Demo: от root cause до reproducible experiments</h1>
              <p>
                Самостоятельная HTML-презентация по исследованию `mf-demo`: архитектура host/remotes,
                shared-runtime contracts, pre-runtime инфраструктурный фикс, controlled regressions,
                manifest diff, Rsdoctor и честные caveats по итоговой верификации.
              </p>
              <div className="hero-card__actions">
                <a className="button button--primary" href="#overview">
                  Открыть исследование
                </a>
                <a
                  className="button button--ghost"
                  href="http://localhost:5000"
                  rel="noreferrer"
                  target="_blank"
                >
                  Live demo
                </a>
              </div>
              <div className="hero-card__chips">
                {heroBullets.map((bullet) => (
                  <span key={bullet}>{bullet}</span>
                ))}
              </div>
            </div>

            <aside className="hero-card__rail">
              <MetricGrid cards={heroMetrics} />
            </aside>
          </div>
        </section>

        {sections.map((section) => (
          <SectionPanel
            eyebrow={section.eyebrow}
            id={section.id}
            key={section.id}
            lead={section.lead}
            title={section.title}
          >
            <div className="section-paragraphs">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {section.bullets?.length ? (
              <ul className="section-bullets">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}

            {section.metrics?.length ? <MetricGrid cards={section.metrics} /> : null}
            {section.visual}

            {section.codeExcerpts?.length ? (
              <div className="code-stack">
                {section.codeExcerpts.map((code) => (
                  <CodeExcerptCard code={code} key={`${section.id}-${code.label}`} />
                ))}
              </div>
            ) : null}

            {section.experiment && section.id.startsWith('experiment-') ? (
              <article className="experiment-card" data-experiment-card={section.id}>
                <div className="experiment-card__grid">
                  <div>
                    <h3>Гипотеза</h3>
                    <p>{section.experiment.hypothesis}</p>
                  </div>
                  <div>
                    <h3>Временные изменения</h3>
                    <ul className="section-bullets">
                      {section.experiment.temporaryChanges.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>Затронутые области</h3>
                    <ul className="section-bullets">
                      {section.experiment.touchedAreas.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>Ожидание</h3>
                    <ul className="section-bullets">
                      {section.experiment.expectation.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>Что реально наблюдалось</h3>
                    <ul className="section-bullets">
                      {section.experiment.observed.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>Как восстановили baseline</h3>
                    <ul className="section-bullets">
                      {section.experiment.restoration.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {section.experiment.metrics?.length ? (
                  <MetricGrid cards={section.experiment.metrics} />
                ) : null}

                {section.experiment.codeExcerpts?.length ? (
                  <div className="code-stack">
                    {section.experiment.codeExcerpts.map((code) => (
                      <CodeExcerptCard code={code} key={`${section.id}-${code.label}`} />
                    ))}
                  </div>
                ) : null}

                {section.experiment.waterfall ? (
                  <RequestWaterfall dataset={section.experiment.waterfall} />
                ) : null}

                {section.experiment.manifestDiff ? (
                  <ManifestDiffTable dataset={section.experiment.manifestDiff} />
                ) : null}

                <EvidenceGallery
                  assets={section.experiment.artifacts}
                  onImageClick={(src, alt) => setLightbox({ alt, src })}
                />
              </article>
            ) : null}

            {section.sources?.length ? <SourceLinks links={section.sources} /> : null}
          </SectionPanel>
        ))}

        <footer className="visual-card">
          <h3>Presentation contract</h3>
          <p>
            Этот microsite специально не зависит от живых remotes: narrative и evidence уже
            зафиксированы локально, а live demo остаётся только опциональной ссылкой.
          </p>
        </footer>
      </main>

      {lightbox ? (
        <Lightbox alt={lightbox.alt} onClose={() => setLightbox(null)} src={lightbox.src} />
      ) : null}
    </div>
  );
}
