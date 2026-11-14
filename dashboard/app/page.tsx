import Radar from '@/components/Radar';
import { obtenerEdiciones } from '@/lib/datos';

export default async function Inicio() {
  const { ediciones, origen } = await obtenerEdiciones();
  return <Radar ediciones={ediciones} origen={origen} />;
}
