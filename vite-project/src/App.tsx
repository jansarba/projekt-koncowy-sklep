import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { SidebarProvider } from './contexts/SidebarContext';
import MainLayout from './layouts/MainLayout';
import NoSidebarLayout from './layouts/NoSidebarLayout';
import { ItemsPresenter } from './components/ItemPresenter';
import { BeatDetailsPage } from './pages/BeatDetailsPage';
import Login from './pages/Login';
import Register from './pages/Register';
import CartPage from './pages/CartPage';
import OrderDetails from './pages/OrderPage';
import { LedgerPage } from './pages/LedgerPage';
import BeatUploadPage from './pages/BeatUploadPage';
import './index.css';

const App: React.FC = () => {
  return (
    <SidebarProvider>
      <Router>
        <Routes>
          {/* Routes with Sidebar */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<ItemsPresenter />} />
            <Route path="/beat/:id" element={<BeatDetailsPage />} />
          </Route>

          {/* Routes without Sidebar */}
          <Route element={<NoSidebarLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/order/:id" element={<OrderDetails />} />
            <Route path="/ledger" element={<LedgerPage />} />
            <Route path="/upload" element={<BeatUploadPage />} />
          </Route>
        </Routes>
      </Router>
    </SidebarProvider>
  );
};

export default App;