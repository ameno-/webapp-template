import { Link } from "react-router-dom";

const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <Link to="/" className={`flex items-center gap-2 group ${className}`}>
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 bg-primary rounded-lg rotate-45 group-hover:rotate-[55deg] transition-transform duration-300" />
        <div className="absolute inset-1 bg-background rounded-md rotate-45 group-hover:rotate-[55deg] transition-transform duration-300" />
        <div className="absolute inset-2 bg-primary rounded-sm rotate-45 group-hover:rotate-[55deg] transition-transform duration-300" />
      </div>
      <span className="text-xl font-semibold tracking-tight">
        <span className="text-foreground">Content</span>
        <span className="text-primary">AI</span>
      </span>
    </Link>
  );
};

export default Logo;
