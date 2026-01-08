import { Link, useLocation } from "wouter";
import { Activity, ShieldCheck, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Overview", icon: Activity },
    { href: "/ask", label: "Ask AI", icon: Terminal },
    { href: "/verify", label: "Verify", icon: ShieldCheck },
  ];

  return (
    <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/50 group-hover:bg-primary/30 transition-colors">
              <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(167,139,250,0.8)] animate-pulse" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-primary transition-colors">
              Linera<span className="text-primary">Mind</span>
            </span>
          </Link>

          <div className="flex gap-1 md:gap-4">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link 
                key={href} 
                href={href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  location === href 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_-5px_rgba(167,139,250,0.3)]" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
