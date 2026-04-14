import { useState, useRef, useEffect } from "react";
import { useAiChat } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Cpu, User, AlertCircle } from "lucide-react";

type Message = {
  role: "user" | "ai";
  content: string;
  suggestions?: string[];
};

export default function AiAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "ai", 
      content: "SHADOW_AI initialized. Ready to assist with OSINT analysis, pattern recognition, and investigative methodologies.",
      suggestions: ["How do I track an IP address?", "What is the best way to find hidden metadata?", "Explain DNS records for OSINT"]
    }
  ]);
  
  const chatMutation = useAiChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatMutation.isPending]);

  const handleSubmit = (e?: React.FormEvent, presetMessage?: string) => {
    e?.preventDefault();
    
    const messageToSend = presetMessage || input;
    if (!messageToSend.trim()) return;

    // Add user message immediately
    const newMessages = [...messages, { role: "user" as const, content: messageToSend }];
    setMessages(newMessages);
    setInput("");

    // Convert history to context string
    const context = newMessages.slice(-5).map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");

    chatMutation.mutate({
      data: { message: messageToSend, context }
    }, {
      onSuccess: (data) => {
        setMessages(prev => [...prev, { 
          role: "ai", 
          content: data.response,
          suggestions: data.suggestions
        }]);
      }
    });
  };

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex flex-col gap-2 shrink-0">
        <h1 className="text-3xl font-bold text-primary glow-text flex items-center gap-2">
          <MessageSquare className="h-8 w-8" /> SHADOW AI
        </h1>
        <p className="text-muted-foreground">Tactical analysis and methodology assistant</p>
      </div>

      <Card className="bg-card/40 border-primary/30 backdrop-blur flex-1 flex flex-col overflow-hidden shadow-[0_0_15px_rgba(0,255,136,0.1)]">
        <CardHeader className="border-b border-white/5 py-3 shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm uppercase flex items-center gap-2 text-primary">
              <Cpu className="h-4 w-4" /> Secure Channel Established
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className="flex items-end gap-2 max-w-[85%]">
                {msg.role === "ai" && (
                  <div className="bg-black/50 p-2 rounded border border-primary/30 shrink-0">
                    <Cpu className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div className={`p-4 rounded-lg font-mono text-sm leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-primary/20 border border-primary/50 text-foreground" 
                    : "bg-black/60 border border-white/10 text-primary/90"
                }`}>
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i} className={line === '' ? 'h-4' : ''}>{line}</p>
                  ))}
                </div>

                {msg.role === "user" && (
                  <div className="bg-black/50 p-2 rounded border border-white/10 shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>

              {msg.role === "ai" && msg.suggestions && msg.suggestions.length > 0 && idx === messages.length - 1 && (
                <div className="mt-4 flex flex-wrap gap-2 ml-10">
                  {msg.suggestions.map((suggestion, sIdx) => (
                    <button 
                      key={sIdx}
                      onClick={() => handleSubmit(undefined, suggestion)}
                      className="text-xs bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 text-secondary px-3 py-1.5 rounded transition-colors text-left"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {chatMutation.isPending && (
            <div className="flex items-start gap-2">
              <div className="bg-black/50 p-2 rounded border border-primary/30 shrink-0">
                <Cpu className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="p-4 rounded-lg bg-black/60 border border-white/10 font-mono text-sm text-primary/50 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-white/5 p-4 shrink-0 bg-black/20">
          <form onSubmit={handleSubmit} className="w-full flex gap-2">
            <Input
              placeholder="Ask SHADOW_AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={chatMutation.isPending}
              className="flex-1 font-mono bg-black/50 border-primary/30 focus-visible:ring-primary text-primary placeholder:text-primary/30"
            />
            <Button 
              type="submit" 
              disabled={chatMutation.isPending || !input.trim()} 
              className="bg-primary text-black hover:bg-primary/90 font-bold shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
