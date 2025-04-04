import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import MainLayout from './layouts/MainLayout';  // Layout with Sidebar
import NoSidebarLayout from './layouts/NoSidebarLayout';  // Layout without Sidebar
import { SidebarProvider } from './contexts/SidebarContext'; // Import Sidebar context provider
import { ItemsPresenter } from './components/ItemPresenter';
import { BeatDetailsPage } from './pages/BeatDetailsPage';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';
import CartPage from './pages/CartPage';
import OrderDetails from './pages/OrderPage';
import { LedgerPage } from './pages/LedgerPage';
import BeatUploadPage from './pages/BeatUploadPage';

function App() {
  return (
    <SidebarProvider> 
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route path="/" element={<ItemsPresenter />} />
            <Route path="/beat/:id" element={<BeatDetailsPage />} />
          </Route>

          <Route path="/" element={<NoSidebarLayout />}>
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
}

export default App;