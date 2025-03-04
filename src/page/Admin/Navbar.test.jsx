import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./NavBar";

// Mock Lucide icons
jest.mock("lucide-react", () => ({
  LogOut: () => <svg data-testid="logout-icon" />, 
}));

describe("Navbar Component", () => {
  // Helper function to render with providers
  const renderWithProviders = (component) => {
    return render(<MemoryRouter>{component}</MemoryRouter>);
  };

  test("renders navbar correctly", () => {
    renderWithProviders(<Navbar />);

    expect(screen.getByText("Telecom Services")).toBeInTheDocument();
    expect(screen.getByTestId("logout-icon")).toBeInTheDocument();
    expect(screen.getByText("Admin Name")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  test("renders the profile section correctly", () => {
    renderWithProviders(<Navbar />);

    expect(screen.getByText("Admin Name")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument(); // Profile circle
  });
});
