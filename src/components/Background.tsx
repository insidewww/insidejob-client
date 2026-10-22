import Image from './Image';
import type { ImageRefSchema } from '../lib/content.types';

export default function Background({ media }: { media?: ImageRefSchema }) {
  return media ? <Image className="w-100 h-100 object-fit-cover" imageref={media} /> : null;
}
