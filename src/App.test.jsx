// __tests__/App.test.jsx

import { render, screen } from '@testing-library/react';
import App from './App';

// Mock all imported components with simple stubs that render unique text.
jest.mock('./page/Home/Homepage', () => () => <div>Homepage</div>);
jest.mock('./page/login/Login', () => () => <div>Login Page</div>);
jest.mock('./page/login/Signup', () => () => <div>Signup Page</div>);
jest.mock('./page/login/ForgotPwd', () => () => <div>Forgot Password</div>);
jest.mock('./utils/logout', () => () => <div>Logout</div>);
jest.mock('./compoents/PageNotFound', () => () => <div>Page Not Found</div>);

jest.mock('./page/Admin/Dashbord', () => () => <div>Admin Dashboard</div>);
jest.mock('./page/Admin/AdminTaskList', () => () => <div>Admin Task List</div>);
jest.mock('./page/Admin/AdminUserList', () => () => <div>Admin User List</div>);
jest.mock('./page/Admin/AdminEngineerList', () => () => <div>Admin Engineer List</div>);
jest.mock('./page/Admin/AdminEngineerApproval', () => () => <div>Admin Engineer Approval</div>);
jest.mock('./page/Admin/AdminCompletedTasks', () => () => <div>Admin Completed Tasks</div>);
jest.mock('./page/Admin/AdminDeferredTasks', () => () => <div>Admin Deferred Tasks</div>);
jest.mock('./page/Admin/AdminEngineerTasks', () => () => <div>Admin Engineer Tasks</div>);
jest.mock('./page/Admin/AdminHazards', () => () => <div>Hazards Admin</div>);
jest.mock('./page/Admin/AdminHazardsTickets', () => () => <div>Hazards Tickets</div>);
jest.mock('./page/Admin/AdminLayout', () => ({ children }) => <div>AdminLayout {children}</div>);

jest.mock('./page/user/Dashbord', () => () => <div>User Dashboard</div>);
jest.mock('./page/user/UserTickets', () => () => <div>User Ticket List</div>);
jest.mock('./page/user/RaiseTicket', () => () => <div>Raise Ticket</div>);
jest.mock('./page/user/UserProfile', () => () => <div>User Profile</div>);
jest.mock('./page/user/UserLayout', () => ({ children }) => <div>UserLayout {children}</div>);

jest.mock('./page/Engineer/EngineerDashboard', () => () => <div>Engineer Dashboard</div>);
jest.mock('./page/Engineer/AssignedTasks', () => () => <div>Assigned Tasks</div>);
jest.mock('./page/Engineer/TaskAcceptance', () => () => <div>Task Acceptance</div>);
jest.mock('./page/Engineer/Hazards', () => () => <div>Hazards</div>);
jest.mock('./page/Engineer/EngineerProfile', () => () => <div>Engineer Profile</div>);
jest.mock('./page/Engineer/HazardsTicket', () => () => <div>Raise Engineer Tickets</div>);
jest.mock('./page/Engineer/Dashbord', () => () => <div>Engineer Dashboard</div>);
jest.mock('./utils/protectedRoute', () => ({ children }) => <div>ProtectedRoute {children}</div>);

