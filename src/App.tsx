/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  Bell, 
  Play, 
  Info, 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Tv, 
  Filter, 
  ChevronRight, 
  Clock, 
  Flame, 
  Grid, 
  ListOrdered,
  X,
  FastForward,
  Rewind,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { seriesData } from './data';
import { Series, Episode } from './types';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<number>(0);
  const [theaterMode, setTheaterMode] = useState<boolean>(false);
  const [autoplayNext, setAutoplayNext] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Episode chunking for large playlists (e.g. Betty has 335 episodes)
  const EPISODES_PER_PAGE = 50;
  const [activeEpisodePage, setActiveEpisodePage] = useState<number>(0);

  const categories = ['Todos', ...Array.from(new Set(seriesData.map(s => s.category)))];

  const filteredSeries = selectedCategory === 'Todos' 
    ? seriesData 
    : seriesData.filter(s => s.category === selectedCategory);

  // References
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);

  // Filter and pagination logic for selected series episodes
  const seriesEpisodes = useMemo(() => {
    if (!selectedSeries) return [];
    return selectedSeries.playlist;
  }, [selectedSeries]);

  const filteredEpisodes = useMemo(() => {
    if (!searchQuery.trim()) return seriesEpisodes;
    const query = searchQuery.toLowerCase();
    return seriesEpisodes.filter(
      ep => ep.titulo.toLowerCase().includes(query) || ep.episodio.toString().includes(query)
    );
  }, [seriesEpisodes, searchQuery]);

  // Adjust active page if search is performed
  useEffect(() => {
    if (searchQuery.trim()) {
      setActiveEpisodePage(0);
    }
  }, [searchQuery]);

  // Total pages based on filtered list
  const totalPages = Math.ceil(filteredEpisodes.length / EPISODES_PER_PAGE);

  const paginatedEpisodes = useMemo(() => {
    const startIdx = activeEpisodePage * EPISODES_PER_PAGE;
    return filteredEpisodes.slice(startIdx, startIdx + EPISODES_PER_PAGE);
  }, [filteredEpisodes, activeEpisodePage]);

  const handlePlayNext = () => {
    if (selectedSeries && currentEpisodeIndex < selectedSeries.playlist.length - 1) {
      setCurrentEpisodeIndex(prev => prev + 1);
    } else {
      // End of playlist
      setTheaterMode(false);
    }
  };

  const handlePlayPrev = () => {
    if (selectedSeries && currentEpisodeIndex > 0) {
      setCurrentEpisodeIndex(prev => prev - 1);
    }
  };

  const handleRestartEpisode = () => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = 0;
      videoPlayerRef.current.play().catch(() => {});
    }
  };

  // Open a series details modal
  const handleSelectSeriesForDetails = (series: Series) => {
    setSelectedSeries(series);
    setCurrentEpisodeIndex(0);
    setSearchQuery('');
    setActiveEpisodePage(0);
    setDetailModalOpen(true);
    setTheaterMode(false);
  };

  const currentEpisode = selectedSeries?.playlist[currentEpisodeIndex] || null;

  // TV / Low-power optimization: If theater mode is active, early-return the player view directly.
  // This guarantees that only one <video> tag is present in the DOM, avoiding overlay, audio conflicts, or TV crashes.
  if (theaterMode && selectedSeries && currentEpisode) {
    return (
      <div className="fixed inset-0 z-50 bg-[#030303] text-white flex flex-col md:flex-row h-screen w-screen overflow-hidden">
        
        {/* Left/Main Container: Widescreen Theater Video Player */}
        <div className="flex-1 flex flex-col justify-between relative bg-black h-[60%] md:h-full">
          
          {/* Top controls HUD (visible on overlay) with pointer-events-none to prevent interception */}
          <div className="absolute top-0 inset-x-0 p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent z-30 flex items-center justify-between pointer-events-none">
            <button 
              onClick={() => {
                setTheaterMode(false);
                setDetailModalOpen(true);
              }}
              className="flex items-center space-x-2 text-sm font-semibold text-neutral-300 hover:text-white bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-neutral-800 transition pointer-events-auto cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Salir del Reproductor</span>
            </button>

            <div className="text-center pointer-events-auto">
              <p className="text-[10px] uppercase font-bold tracking-widest text-red-500">{selectedSeries.title}</p>
              <p className="text-sm font-bold text-white line-clamp-1">{currentEpisode.titulo}</p>
            </div>

            <div className="flex items-center space-x-3 pointer-events-auto">
              <div className="bg-black/60 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-300 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-mono text-[10px]">Autoplay Siguiente</span>
                <input 
                  type="checkbox" 
                  checked={autoplayNext}
                  onChange={(e) => setAutoplayNext(e.target.checked)}
                  className="accent-red-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Native Video Player - Fully unencumbered by floating elements */}
          <div className="w-full h-full flex items-center justify-center relative">
            <video 
              ref={videoPlayerRef}
              key={currentEpisodeIndex}
              src={currentEpisode.url}
              controls
              autoPlay
              onEnded={handlePlayNext}
              className="w-full h-full object-contain focus:outline-none"
            />
          </div>
        </div>

        {/* Right Side Control Center: Quick navigation Sidebar */}
        <div className="w-full md:w-[350px] bg-neutral-950 border-t md:border-t-0 md:border-l border-neutral-900 flex flex-col h-[40%] md:h-full z-10">
          <div className="p-4 border-b border-neutral-900 bg-neutral-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center space-x-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-red-500" />
                <span>Contenido de la serie</span>
              </h4>
              <span className="text-[10px] bg-red-600/20 text-red-500 font-bold px-2 py-0.5 rounded">
                Episodio {currentEpisodeIndex + 1}/{selectedSeries.playlist.length}
              </span>
            </div>

            {/* Miniature Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
              <input 
                type="text"
                placeholder="Filtrar capítulos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 text-[11px] rounded-lg pl-8 pr-4 py-1.5 w-full focus:outline-none focus:border-red-600 transition text-white"
              />
            </div>
          </div>

          {/* Mini sidebar playlist */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredEpisodes.map((ep) => {
              const playlistIndex = selectedSeries.playlist.findIndex(p => p.episodio === ep.episodio);
              const isActive = playlistIndex === currentEpisodeIndex;

              return (
                <div 
                  key={ep.episodio}
                  onClick={() => setCurrentEpisodeIndex(playlistIndex)}
                  className={`p-2.5 rounded-lg border cursor-pointer flex items-center space-x-3 transition duration-150 ${
                    isActive 
                      ? 'border-red-600 bg-red-950/20 shadow-md' 
                      : 'border-neutral-900 bg-neutral-900/50 hover:bg-neutral-900 hover:border-neutral-800'
                  }`}
                >
                  <div className={`w-8 h-8 rounded flex items-center justify-center font-mono font-bold text-[11px] shrink-0 ${
                    isActive ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {ep.episodio}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold truncate ${isActive ? 'text-red-500' : 'text-neutral-200'}`}>
                      {ep.titulo}
                    </p>
                    <p className="text-[9px] text-neutral-500">Video MP4 • 1080p</p>
                  </div>

                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Dedicated Playback Controller Panel in sidebar footer (No overlays!) */}
          <div className="p-4 border-t border-neutral-900 bg-black/60 space-y-3">
            <div className="text-xs space-y-1">
              <span className="text-neutral-500">Reproduciendo ahora:</span>
              <p className="font-bold text-white line-clamp-1">{currentEpisode.titulo}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-900/50">
              <button 
                onClick={handlePlayPrev} 
                disabled={currentEpisodeIndex === 0}
                className="flex items-center justify-center p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 disabled:opacity-20 text-neutral-300 hover:text-white transition cursor-pointer"
                title="Anterior"
              >
                <Rewind className="w-4 h-4 fill-current" />
              </button>

              <button 
                onClick={handleRestartEpisode} 
                className="flex items-center justify-center p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition cursor-pointer"
                title="Reiniciar Capítulo"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono text-neutral-400 font-semibold">Cap. {currentEpisode.episodio}</span>

              <button 
                onClick={handlePlayNext} 
                disabled={currentEpisodeIndex === selectedSeries.playlist.length - 1}
                className="flex items-center justify-center p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 disabled:opacity-20 text-neutral-300 hover:text-white transition cursor-pointer"
                title="Siguiente"
              >
                <FastForward className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f7] font-sans antialiased overflow-x-hidden selection:bg-[#E50914] selection:text-white">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent backdrop-blur-md border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-12 py-4">
          <div className="flex items-center space-x-10">
            <div 
              onClick={() => { setSelectedSeries(null); setTheaterMode(false); setDetailModalOpen(false); }} 
              className="text-[#E50914] text-3xl font-black tracking-tighter cursor-pointer hover:scale-102 transition-transform duration-200 select-none"
              id="brand-logo"
            >
              NETFLIX
            </div>
            <nav className="hidden md:flex space-x-6 text-sm font-medium text-gray-400">
              <button 
                onClick={() => { setSelectedSeries(null); setTheaterMode(false); setDetailModalOpen(false); }} 
                className="hover:text-white transition duration-200"
              >
                Inicio
              </button>
              <button 
                onClick={() => { setSelectedSeries(seriesData[0]); handleSelectSeriesForDetails(seriesData[0]); }} 
                className="hover:text-white transition duration-200"
              >
                Betty La Fea
              </button>
              <a href="#series-grid" className="hover:text-white transition duration-200">Catálogo</a>
            </nav>
          </div>
          <div className="flex items-center space-x-6 text-gray-300">
            <div className="relative hidden sm:block">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text"
                placeholder="Buscar series..."
                className="bg-neutral-900 border border-neutral-800 text-xs rounded-full pl-9 pr-4 py-1.5 w-48 focus:w-64 focus:outline-none focus:border-red-600 transition-all duration-300 text-white"
                onChange={(e) => {
                  const val = e.target.value.toLowerCase();
                  if (val.includes('betty')) {
                    handleSelectSeriesForDetails(seriesData[0]);
                  } else if (val.includes('naturaleza') || val.includes('bosque')) {
                    handleSelectSeriesForDetails(seriesData[1]);
                  } else if (val.includes('tecnologia') || val.includes('futuro')) {
                    handleSelectSeriesForDetails(seriesData[2]);
                  }
                }}
              />
            </div>
            <Bell className="w-5 h-5 cursor-pointer hover:text-white transition" />
            <div className="flex items-center space-x-2 cursor-pointer group">
              <div className="w-8 h-8 bg-gradient-to-tr from-red-600 to-rose-400 rounded-md font-bold text-white flex items-center justify-center text-xs group-hover:shadow-[0_0_12px_rgba(229,9,20,0.4)] transition">
                B
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Showcase (Interactive billboard featuring the main show) */}
      <section className="relative w-full min-h-[90vh] flex items-end pt-24 pb-16 bg-black">
        {/* Cinematic Backdrop Image & Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ 
            backgroundImage: "linear-gradient(to right, #0a0a0a 12%, rgba(10,10,10,0.85) 30%, rgba(10,10,10,0.1) 70%, #0a0a0a 100%), linear-gradient(to top, #0a0a0a 5%, rgba(10,10,10,0.4) 30%, transparent 100%), url('https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1600&auto=format&fit=crop')" 
          }}
        />

        <div className="relative max-w-7xl mx-auto w-full px-6 md:px-12 z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center space-x-3">
              <span className="bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded">
                SERIE RECOMENDADA
              </span>
              <div className="flex items-center space-x-1.5 text-xs text-neutral-400 font-medium">
                <Flame className="w-4 h-4 text-amber-500 fill-current" />
                <span>Lo más visto hoy</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white font-display">
              {seriesData[0].title}
            </h1>

            <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-2xl font-light">
              {seriesData[0].description}
            </p>

            <div className="flex flex-wrap gap-4 items-center pt-2">
              <button 
                onClick={() => {
                  setSelectedSeries(seriesData[0]);
                  setCurrentEpisodeIndex(0);
                  setTheaterMode(true);
                  setDetailModalOpen(false);
                }}
                className="flex items-center px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition duration-200 active:scale-95 shadow-lg shadow-white/10"
                id="hero-play-button"
              >
                <Play className="w-5 h-5 mr-2.5 fill-current text-black" />
                Reproducir S1:E1
              </button>

              <button 
                onClick={() => handleSelectSeriesForDetails(seriesData[0])}
                className="flex items-center px-7 py-3 bg-neutral-800/80 text-white font-semibold rounded-lg border border-neutral-700/50 backdrop-blur-md hover:bg-neutral-700 transition duration-200 active:scale-95"
                id="hero-info-button"
              >
                <Info className="w-5 h-5 mr-2.5" />
                Ver Episodios ({seriesData[0].playlist.length})
              </button>
            </div>
          </div>

          {/* Quick preview card on the right (Satisfying: con vista previa en lo posible) */}
          <div className="lg:col-span-5 hidden lg:block">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-neutral-900/60 rounded-2xl p-4 border border-neutral-800/80 backdrop-blur-lg shadow-2xl relative overflow-hidden group hover:border-red-600/30 transition-all duration-300"
            >
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black relative">
                {/* Embedded preview playing in loop & muted (only when modal is NOT open to prevent multi-video decoding conflicts) */}
                {!detailModalOpen ? (
                  <video 
                    src={seriesData[0].playlist[0].url}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted={isMuted}
                    loop
                    playsInline
                  />
                ) : (
                  <img 
                    src={seriesData[0].thumbnail}
                    className="w-full h-full object-cover opacity-80"
                    alt={seriesData[0].title}
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="absolute top-3 left-3 bg-red-600 text-white font-extrabold text-[9px] tracking-widest px-2 py-0.5 rounded-full uppercase flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>VISTA PREVIA</span>
                </div>

                {!detailModalOpen && (
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute bottom-3 right-3 p-2 bg-black/70 rounded-full text-white hover:bg-red-600 transition"
                    title={isMuted ? "Activar sonido" : "Silenciar"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-xs text-neutral-400">
                  <span className="text-[#E50914] font-bold">Yo soy Betty, la fea</span>
                  <span>Capítulo 1</span>
                </div>
                <h3 className="font-semibold text-sm line-clamp-1 text-white">Beatriz Pinzón entra a ECOMODA</h3>
                <p className="text-xs text-neutral-400 line-clamp-2">
                  Beatriz Pinzón Solano, una economista brillante pero poco atractiva físicamente, asiste a una entrevista de trabajo.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Browse Section */}
      <main id="series-grid" className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-12 relative z-20">
        
        {/* Category Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-900 pb-6">
          <div className="space-y-1.5">
            <h2 className="text-3xl font-black tracking-tight font-display text-white">Explorar Programas</h2>
            <p className="text-xs text-neutral-400">Selecciona un programa para ver sus capítulos y reproducir en orden continuo.</p>
          </div>
          
          <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs text-neutral-500 flex items-center space-x-1 shrink-0 font-medium tracking-wide">
              <Filter className="w-3.5 h-3.5 text-neutral-500" />
              <span>CATEGORÍAS:</span>
            </span>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition shrink-0 border cursor-pointer ${
                  selectedCategory === cat 
                    ? 'border-white bg-white text-black font-bold shadow-md shadow-white/5' 
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-500 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Series Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSeries.map(series => (
            <motion.div 
              key={series.id} 
              layoutId={`series-card-${series.id}`}
              onClick={() => handleSelectSeriesForDetails(series)}
              className="bg-neutral-950 rounded-2xl border border-neutral-900 overflow-hidden shadow-xl group cursor-pointer hover:border-neutral-700 hover:shadow-2xl hover:shadow-red-900/10 transition-all duration-300 flex flex-col h-full"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                <img 
                  src={series.thumbnail} 
                  alt={series.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  referrerPolicy="no-referrer"
                />
                
                {/* Dark Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />
                
                {/* Visual badges */}
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-800 text-[10px] font-bold tracking-widest text-white uppercase">
                  {series.category}
                </div>

                <div className="absolute top-4 right-4 bg-red-600/90 text-white font-extrabold text-[10px] px-2.5 py-1 rounded">
                  {series.playlist.length} Capítulos
                </div>

                {/* Centered play button on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/50 scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Play className="w-6 h-6 fill-current text-white ml-1" />
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-bold text-xl text-white group-hover:text-red-500 transition duration-200">
                    {series.title}
                  </h3>
                  <p className="text-sm text-neutral-400 line-clamp-3 leading-relaxed font-light">
                    {series.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-900 flex items-center justify-between text-xs text-neutral-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Reproducción en orden</span>
                  </span>
                  <span className="text-red-500 font-semibold group-hover:underline flex items-center">
                    Ver episodios <ChevronRight className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Details & Episodes Playlist Modal */}
      <AnimatePresence>
        {detailModalOpen && selectedSeries && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/90 backdrop-blur-md">
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.3 }}
              className="bg-neutral-950 rounded-2xl border border-neutral-800 shadow-2xl w-full max-w-5xl my-8 overflow-hidden relative"
              id="details-modal"
            >
              {/* Close Button */}
              <button 
                onClick={() => setDetailModalOpen(false)}
                className="absolute top-5 right-5 z-20 p-2.5 bg-black/80 hover:bg-red-600 rounded-full text-white hover:scale-105 transition duration-200"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Banner */}
              <div className="relative aspect-[21/9] w-full bg-neutral-900">
                <img 
                  src={selectedSeries.thumbnail} 
                  alt={selectedSeries.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
                
                <div className="absolute bottom-6 left-6 md:left-10 space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                      {selectedSeries.category}
                    </span>
                    <span className="text-xs text-neutral-400 font-semibold">
                      {selectedSeries.playlist.length} Capítulos Disponibles
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-extrabold text-white font-display">
                    {selectedSeries.title}
                  </h2>
                </div>
              </div>

              {/* Modal Content Grid */}
              <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Summary & Auto-play Preview */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Sinopsis</h4>
                    <p className="text-sm text-neutral-300 leading-relaxed font-light">
                      {selectedSeries.description}
                    </p>
                  </div>

                  {/* Dynamic Preview Container */}
                  <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-red-500 flex items-center">
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        PREVISUALIZAR
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">E{currentEpisodeIndex + 1}</span>
                    </div>

                    <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                      <video 
                        key={currentEpisodeIndex}
                        src={selectedSeries.playlist[currentEpisodeIndex]?.url}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted={isMuted}
                        loop
                        playsInline
                      />
                      <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className="absolute bottom-2 right-2 p-1.5 bg-black/80 rounded-full text-white hover:bg-red-600 transition"
                      >
                        {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-white line-clamp-1">
                        {selectedSeries.playlist[currentEpisodeIndex]?.titulo}
                      </p>
                      <button 
                        onClick={() => {
                          setTheaterMode(true);
                          setDetailModalOpen(false);
                        }}
                        className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-bold transition flex items-center justify-center space-x-1"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Ver en Pantalla Completa</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Side: Interactive Episode Browser with pagination and search */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Episode Search & Pagination Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                      <Tv className="w-4 h-4 text-red-500" />
                      <span>Lista de Capítulos</span>
                      <span className="text-xs font-normal text-neutral-500">({filteredEpisodes.length} resultados)</span>
                    </h3>

                    {/* Search episodes */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
                      <input 
                        type="text"
                        placeholder="Buscar por nro o título..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-neutral-900 border border-neutral-800 text-xs rounded-lg pl-9 pr-4 py-2 w-full sm:w-56 focus:outline-none focus:border-red-600 transition text-white"
                      />
                    </div>
                  </div>

                  {/* Pagination chunks (tabs) for large sets (e.g. 335 episodes) */}
                  {totalPages > 1 && (
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-neutral-900 scrollbar-none">
                      {Array.from({ length: totalPages }).map((_, pageIdx) => {
                        const startEp = pageIdx * EPISODES_PER_PAGE + 1;
                        const endEp = Math.min((pageIdx + 1) * EPISODES_PER_PAGE, filteredEpisodes.length);
                        return (
                          <button
                            key={pageIdx}
                            onClick={() => setActiveEpisodePage(pageIdx)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold shrink-0 transition ${
                              activeEpisodePage === pageIdx 
                                ? 'bg-red-600 text-white' 
                                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
                            }`}
                          >
                            Caps {startEp}-{endEp}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Episodes Scrollable Area */}
                  <div className="max-h-[380px] overflow-y-auto pr-2 space-y-2 border border-neutral-900 bg-[#0d0d0d]/80 rounded-xl p-3">
                    {paginatedEpisodes.length === 0 ? (
                      <div className="py-12 text-center text-neutral-500 text-sm">
                        No se encontraron capítulos para tu búsqueda.
                      </div>
                    ) : (
                      paginatedEpisodes.map((ep) => {
                        // Find the original index of this episode in the complete playlist
                        const playlistIndex = selectedSeries.playlist.findIndex(p => p.episodio === ep.episodio);
                        const isCurrent = playlistIndex === currentEpisodeIndex;

                        return (
                          <div 
                            key={ep.episodio}
                            onClick={() => {
                              setCurrentEpisodeIndex(playlistIndex);
                            }}
                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition duration-200 group/item ${
                              isCurrent 
                                ? 'border-red-600/50 bg-red-950/20 shadow-lg' 
                                : 'border-neutral-900 bg-neutral-950 hover:bg-neutral-900 hover:border-neutral-800'
                            }`}
                          >
                            <div className="flex items-center space-x-4 min-w-0">
                              <div className={`w-10 h-10 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                                isCurrent 
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-neutral-900 text-neutral-400 group-hover/item:bg-neutral-800 group-hover/item:text-white transition'
                              }`}>
                                {ep.episodio}
                              </div>
                              <div className="min-w-0">
                                <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-red-500' : 'text-neutral-200'}`}>
                                  {ep.titulo}
                                </p>
                                <p className="text-[10px] text-neutral-500">Streaming HD • Bunny.net</p>
                              </div>
                            </div>

                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentEpisodeIndex(playlistIndex);
                                setTheaterMode(true);
                                setDetailModalOpen(false);
                              }}
                              className={`p-2 rounded-full shrink-0 ${
                                isCurrent 
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-neutral-900 text-neutral-400 opacity-50 group-hover/item:opacity-100 hover:bg-neutral-800 hover:text-white transition'
                              }`}
                              title="Reproducir en pantalla completa"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-neutral-900/80 py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-500">
          <div className="flex items-center space-x-4">
            <span className="text-white font-extrabold tracking-tighter text-lg">NETFLIX</span>
            <span className="text-neutral-700">|</span>
            <span>Video Library Cloud Player v2.5</span>
          </div>
          <div className="flex space-x-6 text-neutral-400">
            <span className="hover:text-white transition cursor-pointer">Términos de servicio</span>
            <span className="hover:text-white transition cursor-pointer">Privacidad</span>
            <span className="hover:text-white transition cursor-pointer">Soporte Bunny.net</span>
          </div>
          <span className="text-neutral-600">Streaming optimizado para carga secuencial instantánea</span>
        </div>
      </footer>

    </div>
  );
}

