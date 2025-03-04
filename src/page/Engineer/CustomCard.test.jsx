import React from "react";
import { render, screen } from "@testing-library/react";
import CustomCard from "./CustomCard";
import { FaUser } from "react-icons/fa";

describe("CustomCard Component", () => {
  test("renders CustomCard component without crashing", () => {
    render(<CustomCard title="Test Title">Test Content</CustomCard>);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  test("displays the title correctly", () => {
    render(<CustomCard title="Dashboard">Sample Content</CustomCard>);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  test("renders child content inside the card", () => {
    render(
      <CustomCard title="Card Title">
        <p data-testid="child-content">This is inside the card</p>
      </CustomCard>
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(screen.getByText("This is inside the card")).toBeInTheDocument();
  });

  test("renders the provided icon", () => {
    render(<CustomCard title="Profile" icon={FaUser}>User Content</CustomCard>);

    expect(screen.getByText("Profile")).toBeInTheDocument();
    
    // Ensure the icon is rendered correctly
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  test("does not render an icon when not provided", () => {
    render(<CustomCard title="No Icon Card">Some Content</CustomCard>);

    expect(screen.getByText("No Icon Card")).toBeInTheDocument();
    expect(screen.queryByTestId("custom-icon")).not.toBeInTheDocument();
  });
});
