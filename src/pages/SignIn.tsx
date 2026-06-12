import React, { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Input, Button } from "../components/ui";
import { AuthCard, AuthError } from "../components/auth/AuthCard";
import { signIn } from "../lib/auth-api";
import { extractApiError } from "../lib/api";
import { isAuthenticated } from "../lib/auth";

const SignIn = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // In-app single-slash path only — reject protocol-relative ("//host") and
  // backslash variants ("/\\host") that some browsers normalize to off-site.
  const rawNext = params.get("next");
  const next = rawNext && /^\/(?![/\\])/.test(rawNext) ? rawNext : null;
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in → honor ?next= (e.g. the docs gate), else dashboard.
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
    <AuthCard title="Log in" subtitle="Welcome back.">
      <form onSubmit={handleSignIn} className="w-full space-y-3">
        <AuthError message={error} />

        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          fullWidth
          required
        />

        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          fullWidth
          required
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="focus:outline-none"
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

        <div className="pt-1">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
          >
            Sign In
          </Button>
        </div>
      </form>

      <button
        type="button"
        onClick={() => navigate("/forgot-password")}
        className="mt-4 text-sm text-gray-500 hover:text-gray-700 cursor-pointer focus:outline-none"
      >
        Forgot password?
      </button>
    </AuthCard>
  );
};

export default SignIn;
