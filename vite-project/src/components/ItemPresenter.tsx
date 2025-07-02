import { useEffect } from 'react';
import { ItemHandler } from './ItemHandler';

export const ItemsPresenter: React.FC = () => {
  useEffect(() => {
    document.title = 'gnusny';
  }, []);

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row">
      <div className="flex-grow">
        <ItemHandler />
      </div>
    </div>
  );
};