'use client';

import { useState } from 'react';

/**
 * Imagen de portada de una nota. Si no hay o no carga, usa la imagen de respaldo del tema;
 * si tampoco hay respaldo, muestra un fondo de color.
 */
export default function Portada({ src, respaldo, clase }: { src?: string; respaldo?: string; clase: string }) {
  const [fallo, setFallo] = useState(false);
  const url = !src || fallo ? respaldo : src;
  if (!url) return <span className={`${clase} portada--vacia`} aria-hidden="true" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={url}
      className={clase}
      src={url}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      draggable={false}
      onError={() => setFallo(true)}
    />
  );
}
