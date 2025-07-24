import { render, screen } from '@testing-library/react';
import Navbar from '../Navbar';
import { BrowserRouter } from 'react-router-dom';

describe('Navbar', () => {
  it('renders the ETL Monitoring title', () => {
    render(
      <BrowserRouter>
        <Navbar setToken={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getByText(/ETL Monitoring/i)).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(
      <BrowserRouter>
        <Navbar setToken={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Sync Status')).toBeInTheDocument();
    expect(screen.getByText('Vitals')).toBeInTheDocument();
  });

  it('renders profile button', () => {
    render(
      <BrowserRouter>
        <Navbar setToken={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getByText(/User|Loading/i)).toBeInTheDocument();
  });
}); 