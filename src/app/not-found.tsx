import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground font-mono p-4">
      <pre className="text-terminal-accent text-sm leading-relaxed mb-6 text-center">
{`  _  _    ___  _  _
 | || |  / _ \\| || |
 | || |_| | | | || |_
 |__   _| | | |__   _|
    |_| | |_| |  |_|
         \\___/`}
      </pre>
      <p className="text-terminal-muted text-sm mb-1">Page not found</p>
      <p className="text-terminal-muted/60 text-xs mb-6">
        The route you requested doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="text-xs px-4 py-2 rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
      >
        ← Back to terminal
      </Link>
    </div>
  );
}
