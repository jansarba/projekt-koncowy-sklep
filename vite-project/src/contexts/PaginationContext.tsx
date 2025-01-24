import { createContext, useContext, useState } from "react";

interface PaginationContextProps {
    currentPage: number;
    setCurrentPage: (page: number) => void;
    resetToFirstPage: () => void;
}

const PaginationContext = createContext<PaginationContextProps | undefined>(undefined);

export const PaginationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const resetToFirstPage = () => {
        setCurrentPage(1);
    };

    return (
        <PaginationContext.Provider value={{ currentPage, setCurrentPage, resetToFirstPage }}>
            {children}
        </PaginationContext.Provider>
    );
};

export const usePagination = () => {
    const context = useContext(PaginationContext);
    if (!context) {
        throw new Error("usePagination must be used within a PaginationProvider");
    }
    return context;
};