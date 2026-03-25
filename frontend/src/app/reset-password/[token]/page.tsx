"use client";

import { Button, Field, FieldError, FieldLabel, Input } from "@/components";
import { cn } from "@/lib/utils";
import { AuthService } from "@/services/auth";
import { StateStatus } from "@/utils";
import { Eye, EyeOff, Loader2, Lock, LockOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { useForm } from "react-hook-form";

interface ParamProps {
  token: string;
}

interface ResetPasswordRequest {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<ParamProps>;
}) {
  const router = useRouter();
  const decodedParams = use(params);
  const token = decodedParams.token;

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [status, setStatus] = useState<StateStatus>({
    type: null,
    message: null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    watch,
  } = useForm<ResetPasswordRequest>();

  const onSubmit = async (data: ResetPasswordRequest) => {
    setStatus({ type: null, message: null });
    setIsLoading(true);
    try {
      const response = await AuthService.resetPassword({
        password: data.password,
        token,
      });
      setStatus({ type: "success", message: response.message });
      setTimeout(() => {
        router.push("/signin");
      }, 4000);
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

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const isConfirmValid =
    confirmPassword && confirmPassword === password && !errors.confirmPassword;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-destructive mb-4">
            Invalid Token
          </h1>
          <p className="text-muted-foreground text-lg">
            The reset token is invalid or has expired.
          </p>
          <Link
            href="/signin"
            className="mt-4 inline-block text-primary hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-start pt-20 justify-center px-4 py-8 relative overflow-hidden ">
      <div className="w-full max-w-[600px] z-10">
        <div className="bg-card/70 backdrop-blur-xl border border-border/80 rounded-2xl p-8 shadow-xl transition-all duration-300 hover:border-border">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2 text-primary">
              Reset Password
            </h1>
            <p className="text-muted-foreground text-md">
              Enter your new password
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Field>
              <FieldLabel htmlFor="password">New Password</FieldLabel>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Lock size={16} />
                </div>
                <Input
                  {...register("password", {
                    required: "Password is required",
                    pattern: {
                      value:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message:
                        "Password must be at least 8 characters, include one uppercase, one lowercase, one number, and one special character",
                    },
                  })}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={cn(
                    "pl-10 h-11 bg-background/50",
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

            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Confirm Password
              </FieldLabel>
              <div className="relative group">
                <div
                  className={cn(
                    isConfirmValid
                      ? "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-success"
                      : "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-destructive"
                  )}
                >
                  {isConfirmValid ? <Lock size={16} /> : <LockOpen size={16} />}
                </div>
                <Input
                  {...register("confirmPassword", {
                    required: "Confirm password is required",
                    validate: (value) =>
                      value === getValues("password") ||
                      "Passwords do not match",
                  })}
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={cn(
                    "pl-10 h-11 bg-background/50",
                    "placeholder:text-foreground/30"
                  )}
                />
              </div>
              {errors.confirmPassword && (
                <FieldError errors={[errors.confirmPassword]} />
              )}
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
                  Reseting Your Password...
                </>
              ) : status.type === "success" ? (
                "Redirecting to Signin Page..."
              ) : (
                "Reset Password"
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
