
import React from 'react';
import { FILTERS, CinematicFilter } from '../types';

interface FilterSelectorProps {
  selectedFilter: CinematicFilter;
  onSelect: (filter: CinematicFilter) => void;
  language: 'en' | 'es';
}

const FilterSelector: React.FC<FilterSelectorProps> = ({ selectedFilter, onSelect, language }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {FILTERS.map((filter) => {
        const isCustom = filter.id === CinematicFilter.CUSTOM_GRADIENT;
        const isSelected = selectedFilter === filter.id;
        
        const displayName = language === 'en' ? filter.name : filter.name_es;
        const displayDescription = language === 'en' ? filter.description : filter.description_es;

        return (
          <button
            key={filter.id}
            onClick={() => onSelect(filter.id)}
            className={`relative overflow-hidden rounded-xl p-4 h-32 text-left transition-all duration-300 group flex flex-col justify-between
              ${isSelected 
                ? 'ring-2 ring-arri-gold transform scale-[1.02] z-10 shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                : 'ring-1 ring-gray-700 hover:ring-gray-500 hover:scale-[1.01]'
              }
              ${isCustom ? 'bg-arri-gray' : ''}
            `}
          >
            {/* Background Gradient - Always visible but subtle, brighter on hover */}
            {!isCustom && (
              <div className={`absolute inset-0 bg-gradient-to-r ${filter.colorFrom} ${filter.colorTo} opacity-40 transition-opacity duration-300 group-hover:opacity-60`} />
            )}
            
            {/* Custom Icon Background */}
            {isCustom && (
               <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="white" className="w-16 h-16">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a16.084 16.084 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                  </svg>
               </div>
            )}

            <div className="relative z-10 flex flex-col h-full justify-between pointer-events-none">
              <div className="flex items-center justify-between">
                <h4 className={`font-serif text-lg font-bold tracking-wide drop-shadow-md ${isCustom ? 'text-arri-gold' : 'text-white'}`}>
                  {displayName}
                </h4>
                {isSelected && (
                  <div className="text-arri-gold drop-shadow-md">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                       <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                     </svg>
                  </div>
                )}
              </div>
              
              <div className="w-full">
                 <p className="text-[11px] leading-tight text-gray-200 line-clamp-2 drop-shadow-sm font-medium opacity-90">
                  {displayDescription}
                 </p>
                 {isCustom && <div className="mt-1 h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-gray-500"></div>
                 </div>}
              </div>
            </div>
            
          </button>
        );
      })}
    </div>
  );
};

export default FilterSelector;
