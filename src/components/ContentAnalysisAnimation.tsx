import { useEffect, useState } from "react";

const analysisSteps = [
  "PARSING HTML",
  "EXTRACTING TEXT",
  "DETECTING CODE",
  "ANALYZING STRUCTURE",
  "PROCESSING MEDIA",
  "GENERATING REPORT",
];

const ContentAnalysisAnimation = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [chars, setChars] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % analysisSteps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Generate random characters for the matrix effect
    const generateChars = () => {
      const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}[]";
      return Array.from({ length: 120 }, () =>
        charset[Math.floor(Math.random() * charset.length)]
      );
    };
    setChars(generateChars());

    const charInterval = setInterval(() => {
      setChars(generateChars());
    }, 150);

    return () => clearInterval(charInterval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Terminal window */}
      <div className="brutal-border bg-background">
        {/* Terminal header */}
        <div className="border-b-2 border-foreground px-4 py-2 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-primary" />
            <div className="w-3 h-3 bg-foreground" />
            <div className="w-3 h-3 bg-muted-foreground" />
          </div>
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            CONTENT_ANALYZER.exe
          </span>
          <div className="w-16" />
        </div>

        {/* Terminal content */}
        <div className="p-6 font-mono text-sm space-y-4">
          {/* Status line */}
          <div className="flex items-center gap-3">
            <span className="text-primary">&gt;_</span>
            <span className="text-foreground animate-pulse">
              {analysisSteps[activeStep]}
            </span>
            <span className="animate-blink text-primary">█</span>
          </div>

          {/* Progress bars */}
          <div className="space-y-2">
            {analysisSteps.map((step, i) => (
              <div key={step} className="flex items-center gap-4">
                <span className="w-32 text-xs text-muted-foreground truncate">
                  {step}
                </span>
                <div className="flex-1 h-4 brutal-border bg-secondary relative overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 bg-primary transition-all duration-500 ${
                      i < activeStep
                        ? "w-full"
                        : i === activeStep
                        ? "w-2/3 animate-pulse"
                        : "w-0"
                    }`}
                  />
                </div>
                <span className="w-12 text-xs text-right">
                  {i < activeStep ? "100%" : i === activeStep ? "67%" : "0%"}
                </span>
              </div>
            ))}
          </div>

          {/* Matrix-like character display */}
          <div className="mt-6 p-4 bg-secondary/50 brutal-border overflow-hidden">
            <div className="grid grid-cols-20 gap-0 text-xs leading-none">
              {chars.map((char, i) => (
                <span
                  key={i}
                  className={`
                    ${i % 7 === 0 ? "text-primary" : "text-muted-foreground/50"}
                    ${Math.random() > 0.9 ? "animate-pulse" : ""}
                  `}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { label: "NODES", value: "2,456" },
              { label: "TOKENS", value: "12.4K" },
              { label: "BLOCKS", value: "89" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="brutal-border p-3 bg-secondary/30 text-center"
              >
                <div className="text-2xl font-bold text-primary font-mono">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentAnalysisAnimation;
