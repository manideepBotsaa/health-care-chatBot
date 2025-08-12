import { Button } from "@/components/ui/button";

interface QuickReplyProps {
  label: string;
  onClick: () => void;
}

export const QuickReply = ({ label, onClick }: QuickReplyProps) => (
  <Button variant="soft" size="sm" onClick={onClick} className="hover-scale">
    {label}
  </Button>
);
