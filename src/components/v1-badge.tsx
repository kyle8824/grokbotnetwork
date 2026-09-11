import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function V1Badge({ className }: { className?: string }) {
  return (
    <Badge variant="outline" className={cn("uppercase", className)}>
      Early V1 network
    </Badge>
  );
}
