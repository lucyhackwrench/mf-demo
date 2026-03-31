import type { ReactNode } from 'react';

interface SectionPanelProps {
  id: string;
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
}

export function SectionPanel({ id, eyebrow, title, lead, children }: SectionPanelProps) {
  return (
    <section className="section-panel" data-section-id={id} id={id}>
      <header className="section-panel__header">
        <p className="section-panel__eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="section-panel__lead">{lead}</p>
      </header>
      <div className="section-panel__body">{children}</div>
    </section>
  );
}
