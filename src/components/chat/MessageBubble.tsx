import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, UserRound } from "lucide-react";

export type ChatRole = "user" | "assistant";

interface MessageBubbleProps {
  role: ChatRole;
  content: string;
  timestamp?: string | number | Date;
}

export const MessageBubble = ({ role, content, timestamp }: MessageBubbleProps) => {
  const isUser = role === "user";
  const time = timestamp ? new Date(timestamp) : new Date();

  return (
    <div className={cn("flex w-full gap-3 items-start", isUser ? "justify-end" : "justify-start")}
      role="article" aria-label={isUser ? "User message" : "Assistant message"}
    >
      {!isUser && (
        <Avatar className="mt-1">
          <AvatarFallback aria-hidden>
            <Bot className="opacity-80" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn(
        "max-w-[85%] rounded-lg border border-border shadow-sm p-3 animate-fade-in",
        isUser ? "bg-primary/10" : "bg-card"
      )}>
        <p className="text-sm leading-relaxed">{content}</p>
        <div className="mt-1 text-[10px] text-muted-foreground">
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      {isUser && (
        <Avatar className="mt-1">
          <AvatarFallback aria-hidden>
            <UserRound className="opacity-80" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
