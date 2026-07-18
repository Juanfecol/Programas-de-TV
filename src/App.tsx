/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Play, 
  Tv, 
  Search,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { seriesData } from './data';
import { Series } from './types';
import { VideoPlayer } from './components/VideoPlayer';
import { CategoryMenu } from './components/CategoryMenu';


export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<number>(0);
  const [autoplayNext, setAutoplayNext] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSelectSeries = (series: Series) => {
    setSelectedSeries(series);
    setCurrentEpisodeIndex(0);
  };

  const currentEpisode = useMemo(() => {
    if (!selectedSeries) return null;
    return selectedSeries.playlist[currentEpisodeIndex] || selectedSeries.playlist[0];
  }, [selectedSeries, currentEpisodeIndex]);

  const categories = useMemo(() => ['Todos', ...Array.from(new Set(seriesData.map(s => s.category)))], []);

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

  const seriesButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedSeries) {
        if (e.key === 'Escape') {
          setSelectedSeries(null);
        }
        return;
      }

      if (e.key === 'ArrowRight') {
        setFocusedIndex((prev) => Math.min(prev + 1, filteredSeries.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'ArrowDown') {
        setFocusedIndex((prev) => Math.min(prev + 1, filteredSeries.length - 1)); // Simplified for linear
      } else if (e.key === 'ArrowUp') {
        setFocusedIndex((prev) => Math.max(prev - 1, 0)); // Simplified for linear
      } else if (e.key === 'Escape') {
        setSelectedSeries(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSeries, filteredSeries.length]);

  useEffect(() => {
    if (!selectedSeries && seriesButtonRefs.current[focusedIndex]) {
      seriesButtonRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, selectedSeries]);

  useEffect(() => {
    setFocusedIndex(0);
  }, [filteredSeries.length]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-900 px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setSelectedSeries(null)}>
          <div className="p-2 bg-gradient-to-tr from-red-600 to-amber-500 rounded-xl shadow-lg">
            <Tv className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-wider text-white">TELEVECINDAD</span>
        </div>

        <div className="flex items-center gap-4">
          <CategoryMenu categories={categories} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
          
          {!selectedSeries && (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
              <input 
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {!selectedSeries ? (
            <motion.div key="catalog" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredSeries.map((series, index) => (
                <button
                  key={series.id}
                  ref={(el) => (seriesButtonRefs.current[index] = el)}
                  onClick={() => handleSelectSeries(series)}
                  className="group w-full text-left bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600 hover:scale-105 focus:scale-105"
                >
                  <img src={series.thumbnail} alt={series.title} className="w-full aspect-video object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold text-white">{series.title}</h3>
                    <p className="text-xs text-neutral-400">{series.playlist.length} Capítulos</p>
                  </div>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div key="player" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-4">
                {currentEpisode && (
                  <VideoPlayer
                    episode={currentEpisode}
                    hasPrev={currentEpisodeIndex > 0}
                    hasNext={currentEpisodeIndex < selectedSeries.playlist.length - 1}
                    onPrev={playPrevEpisode}
                    onNext={playNextEpisode}
                    onTimeUpdate={(time, duration) => {
                      if (duration > 0) {
                        const progress = (time / duration) * 100;
                        localStorage.setItem(`progress_${selectedSeries.id}_${currentEpisode.episodio}`, progress.toString());
                      }
                    }}
                    onEnded={() => {
                      if (autoplayNext) playNextEpisode();
                    }}
                  />
                )}
                <h1 className="text-2xl font-bold">{selectedSeries.title} - {currentEpisode?.titulo}</h1>
              </div>
              <div className="bg-neutral-900 p-4 rounded-xl h-[500px] overflow-y-auto">
                <h3 className="font-bold mb-4">Capítulos</h3>
                {selectedSeries.playlist.map((ep, idx) => {
                   const progress = parseFloat(localStorage.getItem(`progress_${selectedSeries.id}_${ep.episodio}`) || '0');
                   return (
                     <button
                       key={ep.episodio}
                       onClick={() => setCurrentEpisodeIndex(idx)}
                       className={`w-full text-left p-2 rounded-lg mb-2 relative overflow-hidden ${idx === currentEpisodeIndex ? 'bg-red-600' : 'bg-neutral-800 hover:bg-neutral-700'}`}
                     >
                       {ep.episodio}. {ep.titulo}
                       {progress > 0 && (
                          <div className="absolute bottom-0 left-0 h-1 bg-red-400" style={{ width: `${progress}%` }} />
                       )}
                     </button>
                   );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="fixed bottom-4 left-4 right-4 flex justify-center gap-4 text-xs text-neutral-500 bg-neutral-950/80 backdrop-blur-sm p-2 rounded-full border border-neutral-800 pointer-events-none z-50">
        <span><kbd className="bg-neutral-800 px-1.5 py-0.5 rounded text-white">↑↓←→</kbd> Mover</span>
        <span><kbd className="bg-neutral-800 px-1.5 py-0.5 rounded text-white">Enter</kbd> Seleccionar</span>
        <span><kbd className="bg-neutral-800 px-1.5 py-0.5 rounded text-white">Esc</kbd> Volver</span>
      </div>
    </div>
  );
}
