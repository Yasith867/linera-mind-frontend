import { useMutation, useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function useAskAi() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ question, history = [] }: { question: string, history?: any[] }) => {
      const res = await fetch(api.ai.ask.path, {
        method: api.ai.ask.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to get answer from LineraMind');
      }
      
      return api.ai.ask.responses[200].parse(await res.json());
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useVerifyEntry(id: number | null) {
  return useQuery({
    queryKey: [api.ai.verify.path, id],
    queryFn: async () => {
      if (id === null) return null;
      
      const url = buildUrl(api.ai.verify.path, { id });
      const res = await fetch(url);
      
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Verification failed');
      
      return api.ai.verify.responses[200].parse(await res.json());
    },
    enabled: id !== null,
    retry: false
  });
}
