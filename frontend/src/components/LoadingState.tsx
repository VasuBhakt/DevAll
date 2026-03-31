import { Loader2 } from "lucide-react";

interface Props {
  message: string;
}

export function LoadingState({ message }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 size={48} className="animate-spin text-primary" />
      <span className="text-lg font-semibold text-muted-foreground animate-pulse tracking-wide">
        {message}
      </span>
    </div>
  );
}
