import { ArrowRight, Zap, Cloud, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '3s' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Local-first Jira experience
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Work offline.</span>
            <br />
            <span className="text-gradient-primary">Sync when ready.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
            JiraLocal connects to your Jira instance, letting you search, edit,
            and manage issues offline — then sync seamlessly when you&apos;re back
            online.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              onClick={() => navigate('/login')}
            >
              Go to Demo
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg font-semibold rounded-xl border-2 hover:bg-secondary transition-all duration-300"
              onClick={() => navigate('/login')}
            >
              Connect Jira
            </Button>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-12">
            <FeaturePill
              icon={<Cloud className="w-4 h-4" />}
              text="Works Offline"
            />
            <FeaturePill
              icon={<RefreshCw className="w-4 h-4" />}
              text="Auto Sync"
            />
            <FeaturePill
              icon={<Zap className="w-4 h-4" />}
              text="Lightning Fast"
            />
          </div>
        </div>

        {/* Hero illustration - floating cards */}
        <div className="mt-20 relative max-w-5xl mx-auto">
          <div className="relative">
            {/* Main board preview */}
            <div className="glass rounded-2xl p-6 shadow-lg">
              <div className="flex gap-4 overflow-hidden">
                {/* To Do Column */}
                <BoardColumn
                  title="To Do"
                  count={3}
                  colorClass="bg-status-todo"
                >
                  <IssueCard
                    id="DEMO-5"
                    title="Add unit tests for API"
                    priority="medium"
                  />
                  <IssueCard
                    id="DEMO-3"
                    title="Design landing page"
                    priority="medium"
                  />
                </BoardColumn>

                {/* In Progress Column */}
                <BoardColumn
                  title="In Progress"
                  count={2}
                  colorClass="bg-status-in-progress"
                >
                  <IssueCard
                    id="DEMO-4"
                    title="Fix responsive layout"
                    priority="high"
                  />
                  <IssueCard
                    id="DEMO-2"
                    title="Implement auth"
                    priority="high"
                  />
                </BoardColumn>

                {/* Done Column */}
                <BoardColumn title="Done" count={2} colorClass="bg-status-done">
                  <IssueCard
                    id="DEMO-1"
                    title="Setup environment"
                    priority="high"
                  />
                </BoardColumn>
              </div>
            </div>

            {/* Floating sync indicator */}
            <div
              className="absolute -top-4 -right-4 glass rounded-xl px-4 py-2 shadow-lg animate-float"
              style={{ animationDelay: '1s' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-status-done rounded-full animate-pulse" />
                <span className="text-sm font-medium">Synced</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturePill = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
    {icon}
    {text}
  </div>
);

const BoardColumn = ({
  title,
  count,
  colorClass,
  children,
}: {
  title: string;
  count: number;
  colorClass: string;
  children: React.ReactNode;
}) => (
  <div className="flex-1 min-w-[200px]">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${colorClass}`} />
        <span className="font-semibold text-foreground">{title}</span>
      </div>
      <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
        {count}
      </span>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const IssueCard = ({
  id,
  title,
  priority,
}: {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
}) => {
  const priorityColors = {
    high: 'text-priority-high',
    medium: 'text-priority-medium',
    low: 'text-priority-low',
  };

  return (
    <div className="bg-card rounded-lg p-3 shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-primary font-mono">{id}</span>
        <div className="w-4 h-4 rounded-full bg-status-done/20 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-status-done" />
        </div>
      </div>
      <p className="text-sm font-medium text-foreground line-clamp-2">
        {title}
      </p>
      <p className={`text-xs mt-2 capitalize ${priorityColors[priority]}`}>
        {priority}
      </p>
    </div>
  );
};

export default HeroSection;
