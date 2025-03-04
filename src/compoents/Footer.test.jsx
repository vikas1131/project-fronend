import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from './Footer';

// Mock all Lucide icons
jest.mock('lucide-react', () => ({
  ChevronRight: () => <div data-testid="mock-chevron-right">ChevronRight Icon</div>,
  CheckCircle: () => <div data-testid="mock-check-circle">CheckCircle Icon</div>,
  MapPin: () => <div data-testid="mock-map-pin">MapPin Icon</div>,
  Shield: () => <div data-testid="mock-shield">Shield Icon</div>,
  Server: () => <div data-testid="mock-server">Server Icon</div>,
  Wifi: () => <div data-testid="mock-wifi">Wifi Icon</div>,
  Users: () => <div data-testid="mock-users">Users Icon</div>,
  Clipboard: () => <div data-testid="mock-clipboard">Clipboard Icon</div>,
  AlertTriangle: () => <div data-testid="mock-alert-triangle">AlertTriangle Icon</div>,
  Mail: () => <div data-testid="mock-mail">Mail Icon</div>,
  Smartphone: () => <div data-testid="mock-smartphone">Smartphone Icon</div>,
  Calendar: () => <div data-testid="mock-calendar">Calendar Icon</div>,
  Clock: () => <div data-testid="mock-clock">Clock Icon</div>,
}));

describe('Footer', () => {
  beforeEach(() => {
    render(<Footer />);
  });

  describe('Company Section', () => {
    it('renders company logo and name', () => {
      expect(screen.getByTestId('mock-wifi')).toBeInTheDocument();
      expect(screen.getByText('TelecomFieldOps')).toBeInTheDocument();
    });

    it('renders company description', () => {
      expect(screen.getByText('Bangalore-based telecom operations management since 2023')).toBeInTheDocument();
    });
  });

  describe('Solutions Section', () => {
    it('renders solutions heading and links', () => {
      expect(screen.getByText('Solutions')).toBeInTheDocument();
      
      const solutionLinks = [
        'Fault Management',
        'Safety Compliance',
        'Workforce Tracking'
      ];

      solutionLinks.forEach(link => {
        const linkElement = screen.getByText(link);
        expect(linkElement).toBeInTheDocument();
        expect(linkElement.tagName.toLowerCase()).toBe('a');
        expect(linkElement).toHaveAttribute('href', '#');
        expect(linkElement).toHaveClass('hover:text-blue-400');
      });
    });
  });

  describe('Company Section', () => {
    it('renders company section heading and links', () => {
      expect(screen.getByText('Company')).toBeInTheDocument();
      
      const companyLinks = [
        'About Us',
        'Careers',
        'Contact'
      ];

      companyLinks.forEach(link => {
        const linkElement = screen.getByText(link);
        expect(linkElement).toBeInTheDocument();
        expect(linkElement.tagName.toLowerCase()).toBe('a');
        expect(linkElement).toHaveAttribute('href', '#');
        expect(linkElement).toHaveClass('hover:text-blue-400');
      });
    });
  });

  describe('Legal Section', () => {
    it('renders legal section heading and links', () => {
      expect(screen.getByText('Legal')).toBeInTheDocument();
      
      const legalLinks = [
        'Privacy Policy',
        'Terms of Service',
        'Security'
      ];

      legalLinks.forEach(link => {
        const linkElement = screen.getByText(link);
        expect(linkElement).toBeInTheDocument();
        expect(linkElement.tagName.toLowerCase()).toBe('a');
        expect(linkElement).toHaveAttribute('href', '#');
        expect(linkElement).toHaveClass('hover:text-blue-400');
      });
    });
  });

  describe('Layout and Styling', () => {
    it('renders footer with correct base styles', () => {
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('bg-gray-900', 'text-gray-300', 'py-20');
    });

    it('renders grid layout container', () => {
      const gridContainer = screen.getByRole('contentinfo')
        .querySelector('.container .grid');
      expect(gridContainer).toHaveClass('md:grid-cols-4', 'gap-8');
    });

    it('renders copyright section', () => {
      const copyright = screen.getByText(/© 2024 TelecomFieldOps/);
      expect(copyright).toBeInTheDocument();
      const copyrightContainer = copyright.closest('div');
      expect(copyrightContainer).toHaveClass('border-t', 'border-gray-800', 'mt-12', 'pt-8', 'text-center');
    });
  });
});