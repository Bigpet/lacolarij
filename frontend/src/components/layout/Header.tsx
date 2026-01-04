import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";

export function Header() {
  const { user, logout } = useAuthStore();

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl">
          JiraLocal
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            to="/issues"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Issues
          </Link>
          <Link
            to="/board"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Board
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user && (
            <span className="text-sm text-muted-foreground">
              {user.username}
            </span>
          )}
          <Link
            to="/settings"
            className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
