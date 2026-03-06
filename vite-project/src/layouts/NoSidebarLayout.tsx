import { Outlet } from 'react-router-dom';

const NoSidebarLayout = () => {
  return (
    <div className="max-w-full min-h-screen bg-darker scrollbar-hide text-text">
      <div className="flex justify-center w-full p-4">
        <div className="w-full max-w-4xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default NoSidebarLayout;