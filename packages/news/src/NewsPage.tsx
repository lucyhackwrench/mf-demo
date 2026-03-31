import React from 'react';
import { useUnit } from 'effector-react';
import { $counter } from '@demo/common';
import { Button, useTheme } from '@demo/ui';

/**
 * Страница News — часть основного бандла packages/app.
 * НЕ является MF Remote. Загружается как отдельный чанк через React.lazy().
 *
 * Использует те же @demo/ui и @demo/common что и остальное приложение.
 * Благодаря этому ThemeContext одинаковый — Context НЕ ломается.
 * Это работает потому что libs/ui загружается один раз как shared-библиотека в app,
 * а все части app-бандла (включая news) используют один shared экземпляр.
 */
export const NewsPage = () => {
  const count = useUnit($counter);
  const { color } = useTheme();

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color }}>Страница новостей</h2>
      <p>
        Этот компонент — часть app-бандла (code splitting), а не MF Remote.
        <br />
        Context работает так же как в остальном приложении.
      </p>
      <p>Счётчик из @demo/common: <strong>{count}</strong></p>
      <p>Цвет темы: <code style={{ color }}>{color}</code></p>
      <Button>Кнопка из @demo/ui</Button>
    </div>
  );
};
