import React, { lazy, Suspense, useState } from 'react';
import { ThemeProvider } from '@demo/ui';

// Lazy-импорты — загружаются как отдельные чанки при первом обращении
// @demo/components — MF Remote (отдельный сервер на порту 5003)
// ~news/NewsPage   — часть app-бандла (code splitting, НЕ Remote)
const ThemedCounter = lazy(() =>
  import('@demo/components/ThemedCounter').then((module) => ({ default: module.ThemedCounter })),
);
const NewsPage = lazy(() => import('~news/NewsPage').then((m) => ({ default: m.NewsPage })));

type Page = 'home' | 'news';

const navStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 20px',
  border: 'none',
  borderBottom: active ? '2px solid crimson' : '2px solid transparent',
  background: 'none',
  cursor: 'pointer',
  fontWeight: active ? 'bold' : 'normal',
  fontSize: 14,
});

export const App = () => {
  const [page, setPage] = useState<Page>('home');

  return (
    <ThemeProvider color="crimson">
      <div
        style={{
          maxWidth: 700,
          margin: '0 auto',
          padding: '0 24px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <h1 style={{ marginBottom: 4 }}>MF Demo</h1>
        <p style={{ color: '#666', marginBottom: 16, fontSize: 13 }}>
          ThemeProvider установил <code>color="crimson"</code>. Зелёный фон = Context работает.
        </p>

        <nav style={{ borderBottom: '1px solid #eee', marginBottom: 24 }}>
          <button style={navStyle(page === 'home')} onClick={() => setPage('home')}>
            Home (MF Remote)
          </button>
          <button style={navStyle(page === 'news')} onClick={() => setPage('news')}>
            News (code split, не Remote)
          </button>
        </nav>

        <Suspense fallback={<div style={{ padding: 24, background: '#f5f5f5', borderRadius: 8 }}>Загрузка...</div>}>
          {page === 'home' && <ThemedCounter />}
          {page === 'news' && <NewsPage />}
        </Suspense>
      </div>
    </ThemeProvider>
  );
};
