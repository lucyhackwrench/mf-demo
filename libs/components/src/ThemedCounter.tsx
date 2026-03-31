import React from 'react';
import { useUnit } from 'effector-react';
import { $counter, increment, decrement, reset } from '@demo/common';
import { Button, useTheme } from '@demo/ui';

export const ThemedCounter = () => {
  const count = useUnit($counter);
  const { color } = useTheme();

  // Если Context сломан — color будет '#888' (дефолт из ThemeContext.tsx)
  // Если Context работает — color будет 'crimson' (из ThemeProvider в App.tsx)
  const isContextBroken = color === '#888';

  return (
    <div
      style={{
        padding: 24,
        border: `3px solid ${color}`,
        borderRadius: 8,
        background: isContextBroken ? '#ffe5e5' : '#e5ffe5',
        transition: 'all 0.3s',
      }}
    >
      <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: 16 }}>
        {isContextBroken
          ? '❌ Context сломан — @demo/ui загружен дважды'
          : `✅ Context работает — color: ${color}`}
      </p>
      <p style={{ margin: '0 0 16px', color: '#666', fontSize: 13 }}>
        Текущий цвет темы: <code>{color}</code>
      </p>
      <p style={{ margin: '0 0 16px', fontSize: 40, fontWeight: 'bold' }}>{count}</p>
      <Button onClick={increment}>+</Button>
      {' '}
      <Button onClick={decrement}>−</Button>
      {' '}
      <Button onClick={reset}>reset</Button>
    </div>
  );
};
