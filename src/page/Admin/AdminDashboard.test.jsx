// src/page/Admin/AdminDashboard.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';

// Mock all child components
jest.mock('./Sidebar.jsx', () => {
    return function MockSidebar() {
        return <div data-testid="sidebar">Mock Sidebar</div>;
    };
});

jest.mock('../../compoents/Navbar', () => {
    return function MockNavbar() {
        return <div data-testid="navbar">Mock Navbar</div>;
    };
});

jest.mock('./NavBar', () => {
    return function MockAdminNavbar() {
        return <div data-testid="admin-navbar">Mock Admin Navbar</div>;
    };
});

jest.mock('./AdminTaskList.jsx', () => {
    return function MockAdminTaskList() {
        return <div data-testid="admin-task-list">Mock Admin Task List</div>;
    };
});

// Initial state for the mock store
const initialState = {
    engineer: {
        tasks: [],
        profiledata: {},
        updateProfile: false,
        error: null
    },
    admin: {
        tasks: [],
        loading: false,
        error: null
    }
};

describe('AdminDashboard Component', () => {
    // Helper function to create a mock store with default state
    const createMockStore = (customState = {}) => {
        return createStore(() => ({
            ...initialState,
            ...customState
        }));
    };

    // Helper function to render with providers at a specific route
    const renderWithProviders = (component, store, initialRoute = '/') => {
        return render(
            <MemoryRouter initialEntries={[initialRoute]}>
                <Provider store={store}>
                    <Routes>
                        <Route path="/*" element={component} />
                    </Routes>
                </Provider>
            </MemoryRouter>
        );
    };

    test('renders sidebar and admin navbar on all routes', () => {
        const store = createMockStore();
        renderWithProviders(<AdminDashboard />, store);

        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('admin-navbar')).toBeInTheDocument();
    });

    test('renders navbar when not on /admin/tasks route', () => {
        const store = createMockStore();
        renderWithProviders(<AdminDashboard />, store, '/admin/dashboard');

        expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    test('does not render navbar on /admin/tasks route', () => {
        const store = createMockStore();
        renderWithProviders(<AdminDashboard />, store, '/admin/tasks');

        expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
    });

    test('renders AdminTaskList on /admin/tasks route', () => {
        const store = createMockStore();
        renderWithProviders(<AdminDashboard />, store, '/admin/tasks');

        expect(screen.getByTestId('admin-task-list')).toBeInTheDocument();
    });

    test('applies correct layout classes', () => {
        const store = createMockStore();
        const { container } = renderWithProviders(<AdminDashboard />, store);

        // Check for main container flex class
        expect(container.querySelector('.flex')).toBeInTheDocument();

        // Check for content container classes
        const contentContainer = container.querySelector('.grow.ml-16.md\\:ml-64');
        expect(contentContainer).toBeInTheDocument();
        expect(contentContainer).toHaveClass('bg-gray-100');
        expect(contentContainer).toHaveClass('text-gray-900');
        expect(contentContainer).toHaveClass('dark:bg-gray-900');
        expect(contentContainer).toHaveClass('dark:text-white');
        expect(contentContainer).toHaveClass('p-6');
    });
});