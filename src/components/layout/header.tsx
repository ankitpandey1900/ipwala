import { Keyboard, BookOpen, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border/20 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {/* mobile menu toggle */}
        {onMenuToggle && (
          <button 
            onClick={onMenuToggle}
            className="lg:hidden p-1.5 -ml-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        {/* logo mark */}
        <Link href="/" className="flex items-center w-28 h-8 relative opacity-90 hover:opacity-100 transition-opacity mix-blend-screen">
          <Image src="/ip.png" alt="IPWala Logo" fill className="object-contain object-left" priority />
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* docs link */}
        <Link 
          href="/docs"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/30 hover:bg-secondary/50 border border-border/20 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Docs
        </Link>
        
        {/* command hint */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-border/30 text-muted-foreground/60">
          <Keyboard className="w-3.5 h-3.5" />
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <span className="bg-background px-1.5 py-0.5 rounded border border-border/50">/</span>
            <span className="ml-1 uppercase tracking-tighter">to focus</span>
          </div>
        </div>
      </div>
    </header>
  );
}
