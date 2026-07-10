export interface Episode {
  episodio: number;
  titulo: string;
  url: string; // URL de Bunny.net
}

export interface Series {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  playlist: Episode[];
}
