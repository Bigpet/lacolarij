import { Github } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3">
            <Logo size={28} />
            <span className="font-bold text-lg text-foreground">LaColaRij</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#docs" className="hover:text-foreground transition-colors">
              Documentation
            </a>
            <a
              href="#privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </a>
            <a
              href="#terms"
              className="hover:text-foreground transition-colors"
            >
              Terms
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Bigpet/lacolarij"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} LaColaRij. Built for developers
            who work anywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
