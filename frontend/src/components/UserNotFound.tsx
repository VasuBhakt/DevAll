import { UserMinus } from "lucide-react";
import { Button } from "./ui";

interface Props {
  username: string;
}

export function UserNotFoundState({ username }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-6">
      <div className="p-6 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
        <UserMinus size={48} />
      </div>
      <div className="space-y-3 max-w-md">
        <h2 className="text-3xl font-bold tracking-tight uppercase">
          User Not Found
        </h2>
        <p className="text-muted-foreground text-lg">
          The user @{username} does not exist.
        </p>
      </div>
      <Button
        className="rounded-full px-10 h-12 text-lg font-bold hover:scale-105 transition-transform"
        onClick={() => (window.location.href = "/signin")}
      >
        Go to Sign In
      </Button>
    </div>
  );
}
