import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { IssuesPage } from "@/pages/IssuesPage";
import { BoardPage } from "@/pages/BoardPage";
import { SettingsPage } from "@/pages/SettingsPage";

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();

  // Redirect to dashboard if already logged in
  if (token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/issues" element={<IssuesPage />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
