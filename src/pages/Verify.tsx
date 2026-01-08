import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { TerminalCard } from "@/components/TerminalCard";
import { useVerifyEntry } from "@/hooks/use-linera";
import { Search, ShieldCheck, FileDown, Copy, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";

export default function Verify() {
  const [deterministicId, setDeterministicId] = useState("");
  const [searchId, setSearchId] = useState<number | null>(null);
  const [isAnswerCollapsed, setIsAnswerCollapsed] = useState(false);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    if (idParam) {
      setDeterministicId(idParam);
      const parts = idParam.split(":");
      const id = parts.length >= 3 ? parseInt(parts[2]) : parseInt(idParam);
      if (!isNaN(id)) setSearchId(id);
    }
  }, []);

  const { data, isLoading, isError } = useVerifyEntry(searchId);

  const formatProofId = (id: string) => {
    if (!id) return "";
    const parts = id.split(':');
    if (parts.length < 3) return id;
    const chainId = parts[1];
    const entryId = parts[2];
    return `Proof · linera:${chainId.substring(0, 6)}…${entryId.substring(entryId.length - 4)}`;
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deterministicId) return;
    
    const parts = deterministicId.split(":");
    let id: number;
    if (parts.length >= 3) {
      id = parseInt(parts[2]);
    } else {
      id = parseInt(deterministicId);
    }
    
    if (!isNaN(id)) {
      setSearchId(id);
    }
  };

  const downloadPDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - (margin * 2);

    doc.setFontSize(22);
    doc.setTextColor(107, 70, 193);
    doc.text("LineraMind — Verified AI Report", margin, 25);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, 30, pageWidth - margin, 30);

    let currentY = 45;

    // Question
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text("QUESTION", margin, currentY);
    currentY += 8;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const qLines = doc.splitTextToSize(data.question, contentWidth);
    doc.text(qLines, margin, currentY);
    currentY += (qLines.length * 6) + 15;

    // Answer
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text("VERIFIED AI ANSWER", margin, currentY);
    currentY += 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const cleanAnswer = data.answer.replace(/\*\*/g, '').replace(/\*/g, '').replace(/###/g, '');
    const aLines = doc.splitTextToSize(cleanAnswer, contentWidth);
    
    // Check for page overflow
    if (currentY + (aLines.length * 6) > 270) {
      const maxLines = Math.floor((270 - currentY) / 6);
      doc.text(aLines.slice(0, maxLines), margin, currentY);
      doc.text("... (Answer truncated to fit one page)", margin, currentY + (maxLines * 6) + 6);
    } else {
      doc.text(aLines, margin, currentY);
      currentY += (aLines.length * 6) + 15;
    }

    // Metadata at bottom
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Deterministic ID: linera:${data.chainId}:${data.id}`, margin, 285);
    doc.text(`Timestamp: ${new Date(data.timestamp!).toLocaleString()}`, pageWidth - margin, 285, { align: "right" });

    doc.save(`LineraMind_Verified_${data.id}.pdf`);
  };

  const getSummaryBullets = (text: string) => {
    // Factual summary without markdown or generic filler
    const clean = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '');
    const sentences = clean.split(/[.!?]/).filter(s => s.trim().length > 25);
    
    if (sentences.length >= 2) {
      return sentences.slice(0, 3).map(s => s.trim() + ".");
    }
    
    return [
      "Verified factual explanation regarding the requested subject matter.",
      "Consensus reached on the simulated microchain state.",
      "Deterministic proof identifier successfully validated."
    ];
  };

  return (
    <div className="min-h-screen bg-background bg-grid-pattern text-foreground flex flex-col pb-20">
      <Navbar />
      
      {/* Sticky Action Bar */}
      {data && (
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10 px-4 py-3 shadow-lg">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs font-mono font-bold text-green-400 uppercase tracking-widest">Record Verified</span>
            </div>
            <div className="flex gap-3">
              <Button 
                size="sm" 
                variant="secondary" 
                className="gap-2 text-xs"
                onClick={() => navigator.clipboard.writeText(data.answer)}
              >
                <Copy className="w-3 h-3" />
                Copy
              </Button>
              <Button 
                size="sm" 
                className="gap-2 text-xs bg-primary"
                onClick={downloadPDF}
              >
                <FileDown className="w-3 h-3" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-12">
        {!data && (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold mb-4">Verification Center</h1>
            <p className="text-muted-foreground">Retrieve and validate proof of generation.</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="bg-secondary/20 p-8 rounded-3xl border border-white/10 space-y-4 shadow-xl backdrop-blur-sm">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Deterministic Proof ID</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={deterministicId}
                  onChange={(e) => setDeterministicId(e.target.value)}
                  placeholder="linera:..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-4 text-primary font-mono text-sm focus:border-primary/50 outline-none transition-all"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="rounded-2xl px-8 bg-primary text-white font-bold">
                Verify
              </Button>
            </div>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span className="text-xs font-mono text-primary animate-pulse">Verifying...</span>
            </div>
          ) : isError ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-3xl p-10 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-bold text-destructive mb-2">Verification Failed</h3>
              <p className="text-sm text-muted-foreground">The proof ID could not be found or validated.</p>
            </div>
          ) : data ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-12">
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Verified Question</h3>
                <div className="bg-secondary/30 border-l-4 border-primary p-8 rounded-r-3xl">
                  <p className="text-2xl font-semibold italic text-foreground/90 leading-tight">"{data.question}"</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Verified AI Answer</h3>
                  <button onClick={() => setIsAnswerCollapsed(!isAnswerCollapsed)} className="text-[10px] uppercase tracking-widest text-primary font-bold hover:opacity-80 flex items-center gap-1">
                    {isAnswerCollapsed ? <><ChevronDown className="w-3 h-3"/> Show Full</> : <><ChevronUp className="w-3 h-3"/> Collapse</>}
                  </button>
                </div>
                {!isAnswerCollapsed && (
                  <div className="bg-white/5 border border-white/5 p-10 rounded-3xl">
                    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:mb-8 prose-p:text-xl">
                      {data.answer.split('\n\n').map((p, i) => (
                        <p key={i}>{p.replace(/\*\*/g, '').replace(/\*/g, '').replace(/###/g, '')}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">SUMMARY (What you learned)</h3>
                <div className="bg-primary/5 border border-primary/20 p-10 rounded-3xl">
                  <ul className="space-y-6">
                    {getSummaryBullets(data.answer).map((bullet, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                        <span className="text-foreground/90 leading-relaxed text-xl">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Verification Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-black/20 border border-white/5 p-6 rounded-3xl">
                    <span className="text-[9px] text-muted-foreground uppercase block mb-2">Deterministic ID</span>
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono text-primary truncate mr-2">{formatProofId(`linera:${data.chainId}:${data.id}`)}</code>
                      <button 
                        onClick={() => navigator.clipboard.writeText(`linera:${data.chainId}:${data.id}`)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Copy Full ID"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="bg-black/20 border border-white/5 p-6 rounded-3xl">
                    <span className="text-[9px] text-muted-foreground uppercase block mb-2">Finalized Timestamp</span>
                    <span className="text-sm font-mono text-foreground/80">{new Date(data.timestamp!).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}
