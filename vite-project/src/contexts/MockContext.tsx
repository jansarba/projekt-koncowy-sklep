import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MockContextType {
  isMockMode: boolean;
  setMockMode: (mock: boolean) => void;
  backendUnavailable: boolean;
  showDialog: boolean;
  dismissDialog: () => void;
  checkingBackend: boolean;
}

const MockContext = createContext<MockContextType>({
  isMockMode: false,
  setMockMode: () => {},
  backendUnavailable: false,
  showDialog: false,
  dismissDialog: () => {},
  checkingBackend: true,
});

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const MockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isMockMode, setMockMode] = useState(false);
  const [backendUnavailable, setBackendUnavailable] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [checkingBackend, setCheckingBackend] = useState(true);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(`${baseURL}/api/tags`, { signal: controller.signal });
        clearTimeout(timeout);
        if (!response.ok) throw new Error('Backend returned error');
      } catch {
        setBackendUnavailable(true);
        setShowDialog(true);
      } finally {
        setCheckingBackend(false);
      }
    };
    checkBackend();
  }, []);

  const dismissDialog = () => {
    setShowDialog(false);
    setMockMode(true);
  };

  return (
    <MockContext.Provider value={{ isMockMode, setMockMode, backendUnavailable, showDialog, dismissDialog, checkingBackend }}>
      {children}
    </MockContext.Provider>
  );
};

export const useMock = () => useContext(MockContext);
