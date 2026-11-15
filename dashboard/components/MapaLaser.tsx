'use client';

import { useEffect, useRef } from 'react';

/** Recorte del mundo que se dibuja: longitud -170..180, latitud 80..-58. */
const LON0 = -170, LON1 = 180, LAT0 = 80, LAT1 = -58;

/** Siluetas muy simplificadas de los continentes ([longitud, latitud]); solo sirven de decorado. */
const TIERRA: [number, number][][] = [
  [[-168,66],[-162,70],[-140,70],[-125,70],[-95,72],[-82,70],[-62,60],[-55,52],[-66,45],[-76,38],[-81,31],[-80,25],[-83,29],[-90,30],[-97,27],[-97,21],[-87,21],[-83,15],[-77,8],[-80,7],[-86,12],[-92,15],[-105,20],[-110,24],[-113,31],[-117,32],[-124,40],[-124,48],[-135,58],[-150,60],[-165,60]],
  [[-55,60],[-45,60],[-20,70],[-20,82],[-60,82],[-70,76]],
  [[-77,8],[-72,12],[-62,10],[-52,5],[-50,0],[-35,-6],[-39,-14],[-41,-22],[-48,-26],[-54,-34],[-58,-38],[-65,-42],[-66,-47],[-69,-52],[-68,-55],[-73,-50],[-74,-40],[-71,-30],[-70,-18],[-76,-14],[-81,-5],[-80,0]],
  [[-10,36],[-9,43],[-2,44],[-5,48],[2,51],[8,54],[10,58],[5,62],[15,69],[28,71],[40,67],[60,69],[70,73],[100,77],[140,72],[170,70],[180,66],[160,60],[155,50],[140,45],[128,36],[122,30],[121,22],[108,20],[106,10],[100,13],[100,5],[98,16],[92,22],[88,22],[80,15],[77,8],[72,20],[67,25],[57,25],[56,27],[48,30],[50,26],[56,24],[59,22],[52,16],[43,13],[39,21],[35,28],[34,31],[36,36],[27,37],[26,40],[22,37],[19,41],[12,44],[16,38],[8,44],[3,43],[-2,37]],
  [[-17,21],[-10,30],[-5,36],[10,37],[11,33],[20,31],[32,31],[34,27],[43,12],[51,12],[40,-3],[40,-15],[35,-24],[32,-29],[20,-35],[17,-30],[12,-17],[13,-6],[9,4],[-8,4],[-17,14]],
  [[114,-22],[122,-18],[130,-12],[137,-12],[142,-11],[146,-19],[153,-26],[150,-37],[140,-38],[131,-31],[115,-34]],
  [[-5,50],[2,51],[-3,56],[-5,58],[-6,54]],
  [[130,32],[135,34],[140,36],[142,40],[140,42],[135,36]],
  [[44,-25],[50,-15],[49,-12],[44,-17]],
];

/** Puntos de llegada de los arcos; el origen siempre es Argentina. */
const DESTINO: Record<string, [number, number]> = {
  BR: [-47, -15], MX: [-99, 19], US: [-98, 39], EU: [10, 50],
};
const ARGENTINA: [number, number] = [-64, -34];

