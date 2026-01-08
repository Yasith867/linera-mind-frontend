import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background bg-grid-pattern text-foreground flex flex-col overflow-hidden">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative">
        <div className="absolute top-8 right-8 z-20 flex items-center gap-3 px-4 py-2 bg-secondary/30 backdrop-blur-md border border-white/5 rounded-full">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/80">Live on Linera Testnet</span>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 leading-tight">
              LineraMind
            </h1>
            
            <h2 className="text-xl md:text-2xl text-primary font-medium mb-6">
              An AI question & verification system with deterministic proof simulation.
            </h2>

            <div className="bg-secondary/20 border border-white/5 p-8 rounded-2xl mb-10 max-w-lg mx-auto backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4 text-foreground/90">Project Overview</h3>
              <ul className="text-muted-foreground space-y-2 text-left list-inside list-disc">
                <li>Built as a demo project</li>
                <li>No real blockchain</li>
                <li>No wallet required</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/ask" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-[0_0_20px_rgba(167,139,250,0.4)] hover:shadow-[0_0_30_rgba(167,139,250,0.6)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group">
                  Go to Ask AI
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
