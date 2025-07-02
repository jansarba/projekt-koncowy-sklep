import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { Header } from '../Header';
import { PaginationProvider } from '../../contexts/PaginationContext';

// Mock the atob function for Jest environment
global.atob = (b64) => Buffer.from(b64, 'base64').toString('binary');

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <PaginationProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </PaginationProvider>
  );
};

describe('Header Component', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('shows Login and Register buttons when user is not logged in', () => {
    renderWithProviders(<Header />);
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('shows user name and Logout button when user is logged in', () => {
    // A mock JWT for a standard user
    const userToken = `header.${btoa(JSON.stringify({ name: 'Test User', exp: Date.now() / 1000 + 3600 }))}.signature`;
    localStorage.setItem('token', userToken);

    renderWithProviders(<Header />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('does not show the Upload Beat button for a standard user', () => {
    const userToken = `header.${btoa(JSON.stringify({ name: 'Test User', exp: Date.now() / 1000 + 3600 }))}.signature`;
    localStorage.setItem('token', userToken);

    renderWithProviders(<Header />);
    expect(screen.queryByLabelText('Upload Beat')).not.toBeInTheDocument();
  });

  it('shows the Upload Beat button for an admin user', () => {
    // A mock JWT for an admin
    const adminToken = `header.${btoa(JSON.stringify({ name: 'Admin User', role: 'admin', exp: Date.now() / 1000 + 3600 }))}.signature`;
    localStorage.setItem('token', adminToken);

    renderWithProviders(<Header />);
    expect(screen.getByLabelText('Upload Beat')).toBeInTheDocument();
  });
});