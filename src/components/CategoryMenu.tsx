import React, { useState, useRef, useEffect } from 'react';
import { Filter } from 'lucide-react';

interface CategoryMenuProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export const CategoryMenu: React.FC<CategoryMenuProps> = ({ categories, selectedCategory, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Focus management for keyboard navigation
  useEffect(() => {
    if (isOpen && buttonRefs.current[0]) {
      buttonRefs.current[0].focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown') {
      buttonRefs.current[(index + 1) % categories.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      buttonRefs.current[(index - 1 + categories.length) % categories.length]?.focus();
    } else if (e.key === 'Enter') {
      onSelect(categories[index]);
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors focus:ring-2 focus:ring-red-500"
      >
        <Filter className="w-5 h-5" />
        <span>Categorías</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-50">
          {categories.map((cat, index) => (
            <button
              key={cat}
              ref={(el) => (buttonRefs.current[index] = el)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onClick={() => {
                onSelect(cat);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-sm font-semibold transition-colors focus:bg-red-600 focus:text-white ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white'
                  : 'text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
