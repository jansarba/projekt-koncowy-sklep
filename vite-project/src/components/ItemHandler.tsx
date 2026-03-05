import { useState, useEffect, useRef } from 'react';
import { Item, ItemProps } from './Item';
import { useFilters } from '../contexts/FiltersContext';
import { usePagination } from '../contexts/PaginationContext';
import { useMock } from '../contexts/MockContext';
import { mockBeats } from '../mockData';

const baseURL = import.meta.env.VITE_API_BASE_URL;
const ITEMS_PER_PAGE = 12;

type FetchBeatsResponse = {
  data: ItemProps[];
  totalPages: number;
};

const SkeletonCard: React.FC = () => (
  <div className="bg-dark rounded-xl overflow-hidden animate-pulse">
    <div className="w-full h-48 bg-light/30" />
    <div className="p-3 space-y-2">
      <div className="h-4 bg-light/30 rounded w-3/4" />
      <div className="flex gap-2">
        <div className="h-5 bg-light/20 rounded-full w-12" />
        <div className="h-5 bg-light/20 rounded-full w-16" />
      </div>
      <div className="flex gap-1">
        <div className="h-4 bg-light/10 rounded w-10" />
        <div className="h-4 bg-light/10 rounded w-8" />
      </div>
    </div>
  </div>
);

export const ItemHandler: React.FC = () => {
  const [items, setItems] = useState<ItemProps[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentPage, setCurrentPage } = usePagination();
  const [totalPages, setTotalPages] = useState(1);
  const { filters } = useFilters();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const { isMockMode, checkingBackend } = useMock();

  useEffect(() => {
    if (checkingBackend) return;
    if (isMockMode) {
      let filtered = mockBeats;

      if (filters.title) {
        const query = filters.title.toLowerCase();
        filtered = filtered.filter((b) => b.title.toLowerCase().includes(query));
      }

      if (filters.tags.length > 0) {
        filtered = filtered.filter((b) =>
          filters.tags.every((tag) => b.tags.includes(tag))
        );
      }

      if (filters.musicalKey.trim()) {
        const key = filters.musicalKey.toLowerCase().trim();
        filtered = filtered.filter((b) => b.musical_key.toLowerCase().includes(key));
      }

      const [minBpm, maxBpm] = filters.bpmRange;
      filtered = filtered.filter((b) => b.bpm >= minBpm && b.bpm <= maxBpm);

      setItems(filtered);
      setTotalPages(1);
      setLoading(false);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    const timer = setTimeout(() => {
      const fetchItems = async () => {
        setLoading(true);
        try {
          const response = await fetch(`${baseURL}/api/beats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              page: currentPage,
              limit: ITEMS_PER_PAGE,
              title: filters.title,
              tags: filters.tags,
              musicalKey: filters.musicalKey,
              bpmRange: filters.bpmRange.join(','),
            }),
          });

          if (!response.ok) throw new Error('Failed to fetch beats');

          const data: FetchBeatsResponse = await response.json();
          setItems(data.data);
          setTotalPages(data.totalPages);
        } catch (error) {
          console.error('Error fetching items:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchItems();
    }, 500);

    debounceTimer.current = timer;

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentPage, filters, isMockMode, checkingBackend]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="container mx-auto p-4">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.length > 0 ? (
              items.map((item) => <Item key={item.id} {...item} />)
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-lightest">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <p className="text-lg">Nie ma jeszcze takich bitów.</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 gap-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-dark hover:bg-light text-text disabled:bg-dark disabled:text-lightest rounded-lg transition-all duration-200 text-sm font-medium"
              >
                Poprzednia
              </button>
              <div className="flex items-center gap-1 text-sm text-texthover">
                <span className="text-text font-medium">{currentPage}</span>
                <span>/</span>
                <span>{totalPages}</span>
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-dark hover:bg-light text-text disabled:bg-dark disabled:text-lightest rounded-lg transition-all duration-200 text-sm font-medium"
              >
                Następna
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
