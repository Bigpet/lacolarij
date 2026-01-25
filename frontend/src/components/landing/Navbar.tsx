import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <Logo size={32} />
            <span className="font-bold text-xl text-foreground">LaColaRij</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#docs">Docs</NavLink>
            <NavLink href="https://github.com/Bigpet/lacolarij" external>
              GitHub
            </NavLink>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              className="font-medium"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
            <Button
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium shadow-sm"
              onClick={() => navigate('/login')}
            >
              Go to Demo
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <NavLink href="#features" mobile>
                Features
              </NavLink>
              <NavLink href="#docs" mobile>
                Docs
              </NavLink>
              <NavLink
                href="https://github.com/Bigpet/lacolarij"
                external
                mobile
              >
                GitHub
              </NavLink>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  className="justify-start font-medium"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium"
                  onClick={() => navigate('/login')}
                >
                  Go to Demo
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const NavLink = ({
  href,
  children,
  mobile = false,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  mobile?: boolean;
  external?: boolean;
}) => (
  <a
    href={href}
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
    className={`text-muted-foreground hover:text-foreground transition-colors font-medium ${
      mobile ? 'py-2' : ''
    }`}
  >
    {children}
  </a>
);

export default Navbar;
