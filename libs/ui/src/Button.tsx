import React from 'react';
import { useTheme } from './ThemeContext';

interface Props {
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button = ({ onClick, children }: Props) => {
  const { color } = useTheme();
  return (
    <button
      onClick={onClick}
      style={{
        background: color,
        color: '#fff',
        padding: '6px 16px',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 'bold',
      }}
    >
      {children}
    </button>
  );
};
