import { useState } from "react";

interface AnalysisLoaderProps {
  isAnalyzing: boolean;
  progress?: number;
}

const AnalysisLoader = ({ isAnalyzing, progress = 0 }: AnalysisLoaderProps) => {
  const stages = [
    { label: "Fetching content", icon: "🔗" },
    { label: "Parsing structure", icon: "📄" },
    { label: "Extracting data", icon: "⚡" },
    { label: "Analyzing content", icon: "🧠" },
    { label: "Generating insights", icon: "✨" },
  ];

  const currentStage = Math.min(Math.floor(progress / 20), 4);

  if (!isAnalyzing) return null;

  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      {/* Main animation */}
      <div className="relative w-32 h-32 mb-8">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-secondary" />
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="60"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${progress * 3.77} 377`}
            className="transition-all duration-500"
          />
        </svg>

        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-orbit">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_hsl(322_100%_60%/0.5)]" />
        </div>
        <div className="absolute inset-0 animate-orbit-reverse" style={{ animationDelay: "0.5s" }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/60" />
        </div>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gradient">{Math.round(progress)}%</div>
          </div>
        </div>
      </div>

      {/* Stage indicators */}
      <div className="flex flex-col items-center gap-4 w-full max-w-sm">
        <div className="text-lg font-medium">
          {stages[currentStage]?.icon} {stages[currentStage]?.label}
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stage dots */}
        <div className="flex items-center gap-3">
          {stages.map((stage, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i <= currentStage
                  ? "bg-primary scale-100"
                  : "bg-secondary scale-75"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisLoader;
