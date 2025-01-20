import { useState, useEffect, useMemo } from "react";
import { Item, ItemProps } from "./Item";
import { useFilters } from "../contexts/FiltersContext";
const baseURL = import.meta.env.VITE_API_BASE_URL;

export const ItemHandler = () => {
    const [items, setItems] = useState<ItemProps[]>([]);
    const [loading, setLoading] = useState(true);
    const { filters } = useFilters(); // Access filters from context

    useEffect(() => {
        const fetchItems = async () => {
            console.log("fetching...");
            console.log(baseURL);
            try {
                const response = await fetch(`${baseURL}/api/beats`);
                if (!response.ok) {
                    throw new Error("Failed to fetch beats");
                }
                const data: ItemProps[] = await response.json();
                setItems(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching items:", error);
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    // Function to normalize musical key format (e.g., "A", "Bb", "A#", "C Major", "F Minor")
    const normalizeKey = (key: string) => {
        // Example: "A Minor" -> ["A", "", "Minor"], "Bb Major" -> ["Bb", "", "Major"]
        const parts = key.split(" ");
        const note = parts[0]; // First part (note + optional symbol)
        const scale = parts[1] || ""; // Second part (scale)
        return { note, scale };
    };

    // Filter items based on the current filters
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            // Filter by title (case-insensitive)
            if (filters.title && !item.title.toLowerCase().includes(filters.title.toLowerCase())) {
                return false;
            }

            // Filter by tags (all selected tags must match, case-insensitive)
            if (filters.tags.length > 0) {
                const normalizedTags = filters.tags.map(tag => tag.toLowerCase()); // Normalize selected tags to lowercase
                const normalizedItemTags = item.tags.map(tag => tag.toLowerCase()); // Normalize item tags to lowercase
        
                // Ensure all selected tags are included in item.tags (case-insensitive)
                if (!normalizedTags.every((tag) => normalizedItemTags.includes(tag))) {
                return false;
                }
            }

            // Filter by BPM range
            if (item.bpm < filters.bpmRange[0] || item.bpm > filters.bpmRange[1]) {
                return false;
            }

            // Filter by musical key
            if (filters.musicalKey) {
                const { note: filterNote, scale: filterScale } = normalizeKey(filters.musicalKey);
                const { note: itemNote, scale: itemScale } = normalizeKey(item.musical_key);

                // Check if the note and scale match
                if (
                    (filterNote && filterNote !== itemNote) || // Filter by note
                    (filterScale && filterScale.toLowerCase() !== itemScale.toLowerCase()) // Filter by scale (major/minor)
                ) {
                    return false;
                }
            }

            return true;
        });
    }, [items, filters]);

    return (
        <div className="container mx-auto p-4">
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item: ItemProps) => (
                            <Item key={item.id} {...item} />
                        ))
                    ) : (
                        <p>No items match the selected filters.</p>
                    )}
                </div>
            )}
        </div>
    );
};