import React from 'react';

export const LibrarySkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 mt-4">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="flex flex-col animate-pulse">
          {/* Portada Skeleton sin bordes */}
          <div className="aspect-[2/3] w-full rounded-2xl bg-black/5 dark:bg-white/5" />
          {/* Título y subtítulo */}
          <div className="mt-2.5 h-3.5 w-3/4 rounded-full bg-black/10 dark:bg-white/10" />
          <div className="mt-1.5 h-2.5 w-1/2 rounded-full bg-black/5 dark:bg-white/5" />
        </div>
      ))}
    </div>
  );
};

