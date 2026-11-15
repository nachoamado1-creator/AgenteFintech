/** Marca de Finn: la F con el punto bicolor, sobre un cuadrado azul noche con borde violeta. */
export default function Logo({ tam = 28 }: { tam?: number }) {
  return (
    <svg className="logo" width={tam} height={tam} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="logo-f" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ECEAFE" />
          <stop offset="1" stopColor="#D6D1FB" />
        </linearGradient>
        <clipPath id="logo-punto">
          <rect x="37.6" y="42.1" width="11.4" height="9.5" rx="4" />
        </clipPath>
      </defs>
      <rect x="1.5" y="1.5" width="61" height="61" rx="15" fill="#120E33" stroke="#7768F6" strokeWidth="1.6" />
      <path
        d="M15.5 15.9a1.2 1.2 0 0 1 1.2-1.2h29.2a1.2 1.2 0 0 1 1.2 1.2v6.4a1.2 1.2 0 0 1-1.2 1.2H25.9v5.8h11.1a1.2 1.2 0 0 1 1.2 1.2v5.9a1.2 1.2 0 0 1-1.2 1.2H25.9v13.8a1.2 1.2 0 0 1-1.2 1.2h-8a1.2 1.2 0 0 1-1.2-1.2Z"
        fill="url(#logo-f)"
      />
      <g clipPath="url(#logo-punto)">
        <rect x="37.6" y="42.1" width="11.4" height="9.5" fill="#7766F8" />
        <rect x="45.7" y="42.1" width="3.3" height="9.5" fill="#D2CCFB" />
      </g>
    </svg>
  );
}

/** La F con su punto dibujada solo en trazo, para encabezar cada capítulo. */
export function MarcaTrazo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="14 13 37 40" aria-hidden="true">
      <path d="M15.5 15.9a1.2 1.2 0 0 1 1.2-1.2h29.2a1.2 1.2 0 0 1 1.2 1.2v6.4a1.2 1.2 0 0 1-1.2 1.2H25.9v5.8h11.1a1.2 1.2 0 0 1 1.2 1.2v5.9a1.2 1.2 0 0 1-1.2 1.2H25.9v13.8a1.2 1.2 0 0 1-1.2 1.2h-8a1.2 1.2 0 0 1-1.2-1.2Z" />
      <rect x="37.6" y="42.1" width="11.4" height="9.5" rx="4" />
    </svg>
  );
}
