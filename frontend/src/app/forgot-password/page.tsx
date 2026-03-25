"use client";

import { Button, Field, FieldError, FieldLabel, Input } from "@/components";
import { cn } from "@/lib/utils";
import { AuthService } from "@/services/auth";
import { StateStatus } from "@/utils";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface ForgotPasswordRequest {
  email: string;
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<StateStatus>({
    type: null,
    message: null,
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordRequest>();

  const onSubmit = async (data: ForgotPasswordRequest) => {
    setStatus({ type: null, message: null });
    setIsLoading(true);
    try {
      const response = await AuthService.forgotPassword(data.email);
      setStatus({ type: "success", message: response.message });
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Invalid credentials. Please try again.";
      setStatus({ type: "error", message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start pt-20 justify-center px-4 py-8 relative overflow-hidden ">
      <div className="w-full max-w-[600px] z-10">
        <div className="bg-card/70 backdrop-blur-xl border border-border/80 rounded-2xl p-8 shadow-xl transition-all duration-300 hover:border-border">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2 text-primary">
              Forgot Password
            </h1>
            <p className="text-muted-foreground text-md">
              Enter your email address and we'll send you a link to reset your
              password
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Mail size={16} />
                </div>
                <Input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={cn(
                    "pl-10 h-11 bg-background/50",
                    "placeholder:text-foreground/30"
                  )}
                />
              </div>
              {errors.email && <FieldError errors={[errors.email]} />}
            </Field>

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
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/signin"
              className="font-medium text-primary hover:text-primary/80 transition-colors relative group"
            >
              Sign in here
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-primary origin-bottom-right scale-x-0 transition-transform duration-300 group-hover:scale-x-100 group-hover:origin-bottom-left" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
