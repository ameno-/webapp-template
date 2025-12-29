import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center animate-fade-in">
        {/* 404 number */}
        <div className="relative mb-8">
          <span className="text-[150px] md:text-[200px] font-bold text-gradient leading-none">
            404
          </span>
          <div className="absolute inset-0 blur-3xl bg-primary/20 -z-10" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-4">Page not found</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/">
            <Button variant="hero" className="group">
              <Home className="w-4 h-4 mr-2" />
              Back to home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline">
              Go to dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-12">
          <Logo className="justify-center opacity-50" />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
