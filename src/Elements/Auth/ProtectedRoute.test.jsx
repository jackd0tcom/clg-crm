/** @vitest-environment happy-dom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import ProtectedRoute from "./ProtectedRoute.jsx";

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: vi.fn(),
}));

const renderProtected = (ui) =>
  render(
    <MemoryRouter initialEntries={["/app"]}>
      <Routes>
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/" element={<div>home page</div>} />
        <Route path="/denied" element={<div>denied page</div>} />
        <Route path="/app" element={ui} />
      </Routes>
    </MemoryRouter>,
  );

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects unauthenticated users to login", () => {
    useAuth0.mockReturnValue({ isAuthenticated: false });

    renderProtected(
      <ProtectedRoute>
        <div>secret</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("login page")).toBeInTheDocument();
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
  });

  it("redirects non-admins away from admin routes", () => {
    useAuth0.mockReturnValue({ isAuthenticated: true });

    renderProtected(
      <ProtectedRoute requireAdmin userStore={{ isAdmin: false, isAllowed: true }}>
        <div>admin only</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("home page")).toBeInTheDocument();
    expect(screen.queryByText("admin only")).not.toBeInTheDocument();
  });

  it("redirects users who are not allowed to the denied page", () => {
    useAuth0.mockReturnValue({ isAuthenticated: true });

    renderProtected(
      <ProtectedRoute userStore={{ isAllowed: false }}>
        <div>secret</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("denied page")).toBeInTheDocument();
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
  });

  it("renders children when the user is authenticated and allowed", () => {
    useAuth0.mockReturnValue({ isAuthenticated: true });

    renderProtected(
      <ProtectedRoute userStore={{ isAllowed: true }}>
        <div>secret</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("secret")).toBeInTheDocument();
  });

  it("renders admin children for an allowed admin", () => {
    useAuth0.mockReturnValue({ isAuthenticated: true });

    renderProtected(
      <ProtectedRoute requireAdmin userStore={{ isAdmin: true, isAllowed: true }}>
        <div>admin only</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("admin only")).toBeInTheDocument();
  });
});