const adentro = (lon: number, lat: number, poligono: [number, number][]) => {
  let dentro = false;
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const [xi, yi] = poligono[i], [xj, yj] = poligono[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
};

/**
 * Decorado de fondo: el mundo en puntos y arcos láser que salen de Argentina hacia las regiones
 * con las que la corrida la compara. No lleva textos ni se puede tocar.
 */
export default function MapaLaser({ regiones }: { regiones: string[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const clave = regiones.join('|');

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const destinos = clave.split('|').filter((r) => DESTINO[r]);
    let ancho = 0, alto = 0, raf = 0, visible = false;
    const tierra = document.createElement('canvas');

    const proyectar = ([lon, lat]: [number, number]) => ({
      x: ((lon - LON0) / (LON1 - LON0)) * ancho,
      y: ((LAT0 - lat) / (LAT0 - LAT1)) * alto,
    });

    const medir = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ancho = canvas.clientWidth; alto = canvas.clientHeight;
      canvas.width = ancho * dpr; canvas.height = alto * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Capa fija con el mundo en puntos: se dibuja una sola vez por tamaño.
      tierra.width = ancho * dpr; tierra.height = alto * dpr;
      const t = tierra.getContext('2d')!;
      t.setTransform(dpr, 0, 0, dpr, 0, 0);
      const paso = Math.max(6, ancho / 150);
      t.fillStyle = 'rgba(124, 140, 255, 0.55)';
      for (let y = paso / 2; y < alto; y += paso) {
        for (let x = paso / 2; x < ancho; x += paso) {
          const lon = LON0 + (x / ancho) * (LON1 - LON0);
          const lat = LAT0 - (y / alto) * (LAT0 - LAT1);
          if (TIERRA.some((p) => adentro(lon, lat, p))) t.fillRect(x - 0.9, y - 0.9, 1.8, 1.8);
        }
      }
    };

    /** Punto de la curva que une Argentina con un destino (arco que sube hacia el norte). */
    const curva = (a: { x: number; y: number }, b: { x: number; y: number }) => {
      const cx = (a.x + b.x) / 2, cy = Math.min(a.y, b.y) - Math.hypot(b.x - a.x, b.y - a.y) * 0.32;
      return (u: number) => ({
        x: (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * cx + u * u * b.x,
        y: (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * cy + u * u * b.y,
      });
    };

    const dibujar = (ahora: number) => {
      ctx.clearRect(0, 0, ancho, alto);
      ctx.drawImage(tierra, 0, 0, ancho, alto);
      const o = proyectar(ARGENTINA);
      destinos.forEach((r, n) => {
        const d = proyectar(DESTINO[r]);
        const en = curva(o, d);
        // Arco base, tenue.
        ctx.strokeStyle = 'rgba(163, 114, 255, 0.28)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= 40; i++) { const p = en(i / 40); if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }
        ctx.stroke();
        // Destello que viaja de Argentina al destino y se apaga.
        const ciclo = 4200, fase = reducir ? 1 : ((ahora + n * 900) % ciclo) / ciclo;
        const cabeza = reducir ? 1 : Math.min(1, fase / 0.7);
        const cola = Math.max(0, cabeza - 0.3);
        const brillo = reducir ? 0.55 : fase < 0.7 ? 1 : 1 - (fase - 0.7) / 0.3;
        ctx.strokeStyle = `rgba(150, 165, 255, ${0.95 * brillo})`;
        ctx.shadowColor = 'rgba(124, 140, 255, 0.95)'; ctx.shadowBlur = 10; ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let i = 0; i <= 20; i++) { const p = en(cola + ((cabeza - cola) * i) / 20); if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Punto de llegada.
        ctx.fillStyle = 'rgba(190, 200, 255, 0.85)';
        ctx.beginPath(); ctx.arc(d.x, d.y, 2.4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `rgba(124, 140, 255, ${reducir ? 0.4 : 0.55 * (1 - fase)})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(d.x, d.y, 3 + (reducir ? 3 : fase * 9), 0, Math.PI * 2); ctx.stroke();
      });
      // Argentina: el origen de todo, con un pulso.
      const pulso = reducir ? 0.5 : (ahora % 2400) / 2400;
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(163, 114, 255, 1)'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(o.x, o.y, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(163, 114, 255, ${0.7 * (1 - pulso)})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(o.x, o.y, 4 + pulso * 16, 0, Math.PI * 2); ctx.stroke();
    };

    const cuadro = (ahora: number) => {
      dibujar(ahora);
      if (!reducir && visible) raf = requestAnimationFrame(cuadro);
    };

    const obs = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(cuadro);
    });
    medir();
    dibujar(0);
    obs.observe(canvas);
    const alCambiar = () => { medir(); dibujar(performance.now()); };
    window.addEventListener('resize', alCambiar);
    return () => { cancelAnimationFrame(raf); obs.disconnect(); window.removeEventListener('resize', alCambiar); };
  }, [clave]);

  return <canvas ref={ref} className="fondo-mapa" aria-hidden="true" />;
}
