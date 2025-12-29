import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Typography focused */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--primary-foreground)) 2px, transparent 2px),
                               linear-gradient(90deg, hsl(var(--primary-foreground)) 2px, transparent 2px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Large typography */}
        <div className="relative z-10 flex flex-col justify-center px-16">
          <h1 className="text-7xl font-black leading-[0.85] mb-8 text-primary-foreground uppercase animate-fade-in-up">
            Analyze
            <br />
            Content
            <br />
            <span className="text-background">Intelligently</span>
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md animate-fade-in-up stagger-2 opacity-0 uppercase tracking-wider">
            Transform any URL into structured insights. Extract, analyze, and
            understand.
          </p>
        </div>

        {/* Floating stat card */}
        <div className="absolute bottom-20 left-16 animate-fade-in-up stagger-3 opacity-0">
          <div className="bg-background brutal-border p-6 hover-lift">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary flex items-center justify-center text-primary-foreground font-black text-xl">
                ✓
              </div>
              <div>
                <p className="text-2xl font-black">1.2M+</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  URLs Analyzed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div>
            <Logo className="mb-12" />
            <h2 className="text-5xl font-black tracking-tight uppercase">
              Welcome
              <br />
              <span className="text-primary">Back</span>
            </h2>
            <p className="mt-4 text-muted-foreground uppercase tracking-wider text-sm">
              Sign in to continue your analysis
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Email field */}
              <div className="relative">
                <label
                  htmlFor="email"
                  className={`absolute left-4 transition-all duration-300 pointer-events-none uppercase tracking-wider text-xs font-bold ${
                    focusedField === "email" || email
                      ? "-top-2.5 text-primary bg-background px-2"
                      : "top-4 text-muted-foreground"
                  }`}
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className="h-14 brutal-border bg-background focus:shadow-brutal-sm transition-shadow"
                  required
                />
              </div>

              {/* Password field */}
              <div className="relative">
                <label
                  htmlFor="password"
                  className={`absolute left-4 transition-all duration-300 pointer-events-none z-10 uppercase tracking-wider text-xs font-bold ${
                    focusedField === "password" || password
                      ? "-top-2.5 text-primary bg-background px-2"
                      : "top-4 text-muted-foreground"
                  }`}
                >
                  Password
                </label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className="h-14 pr-12 brutal-border bg-background focus:shadow-brutal-sm transition-shadow"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-5 h-5 brutal-border peer-checked:bg-primary transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                to="#"
                className="text-xs text-primary hover:underline uppercase tracking-wider font-bold"
              >
                Forgot?
              </Link>
            </div>

            <Button
              type="submit"
              variant="default"
              size="xl"
              className="w-full group uppercase tracking-wider font-bold shadow-brutal hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-brutal-lg transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-xs uppercase tracking-widest text-muted-foreground font-bold">
                Or
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-14 brutal-border hover:shadow-brutal-sm hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all uppercase tracking-wider text-xs font-bold"
            >
              Google
            </Button>
            <Button
              variant="outline"
              className="h-14 brutal-border hover:shadow-brutal-sm hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all uppercase tracking-wider text-xs font-bold"
            >
              GitHub
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground uppercase tracking-wider">
            No account?{" "}
            <Link
              to="/signup"
              className="text-primary hover:underline font-bold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
