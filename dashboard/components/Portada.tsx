'use client';

import { useState } from 'react';

/** Imagen de portada de una nota. Si no carga (o no hay), muestra un fondo de color en su lugar. */
export default function Portada({ src, clase }: { src?: string; clase: string }) {
  const [fallo, setFallo] = useState(false);
  if (!src || fallo) return <span className={`${clase} portada--vacia`} aria-hidden="true" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={clase}
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      draggable={false}
      onError={() => setFallo(true)}
    />
  );
}
