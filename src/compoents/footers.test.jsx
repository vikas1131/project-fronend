// src/components/Footer.test.jsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from './footers';

describe('Footer', () => {
  test('renders Footer component', () => {
    render(<Footer />);
    const footerElement = screen.getByRole('contentinfo');
    expect(footerElement).toBeInTheDocument();
  });

  test('displays the correct company name and tagline', () => {
    render(<Footer />);
    const companyName = screen.getByText('SwiftLink Telecom Services');
    const tagline = screen.getByText('Connecting you to the world with reliable telecom solutions.');
    expect(companyName).toBeInTheDocument();
    expect(tagline).toBeInTheDocument();
  });

  test('renders social media icons', () => {
    render(<Footer />);
    const facebookIcon = screen.getByLabelText('Facebook');
    const twitterIcon = screen.getByLabelText('Twitter');
    const linkedinIcon = screen.getByLabelText('LinkedIn');
    const githubIcon = screen.getByLabelText('GitHub');
    expect(facebookIcon).toBeInTheDocument();
    expect(twitterIcon).toBeInTheDocument();
    expect(linkedinIcon).toBeInTheDocument();
    expect(githubIcon).toBeInTheDocument();
  });

  test('displays copyright information', () => {
    render(<Footer />);
    const copyright = screen.getByText(/© 2025 SwiftLink Telecom Services. All rights reserved./);
    expect(copyright).toBeInTheDocument();
  });
});