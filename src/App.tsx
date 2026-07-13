/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Play, 
  ChevronLeft, 
  Tv, 
  Search,
  Filter, 
  ChevronRight, 
  X,
  Download,
  Copy,
  Check,
  Flame,
  Info,
  ExternalLink,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { seriesData } from './data';
import { Series, Episode } from './types';

// Helper to determine the streaming URL based on file type (.avi uses transcode proxy)
const getVideoSrc = (url: string) => {
  if (url && url.toLowerCase().endsWith('.avi')) {
    return `/api/video?url=${encodeURIComponent(url)}`;
  }
  return url;
};

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<number>(0);
  const [autoplayNext, setAutoplayNext] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [episodeSearchQuery, setEpisodeSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [showTroubleshoot, setShowTroubleshoot] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);

  // Filter series catalog
  const filteredSeries = useMemo(() => {
    let result = seriesData;
    if (selectedCategory !== 'Todos') {
      result = result.filter(s => s.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [selectedCategory, searchQuery]);

  // Load and change selected series
  const handleSelectSeries = (series: Series) => {
    setSelectedSeries(series);
    setEpisodeSearchQuery('');
    
    // Retrieve last watched episode index for this series
    const savedIndex = localStorage.getItem(`last_ep_idx_${series.id}`);
    const index = savedIndex ? parseInt(savedIndex, 10) : 0;
    
    // Ensure index is within range
    if (index >= 0 && index < series.playlist.length) {
      setCurrentEpisodeIndex(index);
    } else {
      setCurrentEpisodeIndex(0);
    }
  };

  const currentEpisode = useMemo(() => {
    if (!selectedSeries) return null;
    return selectedSeries.playlist[currentEpisodeIndex] || selectedSeries.playlist[0];
  }, [selectedSeries, currentEpisodeIndex]);

  // Handle Autoplay & Episode storage
  useEffect(() => {
    if (selectedSeries) {
      localStorage.setItem(`last_ep_idx_${selectedSeries.id}`, currentEpisodeIndex.toString());
    }
  }, [selectedSeries, currentEpisodeIndex]);

  // Handle media source change safely
  useEffect(() => {
    if (videoPlayerRef.current && currentEpisode) {
      const video = videoPlayerRef.current;
      const targetSrc = getVideoSrc(currentEpisode.url);
      const absoluteTargetSrc = new URL(targetSrc, window.location.href).href;
      
      if (video.src !== absoluteTargetSrc) {
        video.src = absoluteTargetSrc;
        video.load();
      }
    }
  }, [currentEpisode]);

  // Filter episodes list
  const filteredEpisodes = useMemo(() => {
    if (!selectedSeries) return [];
    if (!episodeSearchQuery.trim()) return selectedSeries.playlist;
    const q = episodeSearchQuery.toLowerCase();
    return selectedSeries.playlist.filter(ep => 
      ep.titulo.toLowerCase().includes(q) || 
      ep.episodio.toString().includes(q)
    );
  }, [selectedSeries, episodeSearchQuery]);

  const handleCopyLink = () => {
    if (!currentEpisode) return;
    const absoluteUrl = new URL(getVideoSrc(currentEpisode.url), window.location.href).href;
    navigator.clipboard.writeText(absoluteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const playNextEpisode = () => {
    if (selectedSeries && currentEpisodeIndex < selectedSeries.playlist.length - 1) {
      setCurrentEpisodeIndex(prev => prev + 1);
    }
  };

  const playPrevEpisode = () => {
    if (selectedSeries && currentEpisodeIndex > 0) {
      setCurrentEpisodeIndex(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Premium Elegant Header */}
      <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-900 px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setSelectedSeries(null)}>
          <div className="p-2 bg-gradient-to-tr from-red-600 to-amber-500 rounded-xl shadow-lg shadow-red-600/10">
            <Tv className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-amber-500 to-yellow-400">
              TELEVECINDAD
            </span>
            <span className="hidden sm:inline-block text-[10px] text-neutral-400 uppercase tracking-widest font-bold ml-2 border-l border-neutral-800 pl-2">
              Clásicos en Streaming
            </span>
          </div>
        </div>

        {/* Direct Access Shortcuts - Requested by User */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest hidden lg:inline">
            ACCESOS RÁPIDOS:
          </span>
          
          <button 
            onClick={() => {
              const chavo = seriesData.find(s => s.id === 'chavo');
              if (chavo) handleSelectSeries(chavo);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/20 text-amber-400 text-xs font-bold transition duration-200 cursor-pointer"
            title="Ir directo a El Chavo del 8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>El Chavo</span>
          </button>

          <button 
            onClick={() => {
              const betty = seriesData.find(s => s.id === 'betty');
              if (betty) handleSelectSeries(betty);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-500 text-xs font-bold transition duration-200 cursor-pointer"
            title="Ir directo a Betty la Fea"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            <span>Betty la Fea</span>
          </button>
        </div>

        {/* Main Catalog Search */}
        {!selectedSeries && (
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
            <input 
              type="text"
              placeholder="Buscar serie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-full pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-white transition-all duration-300"
            />
          </div>
        )}
      </header>

      {/* Main Content Stage */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {!selectedSeries ? (
            /* ================= CATALOG LANDING VIEW ================= */
            <motion.div 
              key="catalog"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Premium Welcome Feature Banner */}
              <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="absolute inset-0 bg-radial-gradient from-red-600/5 via-transparent to-transparent pointer-events-none" />
                <div className="space-y-4 max-w-2xl relative z-10">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 bg-red-600/10 border border-red-600/20 text-red-500 rounded-full text-xs font-extrabold tracking-wider uppercase">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>Plataforma Optimizada</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white font-display">
                    ¡Tus comedias favoritas listas para ver!
                  </h2>
                  <p className="text-sm md:text-base text-neutral-400 leading-relaxed font-light">
                    Disfruta de reproducciones directas y organizadas. Si experimentas pausas debido a la conversión en tiempo real de formatos clásicos (.avi), puedes descargar directamente el capítulo en un clic y disfrutarlo sin conexión con tu reproductor favorito como VLC.
                  </p>
                  
                  {/* Banner Quick Launch Links */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button 
                      onClick={() => {
                        const chavo = seriesData.find(s => s.id === 'chavo');
                        if (chavo) handleSelectSeries(chavo);
                      }}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl transition duration-200 active:scale-95 shadow-lg shadow-amber-500/25 flex items-center space-x-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>El Chavo del 8</span>
                    </button>
                    <button 
                      onClick={() => {
                        const betty = seriesData.find(s => s.id === 'betty');
                        if (betty) handleSelectSeries(betty);
                      }}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl transition duration-200 active:scale-95 shadow-lg shadow-red-600/25 flex items-center space-x-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Yo soy Betty, la fea</span>
                    </button>
                  </div>
                </div>

                {/* Right decorative visual */}
                <div className="hidden lg:block relative w-80 h-48 bg-neutral-950 rounded-2xl border border-neutral-800 p-4 shadow-inner overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 to-transparent z-10" />
                  <img 
                    src="https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?q=80&w=400&h=250&auto=format&fit=crop"
                    className="w-full h-full object-cover rounded-lg filter saturate-50 blur-[1px]"
                    alt="Decoración"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">El Chavo del 8</span>
                    <span className="text-[10px] text-neutral-400 bg-neutral-900/95 px-2 py-0.5 rounded border border-neutral-800">161 Capítulos</span>
                  </div>
                </div>
              </div>

              {/* Series Categories Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest mr-2">Filtrar:</span>
                {['Todos', 'Comedia', 'Documental', 'Tecnología'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition duration-200 cursor-pointer border ${
                      selectedCategory === cat 
                        ? 'bg-neutral-100 text-neutral-900 border-neutral-100' 
                        : 'bg-neutral-900/50 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Catalog Series Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="series-grid">
                {filteredSeries.map((series) => (
                  <div 
                    key={series.id}
                    onClick={() => handleSelectSeries(series)}
                    className="group bg-neutral-900/40 hover:bg-neutral-900 border border-neutral-800/60 hover:border-neutral-700/80 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl flex flex-col h-full"
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-950">
                      <img 
                        src={series.thumbnail} 
                        alt={series.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter saturate-75 group-hover:saturate-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="bg-white text-black font-extrabold text-[10px] tracking-wider px-3 py-1 rounded-lg uppercase flex items-center gap-1.5 shadow-lg">
                          <Play className="w-3 h-3 fill-current" />
                          <span>Entrar</span>
                        </span>
                      </div>
                      <div className="absolute top-3 left-3 bg-neutral-950/90 backdrop-blur-md text-[10px] font-black uppercase text-neutral-400 border border-neutral-800 px-2.5 py-1 rounded-full">
                        {series.category}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <h3 className="font-bold text-white group-hover:text-red-500 transition-colors duration-200">
                          {series.title}
                        </h3>
                        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed font-light">
                          {series.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-900 text-[11px] font-semibold text-neutral-500">
                        <span>{series.playlist.length} Capítulos</span>
                        <span className="text-red-500 group-hover:underline">Ver episodios →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* ================= TWO-COLUMN MASTER-DETAIL PLAYER VIEW ================= */
            <motion.div 
              key="player"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
            >
              
              {/* LEFT COLUMN: Dedicated Interactive Video Player */}
              <div className="lg:col-span-2 space-y-5">
                
                {/* Back button */}
                <button 
                  onClick={() => setSelectedSeries(null)}
                  className="inline-flex items-center space-x-2 text-xs font-bold text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-4 py-2.5 rounded-xl transition duration-150 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Volver al Catálogo</span>
                </button>

                {/* Dark Cinematic Player Frame */}
                <div className="bg-neutral-950 border border-neutral-900 rounded-3xl overflow-hidden shadow-2xl relative">
                  
                  {/* Top-bar HUD inside the Player area */}
                  <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
                    <span className="bg-neutral-950/90 backdrop-blur-md border border-neutral-800 text-neutral-300 font-bold text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-full shadow-lg">
                      {selectedSeries.title} • Capítulo {currentEpisode?.episodio}
                    </span>
                    
                    <span className="bg-neutral-950/90 backdrop-blur-md border border-neutral-800 text-[10px] tracking-wider text-red-500 font-extrabold uppercase px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                      <span>Streaming Activo</span>
                    </span>
                  </div>

                  {/* Responsive aspect ratio container */}
                  <div className="aspect-video w-full bg-black flex items-center justify-center relative">
                    <video 
                      ref={videoPlayerRef}
                      controls
                      autoPlay
                      onEnded={() => {
                        if (autoplayNext) {
                          playNextEpisode();
                        }
                      }}
                      onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                      onDurationChange={(e) => setDuration(e.currentTarget.duration)}
                      onLoadedMetadata={(e) => {
                        const videoDuration = e.currentTarget.duration;
                        setDuration(videoDuration);
                        const savedTimeStr = localStorage.getItem(`progress_${selectedSeries.id}_${currentEpisodeIndex}`);
                        if (savedTimeStr) {
                          const savedTime = parseFloat(savedTimeStr);
                          if (savedTime > 0 && savedTime < videoDuration - 5) {
                            e.currentTarget.currentTime = savedTime;
                          }
                        }
                      }}
                      className="w-full h-full object-contain"
                      title={currentEpisode?.titulo}
                    />
                  </div>

                  {/* Active episode description & metadata footer */}
                  <div className="p-6 bg-neutral-900/80 border-t border-neutral-900 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs text-red-500 font-extrabold uppercase tracking-widest">
                          REPRODUCIENDO AHORA:
                        </span>
                        <h2 className="text-xl font-bold text-white mt-1">
                          Capítulo {currentEpisode?.episodio}: {currentEpisode?.titulo}
                        </h2>
                      </div>

                      {/* Autoplay toggle */}
                      <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={autoplayNext}
                          onChange={(e) => setAutoplayNext(e.target.checked)}
                          className="w-4.5 h-4.5 rounded text-red-600 focus:ring-red-500 bg-neutral-950 border-neutral-800"
                        />
                        <span className="text-xs font-bold text-neutral-300">Auto-reproducir siguiente</span>
                      </label>
                    </div>

                    <p className="text-xs text-neutral-400 font-light leading-relaxed">
                      Estás sintonizando la videoteca oficial de clásicos. El reproductor utiliza controles nativos de tu navegador para brindar máxima velocidad, compatibilidad con subtítulos/audio y menor consumo de batería.
                    </p>
                  </div>
                </div>

                {/* PLAYBACK ASSISTANCE PANEL: Crucial fix for .avi files */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <HelpCircle className="w-5 h-5 text-amber-500" />
                      <h4 className="text-sm font-bold text-white">¿Problemas con la reproducción o pausas?</h4>
                    </div>
                    <button 
                      onClick={() => setShowTroubleshoot(!showTroubleshoot)}
                      className="text-xs font-bold text-neutral-400 hover:text-white underline cursor-pointer"
                    >
                      {showTroubleshoot ? 'Ocultar info' : 'Saber por qué'}
                    </button>
                  </div>

                  {showTroubleshoot && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-xs text-neutral-400 leading-relaxed font-light border-l-2 border-amber-500/50 pl-3 pt-1"
                    >
                      Los capítulos clásicos están almacenados en formato <code className="bg-neutral-950 px-1 py-0.5 rounded text-amber-400">.avi</code>. Dado que los navegadores modernos no soportan AVI de forma nativa, nuestro servidor convierte el video en tiempo real. Esto consume mucha CPU; si experimentas pausas, te aconsejamos descargar el archivo para verlo perfectamente con VLC Media Player.
                    </motion.p>
                  )}

                  {/* Actions Bar */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Download button */}
                    <a 
                      href={currentEpisode?.url} 
                      download 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold py-3.5 px-4 rounded-xl shadow-lg transition duration-150 cursor-pointer text-center"
                    >
                      <Download className="w-4 h-4" />
                      <span>Descargar Capítulo Directo</span>
                    </a>

                    {/* Copy direct video URL button for VLC */}
                    <button 
                      onClick={handleCopyLink}
                      className="flex items-center justify-center space-x-2 bg-neutral-950 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 hover:border-neutral-700 text-xs font-bold py-3.5 px-4 rounded-xl transition duration-150 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-green-400">¡Copiado al portapapeles!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-neutral-400" />
                          <span>Copiar Enlace para VLC / Externo</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-[11px] text-neutral-500 text-center">
                    Sugerencia: Abre VLC, presiona <kbd className="bg-neutral-950 px-1 py-0.5 rounded">Ctrl + N</kbd> (o comando + N), pega el enlace copiado y disfruta el capítulo sin un solo corte.
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Interactive Searchable Episode Directory */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[800px]">
                
                {/* Search Bar & Header */}
                <div className="p-5 border-b border-neutral-800 space-y-3 bg-neutral-900/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white uppercase tracking-widest">
                      EPISODIOS DISPONIBLES
                    </span>
                    <span className="text-[11px] bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 font-bold text-neutral-400">
                      {selectedSeries.playlist.length} en Total
                    </span>
                  </div>

                  {/* Episode Specific Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
                    <input 
                      type="text"
                      placeholder="Buscar capítulo o nº..."
                      value={episodeSearchQuery}
                      onChange={(e) => setEpisodeSearchQuery(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-white"
                    />
                    {episodeSearchQuery && (
                      <button 
                        onClick={() => setEpisodeSearchQuery('')}
                        className="absolute right-2.5 top-2.5 text-neutral-500 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Scrollable list of episodes */}
                <div className="flex-1 overflow-y-auto divide-y divide-neutral-950 p-2 space-y-1.5 custom-scrollbar">
                  {filteredEpisodes.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <Search className="w-8 h-8 text-neutral-600 mx-auto" />
                      <p className="text-xs text-neutral-400">No se encontraron episodios.</p>
                    </div>
                  ) : (
                    filteredEpisodes.map((ep, idx) => {
                      // Find actual index in the unfiltered playlist
                      const actualIdx = selectedSeries.playlist.findIndex(p => p.episodio === ep.episodio);
                      const isActive = actualIdx === currentEpisodeIndex;

                      return (
                        <button
                          key={ep.episodio}
                          onClick={() => {
                            setCurrentEpisodeIndex(actualIdx);
                            // Scroll to top of page on mobile to instantly see video play
                            if (window.innerWidth < 1024) {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }}
                          className={`w-full text-left p-3.5 rounded-2xl flex items-center gap-3.5 transition-all duration-200 group cursor-pointer ${
                            isActive 
                              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/10 font-bold' 
                              : 'hover:bg-neutral-800/80 text-neutral-300'
                          }`}
                        >
                          {/* Play Status indicator */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isActive 
                              ? 'bg-white text-red-600 scale-105' 
                              : 'bg-neutral-950 border border-neutral-800 text-neutral-400 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600'
                          }`}>
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className={`text-[10px] uppercase font-black tracking-wider block ${
                              isActive ? 'text-white' : 'text-neutral-500'
                            }`}>
                              EPISODIO {ep.episodio}
                            </span>
                            <h5 className="text-xs truncate font-medium tracking-wide mt-0.5">
                              {ep.titulo}
                            </h5>
                          </div>

                          <div className="text-[10px] font-bold text-neutral-500 shrink-0">
                            {isActive ? 'Viendo' : 'Ver'}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Quick pagination helper footer */}
                <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 flex justify-between items-center text-xs text-neutral-400">
                  <button 
                    disabled={currentEpisodeIndex === 0}
                    onClick={playPrevEpisode}
                    className="flex items-center space-x-1 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  <span className="font-bold">
                    Capítulo {currentEpisodeIndex + 1} de {selectedSeries.playlist.length}
                  </span>

                  <button 
                    disabled={currentEpisodeIndex === selectedSeries.playlist.length - 1}
                    onClick={playNextEpisode}
                    className="flex items-center space-x-1 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 cursor-pointer"
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Humble footer */}
      <footer className="bg-neutral-950 border-t border-neutral-900 py-6 text-center text-xs text-neutral-500 space-y-1 mt-10">
        <p>© 2026 Televecindad. Hecho con ❤️ para toda la comunidad.</p>
        <p className="font-light">Todo el material está enlazado directamente y se procesa para fines de compatibilidad.</p>
      </footer>
    </div>
  );
}
