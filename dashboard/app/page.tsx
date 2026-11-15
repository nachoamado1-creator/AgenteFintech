import Radar from '@/components/Radar';
import { obtenerEdiciones } from '@/lib/datos';
import { obtenerPortadas } from '@/lib/portadas';

export default async function Inicio() {
  const { ediciones, origen } = await obtenerEdiciones();
  const portadas = await obtenerPortadas(ediciones);
  return <Radar ediciones={ediciones} origen={origen} portadas={portadas} />;
}
