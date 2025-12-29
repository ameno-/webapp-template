import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import AnalysisLoader from "@/components/AnalysisLoader";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { useJob, Job } from "@/hooks/useJob";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  History,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

// Tool configuration - can be customized per deployment
const TOOL_CONFIG = {
  name: "content-analyzer",
  title: "Content Analysis",
  description: "Enter a URL to extract and analyze its content",
  depths: [
    { value: "quick", label: "Quick", description: "Fast extraction of main content and basic metrics." },
    { value: "standard", label: "Standard", description: "Full content analysis with code detection and sentiment." },
    { value: "deep", label: "Deep", description: "Comprehensive analysis with AI-powered insights." },
  ],
};

// Map job status to progress percentage
const getProgressFromStatus = (status: Job['status'] | undefined, prevProgress: number): number => {
  switch (status) {
    case 'pending':
      return Math.min(prevProgress + 5, 20);
    case 'processing':
      return Math.min(prevProgress + 10, 90);
    case 'completed':
      return 100;
    case 'failed':
      return prevProgress;
    default:
      return 0;
  }
};

// Extract result content from job result
const extractResultContent = (result: unknown): string | null => {
  if (!result) return null;

  // Handle { content, format } structure
  if (typeof result === 'object' && result !== null && 'content' in result) {
    return String((result as { content: unknown }).content);
  }

  // Handle string result directly
  if (typeof result === 'string') {
    return result;
  }

  // Handle object by converting to JSON
  return JSON.stringify(result, null, 2);
};

const Dashboard = () => {
  const [url, setUrl] = useState("");
  const [depth, setDepth] = useState("standard");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Job hook for API integration
  const { job, isLoading: isAnalyzing, error, startJob } = useJob({
    onComplete: useCallback((completedJob: Job) => {
      setProgress(100);
      const content = extractResultContent(completedJob.result);
      setResult(content);
    }, []),
    onError: useCallback((failedJob: Job) => {
      console.error('Analysis failed:', failedJob.error);
    }, []),
  });

  // Update progress based on job status
  useEffect(() => {
    if (job?.status) {
      setProgress(prev => getProgressFromStatus(job.status, prev));
    }
  }, [job?.status]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setProgress(0);
    setResult(null);

    // Submit job to the API
    await startJob('/api/jobs', {
      input: {
        url: url.trim(),
        mode: depth,
      },
    });
  };

  const recentAnalyses = [
    { url: "example.com/blog", date: "2 MIN AGO" },
    { url: "medium.com/article", date: "1 HOUR AGO" },
    { url: "dev.to/tutorial", date: "YESTERDAY" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-40 h-screen w-64 bg-card border-r-2 border-foreground transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0 lg:w-16"
        }`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
            {sidebarOpen && <Logo />}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:flex hidden"
            >
              {sidebarOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 space-y-2">
            <Button
              variant="secondary"
              className="w-full justify-start gap-3 brutal-border font-bold uppercase tracking-wider text-xs"
            >
              <Zap className="w-4 h-4 text-primary" />
              {sidebarOpen && "Analyze"}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 uppercase tracking-wider text-xs"
            >
              <History className="w-4 h-4" />
              {sidebarOpen && "History"}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 uppercase tracking-wider text-xs"
            >
              <Settings className="w-4 h-4" />
              {sidebarOpen && "Settings"}
            </Button>
          </nav>

          {/* Recent analyses */}
          {sidebarOpen && (
            <div className="py-4 border-t-2 border-border">
              <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-widest">
                Recent
              </p>
              <div className="space-y-2">
                {recentAnalyses.map((item, i) => (
                  <button
                    key={i}
                    className="w-full text-left px-3 py-2 brutal-border bg-secondary hover:shadow-brutal-sm hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                  >
                    <p className="text-sm font-bold truncate">{item.url}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {item.date}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User section */}
          <div className="pt-4 border-t-2 border-border">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 bg-primary flex items-center justify-center">
                <span className="text-sm font-black text-primary-foreground">
                  U
                </span>
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate uppercase">User</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Free Plan
                  </p>
                </div>
              )}
              {sidebarOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/")}
                  className="h-8 w-8"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b-2 border-foreground">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <Logo />
          <div className="w-10" />
        </header>

        {/* Content area */}
        <div className="flex-1 p-6 lg:p-10 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-black mb-2 uppercase">
                Content
                <br />
                <span className="text-primary">Analysis</span>
              </h1>
              <p className="text-muted-foreground uppercase tracking-wider text-sm">
                Enter a URL to extract and analyze its content
              </p>
            </div>

            {/* Input form */}
            <form
              onSubmit={handleAnalyze}
              className="brutal-border bg-card p-6 mb-8 animate-fade-in-up"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="url"
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="h-14 text-base brutal-border bg-background focus:shadow-brutal-sm transition-shadow"
                    disabled={isAnalyzing}
                  />
                </div>
                <Select
                  value={depth}
                  onValueChange={setDepth}
                  disabled={isAnalyzing}
                >
                  <SelectTrigger className="w-full sm:w-40 h-14 brutal-border bg-background uppercase tracking-wider text-xs font-bold">
                    <SelectValue placeholder="Depth" />
                  </SelectTrigger>
                  <SelectContent className="bg-card brutal-border">
                    <SelectItem value="quick" className="uppercase text-xs font-bold">Quick</SelectItem>
                    <SelectItem value="standard" className="uppercase text-xs font-bold">Standard</SelectItem>
                    <SelectItem value="deep" className="uppercase text-xs font-bold">Deep</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  className="h-14 px-8 uppercase tracking-wider font-bold shadow-brutal hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-brutal-lg transition-all"
                  disabled={isAnalyzing || !url.trim()}
                >
                  {isAnalyzing ? (
                    "Analyzing..."
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-4 uppercase tracking-wider">
                {TOOL_CONFIG.depths.find(d => d.value === depth)?.description}
              </p>
              {error && (
                <p className="text-xs text-destructive mt-2 uppercase tracking-wider">
                  Error: {error}
                </p>
              )}
            </form>

            {/* Loading state */}
            {isAnalyzing && (
              <AnalysisLoader isAnalyzing={isAnalyzing} progress={progress} />
            )}

            {/* Results */}
            {result && !isAnalyzing && (
              <div className="space-y-6">
                <MarkdownRenderer content={result} title="Analysis Results" />
              </div>
            )}

            {/* Empty state */}
            {!isAnalyzing && !result && (
              <div className="text-center py-16 animate-fade-in">
                <div className="w-20 h-20 brutal-border bg-secondary flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-black mb-2 uppercase">
                  No Analysis Yet
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto uppercase tracking-wider text-sm">
                  Enter a URL above to start analyzing content.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
