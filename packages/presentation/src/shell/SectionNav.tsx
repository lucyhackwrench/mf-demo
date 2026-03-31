interface SectionNavProps {
  items: Array<{ id: string; label: string }>;
  currentId: string;
}

export function SectionNav({ items, currentId }: SectionNavProps) {
  return (
    <aside className="section-nav" data-testid="section-nav">
      <div className="section-nav__eyebrow">Research navigation</div>
      <h2 className="section-nav__title">MF Demo Presentation</h2>
      <p className="section-nav__summary">
        Детальный техразбор Module Federation sandbox без зависимости от живого runtime.
      </p>
      <nav aria-label="Sections" className="section-nav__links">
        {items.map((item, index) => (
          <a
            className={`section-nav__link${item.id === currentId ? ' is-active' : ''}`}
            href={`#${item.id}`}
            key={item.id}
          >
            <span className="section-nav__index">{String(index + 1).padStart(2, '0')}</span>
            <span>
              <strong>{item.label}</strong>
              <small>{item.id}</small>
            </span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
