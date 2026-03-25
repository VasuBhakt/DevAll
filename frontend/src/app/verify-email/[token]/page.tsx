"use client";

import { Button } from "@/components";
import { cn } from "@/lib/utils";
import { AuthService } from "@/services/auth";
import { StateStatus } from "@/utils";
import { CheckCircle, Link, Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

interface ParamProps {
  token: string;
}

export default function VerifyEmailPage({
  params,
}: {
  params: Promise<ParamProps>;
}) {
  const router = useRouter();
  const decodedParams = use(params);
  const token = decodedParams.token;

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<StateStatus>({
    type: null,
    message: null,
  });

  useEffect(() => {
    if (!token) {
      setStatus({ type: "error", message: "Invalid token" });
      return;
    }
    setIsLoading(true);
    setStatus({ type: "loading", message: "Verifying your email..." });
    const verify = async () => {
      try {
        const response = await AuthService.verifyEmail(token);
        setStatus({ type: "success", message: response.message });
      } catch (err: any) {
        const message =
          err.response?.data?.message ||
          err.message ||
          "Verification link is invalid or has expired.";
        setStatus({ type: "error", message });
      } finally {
        setIsLoading(false);
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        {isLoading && (
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="animate-spin text-primary" />
          </div>
        )}
        {status.type === "success" && (
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="text-success" size={64} />
          </div>
        )}
        {status.type === "error" && (
          <div className="flex items-center justify-center mb-4">
            <XCircle className="text-destructive" size={64} />
          </div>
        )}
        {status.type && (
          <div
            className={cn(
              status.type === "error" &&
                "bg-destructive/10 border border-destructive/20 text-destructive text-sm py-3 px-4 rounded-xl text-center",
              status.type === "success" &&
                "bg-success/10 border border-success/20 text-success text-sm py-3 px-4 rounded-xl text-center"
            )}
          >
            {status.message}
          </div>
        )}
        <Button
          disabled={isLoading}
          className="w-full h-11 my-8 text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
          onClick={() => router.push("/signin")}
        >
          Back to Sign In
        </Button>
      </div>
    </div>
  );
}
