import {
  Database,
  Wifi,
  WifiOff,
  Search,
  RefreshCcw,
  Shield,
} from 'lucide-react';

const features = [
  {
    icon: WifiOff,
    title: 'True Offline Mode',
    description:
      "Work on your issues without internet. All data is stored locally and syncs when you're back online.",
    colorClass: 'bg-primary/10 text-primary',
  },
  {
    icon: RefreshCcw,
    title: 'Smart Sync',
    description:
      'Intelligent conflict resolution ensures your changes are never lost. Sync happens in the background.',
    colorClass: 'bg-accent/10 text-accent',
  },
  {
    icon: Search,
    title: 'Instant Search',
    description:
      'Blazing fast local search across all your issues. Filter by status, priority, assignee, and more.',
    colorClass: 'bg-primary/10 text-primary',
  },
  {
    icon: Database,
    title: 'Local-First Storage',
    description:
      'Your data lives on your device. Connect multiple Jira instances and switch between them instantly.',
    colorClass: 'bg-green-500/10 text-green-600',
  },
  {
    icon: Wifi,
    title: 'Jira Compatible',
    description:
      'Works with any Jira instance — Cloud or Server. Use our demo server to try it out first.',
    colorClass: 'bg-primary/10 text-primary',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description:
      'Your credentials stay on your device. No data is sent to third-party servers.',
    colorClass: 'bg-accent/10 text-accent',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Built for productivity
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to manage Jira issues efficiently, whether
            you&apos;re online or offline.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ feature }: { feature: (typeof features)[0] }) => {
  const Icon = feature.icon;

  return (
    <div className="group glass rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div
        className={`w-12 h-12 rounded-xl ${feature.colorClass} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {feature.title}
      </h3>
      <p className="text-muted-foreground">{feature.description}</p>
    </div>
  );
};

export default FeaturesSection;
