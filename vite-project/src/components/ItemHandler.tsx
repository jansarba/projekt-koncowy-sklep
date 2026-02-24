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
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.length > 0 ? items.map((item) => <Item key={item.id} {...item} />) : <p>Nie ma jeszcze takich bitów.</p>}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-6">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-secondary text-white disabled:bg-lightest w-[6rem]">
                Previous
              </button>
              <span className="self-center">{`${currentPage} / ${totalPages}`}</span>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-secondary text-white disabled:bg-lightest w-[6rem]">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};