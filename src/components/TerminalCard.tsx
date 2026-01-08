import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface TerminalCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  showControls?: boolean;
}

export function TerminalCard({ title = "Output Log", children, className, showControls = true }: TerminalCardProps) {
  return (
    <div className={cn(
      "bg-[#0D1117] rounded-xl border border-border/50 overflow-hidden shadow-2xl shadow-black/40",
      className
    )}>
      <div className="bg-secondary/30 px-4 py-2 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          {showControls && (
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
          )}
          <span className="ml-2 font-mono text-xs text-muted-foreground tracking-wide uppercase">{title}</span>
        </div>
        <div className="text-[10px] font-mono text-primary/70 bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
          LINERA_MICROCHAIN_V1
        </div>
      </div>
      <div className="p-4 md:p-6 font-mono text-sm md:text-base overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

export function TerminalLine({ label, value, copyable = false }: { label: string; value: string | React.ReactNode; copyable?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof value === 'string') {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2 border-b border-white/5 last:border-0">
      <span className="text-muted-foreground min-w-[120px] text-xs uppercase tracking-wider pt-1">{label}</span>
      <div className="flex-1 flex items-start justify-between gap-4 group">
        <span className="text-foreground break-all">{value}</span>
        {copyable && typeof value === 'string' && (
          <button 
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
          </button>
        )}
      </div>
    </div>
  );
}