describe('App Routing', () => {
  // Home and Public Routes
  it('renders Homepage at route "/"', () => {
    window.history.pushState({}, 'Test page', '/');
    render(<App />);
    expect(screen.getByText('Homepage')).toBeInTheDocument();
  });

  it('renders Login Page at route "/login"', () => {
    window.history.pushState({}, 'Test page', '/login');
    render(<App />);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders Signup Page at route "/register"', () => {
    window.history.pushState({}, 'Test page', '/register');
    render(<App />);
    expect(screen.getByText('Signup Page')).toBeInTheDocument();
  });

  it('renders Forgot Password at route "/reset"', () => {
    window.history.pushState({}, 'Test page', '/reset');
    render(<App />);
    expect(screen.getByText('Forgot Password')).toBeInTheDocument();
  });

  it('renders Logout at route "/logout"', () => {
    window.history.pushState({}, 'Test page', '/logout');
    render(<App />);
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('renders Page Not Found for an unknown route', () => {
    window.history.pushState({}, 'Test page', '/unknown');
    render(<App />);
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  // User Protected Routes
  it('renders User Dashboard at route "/User"', () => {
    window.history.pushState({}, 'Test page', '/User');
    render(<App />);
    expect(screen.getByText('User Dashboard')).toBeInTheDocument();
  });

  it('renders User Ticket List at route "/User/tickets"', () => {
    window.history.pushState({}, 'Test page', '/User/tickets');
    render(<App />);
    expect(screen.getByText('User Ticket List')).toBeInTheDocument();
  });

  it('renders Raise Ticket at route "/User/RaiseTicket"', () => {
    window.history.pushState({}, 'Test page', '/User/RaiseTicket');
    render(<App />);
    expect(screen.getByText('Raise Ticket')).toBeInTheDocument();
  });

  it('renders User Profile at route "/User/UserProfile"', () => {
    window.history.pushState({}, 'Test page', '/User/UserProfile');
    render(<App />);
    expect(screen.getByText('User Profile')).toBeInTheDocument();
  });

  // Admin Protected Routes
  it('renders Admin Dashboard at route "/admin"', () => {
    window.history.pushState({}, 'Test page', '/admin');
    render(<App />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('renders Admin Task List at route "/admin/tasks"', () => {
    window.history.pushState({}, 'Test page', '/admin/tasks');
    render(<App />);
    expect(screen.getByText('Admin Task List')).toBeInTheDocument();
  });

  it('renders Admin User List at route "/admin/users"', () => {
    window.history.pushState({}, 'Test page', '/admin/users');
    render(<App />);
    expect(screen.getByText('Admin User List')).toBeInTheDocument();
  });

  it('renders Admin Engineer List at route "/admin/engineers"', () => {
    window.history.pushState({}, 'Test page', '/admin/engineers');
    render(<App />);
    expect(screen.getByText('Admin Engineer List')).toBeInTheDocument();
  });

  it('renders Admin Engineer Approval at route "/admin/engineer-approval"', () => {
    window.history.pushState({}, 'Test page', '/admin/engineer-approval');
    render(<App />);
    expect(screen.getByText('Admin Engineer Approval')).toBeInTheDocument();
  });

  it('renders Admin Completed Tasks at route "/admin/completed-tasks"', () => {
    window.history.pushState({}, 'Test page', '/admin/completed-tasks');
    render(<App />);
    expect(screen.getByText('Admin Completed Tasks')).toBeInTheDocument();
  });

  it('renders Admin Deferred Tasks at route "/admin/deferred"', () => {
    window.history.pushState({}, 'Test page', '/admin/deferred');
    render(<App />);
    expect(screen.getByText('Admin Deferred Tasks')).toBeInTheDocument();
  });

  it('renders Admin Engineer Tasks at route "/admin/engineer/someemail"', () => {
    window.history.pushState({}, 'Test page', '/admin/engineer/someemail');
    render(<App />);
    expect(screen.getByText('Admin Engineer Tasks')).toBeInTheDocument();
  });

  it('renders Hazards Admin at route "/admin/hazards"', () => {
    window.history.pushState({}, 'Test page', '/admin/hazards');
    render(<App />);
    expect(screen.getByText('Hazards Admin')).toBeInTheDocument();
  });

  it('renders Hazards Tickets at route "/admin/hazardsTickets"', () => {
    window.history.pushState({}, 'Test page', '/admin/hazardsTickets');
    render(<App />);
    expect(screen.getByText('Hazards Tickets')).toBeInTheDocument();
  });

  // Engineer Protected Routes
  it('renders Engineer Dashboard at route "/engineer"', () => {
    window.history.pushState({}, 'Test page', '/engineer');
    render(<App />);
    expect(screen.getByText('Engineer Dashboard')).toBeInTheDocument();
  });

  it('renders Task Acceptance at route "/engineer/task/acceptance"', () => {
    window.history.pushState({}, 'Test page', '/engineer/task/acceptance');
    render(<App />);
    expect(screen.getByText('Task Acceptance')).toBeInTheDocument();
  });

  it('renders Assigned Tasks at route "/engineer/AssignedTasks"', () => {
    window.history.pushState({}, 'Test page', '/engineer/AssignedTasks');
    render(<App />);
    expect(screen.getByText('Assigned Tasks')).toBeInTheDocument();
  });

  it('renders Hazards at route "/engineer/Hazards"', () => {
    window.history.pushState({}, 'Test page', '/engineer/Hazards');
    render(<App />);
    expect(screen.getByText('Hazards')).toBeInTheDocument();
  });

  it('renders Engineer Profile at route "/engineer/Profile"', () => {
    window.history.pushState({}, 'Test page', '/engineer/Profile');
    render(<App />);
    expect(screen.getByText('Engineer Profile')).toBeInTheDocument();
  });

  it('renders Raise Engineer Tickets at route "/engineer/RiseTickets"', () => {
    window.history.pushState({}, 'Test page', '/engineer/RiseTickets');
    render(<App />);
    expect(screen.getByText('Raise Engineer Tickets')).toBeInTheDocument();
  });
});