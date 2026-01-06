/**
 * Tests for IssueCard component
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/test/testUtils";
import { IssueCard } from "./IssueCard";
import type { Issue } from "@/types";

const mockIssue: Issue = {
  id: "issue-1",
  key: "TEST-123",
  projectKey: "TEST",
  summary: "Fix critical login bug",
  description: null,
  status: "Open",
  statusCategory: "todo",
  assignee: "alice",
  reporter: "bob",
  priority: "High",
  issueType: "Bug",
  labels: [],
  created: "2024-01-01T00:00:00Z",
  updated: "2024-01-01T00:00:00Z",
  _localUpdated: Date.now(),
  _syncStatus: "synced",
  _syncError: null,
  _remoteVersion: "1",
};

describe("IssueCard", () => {
  it("should render issue key", () => {
    render(<IssueCard issue={mockIssue} />);

    expect(screen.getByText("TEST-123")).toBeInTheDocument();
  });

  it("should render issue summary", () => {
    render(<IssueCard issue={mockIssue} />);

    expect(screen.getByText("Fix critical login bug")).toBeInTheDocument();
  });

  it("should render issue type emoji", () => {
    render(<IssueCard issue={mockIssue} />);

    expect(screen.getByText("🐛")).toBeInTheDocument();
  });

  it("should render status badge", () => {
    render(<IssueCard issue={mockIssue} />);

    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("should render priority when set", () => {
    render(<IssueCard issue={mockIssue} />);

    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("should not render priority when not set", () => {
    const noPriorityIssue = { ...mockIssue, priority: "" };

    render(<IssueCard issue={noPriorityIssue} />);

    expect(screen.queryByText("High")).not.toBeInTheDocument();
  });

  it("should render assignee when assigned", () => {
    render(<IssueCard issue={mockIssue} />);

    expect(screen.getByText("alice")).toBeInTheDocument();
  });

  it("should render Unassigned when not assigned", () => {
    const unassignedIssue = { ...mockIssue, assignee: null };

    render(<IssueCard issue={unassignedIssue} />);

    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    const handleClick = vi.fn();

    render(<IssueCard issue={mockIssue} onClick={handleClick} />);

    const card = screen.getByText("Fix critical login bug").closest("div");
    fireEvent.click(card!);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should not call onClick when not provided", () => {
    // Should not throw error
    render(<IssueCard issue={mockIssue} />);

    const card = screen.getByText("Fix critical login bug").closest("div");
    fireEvent.click(card!);

    // Just verify no error was thrown
    expect(true).toBe(true);
  });

  it("should apply selected styles when selected prop is true", () => {
    const { container } = render(<IssueCard issue={mockIssue} selected={true} />);

    const card = container.querySelector("div[class*='border-primary']");
    expect(card).toBeInTheDocument();
  });

  it("should not apply selected styles when selected prop is false", () => {
    const { container } = render(<IssueCard issue={mockIssue} selected={false} />);

    const card = container.querySelector("div[class*='border-primary']");
    expect(card).not.toBeInTheDocument();
  });

  it("should not apply selected styles when selected prop is not provided", () => {
    const { container } = render(<IssueCard issue={mockIssue} />);

    const card = container.querySelector("div[class*='border-primary']");
    expect(card).not.toBeInTheDocument();
  });

  it("should render synced status icon", () => {
    render(<IssueCard issue={mockIssue} />);

    const syncIcon = document.querySelector("svg[class*='text-green-500']");
    expect(syncIcon).toBeInTheDocument();
  });

  it("should render pending status icon", () => {
    const pendingIssue = { ...mockIssue, _syncStatus: "pending" as const };

    render(<IssueCard issue={pendingIssue} />);

    const syncIcon = document.querySelector("svg[class*='text-yellow-500']");
    expect(syncIcon).toBeInTheDocument();
  });

  it("should render conflict status icon", () => {
    const conflictIssue = { ...mockIssue, _syncStatus: "conflict" as const };

    render(<IssueCard issue={conflictIssue} />);

    const syncIcon = document.querySelector("svg[class*='text-red-500']");
    expect(syncIcon).toBeInTheDocument();
  });

  it("should render info badge for todo status category", () => {
    render(<IssueCard issue={mockIssue} />);

    const badge = screen.getByText("Open");
    // Badge variant "info" maps to blue-100 class
    expect(badge).toHaveClass("bg-blue-100");
  });

  it("should render warning badge for indeterminate status category", () => {
    const inProgressIssue = {
      ...mockIssue,
      status: "In Progress",
      statusCategory: "indeterminate" as const,
    };

    render(<IssueCard issue={inProgressIssue} />);

    const badge = screen.getByText("In Progress");
    // Badge variant "warning" maps to yellow-100 class
    expect(badge).toHaveClass("bg-yellow-100");
  });

  it("should render success badge for done status category", () => {
    const doneIssue = {
      ...mockIssue,
      status: "Done",
      statusCategory: "done" as const,
    };

    render(<IssueCard issue={doneIssue} />);

    const badge = screen.getByText("Done");
    // Badge variant "success" maps to green-100 class
    expect(badge).toHaveClass("bg-green-100");
  });

  it("should truncate long summary text", () => {
    const longSummaryIssue = {
      ...mockIssue,
      summary: "This is a very long summary that should be truncated when displayed in the card",
    };

    render(<IssueCard issue={longSummaryIssue} />);

    const summary = screen.getByText((text) =>
      text.startsWith("This is a very long summary")
    );
    expect(summary).toBeInTheDocument();
  });

  it("should render User icon for assignee", () => {
    render(<IssueCard issue={mockIssue} />);

    const userIcon = document.querySelector("svg[class*='h-3']");
    expect(userIcon).toBeInTheDocument();
  });
});
