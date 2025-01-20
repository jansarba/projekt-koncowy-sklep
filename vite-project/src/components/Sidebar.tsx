import { Filters } from './Filters';

export const Sidebar = () => {
  return (
    <div className="bg-dark text-slate-100 min-w-48 sm:w-full sm:min-w-full sm:sticky sm:top-[84px] w-full px-4 h-auto sm:h-screen">
      <div className="overflow-y-auto sm:h-full" style={{scrollbarWidth: 'none'}}>
        <Filters />
      </div>
    </div>
  );
};