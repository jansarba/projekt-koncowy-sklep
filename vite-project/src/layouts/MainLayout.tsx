import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { useSidebar } from '../contexts/SidebarContext';


const MainLayout = () => {
  const { isSidebarVisible } = useSidebar();

  return (
    <div className="max-w-full min-h-screen overflow-x-clip bg-darker scrollbar-hide">
      <Header />
      <div className="flex flex-col sm:flex-row w-full">
        {isSidebarVisible && (
          <div className="w-full sm:w-3/12 sm:block">
            <Sidebar />
          </div>
        )}
        <div className="flex flex-col text-text p-4 overflow-hidden w-full pb-48">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;