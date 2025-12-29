import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import { Check, ArrowRight, Loader2, CreditCard, Lock } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for trying out ContentAI",
    features: [
      "50 analyses per month",
      "Basic content extraction",
      "Standard response time",
      "Community support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For professionals and growing teams",
    features: [
      "Unlimited analyses",
      "Deep analysis mode",
      "Priority processing",
      "API access",
      "Email support",
      "Export to PDF/JSON",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with custom needs",
    features: [
      "Everything in Pro",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
      "On-premise option",
      "Team management",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const Signup = () => {
  const [step, setStep] = useState<"plan" | "account" | "payment">("plan");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePlanSelect = (planName: string) => {
    setSelectedPlan(planName);
    if (planName === "Enterprise") {
      // Would redirect to contact form
      return;
    }
    setStep("account");
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlan === "Starter") {
      // Free plan - go straight to dashboard
      setIsLoading(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } else {
      setStep("payment");
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-4">
            {["plan", "account", "payment"].map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step === s
                      ? "bg-primary text-primary-foreground"
                      : ["plan", "account", "payment"].indexOf(step) > i
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {["plan", "account", "payment"].indexOf(step) > i ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 2 && (
                  <div
                    className={`w-16 h-0.5 mx-2 transition-colors ${
                      ["plan", "account", "payment"].indexOf(step) > i
                        ? "bg-primary"
                        : "bg-secondary"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-12 mt-2 text-xs text-muted-foreground">
            <span className={step === "plan" ? "text-primary" : ""}>Choose Plan</span>
            <span className={step === "account" ? "text-primary" : ""}>Create Account</span>
            <span className={step === "payment" ? "text-primary" : ""}>Payment</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Plan Selection */}
        {step === "plan" && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Choose your plan</h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Start free and upgrade as you grow. All plans include a 14-day trial.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan, i) => (
                <div
                  key={plan.name}
                  className={`glass rounded-xl p-6 relative transition-all duration-300 hover:scale-[1.02] cursor-pointer animate-fade-in-up opacity-0 ${
                    plan.popular
                      ? "ring-2 ring-primary shadow-[0_0_30px_hsl(322_100%_60%/0.2)]"
                      : ""
                  }`}
                  style={{ animationDelay: `${0.1 * i}s` }}
                  onClick={() => handlePlanSelect(plan.name)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                      Most Popular
                    </div>
                  )}

                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    {plan.description}
                  </p>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.popular ? "hero" : "outline"}
                    className="w-full group"
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account Creation */}
        {step === "account" && (
          <div className="max-w-md mx-auto animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Create your account</h1>
              <p className="text-muted-foreground">
                You selected the <span className="text-primary font-medium">{selectedPlan}</span> plan
              </p>
            </div>

            <form onSubmit={handleAccountSubmit} className="space-y-6">
              <div className="glass rounded-xl p-6 space-y-4">
                {/* Name field */}
                <div className="relative">
                  <label
                    htmlFor="name"
                    className={`absolute left-3 transition-all duration-300 pointer-events-none ${
                      focusedField === "name" || name
                        ? "-top-2.5 text-xs text-primary bg-card px-1"
                        : "top-3 text-muted-foreground"
                    }`}
                  >
                    Full name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    className="h-12"
                    required
                  />
                </div>

                {/* Email field */}
                <div className="relative">
                  <label
                    htmlFor="email"
                    className={`absolute left-3 transition-all duration-300 pointer-events-none ${
                      focusedField === "email" || email
                        ? "-top-2.5 text-xs text-primary bg-card px-1"
                        : "top-3 text-muted-foreground"
                    }`}
                  >
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className="h-12"
                    required
                  />
                </div>

                {/* Password field */}
                <div className="relative">
                  <label
                    htmlFor="password"
                    className={`absolute left-3 transition-all duration-300 pointer-events-none ${
                      focusedField === "password" || password
                        ? "-top-2.5 text-xs text-primary bg-card px-1"
                        : "top-3 text-muted-foreground"
                    }`}
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className="h-12"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="xl"
                className="w-full group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    {selectedPlan === "Starter" ? "Create Free Account" : "Continue to Payment"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By continuing, you agree to our{" "}
                <Link to="#" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="#" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </form>

            <button
              onClick={() => setStep("plan")}
              className="flex items-center justify-center gap-2 w-full mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to plans
            </button>
          </div>
        )}

        {/* Payment */}
        {step === "payment" && (
          <div className="max-w-md mx-auto animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Payment details</h1>
              <p className="text-muted-foreground">
                Start your 14-day free trial of {selectedPlan}
              </p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              {/* Order summary */}
              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">{selectedPlan}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground">Billing</span>
                  <span className="font-medium">Monthly</span>
                </div>
                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <span className="font-medium">Due today</span>
                  <span className="text-xl font-bold text-primary">$0.00</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Then $29/month after your trial ends
                </p>
              </div>

              {/* Card input */}
              <div className="glass rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Card details</span>
                </div>

                <Input
                  placeholder="Card number"
                  className="h-12"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="MM/YY"
                    className="h-12"
                  />
                  <Input
                    placeholder="CVC"
                    className="h-12"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="xl"
                className="w-full group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Start Free Trial
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                Secure payment powered by Stripe
              </div>
            </form>

            <button
              onClick={() => setStep("account")}
              className="flex items-center justify-center gap-2 w-full mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
