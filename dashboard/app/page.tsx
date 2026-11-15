import Tablero from '@/components/Tablero';
import { obtenerEdiciones } from '@/lib/datos';
import { obtenerPortadas } from '@/lib/portadas';

export default async function Inicio() {
  const { ediciones, origen } = await obtenerEdiciones();
  const portadas = await obtenerPortadas(ediciones);
  return <Tablero ediciones={ediciones} origen={origen} portadas={portadas} />;
}
