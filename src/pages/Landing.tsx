import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import ContentAnalysisAnimation from "@/components/ContentAnalysisAnimation";
import { ArrowRight, Zap, Shield, BarChart3, Sparkles } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b-2 border-foreground">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="#features"
              className="text-sm font-medium uppercase tracking-wider hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              to="#pricing"
              className="text-sm font-medium uppercase tracking-wider hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="#docs"
              className="text-sm font-medium uppercase tracking-wider hover:text-primary transition-colors"
            >
              Docs
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="uppercase tracking-wider">
                Sign in
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="default" size="sm" className="uppercase tracking-wider shadow-brutal-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 brutal-border bg-secondary mb-8 animate-fade-in uppercase tracking-widest text-xs font-bold">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Now with advanced code extraction</span>
          </div>

          {/* Grid layout */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left column - Text */}
            <div className="animate-fade-in-up">
              <h1 className="text-6xl md:text-8xl font-black leading-[0.9] mb-8 uppercase">
                Content
                <br />
                Analysis
                <br />
                <span className="text-primary">Engine</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-lg mb-10 leading-relaxed">
                Transform any URL into structured insights. Extract text, code,
                and media. Understand content at scale.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button
                    variant="default"
                    size="xl"
                    className="group uppercase tracking-wider font-bold shadow-brutal hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-brutal-lg transition-all"
                  >
                    Start Analyzing
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="xl"
                    className="uppercase tracking-wider font-bold brutal-border hover:bg-secondary transition-colors"
                  >
                    View Demo
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right column - Animation */}
            <div className="animate-fade-in-up stagger-2 opacity-0">
              <ContentAnalysisAnimation />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-20 animate-fade-in-up stagger-3 opacity-0">
            {[
              { value: "1.2M+", label: "URLS ANALYZED" },
              { value: "50ms", label: "AVG RESPONSE" },
              { value: "99.9%", label: "UPTIME SLA" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="brutal-border p-6 bg-card hover-lift"
              >
                <div className="text-4xl md:text-5xl font-black text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-5xl md:text-6xl font-black uppercase mb-4">
              Powerful
              <br />
              <span className="text-primary">Features</span>
            </h2>
            <p className="text-muted-foreground max-w-xl text-lg">
              Everything you need to understand any content on the web.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Zap,
                title: "LIGHTNING FAST",
                description:
                  "Sub-50ms analysis powered by distributed edge computing. Real-time results.",
              },
              {
                icon: Shield,
                title: "SECURE BY DEFAULT",
                description:
                  "Enterprise-grade encryption. Your data never stored. Complete privacy.",
              },
              {
                icon: BarChart3,
                title: "DEEP INSIGHTS",
                description:
                  "Sentiment, readability, and semantic analysis built-in. Actionable data.",
              },
              {
                icon: Sparkles,
                title: "AI-POWERED",
                description:
                  "GPT-4 integration for intelligent content summarization. Future-ready.",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="group brutal-border bg-card p-8 hover-lift animate-fade-in-up opacity-0"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <div className="w-16 h-16 brutal-border bg-primary flex items-center justify-center mb-6 group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-transform">
                  <feature.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-black mb-3 uppercase tracking-wider">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="brutal-border bg-card p-12 md:p-16 relative">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 bg-primary" />
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary" />

            <h2 className="text-4xl md:text-6xl font-black uppercase mb-6 text-center">
              Ready to
              <br />
              <span className="text-primary">Get Started?</span>
            </h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto text-center text-lg">
              Join thousands of developers and analysts using ContentAI.
            </p>
            <div className="flex justify-center">
              <Link to="/signup">
                <Button
                  variant="default"
                  size="xl"
                  className="group uppercase tracking-wider font-bold shadow-brutal hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-brutal-lg transition-all"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-foreground py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo />
          <div className="flex items-center gap-8 text-sm uppercase tracking-wider font-medium">
            <Link
              to="#"
              className="hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="#"
              className="hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              to="#"
              className="hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider">
            © 2024 ContentAI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
