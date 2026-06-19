import React, { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input, Button } from "../components/ui";
import { AuthError } from "../components/auth/AuthCard";
import { signIn } from "../lib/auth-api";
import { extractApiError } from "../lib/api";
import { isAuthenticated } from "../lib/auth";

const SignIn = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const rawNext = params.get("next");
  const next = rawNext && /^\/(?![/\\])/.test(rawNext) ? rawNext : null;
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated()) {
    return <Navigate to={next || "/dashboard"} replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { mustChangePassword } = await signIn(email, password);
      navigate(mustChangePassword ? "/change-password" : next || "/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(extractApiError(err, "Invalid email or password.").message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-app p-6">
      <div className="w-full max-w-sm">
        {/* Logo + heading */}
        <div className="flex justify-center mb-5">
          <img
            src="/logo.png"
            className="h-16 w-auto object-contain"
            alt="Omaya Care"
          />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-brand-navy">Omaya Care</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-5">
          <AuthError message={error} />

          <Input
            label="Email address"
            type="email"
            placeholder="name@hospital.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="focus:outline-none text-gray-400 hover:text-primary transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            }
          />

          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="w-full font-semibold"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-sm font-medium text-gray-500 hover:text-primary transition-colors focus:outline-none underline-offset-4 hover:underline"
          >
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
