import { Series } from './types';
import { bettyPlaylist } from './bettyPlaylist';

export const seriesData: Series[] = [
  {
    id: 'betty',
    title: 'Yo soy Betty, la fea (1999)',
    description: 'La historia de Beatriz Pinzón Solano, una mujer poco atractiva pero extremadamente inteligente que trabaja para Ecomoda.',
    thumbnail: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=600&h=337&auto=format&fit=crop',
    category: 'Comedia',
    playlist: bettyPlaylist
  },
  {
    id: 's1',
    title: 'Documentales de Naturaleza',
    description: 'Explora la belleza del mundo natural y la asombrosa vida silvestre en alta definición.',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600&h=337&auto=format&fit=crop',
    category: 'Documental',
    playlist: [
      { episodio: 1, titulo: 'Episodio 1: Bosques Profundos', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
      { episodio: 2, titulo: 'Episodio 2: Secretos de la Naturaleza', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
      { episodio: 3, titulo: 'Episodio 3: Ríos y Cascadas', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }
    ]
  },
  {
    id: 's2',
    title: 'Tecnología Futurista',
    description: 'Un vistazo interactivo y revelador a lo que nos depara el futuro de la ciencia y la IA.',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&h=337&auto=format&fit=crop',
    category: 'Tecnología',
    playlist: [
      { episodio: 1, titulo: 'Episodio 1: La Era de la IA', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
      { episodio: 2, titulo: 'Episodio 2: Robótica y Autómatas', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
      { episodio: 3, titulo: 'Episodio 3: Realidades Virtuales', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' }
    ]
  }
];
