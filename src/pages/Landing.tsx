import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { ArrowRight, Sparkles, Zap, Shield, BarChart3 } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            <Link to="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link to="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link to="#docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button variant="default" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm">Now with advanced code extraction</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 animate-fade-in-up">
            Content analysis
            <br />
            <span className="text-gradient">made intelligent.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-2 opacity-0">
            Transform any URL into structured insights. Extract text, code, and media. 
            Understand content at scale with AI-powered analysis.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-3 opacity-0">
            <Link to="/signup">
              <Button variant="hero" size="xl" className="group">
                Start analyzing free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="xl">
                View demo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-12 mt-16 animate-fade-in-up stagger-4 opacity-0">
            {[
              { value: "1.2M+", label: "URLs analyzed" },
              { value: "50ms", label: "Avg. response" },
              { value: "99.9%", label: "Uptime SLA" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-gradient">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview mockup */}
        <div className="max-w-4xl mx-auto mt-20 animate-fade-in-up stagger-5 opacity-0">
          <div className="glass rounded-2xl p-6 hover-lift">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-destructive/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <div className="flex-1 ml-4">
                <div className="bg-secondary rounded-md h-8 flex items-center px-4 text-sm text-muted-foreground max-w-md">
                  https://example.com/article
                </div>
              </div>
            </div>
            <div className="bg-background/50 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm text-muted-foreground">Analyzing content...</span>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-secondary rounded-full w-full" />
                <div className="h-2 bg-secondary rounded-full w-4/5" />
                <div className="h-2 bg-secondary rounded-full w-3/5" />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4">
                {["Text", "Code", "Media"].map((type) => (
                  <div key={type} className="bg-secondary/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {type === "Text" ? "2.4k" : type === "Code" ? "156" : "24"}
                    </div>
                    <div className="text-xs text-muted-foreground">{type} blocks</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-gradient-to-b from-background to-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful analysis, <span className="text-gradient">simple interface</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to understand any content on the web.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: "Lightning fast",
                description: "Sub-50ms analysis powered by distributed edge computing.",
              },
              {
                icon: Shield,
                title: "Secure by default",
                description: "Enterprise-grade encryption. Your data never stored.",
              },
              {
                icon: BarChart3,
                title: "Deep insights",
                description: "Sentiment, readability, and semantic analysis built-in.",
              },
              {
                icon: Sparkles,
                title: "AI-powered",
                description: "GPT-4 integration for intelligent content summarization.",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="group glass rounded-xl p-6 hover-lift cursor-pointer animate-fade-in-up opacity-0"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-2xl p-12 text-center relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 pointer-events-none" />
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto relative z-10">
              Join thousands of developers and analysts using ContentAI to understand the web.
            </p>
            <Link to="/signup" className="relative z-10">
              <Button variant="hero" size="xl" className="group">
                Start free trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo />
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <Link to="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="#" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 ContentAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
