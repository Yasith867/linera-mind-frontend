import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { TerminalCard } from "@/components/TerminalCard";
import { useAskAi } from "@/hooks/use-linera";
import { Link } from "wouter";
import { Send, Loader2, Copy, User, Bot, ChevronRight, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  proofId?: string;
}

export default function AskAi() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const askMutation = useAskAi();
  const { toast } = useToast();

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, askMutation.isPending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || askMutation.isPending) return;

    const userMessage: Message = { role: "user", content: question };
    setMessages(prev => [...prev, userMessage]);
    setQuestion("");
    
    askMutation.mutate({ question, history: messages }, {
      onSuccess: (data) => {
        // Clean markdown from response
        const cleanAnswer = data.answer
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/__/g, '')
          .replace(/`/g, '')
          .replace(/#{1,6}\s?/g, '')
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$2'); // Keep only URL for markdown links
        
        const proofId = `linera:${data.chainId}:${data.id}`;
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: cleanAnswer,
          proofId
        }]);
      }
    });
  };

  const handleClearHistory = () => {
    setMessages([]);
    setQuestion("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatProofId = (id: string) => {
    if (!id) return "";
    const parts = id.split(':');
    if (parts.length < 3) return id;
    const chainId = parts[1];
    const entryId = parts[2];
    return `Proof · linera:${chainId.substring(0, 6)}…${entryId.substring(entryId.length - 4)}`;
  };

  return (
    <div className="min-h-screen bg-background bg-grid-pattern text-foreground flex flex-col h-screen overflow-hidden">
      <Navbar />
      
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto pt-8 pb-32 custom-scrollbar scroll-smooth">
          <div className="space-y-4 pb-20">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 opacity-20">
                <Bot className="w-16 h-16 mb-4" />
                <p className="text-xl font-display font-bold tracking-widest uppercase">LineraMind AI</p>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center border border-white/10 ${msg.role === "user" ? "bg-primary text-white" : "bg-secondary text-primary"}`}>
                  {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <div className={`rounded-2xl p-4 ${msg.role === "user" ? "bg-primary/15 border border-primary/30 rounded-tr-none" : "bg-secondary/40 border border-white/5 rounded-tl-none shadow-lg"}`}>
                    <div className="prose prose-invert max-w-none text-base leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content.split(/(https?:\/\/[^\s]+)/g).map((part, index) => 
                        part.match(/^https?:\/\//) ? (
                          <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                            {part}
                          </a>
                        ) : part
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {askMutation.isPending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <div className="w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center border border-white/10 bg-secondary text-primary">
                  <Bot className="w-5 h-5 animate-pulse" />
                </div>
                <div className="bg-secondary/30 border border-white/10 rounded-3xl p-6 rounded-tl-none flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}
            
            <div ref={scrollRef} />
          </div>
        </div>

        <div className={`absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm px-4 border-t border-white/5 transition-all duration-300 ${messages.some(m => m.proofId) ? 'pb-4 pt-2' : 'pb-8 pt-4'}`}>
          <div className="max-w-4xl mx-auto flex flex-col gap-2">
            {messages.filter(m => m.proofId).length > 0 && (
              <div className="flex items-center gap-2 px-2">
                <span className="text-[12px] text-muted-foreground/60 font-mono">
                  {formatProofId(messages.filter(m => m.proofId).slice(-1)[0].proofId!)}
                </span>
                <Link href={`/verify?id=${messages.filter(m => m.proofId).slice(-1)[0].proofId}`}>
                  <button className="text-[12px] text-primary hover:text-primary/80 font-bold transition-colors">
                    Verify
                  </button>
                </Link>
              </div>
            )}
            <div className="flex items-end gap-3 group">
              <button
                type="button"
                onClick={handleClearHistory}
                disabled={messages.length === 0}
                className={`rounded-[1.2rem] bg-secondary/40 backdrop-blur-md border border-white/10 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 disabled:opacity-30 disabled:hover:bg-secondary/40 disabled:hover:text-muted-foreground flex items-center justify-center transition-all shrink-0 mb-1 ${messages.some(m => m.proofId) ? 'w-12 h-12' : 'w-14 h-14'}`}
                title="Clear Conversation"
              >
                <Trash2 className={`${messages.some(m => m.proofId) ? 'w-5 h-5' : 'w-6 h-6'}`} />
              </button>
              <form onSubmit={handleSubmit} className={`flex-1 relative bg-secondary/40 backdrop-blur-xl p-1.5 rounded-[1.5rem] border border-white/10 flex items-end gap-2 shadow-2xl transition-all duration-300 focus-within:border-primary/50 focus-within:shadow-[0_0_20px_rgba(var(--primary),0.2)] focus-within:ring-1 focus-within:ring-primary/20`}>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="eg: what is Linera?"
                  rows={1}
                  className={`flex-1 bg-transparent border-none focus:ring-0 outline-none shadow-none px-4 py-3 placeholder:text-muted-foreground/30 resize-none max-h-32 overflow-y-auto ${messages.some(m => m.proofId) ? 'text-base' : 'text-lg'}`}
                  style={{ height: 'auto', minHeight: messages.some(m => m.proofId) ? '48px' : '60px' }}
                  disabled={askMutation.isPending}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={askMutation.isPending || !question.trim()}
                  className={`rounded-[1.2rem] bg-primary hover:bg-primary/90 disabled:opacity-50 text-white flex items-center justify-center shadow-lg transition-all active:scale-95 shrink-0 mb-0.5 ${messages.some(m => m.proofId) ? 'w-12 h-12' : 'w-14 h-14'}`}
                >
                  {askMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
