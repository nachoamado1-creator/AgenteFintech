'use client';

import { puntoArco } from '@/lib/vista';

type Nivel = 0 | 1 | 2 | 3 | null;

const CX = 160;
const CY = 172;
const R = 128;

/** Grados para girar un elemento dibujado "hacia arriba" hasta el nivel indicado. */
const giro = (n: number) => -90 + (n / 3) * 180;

function Marca({ nivel, radio, clase }: { nivel: Nivel; radio: number; clase: string }) {
  return (
    <g
      className={`medidor__marca ${clase}`}
      data-visible={nivel !== null}
      style={{ transform: `rotate(${giro(nivel ?? 0)}deg)`, transformOrigin: `${CX}px ${CY}px` }}
    >
      <circle cx={CX} cy={CY - radio} r={6} />
    </g>
  );
}

/**
 * Medidor semicircular de 0 a 3. Argentina es la aguja y el arco lleno;
 * Brasil/México va por fuera del arco y EE.UU./UE por dentro.
 */
export default function Medidor({ ar, latam, global }: { ar: Nivel; latam: Nivel; global: Nivel }) {
  const ini = puntoArco(0, R, CX, CY);
  const fin = puntoArco(3, R, CX, CY);
  const arco = `M ${ini.x} ${ini.y} A ${R} ${R} 0 0 1 ${fin.x} ${fin.y}`;

  return (
    <svg className="medidor" viewBox="0 0 320 196" role="img" aria-label={`Argentina en nivel ${ar ?? 'sin datos'} de 3`}>
      <defs>
        <linearGradient id="medidor-degradado" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      <path d={arco} className="medidor__pista" pathLength={1} />
      <path d={arco} className="medidor__lleno" pathLength={1} style={{ strokeDashoffset: 1 - (ar ?? 0) / 3 }} />

      {[0, 1, 2, 3].map((n) => {
        const a = puntoArco(n, R - 16, CX, CY);
        const b = puntoArco(n, R - 24, CX, CY);
        const t = puntoArco(n, R - 36, CX, CY);
        return (
          <g key={n} className="medidor__escala">
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
            <text x={t.x} y={t.y + 4} textAnchor={n === 0 ? 'start' : n === 3 ? 'end' : 'middle'}>{n}</text>
          </g>
        );
      })}

      <Marca nivel={latam} radio={R + 16} clase="medidor__marca--latam" />
      <Marca nivel={global} radio={R - 52} clase="medidor__marca--global" />

      <g
        className="medidor__aguja"
        data-visible={ar !== null}
        style={{ transform: `rotate(${giro(ar ?? 0)}deg)`, transformOrigin: `${CX}px ${CY}px` }}
      >
        <line x1={CX} y1={CY} x2={CX} y2={CY - R + 12} />
        <circle cx={CX} cy={CY - R} r={9} className="medidor__perilla" />
      </g>
      <circle cx={CX} cy={CY} r={5} className="medidor__eje" />
    </svg>
  );
}
