import { MousePointer2 } from "lucide-react";
import { Button } from "./ui";

export function SignInRequiredState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-6">
      <div className="p-6 rounded-full bg-primary/10 text-primary border border-primary/20">
        <MousePointer2 size={48} />
      </div>
      <div className="space-y-3 max-w-md">
        <h2 className="text-3xl font-bold tracking-tight uppercase">
          Access Restricted
        </h2>
        <p className="text-muted-foreground text-lg">
          Forge your profile first. Sign in to showcase your code and models to
          the world.
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
