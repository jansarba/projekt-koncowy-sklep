import { useEffect } from 'react';
import { ItemHandler } from './ItemHandler';

const Hero: React.FC = () => (
  <div className="relative overflow-hidden bg-gradient-to-br from-darkest via-dark to-darkest border-b border-light/10">
    <div className="absolute inset-0 opacity-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(160,71,71,0.3),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,_rgba(216,162,94,0.2),_transparent_50%)]" />
    </div>
    <div className="relative max-w-4xl mx-auto px-6 py-12 sm:py-16 text-center">
      <h2 className="font-bold text-4xl sm:text-5xl md:text-6xl text-text tracking-wider mb-3">
        ZNAJDŹ SWÓJ BIT
      </h2>
      <p className="text-texthover text-sm sm:text-base max-w-lg mx-auto">
        Przeglądaj, słuchaj i licencjonuj profesjonalne bity
      </p>
    </div>
  </div>
);

export const ItemsPresenter: React.FC = () => {
  useEffect(() => {
    document.title = 'thumpingbass';
  }, []);

  return (
    <div className="flex flex-col w-full">
      <Hero />
      <div className="container mx-auto flex flex-col md:flex-row">
        <div className="flex-grow">
          <ItemHandler />
        </div>
      </div>
    </div>
  );
};
