// src/components/SkeletonLoading.test.jsx
import React from 'react';
import { render } from '@testing-library/react';
import SkeletonLoading from './Loadingpage';

describe('SkeletonLoading Component', () => {
  test('renders header skeleton', () => {
    const { container } = render(<SkeletonLoading />);
    // The header skeleton container should have these Tailwind classes
    const headerSkeleton = container.querySelector('div.flex.items-center.justify-between.mb-8');
    expect(headerSkeleton).toBeInTheDocument();

    // Verify the header contains at least two child elements (left side texts and right side pulse)
    expect(headerSkeleton.children.length).toBeGreaterThanOrEqual(2);
  });

  test('renders search bar skeleton', () => {
    const { container } = render(<SkeletonLoading />);
    // The search bar has these classes
    const searchBar = container.querySelector('div.h-12.w-full.bg-gray-200.rounded-lg.animate-pulse.mb-8');
    expect(searchBar).toBeInTheDocument();
  });

  test('renders 6 card skeletons', () => {
    const { container } = render(<SkeletonLoading />);
    // The grid container has the cards; each card skeleton has these classes:
    const cardSkeletons = container.querySelectorAll('div.grid div.border.border-gray-200.rounded-lg.p-4.space-y-4');
    expect(cardSkeletons.length).toBe(6);
  });

  test('renders pagination skeleton with 3 items', () => {
    const { container } = render(<SkeletonLoading />);
    // The pagination container has these classes
    const paginationContainer = container.querySelector('div.flex.justify-center.items-center.space-x-2.mt-8');
    expect(paginationContainer).toBeInTheDocument();
    
    // Each pagination item should have these classes
    const paginationItems = paginationContainer.querySelectorAll('div.h-8.w-8.bg-gray-200.rounded.animate-pulse');
    expect(paginationItems.length).toBe(3);
  });
});
