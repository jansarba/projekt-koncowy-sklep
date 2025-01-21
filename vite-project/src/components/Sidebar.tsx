import { useLocation } from "react-router-dom";
import { Filters } from './Filters';

export const Sidebar = () => {
  const location = useLocation();
  const isBeatPage = location.pathname.startsWith("/beat/");

  return (
    <div
      className={`bg-dark text-slate-100 min-w-48 sm:w-full sm:min-w-full sm:sticky sm:top-[88px] w-full px-4 h-auto sm:h-screen ${isBeatPage ? "hidden sm:block" : ""}`}
    >
      <div className="overflow-y-auto sm:h-full" style={{ scrollbarWidth: 'none' }}>
        <Filters />
      </div>
      {isBeatPage && (<div>
          hsfusdfhudfgjfghjdghbb
      </div>)}
    </div>
  );
};