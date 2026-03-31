import { useEffect } from 'react';

interface LightboxProps {
  alt: string;
  src: string;
  onClose: () => void;
}

export function Lightbox({ alt, src, onClose }: LightboxProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" onClick={onClose}>
      <button className="lightbox__close" type="button" onClick={onClose}>
        Закрыть
      </button>
      <img
        alt={alt}
        className="lightbox__image"
        src={src}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}
