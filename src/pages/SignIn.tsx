import React, { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Leaf } from "lucide-react";
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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F9FAFB]">
      {/* Left Column: Image Panel */}
      <div className="relative h-64 md:h-auto md:w-1/2 bg-brand-plum overflow-hidden">
        <div className="absolute inset-0 bg-[#3D1A2E] opacity-40" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay animate-ken-burns"
          style={{
            backgroundImage: "url('/login-bg.png')",
            filter: "grayscale(10%) contrast(105%)"
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full w-full p-8 md:p-12 text-white">
          <div className="max-w-md text-center">
             <Leaf className="w-12 h-12 md:w-16 md:h-16 mb-6 md:mb-8 mx-auto opacity-90 drop-shadow-lg" />
             <h2 className="text-2xl md:text-4xl lg:text-5xl font-sans font-semibold leading-tight tracking-tight drop-shadow-md">
               Care that follows you home.
             </h2>
          </div>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 md:p-16 lg:p-24">
        <div className="max-w-md w-full">
          <div className="mb-8 md:mb-12 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-6 md:mb-10">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-brand-plum/10 rounded-2xl flex items-center justify-center shadow-sm">
                <Leaf className="w-7 h-7 md:w-8 md:h-8 text-brand-plum" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-sans font-bold text-brand-navy mb-3 tracking-tight">Log in</h1>
            <p className="text-gray-500 font-sans text-base md:text-lg font-normal">Welcome back.</p>
          </div>

          <form onSubmit={handleSignIn} className="w-full space-y-6">
            <AuthError message={error} />

            <div className="space-y-4">
              <Input
                label="Email address"
                type="email"
                placeholder="name@hospital.gov.gh"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                fullWidth
                required
                className="bg-white border-gray-200 focus:ring-brand-plum py-3 text-base"
              />

              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                fullWidth
                required
                className="bg-white border-gray-200 focus:ring-brand-plum py-3 text-base"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="focus:outline-none text-gray-400 hover:text-brand-plum transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 md:h-6 md:w-6" />
                    ) : (
                      <Eye className="h-5 w-5 md:h-6 md:w-6" />
                    )}
                  </button>
                }
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                fullWidth
                loading={submitting}
                className="bg-brand-plum hover:bg-[#3D1A2E] text-white py-4 md:py-5 text-base md:text-lg font-bold transition-all shadow-xl shadow-brand-plum/20 active:scale-[0.98]"
              >
                Sign In
              </Button>
            </div>
          </form>

          <div className="mt-8 md:mt-12 text-center md:text-left">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm md:text-base font-semibold text-gray-500 hover:text-brand-plum transition-colors font-sans cursor-pointer focus:outline-none underline-offset-4 hover:underline"
            >
              Forgot password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
