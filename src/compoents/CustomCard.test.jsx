// src/components/CustomCard.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import CustomCard from "./CustomCard";

// Dummy Icon component to simulate an icon and verify className
const DummyIcon = ({ className }) => (
  <div data-testid="dummy-icon" className={className}>
    Dummy Icon
  </div>
);

describe("CustomCard Component", () => {
  test("renders title and children correctly", () => {
    render(
      <CustomCard title="Test Title">
        <p>Test Child Content</p>
      </CustomCard>
    );
    // Verify that the title is rendered
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    // Verify that the children content is rendered
    expect(screen.getByText("Test Child Content")).toBeInTheDocument();
  });

  test("renders the icon when provided", () => {
    render(
      <CustomCard title="Card With Icon" icon={DummyIcon}>
        <p>Child Content</p>
      </CustomCard>
    );
    // Check that the DummyIcon is rendered
    const iconElement = screen.getByTestId("dummy-icon");
    expect(iconElement).toBeInTheDocument();
    // Verify that the DummyIcon receives the expected class
    expect(iconElement).toHaveClass("text-yellow-500");
  });

  test("does not render an icon when not provided", () => {
    render(
      <CustomCard title="Card Without Icon">
        <p>Child Content</p>
      </CustomCard>
    );
    // There should be no element with the test id "dummy-icon"
    expect(screen.queryByTestId("dummy-icon")).toBeNull();
  });
});
