import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble, type ChatRole } from "./MessageBubble";
import { QuickReply } from "./QuickReply";
import { Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


interface ChatMessage { id: string; role: ChatRole; content: string; ts: number; feedback?: "up" | "down"; }

const QUICK_REPLIES = [
  "Check symptoms",
  "Medication reminder",
  "Book appointment",
  "Daily health tip",
];

export const ChatWindow = () => {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: crypto.randomUUID(),
    role: "assistant",
    content: "Hi! I’m Serene, your health companion. How can I help today?",
    ts: Date.now(),
  }]);
  const endRef = useRef<HTMLDivElement | null>(null);

  const scrollToEnd = () => endRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToEnd(); }, [messages.length, loading]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const payload = {
        messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
      };

      const res = await fetch('/functions/v1/healthchat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      let reply: string;
      if (res.ok) {
        const data = await res.json();
        reply = data?.content ?? "I'm sorry, I couldn't process that just now.";
      } else {
        throw new Error(`HTTP ${res.status}`);
      }

      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: reply, ts: Date.now() }]);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Chat service unavailable",
        description: "Please add the Perplexity API key in Supabase Edge Function secrets and try again.",
      });
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: "I’m having trouble reaching the service. Please try again soon.", ts: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const setFeedback = (id: string, fb: "up" | "down") =>
    setMessages((m) => m.map((x) => (x.id === id ? { ...x, feedback: fb } : x)));

  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-col h-[70vh] sm:h-[72vh]">
          <ScrollArea className="flex-1 px-4 py-4">
            <div className="space-y-4" aria-live="polite">
              {messages.map((m) => (
                <div key={m.id}>
                  <MessageBubble role={m.role} content={m.content} timestamp={m.ts} />
                  {m.role === "assistant" && (
                    <div className="flex gap-2 mt-2 ps-12">
                      <Button variant="ghost" size="sm" aria-label="Thumbs up" onClick={() => setFeedback(m.id, "up")}>
                        <ThumbsUp className="me-1" /> Helpful
                      </Button>
                      <Button variant="ghost" size="sm" aria-label="Thumbs down" onClick={() => setFeedback(m.id, "down")}>
                        <ThumbsDown className="me-1" /> Not helpful
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="ps-12 text-sm text-muted-foreground animate-pulse">Serene is typing…</div>
              )}
              <div ref={endRef} />
            </div>
          </ScrollArea>

          <div className="border-t border-border p-3">
            <div className="flex flex-wrap gap-2 mb-2">
              {QUICK_REPLIES.map((q) => (
                <QuickReply key={q} label={q} onClick={() => handleSend(q)} />
              ))}
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <label htmlFor="chat-input" className="sr-only">Type your message</label>
              <Input
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about symptoms, medication, appointments…"
                autoComplete="off"
                aria-label="Chat input"
              />
              <Button type="submit" variant="hero" size="lg" disabled={!canSend}>
                <Send className="me-1" /> Send
              </Button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">
              Information provided is for educational purposes and not a substitute for professional medical advice. Call emergency services in urgent situations.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
