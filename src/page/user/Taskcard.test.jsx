import React from "react";
import { render, screen } from "@testing-library/react";
import TaskCard from './Taskcard';

describe("TaskCard Component", () => {
  const mockTask = {
    serviceType: "Installation",
    status: "open",
    description: "Fix internet issues",
    address: "123 Main St",
    pincode: "123456",
    priority: "high",
    engineerEmail: "engineer@example.com",
    createdAt: "2024-02-29T12:00:00Z",
    updatedAt: "2024-03-01T15:00:00Z",
  };

  test("renders task details correctly", () => {
    render(<TaskCard task={mockTask} showPriority={true} assignEngineer={true} />);
    
    expect(screen.getByText(/Service Type : Installation/i)).toBeInTheDocument();
    expect(screen.getByText(/Status : open/i)).toBeInTheDocument();
    expect(screen.getByText(/Description : Fix internet issues/i)).toBeInTheDocument();
    expect(screen.getByText(/Address : 123 Main St/i)).toBeInTheDocument();
    expect(screen.getByText(/Pincode : 123456/i)).toBeInTheDocument();
    expect(screen.getByText(/Assigned Engineer : engineer@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Created At:/i)).toBeInTheDocument();
    expect(screen.getByText(/Updated At:/i)).toBeInTheDocument();
  });

  test("applies correct status styles", () => {
    const { rerender } = render(<TaskCard task={{ ...mockTask, status: "completed" }} />);
    expect(screen.getByText(/Status : completed/i)).toHaveClass("text-green-600");

    rerender(<TaskCard task={{ ...mockTask, status: "in-progress" }} />);
    expect(screen.getByText(/Status : in-progress/i)).toHaveClass("text-blue-600");

    rerender(<TaskCard task={{ ...mockTask, status: "failed" }} />);
    expect(screen.getByText(/Status : failed/i)).toHaveClass("text-red-600");

    rerender(<TaskCard task={{ ...mockTask, status: "unknown-status" }} />);
    expect(screen.getByText(/Status : unknown-status/i)).toHaveClass("text-gray-600");
  });

  test("displays correct priority indicator", () => {
    render(<TaskCard task={mockTask} showPriority={true} />);
    expect(screen.getByText(/high priority/i)).toBeInTheDocument();
  });

  test("handles missing task fields gracefully", () => {
    render(<TaskCard task={{}} showPriority={true} />);
    expect(screen.queryByText(/Service Type/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Description/i)).not.toBeInTheDocument();
  });

  test("handles missing createdAt and updatedAt gracefully", () => {
    render(<TaskCard task={{ ...mockTask, createdAt: undefined, updatedAt: undefined }} />);
    expect(screen.queryByText(/Created At/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Updated At/i)).not.toBeInTheDocument();
  });

  test("does not render priority when showPriority is false", () => {
    render(<TaskCard task={mockTask} showPriority={false} />);
    expect(screen.queryByText(/priority/i)).not.toBeInTheDocument();
  });

  test("handles missing priority gracefully", () => {
    render(<TaskCard task={{ ...mockTask, priority: undefined }} showPriority={true} />);
    expect(screen.getByText(/priority/i)).toBeInTheDocument();
  });

  test("renders assigned engineer details when assignEngineer is true", () => {
    render(<TaskCard task={mockTask} assignEngineer={true} />);
    expect(screen.getByText(/Assigned Engineer : engineer@example.com/i)).toBeInTheDocument();
  });

  test("does not render engineer details when assignEngineer is false", () => {
    render(<TaskCard task={mockTask} assignEngineer={false} />);
    expect(screen.queryByText(/Assigned Engineer/i)).not.toBeInTheDocument();
  });
});
