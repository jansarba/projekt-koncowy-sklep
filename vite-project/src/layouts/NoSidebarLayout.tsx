// NoSidebarLayout.tsx
import { Outlet } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';

const NoSidebarLayout = () => {
  return (
    <div className="max-w-full min-h-screen bg-darker scrollbar-hide text-text">
      <Header />
      <div className="flex justify-center w-full p-4">
        <div className="w-full max-w-4xl">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NoSidebarLayout;