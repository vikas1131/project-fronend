// src/compoents/EngineerNavbar.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import EngineerNavbar from "./Navbar";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

// Create a dummy store with minimal slices needed for EngineerNavbar
const store = configureStore({
  reducer: {
    engineer: (state = { profiledata: { name: "Test Engineer" } }) => state,
    notifications: (state = { notifications: [{ isRead: false }, { isRead: true }] }) => state,
  },
});

describe("EngineerNavbar Component", () => {
  test("renders correctly with provided props", () => {
    const mockToggleTheme = jest.fn();
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <EngineerNavbar onToggleTheme={mockToggleTheme} isDarkMode={false} />
        </BrowserRouter>
      </Provider>
    );

    // Verify that the header text is rendered.
    expect(screen.getByText(/Telecom Services/i)).toBeInTheDocument();
    // Verify that the profile name is rendered.
    expect(screen.getByText("Test Engineer")).toBeInTheDocument();

    // Verify that the Logout link (provided by <Link> from react-router-dom) exists.
    const logoutLink = screen.getByRole("link", { name: /logout/i });
    expect(logoutLink).toBeInTheDocument();
  });

  test("calls theme toggle when button is clicked", () => {
    const mockToggleTheme = jest.fn();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <EngineerNavbar onToggleTheme={mockToggleTheme} isDarkMode={false} />
        </BrowserRouter>
      </Provider>
    );

    // Find the theme toggle button by checking for Sun or Moon icon.
    // For simplicity, check that a button exists that calls onToggleTheme.
    const toggleButton = screen.getByRole("button", {
      name: "",
    });
    // Simulate a click.
    fireEvent.click(toggleButton);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});
