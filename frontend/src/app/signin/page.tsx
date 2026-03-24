"use client";

import { useAuth } from "@/hooks";
import { SigninRequest } from "@/services/auth/schema";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { Input, Button, Field, FieldLabel, FieldError } from "@/components";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { isSignedIn, signinAsync, signinStatus } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninRequest>();

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn, router]);

  const onSubmit = async (data: SigninRequest) => {
    setErrorMsg(null);
    try {
      await signinAsync(data);
      router.push("/");
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Invalid credentials. Please try again.";
      setErrorMsg(message);
    }
  };

  const isLoading = signinStatus === "pending";

  return (
    <div className="min-h-screen flex items-start pt-20 justify-center px-4 py-8 relative overflow-hidden ">
      {/* Background blobs for premium feel - using theme-aware colors */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-yellow-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-[600px] z-10">
        <div className="bg-card/70 backdrop-blur-xl border border-border/80 rounded-2xl p-8 shadow-xl transition-all duration-300 hover:border-border">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-md">
              Sign in to access your DevAll dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Field>
              <FieldLabel htmlFor="identifier">Email or Username</FieldLabel>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Mail size={16} />
                </div>
                <Input
                  {...register("identifier", {
                    required: "Email or username is required",
                  })}
                  id="identifier"
                  type="text"
                  placeholder="name@example.com, name..."
                  className={cn(
                    "pl-10 h-11 bg-background/50",
                    "placeholder:text-foreground/30"
                  )}
                />
              </div>
              {errors.identifier && <FieldError errors={[errors.identifier]} />}
            </Field>

            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Link
                  href="/forgot-password"
                  className="text-sm relative group text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-primary origin-bottom-right scale-x-0 transition-transform duration-300 group-hover:scale-x-100 group-hover:origin-bottom-left" />
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Lock size={16} />
                </div>
                <Input
                  {...register("password", {
                    required: "Password is required",
                  })}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={cn(
                    "pl-10 pr-10 h-11 transition-colors duration-200 bg-background/50",
                    "placeholder:text-foreground/30"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 h-full flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <FieldError errors={[errors.password]} />}
            </Field>

            {errorMsg && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm py-3 px-4 rounded-xl text-center">
                {errorMsg}
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
                  Logging in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="relative group text-primary transition-colors duration-300"
            >
              Sign up
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-primary origin-bottom-right scale-x-0 transition-transform duration-300 group-hover:scale-x-100 group-hover:origin-bottom-left" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
