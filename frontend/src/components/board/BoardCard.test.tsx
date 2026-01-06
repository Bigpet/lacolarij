/**
 * Tests for BoardCard component
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/test/testUtils";
import { BoardCard } from "./BoardCard";
import type { Issue } from "@/types";

const mockNavigate = vi.fn();

// Mock useNavigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

describe("BoardCard", () => {
  afterEach(() => {
    mockNavigate.mockClear();
  });

  it("should render issue key", () => {
    render(<BoardCard issue={mockIssue} />);

    expect(screen.getByText("TEST-123")).toBeInTheDocument();
  });

  it("should render issue summary", () => {
    render(<BoardCard issue={mockIssue} />);

    expect(screen.getByText("Fix critical login bug")).toBeInTheDocument();
  });

  it("should render bug emoji for Bug issue type", () => {
    render(<BoardCard issue={mockIssue} />);

    expect(screen.getByText("🐛")).toBeInTheDocument();
  });

  it("should render story emoji for Story issue type", () => {
    const storyIssue = { ...mockIssue, issueType: "Story" };

    render(<BoardCard issue={storyIssue} />);

    expect(screen.getByText("📖")).toBeInTheDocument();
  });

  it("should render epic emoji for Epic issue type", () => {
    const epicIssue = { ...mockIssue, issueType: "Epic" };

    render(<BoardCard issue={epicIssue} />);

    expect(screen.getByText("⚡")).toBeInTheDocument();
  });

  it("should render task emoji for Task issue type", () => {
    const taskIssue = { ...mockIssue, issueType: "Task" };

    render(<BoardCard issue={taskIssue} />);

    expect(screen.getByText("📋")).toBeInTheDocument();
  });

  it("should render assignee when assigned", () => {
    render(<BoardCard issue={mockIssue} />);

    expect(screen.getByText("alice")).toBeInTheDocument();
  });

  it("should render Unassigned when not assigned", () => {
    const unassignedIssue = { ...mockIssue, assignee: null };

    render(<BoardCard issue={unassignedIssue} />);

    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });

  it("should render priority with correct color for High priority", () => {
    render(<BoardCard issue={mockIssue} />);

    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("High")).toHaveClass("text-orange-500");
  });

  it("should render priority with correct color for Medium priority", () => {
    const mediumIssue = { ...mockIssue, priority: "Medium" };

    render(<BoardCard issue={mediumIssue} />);

    expect(screen.getByText("Medium")).toHaveClass("text-yellow-500");
  });

  it("should render priority with correct color for Low priority", () => {
    const lowIssue = { ...mockIssue, priority: "Low" };

    render(<BoardCard issue={lowIssue} />);

    expect(screen.getByText("Low")).toHaveClass("text-blue-500");
  });

  it("should render synced status icon", () => {
    render(<BoardCard issue={mockIssue} />);

    // CheckCircle indicates synced status
    const checkCircle = document.querySelector("svg[class*='text-green-500']");
    expect(checkCircle).toBeInTheDocument();
  });

  it("should render pending status icon", () => {
    const pendingIssue = { ...mockIssue, _syncStatus: "pending" as const };

    render(<BoardCard issue={pendingIssue} />);

    // Clock indicates pending status
    const clock = document.querySelector("svg[class*='text-yellow-500']");
    expect(clock).toBeInTheDocument();
  });

  it("should render conflict status icon", () => {
    const conflictIssue = { ...mockIssue, _syncStatus: "conflict" as const };

    render(<BoardCard issue={conflictIssue} />);

    // AlertCircle indicates conflict status
    const alertCircle = document.querySelector("svg[class*='text-red-500']");
    expect(alertCircle).toBeInTheDocument();
  });

  it("should apply dragging styles when isDragging is true", () => {
    const { container } = render(<BoardCard issue={mockIssue} isDragging={true} />);

    const card = container.querySelector("div[class*='rotate-2']");
    expect(card).toBeInTheDocument();
  });

  it("should not apply dragging styles when isDragging is false", () => {
    const { container } = render(<BoardCard issue={mockIssue} isDragging={false} />);

    const card = container.querySelector("div[class*='rotate-2']");
    expect(card).not.toBeInTheDocument();
  });

  it("should navigate on click when not dragging", () => {
    render(<BoardCard issue={mockIssue} isDragging={false} />);

    const card = screen.getByText("Fix critical login bug").closest("div");
    fireEvent.click(card!);

    expect(mockNavigate).toHaveBeenCalledWith("/issues/issue-1");
  });

  it("should not navigate on click when dragging", () => {
    render(<BoardCard issue={mockIssue} isDragging={true} />);

    const card = screen.getByText("Fix critical login bug").closest("div");
    fireEvent.click(card!);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should render empty span when priority is not set", () => {
    const noPriorityIssue = { ...mockIssue, priority: "" };

    render(<BoardCard issue={noPriorityIssue} />);

    // Empty placeholder is rendered instead of priority
    const priorityElements = screen.queryAllByText("High");
    expect(priorityElements.length).toBe(0);
  });
});
