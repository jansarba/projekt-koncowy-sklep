import { useLocation } from 'react-router-dom';
import { Filters } from './Filters';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const isBeatPage = location.pathname.startsWith('/beat/');

  return (
    <div className={`bg-dark/50 text-text min-w-48 sm:w-full sm:min-w-full sm:sticky sm:top-[56px] w-full px-3 pt-2 h-auto sm:h-screen border-r border-light/10 ${isBeatPage ? 'hidden sm:block' : ''}`}>
      <div className="overflow-y-auto sm:h-full" style={{ scrollbarWidth: 'none' }}>
        <Filters />
      </div>
    </div>
  );
};
