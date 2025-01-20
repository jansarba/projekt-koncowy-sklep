import { useState, useEffect, useMemo } from "react";
import { Item, ItemProps } from "./Item";
import { useFilters } from "../contexts/FiltersContext";
const baseURL = import.meta.env.VITE_API_BASE_URL;

export const ItemHandler = () => {
    const [items, setItems] = useState<ItemProps[]>([]);
    const [nextItems, setNextItems] = useState<ItemProps[]>([]); // Store preloaded next page's items
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);  // Track current page
    const [totalPages, setTotalPages] = useState(1);    // Track total pages
    const { filters } = useFilters(); // Access filters from context
    const limit = 12; // Set the limit of items per page

    // Fetch items for the current page and preload next page
    useEffect(() => {
        const fetchItems = async () => {
            console.log("fetching...");
            console.log(baseURL);
            try {
                // Fetch current page's items
                const response = await fetch(`${baseURL}/api/beats?page=${currentPage}&limit=${limit}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch beats");
                }
                const data = await response.json();
                setItems(data.beats);
                setTotalPages(data.totalPages); // Set the total number of pages
                setLoading(false);
                
                console.log(currentPage, data.totalPages);
                // Preload next page if it exists
                if (currentPage < data.totalPages) {
                    console.log("Preloading next page...");
                    const nextPageResponse = await fetch(`${baseURL}/api/beats?page=${currentPage + 1}&limit=${limit}`);
                    if (nextPageResponse.ok) {
                        const nextPageData = await nextPageResponse.json();
                        setNextItems(nextPageData.beats); // Store next page's items
                    }
                }
            } catch (error) {
                console.error("Error fetching items:", error);
                setLoading(false);
            }
        };

        fetchItems();
    }, [currentPage]); // Re-fetch when the page changes

    // Function to normalize musical key format (e.g., "A", "Bb", "A#", "C Major", "F Minor")
    const normalizeKey = (key: string) => {
        const parts = key.split(" ");
        const note = parts[0]; 
        const scale = parts[1] || ""; 
        return { note, scale };
    };

    // Filter items based on the current filters
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            if (filters.title && !item.title.toLowerCase().includes(filters.title.toLowerCase())) {
                return false;
            }
            if (filters.tags.length > 0) {
                const normalizedTags = filters.tags.map(tag => tag.toLowerCase());
                const normalizedItemTags = item.tags.map(tag => tag.toLowerCase());
                if (!normalizedTags.every((tag) => normalizedItemTags.includes(tag))) {
                    return false;
                }
            }
            if (item.bpm < filters.bpmRange[0] || item.bpm > filters.bpmRange[1]) {
                return false;
            }
            if (filters.musicalKey) {
                const { note: filterNote, scale: filterScale } = normalizeKey(filters.musicalKey);
                const { note: itemNote, scale: itemScale } = normalizeKey(item.musical_key);
                if ((filterNote && filterNote !== itemNote) || (filterScale && filterScale.toLowerCase() !== itemScale.toLowerCase())) {
                    return false;
                }
            }
            return true;
        });
    }, [items, filters]);

    // Pagination control functions
    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            // Swap the current items with the next preloaded items
            setItems(nextItems);
            setNextItems([]); // Clear next items after swapping
        }
    };

    return (
        <div className="container mx-auto p-4">
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredItems.length > 0 ? (
                            filteredItems.map((item: ItemProps) => (
                                <Item key={item.id} {...item} />
                            ))
                        ) : (
                            <p>No items match the selected filters.</p>
                        )}
                    </div>

                    {/* Pagination controls */}
                    <div className="flex justify-center mt-4 gap-6">
                        <button 
                            onClick={handlePrevPage} 
                            disabled={currentPage === 1} 
                            className="px-4 py-2 bg-secondary text-white disabled:bg-lightest w-[6rem]"
                        >
                            Previous
                        </button>
                        <span className="self-center">{`${currentPage} / ${totalPages}`}</span>
                        <button 
                            onClick={handleNextPage} 
                            disabled={currentPage === totalPages} 
                            className="px-4 py-2 bg-secondary text-white disabled:bg-lightest w-[6rem]"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};