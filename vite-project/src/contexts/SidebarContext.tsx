import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface SidebarContextType {
  isSidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
  forceSidebarVisibility: (visible: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [forceVisibility, setForceVisibility] = useState<null | boolean>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 450) {
        setSidebarVisible(true); // Always show sidebar on small screens
      } else if (forceVisibility === null) {
        setSidebarVisible(true); // Use default visibility for larger screens
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [forceVisibility]);

  const forceSidebarVisibility = (visible: boolean) => {
    setForceVisibility(visible);
    setSidebarVisible(visible);
  };

  return (
    <SidebarContext.Provider
      value={{
        isSidebarVisible,
        setSidebarVisible,
        forceSidebarVisibility,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};