import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-primary opacity-5" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Try it now</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to work smarter?
          </h2>

          <p className="text-xl text-muted-foreground mb-10">
            Start with our demo server to experience JiraLocal, or connect your
            own Jira instance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              onClick={() => navigate('/login')}
            >
              Launch Demo
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg font-semibold rounded-xl border-2 hover:bg-secondary transition-all duration-300"
              onClick={() => (window.location.href = '#docs')}
            >
              Read Documentation
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-border">
            <StatItem value="100%" label="Offline Ready" />
            <StatItem value="<50ms" label="Search Speed" />
            <StatItem value="∞" label="Connections" />
          </div>
        </div>
      </div>
    </section>
  );
};

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <div className="text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
      {value}
    </div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

export default CTASection;
